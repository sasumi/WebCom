import {ACEventChainBind} from "./ACBase.js";

export const ACAsync = (node, param) => {
	if(!param.url && node.nodeName === 'A' && node.href){
		param.url = node.href;
	}

	if(node.nodeName === 'A'){
		let cgi = node.getAttribute('href');
	}
	ACEventChainBind(node, 'click', next => {
		console.log('send async');
		next();
	})
};