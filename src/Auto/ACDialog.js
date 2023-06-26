import {Dialog} from "../Widget/Dialog.js";

export class ACDialog {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let title = param.title;
			let url = param.url;
			let content = param.content;
			if(node.tagName === 'A'){
				url = node.href || url;
				title = node.title || title;
			}
			if(url){
				content = {src: url};
			}
			Dialog.show(title || '对话框', content, param);
		})
	}
}