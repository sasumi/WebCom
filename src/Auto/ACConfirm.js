import {Dialog} from "../Widget/Dialog.js";

export class ACConfirm {
	nodeInit(node, param){
		let message = param.message;
		return new Promise((resolve, reject) => {
			Dialog.confirm('确认', message).then(resolve, reject);
		});
	}
}