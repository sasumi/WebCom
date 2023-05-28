import {formSerializeJSON} from "../Lang/Form.js";

export const getJSON = (url, data) => {
	return requestJSON(url, data, 'get');
}

export const postJSON = (url, data) => {
	return requestJSON(url, data, 'post');
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

export class ACForm {
	nodeInit(form, param){
		return new Promise((resolve, reject) => {
			postJSON(form.getAttribute('action'), formSerializeJSON(form)).then(resolve, reject);
		});
	}
}