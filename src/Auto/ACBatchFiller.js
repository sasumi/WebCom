import {Toast} from "../Widget/Toast.js";
import {findAll} from "../Lang/Dom.js";
import {escapeAttr, escapeHtml} from "../Lang/Html.js";
import {Dialog, DLG_CLS_WEAK_BTN} from "../Widget/Dialog.js";
import {Theme} from "../Widget/Theme.js";
import {guid} from "../Lang/Util.js";
import {triggerDomEvent} from "../Lang/Event.js";
import {getAvailableElements} from "../Lang/Form.js";

const NS = Theme.Namespace + 'ac-batch-filler';

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

const KEEP_ATTRIBUTES = ['type', 'required', 'pattern', 'placeholder', 'size', 'maxlength', 'title', 'min', 'max', 'step', 'multiple'];

const cloneElementAsHtml = (el, newId = '') => {
	let keep_attr_str = [];
	if(newId){
		keep_attr_str.push(`id="${escapeAttr(newId)}"`);
	}
	KEEP_ATTRIBUTES.forEach(attr_name => {
		if(el.hasAttribute(attr_name)){
			let attr_val = el.getAttribute(attr_name);
			keep_attr_str.push(attr_val !== null ? `${attr_name}="${escapeAttr(attr_val)}"` : attr_name);
		}
	});
	switch(el.tagName){
		case 'SELECT':
			let option_html = '';
			Array.from(el.options).forEach(opt => {
				option_html +=
					`<option value="${escapeAttr(opt.name) || ''}" ${opt.disabled ? 'disabled' : ''}>
						${escapeHtml(opt.innerText)}
					</option>`;
			});
			return `<select ${keep_attr_str.join(' ')}>${option_html}</select>`;
		case 'INPUT':
			if(SUPPORT_INPUT_TYPES.includes(el.type.toLowerCase())){
				return `<input ${keep_attr_str.join(' ')}>`;
			}
			throw "no support type" + el.type;
		case 'TEXTAREA':
			return `<textarea ${keep_attr_str.join(' ')}></textarea>`;
		default:
			throw "no support type" + el.type;
	}
}

const initElement = el => {
	if(el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')){
		el.checked = false;
	}else if(el.tagName === 'SELECT'){
		Array.from(el.options).forEach(opt => {
			opt.selected = false;
		});
	}else{
		el.value = '';
	}
}

/**
 * 同步两个元素值
 * @param fromEl
 * @param toEl
 */
const syncValue = (fromEl, toEl) => {
	if(fromEl.tagName === 'INPUT' && (fromEl.type === 'checkbox' || fromEl.type === 'radio')){
		toEl.checked = fromEl.checked;
	}else if(fromEl.tagName === 'SELECT' && fromEl.multiple){
		Array.from(toEl.options).forEach(opt => {
			opt.selected = false;
		});
		Array.from(fromEl.selectedOptions).forEach(opt => {
			Array.from(toEl.options)[opt.index].selected = true;
		});
	}else{
		toEl.value = fromEl.value;
	}
}

/**
 * 批量填充功能
 */
export class ACBatchFiller {
	static active(node, param, event){
		return new Promise((resolve, reject) => {
			let relative_elements = findAll(param.relative_elements);

			if(!relative_elements.length){
				throw "param.selector or param.container_selector required";
			}

			relative_elements = relative_elements.filter(el => {
				return el.type !== 'BUTTON' && el.type !== 'RESET' && el.tagName !== 'BUTTON';
			});

			if(!relative_elements.length){
				Toast.showInfo("没有可以填写的输入框");
				return;
			}
			let id = guid(NS);
			let shadow_el_html = cloneElementAsHtml(relative_elements[0], id);
			let el, dlg, form;
			let label_html = param.title || '批量设置';
			let doFill = () => {
				relative_elements.forEach(element => {
					syncValue(el, element);
					triggerDomEvent(element, 'change');
				});
				dlg.close();
			};

			dlg = Dialog.show('',
`
<style>
.${NS} {padding:2em 2em 1em 2em}
.${NS} label {font-size:1.1em; margin-bottom:.75em; display:block;}
.${NS} input,
.${NS} textarea,
.${NS} select {width:100% !important; box-sizing:border-box; min-height:2.25em;}
.${NS} textarea {min-height:5em; resize:vertical}
</style>
<form class="${NS}">
	<label for="${id}">${label_html}</label>
	<div>${shadow_el_html}</div>
</form>`, {
					width: 350,
					buttons: [
						{
							default: true,
							title: '确定', callback: () => {
								doFill();
								dlg.close();
							}
						},
						{title: '关闭', className: DLG_CLS_WEAK_BTN, ariaLabel: 'Close'}
					]
				});
			el = getAvailableElements(dlg.dom, true)[0];
			el.focus();
			initElement(el);
			form = dlg.dom.querySelector('form');
			form.addEventListener('submit', doFill);
			resolve();
		});
	}
}
