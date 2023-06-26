import {Toast} from "../Widget/Toast.js";

export class ACToast {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let message = param.message || '提示信息';
			let type = param.type || Toast.TYPE_INFO;
			Toast.showToast(message, type, Toast.DEFAULT_TIME_MAP[type], resolve);
		});
	}
}