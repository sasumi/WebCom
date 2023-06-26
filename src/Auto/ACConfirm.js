import {Dialog} from "../Widget/Dialog.js";

export class ACConfirm {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let title = param.title;
			let message = param.message;
			Dialog.confirm(title || '确认', message).then(resolve, reject);
		});
	}
}