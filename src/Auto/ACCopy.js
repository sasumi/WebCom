import {copy} from "../Widget/Copy.js";
import {Theme} from "../Widget/Theme.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {bindNodeActive} from "../Lang/Event.js";
import {PAIR_TAGS} from "../Lang/Html.js";

const NS = Theme.Namespace + 'ac-copy';

/**
 * 复制内容
 * 参数：
 * *[data-copy-content]
 * *[data-copy-trigger
 * 使用举例：
 * 1：单节点使用：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 * 2：内容区使用：
 * <span data-component="copy">Text Here</span>
 */
export class ACCopy {
	static TRIGGER_SELF = 1;
	static TRIGGER_INSIDE = 2;

	static COPY_CLASS = NS;

	/**
	 * @param {Node} node
	 * @param {Object} params
	 * @param {Number} params.trigger 触发器类型，TRIGGER_SELF：当前节点，TRIGGER_INSIDE：内部额外新建触发器
	 * @param {String} params.content 额外指定复制内容
	 */
	static init(node, params = {}){
		insertStyleSheet(`
			.${NS} {cursor:pointer; opacity:0.7; margin-left:0.2em;}
			.${NS}:hover {opacity:1}
			.${NS}:before {font-family:"${Theme.IconFont}", serif; content:"\\e6ae"}
		`, Theme.Namespace + 'ac-copy');

		let trigger = node;
		if((!params.trigger && PAIR_TAGS.includes(node.tagName)) ||
			(params.trigger && params.trigger === ACCopy.TRIGGER_INSIDE)){
			trigger = createDomByHtml(`<span class="${ACCopy.COPY_CLASS}" tabindex="1" title="复制"></span>`, node);
		}
		bindNodeActive(trigger, e => {
			let content = params.content || node.innerText;
			copy(content, true);
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	}
}