import {Toast} from "../Widget/Toast.js";
import {formSerializeJSON} from "../Lang/Form.js";
import {mergerUriParam, requestJSON} from "../Lang/Net.js";

export class ACAsync {
	//默认成功回调处理函数
	static COMMON_SUCCESS_RESPONSE_HANDLE = (rsp) => {
		let next = () => {
			if(rsp.forward_url){
				parent.location.href = rsp.forward_url;
			}else{
				parent.location.reload();
			}
		}
		rsp.message ? Toast.showSuccess(rsp.message, next) : next();
	};

	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let url, data, method,
				onsuccess = param.onsuccess || ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE;
			if(node.tagName === 'FORM'){
				url = node.action;
				data = formSerializeJSON(node);
				method = node.method.toLowerCase() === 'post' ? 'post' : 'get';
			}else if(node.tagName === 'A'){
				url = node.href;
				method = 'get';
			}

			//优先使用参数传参
			url = param.url || url;
			method = param.method || method || 'get';
			data = param.data || data;

			let loader = Toast.showLoadingLater('正在请求中，请稍候···');
			requestJSON(url, data, method).then(rsp => {
				if(rsp.code === 0){
					onsuccess(rsp);
					resolve();
				}else{
					Toast.showError(rsp.message || '系统错误');
				}
			}, err => {
				Toast.showError(err);
			}).finally(()=>{
				loader && loader.hide();
			})
		})
	}
}
