import {Dialog} from "../Widget/Dialog.js";
import {cutString} from "../Lang/String.js";

/**
 * 对话框组件
 * 参数：
 * node[data-dialog-url] iframe对话框页面地址
 * node[data-content] 对话框内容
 * a[title] | node[text] 对话框标题
 */
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
