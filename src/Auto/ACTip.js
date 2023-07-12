import {Tip} from "../Widget/Tip.js";

/**
 * 提示信息
 * 参数：
 * node[data-tip-content] | node[title] 提示内容，必填
 * node[data-tip-triggertype] 提示方式，缺省为 hover 触发
 */
export class ACTip {
	static init(node, option){
		let {content, triggertype = 'hover'} = option;
		return new Promise((resolve, reject) => {
			if(!content && node.title){
				content = node.title;
				node.title = '';
			}
			if(!content){
				reject('content required');
				return;
			}
			Tip.bindNode(content, node, {triggerType:triggertype});
			resolve();
		});
	}
}