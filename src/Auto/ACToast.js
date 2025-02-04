import {Toast} from "../Widget/Toast.js";

/**
 * 对象触发时显示提示信息
 * 参数：
 * node[data-toast-message]
 * node[data-toast-type] type 为 Toast.type 类型
 */
export class ACToast {
	static active(node, param, event){
		return new Promise((resolve, reject) => {
			let message = param.message || '提示信息';
			let type = param.type || Toast.TYPE_INFO;
			Toast.showToast(message, type, Toast.DEFAULT_TIME_MAP[type], resolve);
		});
	}
}