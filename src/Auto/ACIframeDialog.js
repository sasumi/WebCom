import {Dialog} from "../Widget/Dialog.js";

export class ACIframeDialog{
	nodeInit(node, {title, src}){
		let iframe_url = src || node.getAttribute('href');
		return new Promise((resolve, reject) => {
			Dialog.show(title || '对话框', {src:iframe_url});
			resolve();
		})
	}
}