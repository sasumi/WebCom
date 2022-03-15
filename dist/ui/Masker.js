let masker = null;
let css_class = 'dialog-masker';
const DEFAULT_Z_INDEX = 999;

const showMasker = () => {
	if(!masker){
		masker = document.createElement('div');
		document.body.appendChild(masker);
		masker.className = css_class;
		let stylesheet = document.createElement('style');
		stylesheet.innerHTML = `.${css_class} {position:fixed;top:0;left:0;right:0;bottom:0;background:#33333342; z-index:${Masker.zIndex}}`;
		document.head.appendChild(stylesheet);
	}
	masker.style.display = '';
};

const hideMasker = () => {
	masker && (masker.style.display = 'none');
};

export const Masker = {
	zIndex: DEFAULT_Z_INDEX,
	show: showMasker,
	hide: hideMasker
}