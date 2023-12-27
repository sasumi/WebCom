import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {getAvailableElements} from "../Lang/Form.js";
import {randomInt} from "../Lang/Math.js";
import {randomSentence} from "../Lang/String.js";
import {triggerDomEvent} from "../Lang/Event.js";
import {Theme} from "./Theme.js";

const DEFAULT_MAXLENGTH = 40;
const DEFAULT_MAX = 100;
let button_init = false;

/**
 * 初始化表单填充按钮
 * @param {String} scopeSelector 自动填充范围，缺省为全局
 */
export const initAutofillButton = (scopeSelector = 'document.body') => {
	if(button_init){
		throw "autofill button already initialized";
	}
	button_init = true;
	insertStyleSheet(`
	#auto-fill-form-btn {position: absolute; left:calc(100vw - 200px); top:50px;z-index:99999;user-select:none;opacity:0.4;transition:all 0.1s linear; border-color:#ddd; white-space:nowrap}
	#auto-fill-form-btn:hover {opacity:1}
	#auto-fill-form-btn:before {content:"\\e75d"; font-family:var(${Theme.IconFont}); margin-right:0.25em;}
`);
	let button = createDomByHtml('<span id="auto-fill-form-btn" class="button outline-button">自动填充</span>', document.body);
	let start_offset = null;
	let moving = false;
	document.body.addEventListener('mousedown', e => {
		if(e.target === button){
			start_offset = {x: e.clientX, y: e.clientY, left: e.target.offsetLeft, top: e.target.offsetTop};
		}else{
			moving = false;
			start_offset = null;
		}
	});
	document.body.addEventListener('mouseup', e => {
		start_offset = null;
		setTimeout(() => {
			moving = false;
		}, 10);
	});
	document.body.addEventListener('mousemove', e => {
		if(start_offset){
			button.style.left = (start_offset.left + e.clientX - start_offset.x) + 'px';
			button.style.top = (start_offset.top + e.clientY - start_offset.y) + 'px';
			moving = true;
		}
	});
	button.addEventListener('click', e => {
		if(moving){
			return;
		}
		document.body.querySelectorAll(`${scopeSelector} form`).forEach(fillForm);
	});
}

/**
 * 填充表单数据
 * @param {HTMLFormElement|Node} formOrContainer
 * @return {boolean}
 */
export const fillForm = (formOrContainer) => {
	let inputElements = getAvailableElements(formOrContainer);
	if(!inputElements.length){
		return false;
	}
	let radio_filled = {};
	inputElements.forEach(element => {
		if(element.type === 'hidden'){
			return;
		}
		let required = this.required ? true : randomInt(0, 1) > 0;
		let maxlength = parseInt(this.getAttribute('maxlength') || 0) || DEFAULT_MAXLENGTH;
		let name = this.name;

		switch(this.type){
			case 'text':
			case 'password':
			case 'search':
			case 'address':
				required && (element.value = randomSentence(maxlength));
				break;

			case 'checkbox':
				this.checked = Math.random() > 0.5;
				break;

			case 'radio':
				if(name.length && radio_filled[name]){
					break;
				}
				radio_filled[name] = true;
				required = true;
				let all_radios = Array.from(formOrContainer.querySelectorAll(`input[name=${name}]`));
				let matched_radio = all_radios[randomInt(0, all_radios.length - 1)];
				matched_radio.setAttribute('checked', 'checked');
				triggerDomEvent(element, 'change');
				return;

			case 'number':
				let min = this.min ? parseFloat(this.min) : 0;
				let max = this.max ? parseFloat(this.max) : DEFAULT_MAX;
				required && (this.value = randomInt(min, max));
				break;

			default:
				if(this.tagName === 'SELECT'){
					required && (element.selectedIndex = randomInt(0, element.querySelectorAll('option').length - 1));
				}else if(this.tagName === 'TEXTAREA'){
					required && (element.value = randomSentence(maxlength, true));
				}else{
					return;
				}
				break;
		}
		required && triggerDomEvent(element, 'change');
	});
}