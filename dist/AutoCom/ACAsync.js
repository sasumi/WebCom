import {ACEventChainBind} from "./ACBase.js";
import {HTTP_METHOD, Net, REQUEST_FORMAT, RESPONSE_FORMAT} from "../Lang/Net.js";
import {Toast} from "../Widget/Toast.js";

const getDataObjectByForm = (form) => {
	let data = new FormData(form);
	return Object.fromEntries(data.entries());
};

export const ACAsync = (node, param) => {
	let AS_FORM = false;
	if(node.nodeName === 'A'){
		param.cgi = param.cgi || node.href;
		param.method = param.method || HTTP_METHOD.GET;
	}
	if(node.nodeName === 'FORM'){
		param.cgi = param.cgi || node.action;
		param.method = param.cgi || node.method || HTTP_METHOD.GET;
		AS_FORM = true;
	}

	param.requestDataFormat = REQUEST_FORMAT.JSON;
	param.responseDataFormat = RESPONSE_FORMAT.JSON;

	ACEventChainBind(node, 'click', next => {
		console.log('send async');
		if(AS_FORM){
			if(!node.reportValidity()){
				return false;
			}
			param.data = getDataObjectByForm(node);
		}
		Net.request(param.cgi, param.data, param).then(ACAsync.commonResponseSuccessHandle, ACAsync.commonResponseErrorHandle);
		next();
	})
};

ACAsync.commonResponseSuccessHandle = (rsp) => {
	if(rsp.code !== 0){
		Toast.showWarning(rsp.message);
		return;
	}
	parent.location.reload();
};

ACAsync.commonResponseErrorHandle = (error)=>{
	Toast.showError(error);
}
