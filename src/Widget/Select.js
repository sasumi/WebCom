import {Theme} from "./Theme.js";
import {buttonActiveBind, createDomByHtml, domContained, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {dimension2Style, escapeAttr, escapeHtml, highlightText} from "../Lang/String.js";
import {guid} from "../Lang/Util.js";
import {BizEvent, KEYS, triggerDomEvent} from "../Lang/Event.js";
import {arrayDistinct} from "../Lang/Array.js";

const COM_ID = Theme.Namespace + 'select';
const CLASS_PREFIX = COM_ID;

insertStyleSheet(`
	.${CLASS_PREFIX}-panel{
		--sel-panel-max-width:20em;
		--sel-panel-bd:1px solid #dddddd;
		--sel-panel-bs:1px 1px 15px #ccccccb3;
		--sel-panel-br:3px;
		--sel-panel-bg:#ffffff;
		--sel-list-max-height:15em;
		--sel-item-matched-color:orange;
		--sel-item-matched-font-weight:bold;
		--sel-item-hover-bg:#eeeeee;
		--sel-item-selected-bg:#abc9e140;
		
		max-width:var(--sel-panel-max-width);
		background-color:var(--sel-panel-bg);
		border:var(--sel-panel-bd);
		padding:3px 0;
		box-shadow:var(--sel-panel-bs);
		border-radius:var(--sel-panel-br);
		position:absolute;
		z-index:1;
	}
	
	.${CLASS_PREFIX}-panel .${CLASS_PREFIX}-search{
		padding:0.5em;
	}
	
	.${CLASS_PREFIX}-panel input[type=search]{
		width:100%;
		padding:0.5em;
		border:none;
		border-bottom:1px solid #dddddd;
		outline:none;
		transition:border 0.1s linear;
	}
	.${CLASS_PREFIX}-panel input[type=search]:focus{
		border-color:gray;
	}
	
	.${CLASS_PREFIX}-list{
		list-style:none;
		max-height:var(--sel-list-max-height);
		overflow:hidden;
	}
	
	.${CLASS_PREFIX}-list:hover{
		overflow:auto;
	}
	
	.${CLASS_PREFIX}-list .sel-item{
		margin:1px 0;
	}
	
	.${CLASS_PREFIX}-list .sel-chk{
		opacity:0;
		width:1em;
		height:1em;
		position:absolute;
		margin:0.05em 0 0 -1.25em;
	}
	
	.${CLASS_PREFIX}-list .sel-chk:before{
		content:"\\e624";
		font-family:"WebCom-iconfont", serif;
	}
	
	.${CLASS_PREFIX}-list .matched{
		color:var(--sel-item-matched-color);
		font-weight:var(--sel-item-matched-font-weight);
	}
	
	.${CLASS_PREFIX}-list input{
		display:block;
		position:absolute;
		z-index:1;
		left:-2em;
		top:0;
		opacity:0;
	}
	
	.${CLASS_PREFIX}-list .ti-wrap{
		cursor:pointer;
		position:relative;
		display:block;
		padding:0.5em .5em .5em 2em;
		user-select:none;
		transition:all 0.1s linear;
	}
	
	.${CLASS_PREFIX}-list ul .ti-wrap{
		padding-left:2.25em;
		display:block;
	}
	
	.${CLASS_PREFIX}-list ul .ti-wrap{
		padding-left:3.5em;
	}
	
	.${CLASS_PREFIX}-list label{
		display:block;
		overflow:hidden;
		position:relative;
	}
	.${CLASS_PREFIX}-list label:hover .ti-wrap{
		background:var(--sel-item-hover-bg);
		text-shadow:1px 1px 1px white;
	}
	
	.${CLASS_PREFIX}-list li[data-group-title]:before{
		content:attr(data-group-title) " -";
		color:gray;
		display:block;
		padding:0.25em .5em .25em 2em;
	}
	
	/** checked **/
	.${CLASS_PREFIX}-list input:checked ~ .ti-wrap{
		background-color:var(--sel-item-selected-bg);
	}
	
	.${CLASS_PREFIX}-list input:checked ~ .ti-wrap .sel-chk{
		opacity:1;
	}
	
	/** disabled **/
	.${CLASS_PREFIX}-list input:disabled ~ .ti-wrap{
		opacity:0.5;
		cursor:default;
		background-color:transparent
	}
	.${CLASS_PREFIX}-list input:disabled ~ .ti-wrap .sel-chk{
		opacity:.1;
	}
`, COM_ID + '-style');

/**
 * @param sel
 * @return {{values: String[], options: Option[], selectedIndexes: Number[]}}
 */
const resolveOptions = (sel) => {
	let options = [
		// {title, value, disabled, selected},
		// {title, options:[{title, value},...], disabled, selected},
	];
	let values = [];
	let selectedIndexes = [];
	sel.childNodes.forEach(node => {
		if(node.nodeType !== 1){
			return;
		}
		if(node.tagName === 'OPTION'){
			options.push(new Option({
				title: node.innerText,
				value: node.value,
				disabled: node.disabled,
				selected: node.selected,
				index: node.index,
			}));
			if(node.selected){
				values.push(node.value);
				selectedIndexes.push(node.index);
			}
		}else if(node.tagName === 'OPTGROUP'){
			let opt_group = new Option({title: node.label});
			node.childNodes.forEach(child => {
				if(child.nodeType !== 1){
					return;
				}
				opt_group.options.push(new Option({
					title: child.innerText,
					value: child.value,
					disabled: child.disabled,
					selected: child.selected,
					index: child.index,
				}));
				if(child.selected){
					values.push(child.value);
					selectedIndexes.push(child.index);
				}
			});
			options.push(opt_group);
		}
	});
	return {options, values, selectedIndexes};
}

/**
 * 渲染单个 checkbox 或 radio
 * @param name
 * @param multiple
 * @param option
 * @return {`
		<input type="${string}"
		tabindex="-1"
		name="${string}"
		value="${string}"
		${string}
		${string}/>
	`}
 */
const renderItemChecker = (name, multiple, option) => {
	return `
		<input type="${multiple ? 'checkbox' : 'radio'}" 
		tabindex="-1"
		name="${name}" 
		value="${escapeAttr(option.value)}" 
		${option.selected ? 'checked' : ''} 
		${option.disabled ? 'disabled' : ''}/>
	`
}

/**
 * 创建面板 DOM
 * @param config
 * @return {HTMLElement|HTMLElement[]}
 */
const createPanel = (config) => {
	let list_html = `<ul class="${CLASS_PREFIX}-list">`;
	config.options.forEach(option => {
		if(option.options && option.options.length){
			list_html += `<li data-group-title="${escapeAttr(option.title)}" class="sel-group"><ul>`;
			option.options.forEach(childOption => {
				list_html += `<li class="sel-item" tabindex="0">
									<label title="${escapeAttr(childOption.title)}" tabindex="0">
										${renderItemChecker(config.name, config.multiple, childOption)} 
										<span class="ti-wrap">
											<span class="sel-chk"></span> 
											<span class="ti">${escapeHtml(childOption.title)}</span>
										</span>
									</label>
								</li>`
			})
			list_html += `</ul></li>`;
		}else{
			list_html += `<li class="sel-item" tabindex="0">
							<label title="${escapeAttr(option.title)}">
								${renderItemChecker(config.name, config.multiple, option)} 
								<span class="ti-wrap">
									<span class="sel-chk"></span> 
									<span class="ti">${escapeHtml(option.title)}</span>
								</span>
							</label>
						</li>`
		}
	});
	list_html += '</ul>';
	let html = `
		<div class="${CLASS_PREFIX}-panel" style="display:none;">
			<div class="${CLASS_PREFIX}-search">
				<input type="search" placeholder="过滤..." aria-label="过滤选项">
			</div>
			${list_html}
		</div>
	`;
	return createDomByHtml(html, document.body);
}

class Option {
	constructor(param){
		for(let i in param){
			this[i] = param[i];
		}
	}

	/** @type {string} */
	title = '';

	/** @type {string} */
	value = '';

	/** @type {Boolean} */
	disabled = false;

	/** @type {Boolean} */
	selected = false;

	/** @type {Number} */
	index = 0;

	/** @type {Option[]} */
	options = [];
}

class Select {
	config = {
		name: COM_ID + guid(),
		required: false,
		multiple: false,
		searchable: false, //是否可搜索
		placeholder: '',

		/** @type {Option[]} options */
		options: []
	};
	panelEl = null;
	searchEl = null;
	onChange = new BizEvent();

	constructor(config){
		this.config = Object.assign(this.config, config);
		this.panelEl = createPanel(config);
		this.searchEl = this.panelEl.querySelector('input[type=search]');

		//checkbox change
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input`).forEach(chk => {
			chk.addEventListener('change', () => {
				this.onChange.fire();
			})
		});

		//search
		this.searchEl.addEventListener('input', () => {
			this.search(this.searchEl.value);
		});

		//li click, enter
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list .sel-item`).forEach(li => {
			buttonActiveBind(li, e => {
				if(e.type !== 'click'){
					let chk = li.querySelector('input');
					if(chk.checked){
						chk.removeAttribute('checked');
					}else{
						chk.setAttribute('checked', 'checked');
					}
				}
				!this.config.multiple && this.hidePanel();
			})
		});
	}

	search(kw){
		this.searchEl.value = kw;
		let liEls = this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list .sel-item`);
		liEls.forEach(li => {
			hide(li);
			let title = li.querySelector('label').title;
			li.querySelector('.ti').innerHTML = highlightText(title, kw);
			if(!kw || title.indexOf(kw.trim()) >= 0){
				show(li);
			}else{
				console.log(title, kw);
			}
		})
	}

	/**
	 * 以index方式设置选中项
	 * @param {Number[]} selectedIndexList
	 */
	selectByIndex(selectedIndexList){
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input`).forEach((chk, idx) => {
			chk.checked = selectedIndexList.includes(idx);
		});
	}

	/**
	 * 使用传值方式设置选中项目（该方法可能存在多个相同值的情况导致误选）
	 * @param values
	 */
	selectByValues(values){
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input`).forEach((chk, idx) => {
			chk.checked = values.includes(chk.value);
		});
	}

	/**
	 * 获取值，这里没有区分多选还是单选，统一返回数组，返回值会去重
	 * @return {String[]}
	 */
	getValues(){
		let values = [];
		let tmp = this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input:checked`)
		tmp.forEach(chk => {
			values.push(chk.value);
		});
		values = arrayDistinct(values);
		return values;
	}

	/**
	 * 获取选中项索引值列表
	 * @return {Number[]}
	 */
	getSelectedIndexes(){
		let selectedIndexes = [];
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input`).forEach((chk, idx) => {
			if(chk.checked){
				selectedIndexes.push(idx);
			}
		});
		return selectedIndexes;
	}

	hidePanel(){
		if(this.panelEl){
			this.panelEl.style.display = 'none';
			this.search("");
		}
	}

	/**
	 * @param {Object|Null} pos
	 * @param {Number} pos.top
	 * @param {Number} pos.left
	 */
	showPanel(pos = {top: 0, left: 0}){
		this.panelEl.style.display = '';
		if(pos){
			this.panelEl.style.top = dimension2Style(pos.top);
			this.panelEl.style.left = dimension2Style(pos.left);
		}
		this.searchEl.focus();
	}

	/**
	 * @param {HTMLSelectElement} srcSelectEl
	 */
	static bindSelect(srcSelectEl){
		let {options} = resolveOptions(srcSelectEl);
		let sel = new Select({
			name: srcSelectEl.name,
			required: srcSelectEl.required,
			multiple: srcSelectEl.multiple,
			placeholder: srcSelectEl.getAttribute('placeholder'),
			options
		});
		sel.onChange.listen(() => {
			let selectedIndexes = sel.getSelectedIndexes();
			srcSelectEl.querySelectorAll('option').forEach((opt, idx) => {
				opt.selected = selectedIndexes.includes(idx);
			});
			triggerDomEvent(srcSelectEl, 'change');
		});

		let sh = () => {
			sel.showPanel({top: srcSelectEl.offsetTop + srcSelectEl.offsetHeight, left: srcSelectEl.offsetLeft});
		}

		srcSelectEl.addEventListener('keydown', e => {
			sh();
			e.preventDefault();
			e.stopPropagation();
			return false;
		});

		srcSelectEl.addEventListener('mousedown', e => {
			sel.panelEl.style.display === 'none' ? sh() : sel.hidePanel();
			e.preventDefault();
			e.stopPropagation();
			return false;
		});

		srcSelectEl.addEventListener('focus', sh);
		srcSelectEl.addEventListener('change', () => {
			let selectedIndexes = [];
			Array.from(srcSelectEl.selectedOptions).forEach(opt => {
				selectedIndexes.push(opt.index);
			})
			sel.selectByIndex(selectedIndexes);
		});

		document.addEventListener('click', e => {
			if(!domContained(sel.panelEl, e.target, true) && !domContained(srcSelectEl, e.target, true)){
				sel.hidePanel();
			}
		});

		document.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Esc){
				sel.hidePanel();
			}
		});
	}
}

export {Select}