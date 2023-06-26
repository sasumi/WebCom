import {Dialog} from "../Widget/Dialog.js";

/**
 * 确认对话框
 * 参数：
 * node[data-confirm-title] 标题，缺省为”确认“
 * node[data-confirm-message] 内容
 */
export class ACConfirm {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let title = param.title;
			let message = param.message;
			Dialog.confirm(title || '确认', message).then(resolve, reject);
		});
	}
}
