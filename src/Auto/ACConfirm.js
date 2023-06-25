import {Dialog} from "../Widget/Dialog.js";

export class ACConfirm {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let message = param.message || '确认信息';
			Dialog.confirm('确认', message).then(resolve, reject);
		});
	}
}