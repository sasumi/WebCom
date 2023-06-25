import {Toast} from "../Widget/Toast.js";

export class ACAsync {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let cgi_url = param.url || node.getAttribute('href');
			postJSON(cgi_url, null).then(() => {
				location.reload();
				resolve();
			}, err => {
				Toast.showError(err);
				reject(err);
			})
		})
	}
}

const getJSON = (url, data) => {
	return requestJSON(url, data, 'get');
}

const postJSON = (url, data) => {
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
