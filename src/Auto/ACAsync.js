import {Toast} from "../Widget/Toast.js";
import {formSerializeJSON} from "../Lang/Form.js";

export class ACAsync {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let data = null, method = 'get', url = null;
			if(node.tagName === 'FORM'){
				url = node.action;
				data = formSerializeJSON(node);
				method = node.method.toLowerCase() === 'get' ? 'get' : 'post';
			}else if(node.tagName === 'A'){
				url = node.href;
			}
			url = param.url || url;
			method = param.method || method;
			data = param.data || data;
			requestJSON(url, data, method).then(() => {
				location.reload();
				resolve();
			}, err => {
				Toast.showError(err);
				reject(err);
			})
		})
	}
}

const requestJSON = (url, data, method) => {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: method.toUpperCase(),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(rsp => rsp.json()).then(rsp => {
			if(rsp.code === 0){
				resolve(rsp.data);
			}else{
				reject(rsp.message || '系统错误');
			}
		}).catch(err => {
			reject(err);
		})
	});
}
