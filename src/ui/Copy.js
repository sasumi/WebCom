import {createDomByHtml} from "../lang/Dom.js";
import trans from "../i18n/Lang.js";

/**
 * 复制文本
 * @param {String} text
 * @param {Boolean} compatible 是否在不兼容是进行提醒
 * @returns {boolean} 是否复制成功
 */
export const copy = (text, compatible = false) => {
	let t = createDomByHtml('<textarea readonly="readonly">', document.body);
	t.style.cssText = 'position:absolute; left:-9999px;';
	let y = window.pageYOffset || document.documentElement.scrollTop;
	t.addEventListener('focus', function(){
		window.scrollTo(0, y);
	});
	t.value = text;
	t.select();
	let succeeded = false;
	try{
		succeeded = document.execCommand('copy');
	}catch(err){
		console.error(err);
	}
	t.parentNode.removeChild(t);
	if(!succeeded && compatible){
		window.prompt(trans('请按键: Ctrl+C, Enter复制内容'), text);
		return true;
	}
	return succeeded;
};
