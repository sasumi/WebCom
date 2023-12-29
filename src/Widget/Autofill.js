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
export const initAutofillButton = (scopeSelector = 'body') => {
	if(button_init){
		throw "autofill button already initialized";
	}
	button_init = true;
	insertStyleSheet(`
	#auto-fill-form-btn {position: absolute; left:calc(100vw - 200px); top:50px;z-index:99999;user-select:none;opacity:0.4;transition:all 0.1s linear; border-color:#ddd; white-space:nowrap; padding:0.5em 0.5em; border:1px solid #aaa; border-radius:5px; cursor:pointer; background-color:#fff;}
	#auto-fill-form-btn:hover {opacity:1}
	#auto-fill-form-btn:before {content:"\\e75d"; font-family:${Theme.IconFont}; margin-right:0.25em;}
	#auto-fill-form-btn s {display:block; cursor:move; float:right; text-decoration:none; margin:-20px -20px 0 0; background-color:white; width:20px; height:20px; overflow:hidden; box-sizing:border-box; text-align:center; border-radius:50%; box-shadow:1px 1px 10px #ccc;}
	#auto-fill-form-btn s:before {content:"\\e83d"; font-family:${Theme.IconFont};} 
`);
	let button = createDomByHtml('<span id="auto-fill-form-btn">自动填充 <s></s></span>', document.body);
	let move_trigger = button.querySelector('s');
	let start_offset = null;
	let moving = false;
	document.addEventListener('mousedown', e => {
		if(e.target === move_trigger){
			start_offset = {x: e.clientX, y: e.clientY, left: button.offsetLeft, top: button.offsetTop};
		}else{
			moving = false;
			start_offset = null;
		}
	});
	document.addEventListener('mouseup', e => {
		start_offset = null;
		setTimeout(() => {
			moving = false;
		}, 10);
	});
	document.addEventListener('mousemove', e => {
		if(start_offset){
			let left = (start_offset.left + e.clientX - start_offset.x);
			let top = (start_offset.top + e.clientY - start_offset.y);
			moving = true;
			window.requestAnimationFrame(() => {
				button.style.left = left + 'px';
				button.style.top = top + 'px';
			});
		}
	});
	button.addEventListener('click', e => {
		document.querySelectorAll(`${scopeSelector} form`).forEach(fillForm);
	});
	tryPositionInFirstForm(`${scopeSelector}`, button);
}

/**
 * 尝试定位在第一个有效的表单旁边
 * @param {String} scope
 * @param {Node} button
 */
const tryPositionInFirstForm = (scope, button) => {
	let firstAvailableForm = Array.from(document.querySelectorAll(`${scope} form`)).find(form => {
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
		let required = element.required ? true : randomInt(0, 1) > 0;
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