import {createDomByHtml} from "../Lang/Dom.js";
import {trans} from "../I18N/Lang.js";
import {Toast} from "./Toast.js";

/**
 * copy text
 * @param {String} text
 * @param {Boolean} silent 是否在不兼容是进行提醒
 * @returns {boolean} 是否复制成功
 */
export const copy = (text, silent = false) => {
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
		!silent && Toast.showSuccess(trans('复制成功'));
		return succeeded;
	}catch(err){
		Toast.showWarning(trans('请按键: Ctrl+C, Enter复制内容'), text);
		console.error(err);
	} finally{
		txtNode.parentNode.removeChild(txtNode);
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
	let container = document.createElement('div')
	container.innerHTML = html
	container.style.position = 'fixed';
	container.style.pointerEvents = 'none';
	container.style.opacity = "0";

	// Detect all style sheets of the page
	let activeSheets = Array.prototype.slice.call(document.styleSheets)
		.filter(function(sheet){
			return !sheet.disabled;
		})

	// Mount the container to the DOM to make `contentWindow` available
	document.body.appendChild(container);

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