import {Theme} from "../Widget/Theme.js";
import {insertStyleSheet} from "../Lang/Dom.js";
import {bindNodeEvents} from "../Lang/Event.js";

const NS = Theme.Namespace + 'input-ellipsis';

export class ACInputEllipsis {
	static init(input, params = {}){
		insertStyleSheet(`.${NS}[readonly] {text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}`, NS);
		input.tabIndex = 0;
		bindNodeEvents(input, ['click', 'focus'], () => {
			input.classList.remove(NS);
			input.removeAttribute('readonly');
			input.title = '';
		});
		bindNodeEvents(input, 'blur', () => {
			input.title = input.value;
			input.classList.add(NS);
			input.setAttribute('readonly', 'readonly');
		}, null, true);
	}
}
