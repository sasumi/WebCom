import {ACEventChainBind} from "./ACBase.js";
import {HTTP_METHOD} from "../Lang/Net.js";

export const ACAsync = (node, param) => {
	if(node.nodeName === 'A'){
		param.cgi = param.cgi|| node.href;
		param.method = param.method || HTTP_METHOD.GET;
	}
	if(node.nodeName === 'FORM'){
		param.cgi = param.cgi || node.action;
		param.method = param.cgi || node.method || HTTP_METHOD.GET;
	}
	
	ACEventChainBind(node, 'click', next => {
		console.log('send async');
		next();
	})
};