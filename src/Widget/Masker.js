import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";

let masker = null;
let CSS_CLASS = 'dialog-masker';

const showMasker = () => {
	return;
	if(!masker){
		masker = createDomByHtml(`<div class="${CSS_CLASS}"></div>`, document.body);
	}
	masker.style.display = '';
};

const hideMasker = () => {
	masker && (masker.style.display = 'none');
};

const Masker = {
	zIndex: Theme.MaskIndex,
	show: showMasker,
	hide: hideMasker
}

insertStyleSheet(`.${CSS_CLASS} {position:fixed;top:0;left:0;right:0;bottom:0;background:#33333342;backdrop-filter:blur(5px);
 z-index:${Masker.zIndex}}`, Theme.Namespace+'masker-style');
export {Masker};

