import {createDomByHtml, remove} from "../Lang/Dom.js";
import {trans} from "../I18N/Lang.js";
import {Toast} from "./Toast.js";
import {Dialog} from "./Dialog.js";

/**
 * copy text
 * @param {String} text
 * @param {Boolean} show_msg 是否在不兼容是进行提醒
 * @returns {boolean} 是否复制成功
 */
export const copy = (text, show_msg = false) => {
	let txtNode = createDomByHtml('<textarea readonly="readonly">', document.body);
	txtNode.style.cssText = 'position:absolute; left:-9999px;';
	let y = window.pageYOffset || document.documentElement.scrollTop;
	txtNode.addEventListener('focus', function(){
		window.scrollTo(0, y);
	});
	txtNode.value = text;
	txtNode.select();
	try{
		let succeeded = document.execCommand('copy');
		show_msg && Toast.showSuccess(trans('复制成功'));
		return succeeded;
	}catch(err){
		console.error(err);
		show_msg && Dialog.prompt('复制失败，请手工复制', {initValue:text});
	} finally{
		remove(txtNode);
	}
	return false;
};

/**
 * Copy formatted html content
 * @param html
 * @param silent
 */
export const copyFormatted = (html, silent = false) => {
	// Create container for the HTML
	let container = createDomByHtml(`
		<div style="position:fixed; pointer-events:none; opacity:0;">${html}</div>
	`, document.body);

	// Detect all style sheets of the page
	let activeSheets = Array.prototype.slice.call(document.styleSheets)
		.filter(function(sheet){
			return !sheet.disabled;
		})

	// Copy to clipboard
	window.getSelection().removeAllRanges();

	let range = document.createRange();
	range.selectNode(container);
	window.getSelection().addRange(range);

	document.execCommand('copy');
	for(let i = 0; i < activeSheets.length; i++){
		activeSheets[i].disabled = true;
	}
	document.execCommand('copy')
	for(let i = 0; i < activeSheets.length; i++){
		activeSheets[i].disabled = false;
	}
	document.body.removeChild(container);
	!silent && Toast.showSuccess(trans('复制成功'));
}
