import {Theme} from "./Theme.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {escapeAttr, escapeHtml} from "../Lang/String.js";

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
	multiple = true;
	return `
		<span class="sel-chk" 
		${checked ? 'data-checked' : ''}
		${disabled ? 'data-disabled' : ''}>
			<input type="${multiple ? 'checkbox' : 'radio'}" name="${name}" value="${escapeAttr(value)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}/>
			<i></i>
		</span>
	`
}

/**
 * 创建面板 DOM
 * @param config
 * @return {HTMLElement|HTMLElement[]}
 */
const createPanel = (config) => {
	let list_html = `<ul>`;
	config.options.forEach(opt => {
		if(opt.options && opt.options.length){
			list_html += `<li data-group-title="${escapeAttr(opt.title)}"><ul>`;
			opt.options.forEach(child => {
				let check_html = renderItemChecker(config.name, child.value, String(config.value) === child.value, config.multiple, child.disabled);
				list_html += `<li><label class="sel-item">${check_html} ${escapeHtml(child.title)}</label></li>`
			})
			list_html += `</ul></li>`;
		}else{
			let check_html = renderItemChecker(config.name, opt.value, String(config.value) === opt.value, config.multiple, opt.disabled);
			list_html += `<li><label class="sel-item">${check_html} ${escapeHtml(opt.title)}</label></li>`
		}
	})
	list_html += '</ul>';
	let html = `
		<div class="com-sel-panel">
			<div class="com-sel-search">
				<input type="search">
			</div>
			<div class="com-sel-list">
				${list_html}
			</div>
		</div>
	`;
	return createDomByHtml(html);
}

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
	static init(param, container = null){
		return new Select();
	}

	/**
	 * @param {HTMLSelectElement} srcSelectEl
	 */
	static initFromSelect(srcSelectEl){
		let {options, values, selectedIndexes} = resolveOptions(srcSelectEl);

		let config = patchDefaultConfig({
			name: '',
			value: srcSelectEl.multiple ? values : values[0],
			required: srcSelectEl.required,
			multiple: srcSelectEl.multiple,
			searchable: false, //是否可搜索
			placeholder: srcSelectEl.getAttribute('placeholder'),
			options
		});
		console.log(config.options);
		let panel = createPanel(config);
		document.body.appendChild(panel);
	}
}

export {Select}