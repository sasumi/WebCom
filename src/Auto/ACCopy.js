import {copy} from "../Widget/Copy.js";
import {Theme} from "../Widget/Theme.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {bindNodeActive} from "../Lang/Event.js";
import {Toast} from "../Widget/Toast.js";

const NS = Theme.Namespace + 'ac-copy';
insertStyleSheet(`
	.${NS} {cursor:pointer; opacity:0.7; margin-left:0.2em;}
	.${NS}:hover {opacity:1}
	.${NS}:before {font-family:"${Theme.IconFont}", serif; content:"\\e6ae"}
`)

/**
 * 复制内容
 * 参数：
 * *[data-copy-content]
 * 使用举例：
 * 1：单节点使用：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 * 2：内容区使用：
 * <span data-component="copy">Text Here</span>
 */
export class ACCopy {
	static COPY_CLASS = NS;

	static init(node, param = {}){
		if(param.content){
			bindNodeActive(node, e=>{
				let content = param.content || node.innerText;
				copy(content);
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			return;
		}
		let trigger = createDomByHtml(`<span class="${ACCopy.COPY_CLASS}" tabindex="1" title="复制"></span>`, node);
		bindNodeActive(trigger, e => {
			let content = param.content || node.innerText;
			copy(content);
			Toast.showSuccess('内容已复制到剪贴板');
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	}
}