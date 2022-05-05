import {Dialog} from "../UI/Dialog.js";
import {ACEventChainBind} from "./ACBase.js";

export const ACDialog = (node, param) => {
	if(!param.src && node.tagName === 'A' && node.href){
		param.src = node.href;
	}
	if(!param.src){
		throw "ACDialog require src value";
	}
	if(!param.title && node.tagName === 'A'){
		param.title = node.getAttribute('title') || node.innerText;
	}

	ACEventChainBind(node, 'click', next=>{
		let dlg = new Dialog({
			title: param.title,
			content: {src:param.src}
		});
		dlg.show();
	});
};