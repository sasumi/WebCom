import {Toast} from "../Widget/Toast.js";
import {REQUEST_FORMAT, requestJSON} from "../Lang/Net.js";
import {formSerializeJSON, formSerializeString} from "../Lang/Form.js";

const SUBMITTING_FLAG = 'data-submitting';

/**
 * 修正从 input[type=submit][formaction] 按钮提交的表单动作
 * @param {HTMLFormElement} form
 * @param {Event|Null} event
 * @returns {string}
 */
const fixFormAction = (form, event = null) => {
	if(event && event.submitter && event.submitter.formAction){
		return event.submitter.formAction;
	}
	return form.action;
}

/**
 * 异步组件
 * 参数：
 * ACAsync.FORM_DATA_PACKAGE_TYPE 设置数据打包方式，如后端是PHP，为兼容PHP数组识别语法，请使用：PACKAGE_TYPE_STRING 方式打包
 * 缺省为 PACKAGE_TYPE_JSON 方式打包
 * node[data-async-url] | a[href] | form[action] 请求url
 * node[data-async-method] | form[method] 请求方法，缺省为GET
 * node[data-async-data] | form{*} 请求数据
 */
export class ACAsync {
	static REQUEST_FORMAT = REQUEST_FORMAT.JSON;

	//默认成功回调处理函数
	//允许外部重新定义
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

	static active(node, param = {}, event = null){
		return new Promise((resolve, reject) => {
			if(node.getAttribute(SUBMITTING_FLAG)){
				return;
			}
			let url, data, method,
				onsuccess = ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE,
				submitter = null;

			if(param.onsuccess){
				if(typeof (param.onsuccess) === 'string'){
					onsuccess = window[param.onsuccess];
				}else{
					onsuccess = param.onsuccess;
				}
			}
			if(node.tagName === 'FORM'){
				url = fixFormAction(node, event);
				submitter = event.submitter;
				data = ACAsync.REQUEST_FORMAT === REQUEST_FORMAT.JSON ? formSerializeJSON(node) : formSerializeString(node);
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
			node.setAttribute(SUBMITTING_FLAG, '1');
			submitter && submitter.setAttribute(SUBMITTING_FLAG, '1');
			requestJSON(url, data, method, {requestFormat: ACAsync.REQUEST_FORMAT}).then(rsp => {
				if(rsp.code === 0){
					onsuccess(rsp);
					resolve();
				}else{
					console.error('Request Error:', url, data, method, rsp);
					Toast.showError(rsp.message || '系统错误');
					reject(`系统错误(${rsp.message})`);
				}
			}, err => {
				Toast.showError(err);
				reject(err);
			}).finally(() => {
				node.removeAttribute(SUBMITTING_FLAG);
				submitter && submitter.removeAttribute(SUBMITTING_FLAG);
				loader && loader.hide();
			})
		})
	}
}
