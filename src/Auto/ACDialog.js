import {Dialog} from "../Widget/Dialog.js";

export class ACDialog{
	static init(node, {title, url}){
		let iframe_url = url || node.getAttribute('href');
		return new Promise((resolve, reject) => {
			Dialog.show(title || '对话框', {src:iframe_url});
			Dialog.callback = resolve;
		})
	}
}