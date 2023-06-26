import {Dialog} from "../Widget/Dialog.js";
import {cutString} from "../Lang/String.js";

export class ACDialog {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let title, url, content;

			if(node.tagName === 'A'){
				url = node.href || url;
				title = node.title || title;
			}
			if(node.innerText){
				title = cutString(node.innerText, 30);
			}

			title = param.title || title;
			url = param.url || url;
			content = param.content || content;
			if(url){
				content = {src: url};
			}
			Dialog.show(title || '对话框', content, param);
			resolve();
		})
	}
}
