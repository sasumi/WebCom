import {Theme} from "../Widget/Theme.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";

const UI_STATE_ACTIVE = 'active';
const UI_STATE_INACTIVE = 'inactive';

const STATE_NORMAL = 'normal';
const STATE_OVERLOAD = 'overload';

const MAIN_CLASS = Theme.Namespace + '-text-counter';

insertStyleSheet(`
.${MAIN_CLASS} {pointer-event:none; margin-left:0.5em; user-select:none;}
.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.5}
.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_ACTIVE}"] {}
.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.8; color:red}
.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_ACTIVE}"] {color:red}
`);

export class ACTextCounter {
	static init(input, param = {}){
		return new Promise((resolve, reject) => {
			let maxlength = input.maxlength || param.maxlength;
			let trim = param.trim;
			if(!maxlength){
				throw "input maxlength required";
			}
			const trigger = createDomByHtml(`<span class="${MAIN_CLASS}" data-state="${STATE_NORMAL}" data-ui-state="${UI_STATE_INACTIVE}">0/${maxlength}</span>`);
			const updState = () => {
				let len = trim ? input.value.trim().length : input.value.length;
				let state = len > maxlength ? STATE_OVERLOAD : STATE_NORMAL;
				console.log(state);
				trigger.setAttribute('data-state', state);
				trigger.innerHTML = len + '/' + maxlength;
			}
			input.parentNode.insertBefore(trigger, input.nextSibling);
			input.addEventListener('focus', () => {
				trigger.setAttribute('data-ui-state', UI_STATE_ACTIVE);
			});
			input.addEventListener('blur', () => {
				trigger.setAttribute('data-ui-state', UI_STATE_INACTIVE);
			});
			input.addEventListener('input', updState);
			updState();
			resolve();
		})
	}
}
