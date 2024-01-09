import {createDomByHtml, findAll, insertStyleSheet} from "../Lang/Dom.js";
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
export const initAutofillButton = (scopeSelector = 'body') => {
	if(button_init){
		throw "autofill button already initialized";
	}
	button_init = true;
	insertStyleSheet(`
	#auto-fill-form-btn {position: absolute; left:calc(100vw - 200px); top:50px;z-index:99999;user-select:none;opacity:0.4;transition:all 0.1s linear; border-color:#ddd; border:1px solid #aaa; --size:2em; border-radius:5px; width:var(--size); height:var(--size); line-height:var(--size); text-align:center; cursor:pointer; background-color:#fff;}
	#auto-fill-form-btn:hover {opacity:1}
	#auto-fill-form-btn:before {content:"\\e75d"; font-family:${Theme.IconFont}}
`);
	let button = createDomByHtml('<span id="auto-fill-form-btn" title="自动填充"></span>', document.body);
	button.addEventListener('click', e => {
		findAll(`${scopeSelector} form`).forEach(fillForm);
	});
	tryPositionInFirstForm(`${scopeSelector}`, button);
}

/**
 * 尝试定位在第一个有效的表单旁边
 * @param {String} scope
 * @param {Node} button
 */
const tryPositionInFirstForm = (scope, button) => {
	let firstAvailableForm = findAll(`${scope} form`).find(form => {
		return !!getAvailableElements(form).length;
	});
	if(firstAvailableForm){
		button.style.left = firstAvailableForm.offsetLeft + firstAvailableForm.offsetWidth - button.offsetWidth + 'px';
		button.style.top = firstAvailableForm.offsetTop + 'px';
	}
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
		let required = element.required ? true : randomInt(0, 5) > 2;
		let maxlength = parseInt(element.getAttribute('maxlength') || 0) || DEFAULT_MAXLENGTH;
		let name = element.name;

		switch(element.type){
			case 'text':
			case 'password':
			case 'search':
			case 'address':
				required && (element.value = randomSentence(maxlength));
				break;

			case 'checkbox':
				element.checked = Math.random() > 0.5;
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
				let min = element.min ? parseFloat(element.min) : 0;
				let max = element.max ? parseFloat(element.max) : DEFAULT_MAX;
				required && (element.value = randomInt(min, max));
				break;

			default:
				if(element.tagName === 'SELECT'){
					required && (element.selectedIndex = randomInt(0, element.querySelectorAll('option').length - 1));
				}else if(element.tagName === 'TEXTAREA'){
					required && (element.value = randomSentence(maxlength, true));
				}else{
					return;
				}
				break;
		}
		required && triggerDomEvent(element, 'change');
	});
}