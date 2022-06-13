import {ACEventChainBind} from "./ACBase.js";
import {mergerUriParam} from "../Lang/Net.js";

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
		top.WEBCOM_GET_LIB_MODULE().then(rsp=>{
			let dlg = new rsp.Dialog({
				title: param.title,
				content: {src: mergerUriParam(param.src, ACDialog.IFRAME_FLAG)},
				width: ACDialog.DEFAULT_WIDTH
			});
			dlg.show();
		});
	});
};

ACDialog.IFRAME_FLAG = {refEnv: 'inIframe'};
ACDialog.DEFAULT_WIDTH = 600;
