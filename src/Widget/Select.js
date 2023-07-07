import {Theme} from "./Theme.js";
import {buttonActiveBind, createDomByHtml, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {dimension2Style, escapeAttr, escapeHtml, highlightText} from "../Lang/String.js";
import {guid} from "../Lang/Util.js";
import {BizEvent, triggerDomEvent} from "../Lang/Event.js";
import {arrayDistinct} from "../Lang/Array.js";

const COM_ID = Theme.Namespace + 'select';
const SELECT_CLS_PREF = COM_ID;

insertStyleSheet(`
`, COM_ID + '-style');

const resolveOptions = (sel) => {
	let options = [
		// {title, value, disabled},
		// {title, options:[{title, value},...], disabled},
	];
	let values = [];
	let selectedIndexes = [];
	sel.childNodes.forEach((node, p_idx) => {
		if(node.nodeType !== 1){
			return;
		}
		if(node.tagName === 'OPTION'){
			options.push({title: node.innerText, value: node.value, disabled: node.disabled});
			if(node.selected){
				values.push(node.value);
				selectedIndexes.push([p_idx, null]);
			}
		}else if(node.tagName === 'OPTGROUP'){
			let opt_group = {title: node.label, options: [], disabled: false};
			node.childNodes.forEach((child, c_idx) => {
				if(child.nodeType !== 1){
					return;
				}
				opt_group.options.push({title: child.innerText, value: child.value, disabled: child.disabled});
				if(child.selected){
					values.push(child.value);
					selectedIndexes.push([p_idx, c_idx]);
				}
			});
			options.push(opt_group);
		}
	});
	return {options, values, selectedIndexes};
}

const renderItemChecker = (name, value, checked, multiple = false, disabled = false) => {
	return `
		<input type="${multiple ? 'checkbox' : 'radio'}" 
		tabindex="-1"
		name="${name}" 
		value="${escapeAttr(value)}" 
		${checked ? 'checked' : ''} 
		${disabled ? 'disabled' : ''}/>
	`
}

/**
 * 创建面板 DOM
 * @param config
 * @return {HTMLElement|HTMLElement[]}
 */
const createPanel = (config) => {
	let list_html = `<ul class="com-sel-list">`;
	config.options.forEach(opt => {
		if(opt.options && opt.options.length){
			list_html += `<li data-group-title="${escapeAttr(opt.title)}" class="sel-group"><ul>`;
			opt.options.forEach(child => {
				let check_html = renderItemChecker(config.name, child.value, String(config.value) === child.value, config.multiple, child.disabled);
				list_html += `<li class="sel-item" tabindex="0">
									<label title="${escapeAttr(child.title)}" tabindex="0">
										${check_html} 
										<span class="ti-wrap">
											<span class="sel-chk"></span> 
											<span class="ti">${escapeHtml(child.title)}</span>
										</span>
									</label>
								</li>`
			})
			list_html += `</ul></li>`;
		}else{
			let check_html = renderItemChecker(config.name, opt.value, String(config.value) === opt.value, config.multiple, opt.disabled);
			list_html += `<li class="sel-item" tabindex="0">
							<label title="${escapeAttr(opt.title)}">${check_html} 
								<span class="ti-wrap">
									<span class="sel-chk"></span> 
									<span class="ti">${escapeHtml(opt.title)}</span>
								</span>
							</label>
						</li>`
		}
	});
	list_html += '</ul>';
	let html = `
		<div class="com-sel-panel">
			<div class="com-sel-search">
				<input type="search" placeholder="过滤..." aria-label="过滤选项">
			</div>
			${list_html}
		</div>
	`;
	return createDomByHtml(html, document.body);
}

/**
 * 补上默认配置
 * @param config
 * @return {any}
 */
const patchDefaultConfig = (config) => {
	return Object.assign({
		value: null,
		required: false,
		multiple: false,
		searchable: false, //是否可搜索
		placeholder: null,
		options: [],
	}, config);
}

class Select {
	config = {
		name: COM_ID + guid(),
		value: null,
		required: false,
		multiple: false,
		searchable: false, //是否可搜索
		placeholder: '',
		options: []
	};
	panelEl = null;
	searchEl = null;
	onChange = new BizEvent();

	constructor(config, container){
		this.config = Object.assign(this.config, config);
		this.panelEl = createPanel(config);
		this.searchEl = this.panelEl.querySelector('input[type=search]');

		//checkbox change
		this.panelEl.querySelectorAll('.com-sel-list input').forEach(chk => {
			chk.addEventListener('change', e => {
				this.onChange.fire();
			})
		});

		//search
		this.searchEl.addEventListener('input', ()=>{
			this.search(this.searchEl.value);
		});

		//li click, enter
		this.panelEl.querySelectorAll('.com-sel-list .sel-item').forEach(li => {
			buttonActiveBind(li, e=>{
				if(e.type !== 'click'){
					let chk = li.querySelector('input');
					if(chk.checked){
						chk.removeAttribute('checked');
					} else {
						chk.setAttribute('checked', 'checked');
					}
				}
				!this.config.multiple && this.hidePanel();
			})
		});
	}

	search(kw){
		this.searchEl.value = kw;
		let liEls = this.panelEl.querySelectorAll('.com-sel-list .sel-item');
		liEls.forEach(li=>{
			hide(li);
			let title = li.querySelector('label').title;
			li.querySelector('.ti').innerHTML = highlightText(title, kw);
			if(!kw || title.indexOf(kw.trim()) >= 0){
				show(li);
			} else {
				console.log(title, kw);
			}
		})
	}

	setValue(value){

	}

	/**
	 * @return {String|String[]}
	 */
	getValue(){
		let values = [];
		let tmp = this.panelEl.querySelectorAll('input[type=checkbox]:checked')
		tmp.forEach(chk => {
			values.push(chk);
		});
		values = arrayDistinct(values);
		return this.config.multiple ? values : values[0];
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
	showPanel(pos = {top:0, left:0}){
		this.panelEl.style.display = '';
		if(pos){
			this.panelEl.style.top = dimension2Style(pos.top);
			this.panelEl.style.left = dimension2Style(pos.left);
		}
		this.searchEl.focus();
	}

	/**
	 *
	 * @param values
	 */
	select(values = []){

	}

	/**
	 * @param {HTMLSelectElement} srcSelectEl
	 */
	static bindSelect(srcSelectEl){
		let {options, values} = resolveOptions(srcSelectEl);
		let sel = new Select(patchDefaultConfig({
			name: srcSelectEl.name,
			value: srcSelectEl.multiple ? values : values[0],
			required: srcSelectEl.required,
			multiple: srcSelectEl.multiple,
			placeholder: srcSelectEl.getAttribute('placeholder'),
			options
		}));
		sel.onChange.listen(() => {
			srcSelectEl.value = sel.getValue();
			triggerDomEvent(srcSelectEl, 'change');
		});

		let s = () => {
			sel.showPanel({top: srcSelectEl.offsetTop + srcSelectEl.offsetHeight, left: srcSelectEl.offsetLeft});
		}

		['keydown', 'mousedown'].forEach(ev=>{
			srcSelectEl.addEventListener(ev, e => {
				s();
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		})
		srcSelectEl.addEventListener('focus',s);
		srcSelectEl.addEventListener('change', e => {
			sel.setValue(srcSelectEl.value);
		});
	}
}

export {Select}