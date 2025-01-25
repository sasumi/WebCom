import {Theme} from "../Widget/Theme.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";

const UI_STATE_ACTIVE = 'active';
const UI_STATE_INACTIVE = 'inactive';

const STATE_NORMAL = 'normal';
const STATE_OVERLOAD = 'overload';
const MAIN_CLASS = Theme.Namespace + 'text-counter';
const STYLE_STR = `
.${MAIN_CLASS} {pointer-events:none; margin-left:0.5em; user-select:none;}
.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.5}
.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_ACTIVE}"] {}
.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.8; color:red}
.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_ACTIVE}"] {color:red}
`;

export class ACTextCounter {
	static init(input, params = {}){
		insertStyleSheet(STYLE_STR, Theme.Namespace+'text-counter');
		return new Promise((resolve, reject) => {
			let maxlength = parseInt(Math.max(input.maxLength, 0) || params.maxlength, 10) || 0;
			let trim = params.trim;
			if(!maxlength){
				console.debug('no maxlength set');
			}
			const trigger = createDomByHtml(`<span class="${MAIN_CLASS}" data-state="${STATE_NORMAL}" data-ui-state="${UI_STATE_INACTIVE}">0/${maxlength}</span>`);
			const updState = () => {
				let len = trim ? input.value.trim().length : input.value.length;
				let state = (maxlength && len > maxlength) ? STATE_OVERLOAD : STATE_NORMAL;
				trigger.setAttribute('data-state', state);
				trigger.innerHTML = maxlength ? (len + '/' + maxlength) : len;
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
