import {Dialog} from "../Widget/Dialog.js";

export class ACPreview {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let src = param.src;
			if(node.tagName === 'IMG'){
				src = src || node.dataset.src || node.src;

			}
			let title = param.title;
			let message = param.message;
			Dialog.confirm(title || '确认', message).then(resolve, reject);
		});
	}
}
