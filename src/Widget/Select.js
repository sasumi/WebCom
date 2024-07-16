import {Theme} from "./Theme.js";
import {createDomByHtml, domContained, findAll, findOne, getDomOffset, hide, insertStyleSheet, remove, show} from "../Lang/Dom.js";
import {guid} from "../Lang/Util.js";
import {bindNodeActive, bindNodeEvents, BizEvent, KEYS, triggerDomEvent} from "../Lang/Event.js";
import {arrayDistinct} from "../Lang/Array.js";
import {dimension2Style, escapeAttr, escapeHtml, highlightText} from "../Lang/Html.js";
import {ACSelectAll} from "../Auto/ACSelectAll.js";

const COM_ID = Theme.Namespace + 'select';
const CLASS_PREFIX = COM_ID;

insertStyleSheet(`
	.${CLASS_PREFIX}-panel{
		${Theme.CssVarPrefix}sel-panel-max-width:20em;
		${Theme.CssVarPrefix}sel-list-max-height:15em;
		${Theme.CssVarPrefix}sel-item-matched-color:orange;
		${Theme.CssVarPrefix}sel-item-matched-font-weight:bold;
		${Theme.CssVarPrefix}sel-item-hover-bg:#eeeeee;
		${Theme.CssVarPrefix}sel-item-selected-bg:#abc9e140;
		
		max-width:var(${Theme.CssVarPrefix}sel-panel-max-width);
		background-color:var(${Theme.CssVar.BACKGROUND_COLOR});
		border:var(${Theme.CssVar.PANEL_BORDER});
		padding:.2em 0;
		box-sizing:border-box;
		box-shadow:var(${Theme.CssVar.PANEL_SHADOW});
		border-radius:var(${Theme.CssVar.PANEL_RADIUS});
		position:absolute;
		z-index:1;
	}
	
	.${CLASS_PREFIX}-panel .${CLASS_PREFIX}-search{padding:0.5em;}
	.${CLASS_PREFIX}-panel input[type=search]{
		width:100%;
		padding:0.5em;
		border:none;
		border-bottom:1px solid #dddddd;
		outline:none;
		box-shadow:none;
		transition:border 0.1s linear;
	}
	.${CLASS_PREFIX}-panel input[type=search]:focus{
		border-color:gray;
	}
	
	.${CLASS_PREFIX}-list{
		list-style:none;
		max-height:var(${Theme.CssVarPrefix}sel-list-max-height);
		overflow:auto;
	}
	
	.${CLASS_PREFIX}-list .sel-item{
		margin:0.2em 0;
	}
	
	.${CLASS_PREFIX}-list .sel-chk{opacity:0;width:1em;height:1em;position:absolute;margin:0.05em 0 0 -1.25em;}
	
	.${CLASS_PREFIX}-list .sel-chk:before{
		content:"\\e624";
		font-family:"${Theme.IconFont}", serif;
	}
	
	.${CLASS_PREFIX}-list .matched{
		color:var(${Theme.CssVarPrefix}sel-item-matched-color);
		font-weight:var(${Theme.CssVarPrefix}sel-item-matched-font-weight);
	}
	
	.${CLASS_PREFIX}-list input{display:block;position:absolute;z-index:1;left:-2em;top:0;opacity:0;}
	.${CLASS_PREFIX}-list .ti-wrap{cursor:pointer;position:relative;display:block;padding:.5em 1em .5em 2em;user-select:none;transition:all 0.1s linear;}
	.${CLASS_PREFIX}-list ul .ti-wrap{padding-left:2.25em;display:block; padding-left:3.5em;}
	.${CLASS_PREFIX}-list .desc {display:block; opacity:0.5}
	
	.${CLASS_PREFIX}-list label{
		display:block;
		overflow:hidden;
		position:relative;
	}
	.${CLASS_PREFIX}-list label:hover .ti-wrap{
		background:var(${Theme.CssVarPrefix}sel-item-hover-bg);
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
		background-color:var(${Theme.CssVarPrefix}sel-item-selected-bg);
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
	
	.${CLASS_PREFIX}-multiple-operation {
		padding:0.25em 0.5em;
	}
	.${CLASS_PREFIX}-multiple-operation label {
		display:flex;
		gap:.25em
	}
	
`, COM_ID + '-style');

/**
 * 提取select placeholder，优先从[placeholder]属性中提取，其次从option[value=""] text 中提取
 * @param sel
 * @return {string}
 */
const resolveSelectPlaceholder = sel =>{
	let pl = sel.getAttribute('placeholder') || '';
	if(pl){
		return pl;
	}
	findAll('option', sel).every(opt=>{
		if(!opt.value){
			pl = opt.innerText;
			return false;
		}
	});
	return pl;
}

/**
 * @param sel
 * @return {{values: String[], options: Option[], selectedIndexes: Number[]}}
 */
const resolveSelectOptions = (sel) => {
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
				type: OPTION_TYPE_OPTION,
				title: node.title,
				text: node.innerText,
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
			let opt_group = new Option({
				text: node.label,
				title: node.title,
				type: OPTION_TYPE_GROUP
			});
			node.childNodes.forEach(child => {
				if(child.nodeType !== 1){
					return;
				}
				opt_group.options.push(new Option({
					type: OPTION_TYPE_OPTION,
					title: child.title,
					text: child.innerText,
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
 * @param {Array} options 选项（支持group模式）
 * @return {string}
 */
const buildOptionText = (options) => {
	let txt = [];
	options.forEach(opt => {
		if(opt.type === OPTION_TYPE_OPTION && opt.selected){
			txt.push(opt.text.trim());
		}
		if(opt.type === OPTION_TYPE_GROUP){
			opt.options.forEach(sub_opt=>{
				sub_opt.selected && txt.push(sub_opt.text.trim());
			});
		}
	});
	return txt.join(', ');
}

/**
 * 从 <datalist> 对象中解析 option 列表
 * @param {HTMLDataListElement} datalistEl
 * @param {Null|String} initValue 初始值，Null 表示没有初始值
 * @return {Option[]}
 */
const resolveListOption = (datalistEl, initValue = null) => {
	let options = [];
	let alreadySelected = false;
	Array.from(datalistEl.options).forEach((option, index) => {
		let text = option.label || option.innerText || option.value;
		let title = option.title || '';
		let value = option.hasAttribute('value') ? option.getAttribute('value') : text; //避免某些空值 "" value获取不到
		let selected = !alreadySelected && initValue !== null && value === initValue;
		options.push({text, title, value, disabled: false, selected, index});
	});
	return options;
}

/**
 * 渲染单个 checkbox 或 radio
 * @param name
 * @param multiple
 * @param option
 * @return {String} input html
 */
const renderItemChecker = (name, multiple, option) => {
	return `<input type="${multiple ? 'checkbox' : 'radio'}" 
		tabindex="0"
		name="${name}" 
		value="${escapeAttr(option.value)}" 
		${option.selected ? 'checked' : ''} 
		${option.disabled ? 'disabled' : ''}/>
	`
}

/**
 * 创建面板 DOM
 * @param {Object} config
 * @param {String} config.name
 * @param {Boolean} config.required
 * @param {Boolean} config.multiple
 * @param {String} config.placeholder
 * @param {Boolean} config.displaySearchInput
 * @param {Boolean} config.hideNoMatchItems
 * @param {Object[]} config.initOptions
 * @return {HTMLElement|HTMLElement[]}
 */
const createPanel = (config) => {
	let list_html = `<ul class="${CLASS_PREFIX}-list">`;
	config.initOptions.forEach(option => {
		if(option.options && option.options.length){
			list_html += `<li data-group-title="${escapeAttr(option.title)}" class="sel-group"><ul>`;
			option.options.forEach(childOption => {
				list_html +=
					`<li class="sel-item" tabindex="0">
						<label data-text="${escapeAttr(childOption.text)}" tabindex="0">
							${renderItemChecker(config.name, config.multiple, childOption)} 
							<span class="ti-wrap">
								<span class="sel-chk"></span> 
								<span class="ti">${escapeHtml(childOption.text)}</span>
								<span class="desc">${escapeHtml(childOption.title)}</span>
							</span>
						</label>
					</li>`;
			})
			list_html += `</ul></li>`;
		}else{
			list_html +=
				`<li class="sel-item" tabindex="0">
					<label data-text="${escapeAttr(option.text)}">
						${renderItemChecker(config.name, config.multiple, option)} 
						<span class="ti-wrap">
							<span class="sel-chk"></span> 
							<span class="ti">${escapeHtml(option.text)}</span>
							<span class="desc">${escapeHtml(option.title)}</span>
						</span>
					</label>
				</li>`;
		}
	});
	list_html += '</ul>';

	let multiple_operation_html = config.multiple ?
`<div class="${CLASS_PREFIX}-multiple-operation">
	<label>
		<input type="checkbox" class="mul-sel-all-chk"> 全选
	</label>
</div>` : '';

	return createDomByHtml(`
		<div class="${CLASS_PREFIX}-panel" style="display:none;">
			<div class="${CLASS_PREFIX}-search" style="${config.displaySearchInput ? '' : 'display:none'}">
				<input type="search" placeholder="过滤..." aria-label="过滤选项" autocomplete="off">
			</div>
			${list_html}
			${multiple_operation_html}
		</div>
	`, document.body);
}

const tabNav = (liList, dir) => {
	let currentIndex = -1;
	liList.forEach((li, idx) => {
		if(li === document.activeElement){
			currentIndex = idx;
		}
	});
	if(dir > 0){
		currentIndex = currentIndex < (liList.length - 1) ? (currentIndex + 1) : 0;
	}else{
		currentIndex = currentIndex <= 0 ? (liList.length - 1) : (currentIndex - 1);
	}
	liList.forEach((li, idx) => {
		if(idx === currentIndex){
			li.focus();
		}
	});
}

const OPTION_TYPE_GROUP = 'group';
const OPTION_TYPE_OPTION = 'option';

class Option {
	constructor(param){
		for(let i in param){
			this[i] = param[i];
		}
	}

	/** @type {String} 类型 **/
	type = OPTION_TYPE_OPTION;

	/** @type {string} */
	title = '';

	/** @type {string} */
	text = '';

	/** @type {string} */
	value = '';

	/** @type {Boolean} */
	disabled = false;

	/** @type {Boolean} */
	selected = false;

	/** @type {Number} */
	index = 0;

	/** @type {Option[]|Null} 子选项*/
	options = [];
}

/**
 * 下拉选择UI组件，用于优化代替原生select、select[multiple]、input[list]组件，同时提供搜索功能。
 */
class Select {
	config = {
		name: "",
		required: false,
		multiple: false,
		placeholder: '',
		displaySearchInput: true, //是否显示搜索输入框
		hideNoMatchItems: true, //隐藏未匹配的搜索结果项目
		initOptions: [], //初始化时的选项列表。仅在初始化时使用，后面不再维护这个属性
	};
	panelEl = null;
	searchEl = null;
	onChange = new BizEvent();

	static PROXY_INPUT_CLASS = 'multiple-select-proxy-input';

	/**
	 * 构造函数
	 * @param {Object} config
	 * @param {String} config.name
	 * @param {Boolean} config.required
	 * @param {Boolean} config.multiple
	 * @param {String} config.placeholder
	 * @param {Boolean} config.displaySearchInput
	 * @param {Boolean} config.hideNoMatchItems
	 * @param {Object[]} config.initOptions
	 */
	constructor(config){
		this.config = Object.assign(this.config, config);
		this.config.name = this.config.name || COM_ID + guid();
		this.panelEl = createPanel(this.config);
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

		//nav
		this.searchEl.addEventListener('keydown', e => {
			if(e.keyCode === KEYS.UpArrow){
				tabNav(liElList, false);
			}else if(e.keyCode === KEYS.DownArrow){
				tabNav(liElList, true);
			}
		})

		//li click, enter
		let liElList = this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list .sel-item`);
		liElList.forEach(li => {
			bindNodeActive(li, e => {
				if(e.type !== 'click'){
					let chk = li.querySelector('input');
					chk.checked ? chk.removeAttribute('checked') : chk.checked = true;
					this.onChange.fire();
				}
				!this.config.multiple && this.hidePanel();
			});
			li.addEventListener('keydown', e => {
				if(e.keyCode === KEYS.UpArrow){
					tabNav(liElList, false);
				}else if(e.keyCode === KEYS.DownArrow){
					tabNav(liElList, true);
				}
			})
		});

		if(this.config.multiple){
			let list = findOne(`.${CLASS_PREFIX}-list`, this.panelEl);
			ACSelectAll.init(findOne('.mul-sel-all-chk', this.panelEl), {container: list});
		}
	}

	isShown(){
		return this.panelEl.style.display !== 'none';
	}

	/**
	 * 以关键字方式搜索
	 * @param {String} kw
	 * @return {HTMLElement}
	 */
	search(kw){
		this.searchEl.value = kw;
		let liEls = this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list .sel-item`);
		let firstMatchedItem = null;
		liEls.forEach(li => {
			this.config.hideNoMatchItems && hide(li);
			let text = li.querySelector('label').dataset.text;
			li.blur();
			li.querySelector('.ti').innerHTML = highlightText(text, kw);
			if(!kw || text.toLowerCase().indexOf(kw.trim().toLowerCase()) >= 0){
				this.config.hideNoMatchItems && show(li);
				if(!firstMatchedItem){
					firstMatchedItem = li;
				}
			}
		});
		if(firstMatchedItem){
			firstMatchedItem.scrollIntoView({behavior: 'smooth'});
		}
		return firstMatchedItem;
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
		this.getSelectedOptions().forEach(opt=>{
			selectedIndexes.push(opt.index);
		});
		return selectedIndexes;
	}

	getSelectedOptions(){
		let options = [];
		this.panelEl.querySelectorAll(`.${CLASS_PREFIX}-list input`).forEach((chk, idx) => {
			if(chk.checked){
				options.push(new Option({
					type: OPTION_TYPE_OPTION,
					text: findOne('.ti', chk.closest('label')).dataset.text,
					value: chk.value,
					selected: true,
					index: idx,
				}))
			}
		});
		return options;
	}

	/**
	 * 隐藏面板
	 */
	hidePanel(){
		if(this.panelEl){
			this.panelEl.style.display = 'none';
			this.search("");
		}
	}

	/**
	 * 显示面板（@todo，需要改造成 Popover 方式来避免遮挡）
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
	 * 绑定 select 元素使其触发行为变成Select组件
	 * @todo 如果select required，浏览器触发的表单校验提示显示会被遮挡
	 * @param {HTMLSelectElement} selectEl
	 * @param {Object} params
	 */
	static bindSelect(selectEl, params = {}){
		let {options} = resolveSelectOptions(selectEl);
		let placeholder = resolveSelectPlaceholder(selectEl);
		let proxyInput;
		const sel = new Select({
			name: selectEl.name,
			required: selectEl.required,
			multiple: selectEl.multiple,
			placeholder,
			initOptions: options,
			...params
		});
		sel.panelEl.style.minWidth = dimension2Style(selectEl.offsetWidth);
		sel.onChange.listen(() => {
			let selectedIndexes = sel.getSelectedIndexes();
			selectEl.querySelectorAll('option').forEach((opt, idx) => {
				opt.selected = selectedIndexes.includes(idx);
			});
			triggerDomEvent(selectEl, 'change');
		});

		const showSelect = () => {
			let offset = getDomOffset(proxyInput || selectEl);
			sel.showPanel({top: offset.top + (proxyInput || selectEl).offsetHeight, left: offset.left});
		}
		const hideSelect = () => {
			sel.hidePanel();
		}

		//multiple mode
		if(selectEl.multiple){
			proxyInput = document.createElement('input');
			proxyInput.value = buildOptionText(options) || placeholder;
			proxyInput.title = buildOptionText(options) || placeholder;
			proxyInput.type = 'text';
			proxyInput.classList.add(this.PROXY_INPUT_CLASS);
			proxyInput.readOnly = true;
			placeholder && (proxyInput.placeholder = placeholder);
			selectEl.parentNode.insertBefore(proxyInput, selectEl);
			hide(selectEl);
			sel.onChange.listen(() => {
				let selectedOptions = sel.getSelectedOptions();
				proxyInput.value = buildOptionText(selectedOptions) || placeholder;
				proxyInput.title = buildOptionText(selectedOptions) || placeholder;
			});
			bindNodeEvents(proxyInput, ['active', 'focus', 'click'], () => {
				showSelect();
			});
		}

		//single select mode
		else {
			selectEl.addEventListener('invalid', hideSelect);
			selectEl.addEventListener('input', showSelect)
			selectEl.addEventListener('focus', showSelect);
			selectEl.addEventListener('keydown', e => {
				showSelect();
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			selectEl.addEventListener('mousedown', e => {
				sel.isShown() ? sel.hidePanel() : showSelect();
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			selectEl.addEventListener('change', () => {
				let selectedIndexes = [];
				Array.from(selectEl.selectedOptions).forEach(opt => {
					selectedIndexes.push(opt.index);
				})
				sel.selectByIndex(selectedIndexes);
			});
		}

		document.addEventListener('click', e => {
			if(!domContained(sel.panelEl, e.target, true) && !domContained(proxyInput || selectEl, e.target, true)){
				hideSelect();
			}
		});
		document.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Esc){
				hideSelect();
			}
		});
	}

	/**
	 * 绑定有关联 datalist 的输入框
	 * @param {HTMLInputElement} inputEl
	 * @param {Object} params 初始化参数对象
	 * @param {Object[]} params.initOptions 是否指定选项列表，默认从 input[list] 中读取
	 */
	static bindTextInput(inputEl, params = {}){
		params = params || {initOptions:null};

		if(!params.initOptions){
			let listTagId = inputEl.getAttribute('list');
			let datalistEl = document.getElementById(listTagId);
			if(!datalistEl){
				throw "no datalist found: " + inputEl.getAttribute('list');
			}
			params.initOptions = resolveListOption(datalistEl, inputEl.value);
			inputEl.removeAttribute('list');
			remove(datalistEl);
		}
		let sel = new Select({
			name: inputEl.name,
			required: inputEl.required,
			multiple: false,
			displaySearchInput: false,
			hideNoMatchItems: false,
			placeholder: inputEl.getAttribute('placeholder'),
			...params
		});
		sel.onChange.listen(() => {
			inputEl.value = sel.getValues()[0];
			triggerDomEvent(inputEl, 'change');
		});
		sel.panelEl.style.minWidth = dimension2Style(inputEl.offsetWidth);

		let sh = () => {
			let offset = getDomOffset(inputEl);
			sel.showPanel({top: offset.top + inputEl.offsetHeight, left: offset.left});
		}

		inputEl.setAttribute('autocomplete', 'off')
		inputEl.addEventListener('focus', sh);
		inputEl.addEventListener('click', sh);
		inputEl.addEventListener('input', () => {
			let matchSelItem = sel.search(inputEl.value.trim());
			findAll(`.${CLASS_PREFIX}-list input`, sel.panelEl).forEach(chk => {
				chk.checked = false;
			});
			if(matchSelItem){
				let lbl = findOne('label', matchSelItem).dataset.text;
				//必须严格相当才能标记选中
				if(lbl.trim() === inputEl.value.trim()){
					findOne('input', matchSelItem).checked = true;
				}
			}
		});

		document.addEventListener('click', e => {
			if(!domContained(sel.panelEl, e.target, true) && !domContained(inputEl, e.target, true)){
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