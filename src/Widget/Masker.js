import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";

let default_masker = null;
let CSS_CLASS = Theme.Namespace + '-masker';

const showMasker = (masker) => {
	if(!masker){
		masker = createDomByHtml(`<div class="${CSS_CLASS}"></div>`, document.body);
	}
	masker.style.display = '';
	return masker;
};

const hideMasker = (masker) => {
	masker && (masker.style.display = 'none');
};

const Masker = {
	zIndex: Theme.MaskIndex,
	show: () => {
		default_masker = showMasker(default_masker);
	},
	hide: () => {
		hideMasker(default_masker);
	},
	instance: () => {
		let new_masker;
		return {
			show: () => {
				new_masker = showMasker(new_masker)
			},
			hide: () => {
				hideMasker(new_masker)
			}
		}
	}
}

insertStyleSheet(`
.${CSS_CLASS} {
	position:fixed;
	top:0;left:0;
	right:0;
	bottom:0;
	background:#33333342;
	backdrop-filter:${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER};
	z-index:${Masker.zIndex}}
`, Theme.Namespace + 'masker-style');
export {Masker};

