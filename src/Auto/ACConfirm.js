import {Dialog} from "../Widget/Dialog.js";

/**
 * 确认对话框
 * 参数：
 * node[data-confirm-title] 标题，缺省为”确认“
 * node[data-confirm-message] 内容
 */
export class ACConfirm {
	static active(node, param, event){
		return new Promise((resolve, reject) => {
			let title = param.title;
			let message = param.message || '确认进行该项操作？';
			console.log('confirm dialog');
			Dialog.confirm(title || '确认', message).then(resolve, reject);
		});
	}
}
