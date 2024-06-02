import {Toast} from "../Widget/Toast.js";
import {findAll, findOne, insertStyleSheet} from "../Lang/Dom.js";
import {escapeAttr, escapeHtml} from "../Lang/Html.js";
import {Dialog, DLG_CLS_WEAK_BTN} from "../Widget/Dialog.js";
import {Theme} from "../Widget/Theme.js";
import {guid} from "../Lang/Util.js";
import {KEYS, triggerDomEvent} from "../Lang/Event.js";

const NS = Theme.Namespace + 'ac-batchfiller';

insertStyleSheet(`
	.${NS} {padding:2em 2em 1em 2em}
	.${NS} label {font-size:1.1em; margin-bottom:.75em; display:block;}
	.${NS} input,
	.${NS} textarea,
	.${NS} select {width:100%; box-sizing:border-box; min-height:2.25em;}
	.${NS} textarea {min-height:5em; resize:vertical}
`)

const SUPPORT_INPUT_TYPES = [
	// 'button',
	// 'checkbox',
	'color',
	'date',
	'datetime',
	'datetime-local',
	'month',
	'week',
	'time',
	'email',
	// 'file',
	// 'hidden',
	// 'image',
	'number',
	'password',
	// 'radio',
	'range',
	// 'reset',
	'search',
	// 'submit',
	'tel',
	'text',
	'url',
];

const cloneElementAsHtml = (el, id = '') => {
	let required_attr = el.required ? 'required' : '';
	let pattern_attr = el.getAttribute('pattern') ? `pattern="${el.getAttribute('pattern')}"` : '';
	let placeholder_attr = el.placeholder ? `placeholder="${escapeAttr(el.placeholder)}"` : '';
	let title_attr = el.title ? `title="${escapeAttr(el.title)}"` : '';
	let max_attr = el.max ? `max=${escapeAttr(el.max)}` : '';
	let min_attr = el.min ? `min=${escapeAttr(el.min)}` : '';
	let step_attr = el.step ? `step=${escapeAttr(el.step)}` : '';
	let id_attr = id.length ? `id="${escapeAttr(id)}"` : '';
	switch(el.tagName){
		case 'SELECT':
			let multiple = el.hasAttribute('multiple');
			let size = el.getAttribute('size');
			let option_html = '';
			Array.from(el.options).forEach(opt => {
				option_html +=
					`<option value="${escapeAttr(opt.name) || ''}" ${opt.disabled ? 'disabled' : ''}>
						${escapeHtml(opt.innerText)}
					</option>`;
			});
			return `<select ${id_attr} ${required_attr} ${multiple ? 'multiple' : ''} ${size ? 'size="' + size + '"' : ''} ${title_attr}>${option_html}</select>`;
		case 'INPUT':
			if(SUPPORT_INPUT_TYPES.includes(el.type.toLowerCase())){
				return `<input ${id_attr} type="${el.type}" ${max_attr} ${min_attr} ${step_attr} ${required_attr} ${pattern_attr} ${placeholder_attr} ${title_attr} ${el.maxLength > 0 ? 'maxlength="' + el.maxLength + '"' : ''}>`;
			}
			throw "no support type" + el.type;
		case 'TEXTAREA':
			return `<textarea ${id_attr} ${pattern_attr} ${required_attr} ${placeholder_attr} ${title_attr} ${el.maxLength > 0 ? 'maxlength="' + el.maxLength + '"' : ''}></textarea>`;
		default:
			throw "no support type" + el.type;
	}
}

/**
 * 批量填充功能
 */
export class ACBatchFiller {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let relative_elements = findAll(param.selector);
			if(!relative_elements.length){
				Toast.showInfo("没有可以填写的输入框");
				return;
			}
			let id = guid(NS);
			let shadow_el_html = cloneElementAsHtml(relative_elements[0], id);
			let el, dlg;
			let label_html = param.title || '批量设置';
			let doFill = () => {
				relative_elements.forEach(element => {
					switch(el.tagName){
						case 'TEXTAREA':
						case 'INPUT':
							element.value = el.value;
							break;
						case 'SELECT':
							if(el.multiple){
								let indexes = [];
								Array.from(el.selectedOptions).forEach(opt => {
									indexes.push(opt.index);
								});
								for(let i = 0; i < element.options.length; i++){
									element.options[i].selected = indexes.includes(i);
								}
							}else{
								element.selectedIndex = el.selectedIndex;
							}
							break;
						default:
							throw "no support tag:" + el.tagName;
					}
					triggerDomEvent(element, 'change');
				});
				dlg.close();
			};
			dlg = Dialog.show('',
				`<div class="${NS}">
	<label for="${id}">${label_html}</label>
	<div>${shadow_el_html}</div>
</div>`, {
					width: 350,
					buttons: [
						{
							default: true,
							title: '确定', callback: () => {
								doFill();
								dlg.close();
							}
						},
						{title: '关闭', className:DLG_CLS_WEAK_BTN}
					]
				});
			el = findOne('input,textarea,select', dlg.dom);
			el.focus();
			if(el.tagName === 'INPUT'){
				el.addEventListener('keydown', e => {
					if(e.keyCode === KEYS.Enter){
						doFill();
					}
				});
			}
			resolve();
		});
	}
}
