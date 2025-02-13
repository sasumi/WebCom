import {Toast} from "../Widget/Toast.js";
import {HTTP_METHOD, Net, REQUEST_FORMAT, RESPONSE_FORMAT} from "../Lang/Net.js";
import {formSerializeJSON, formSerializeString} from "../Lang/Form.js";
import {BizEvent} from "../Lang/Event.js";

export const ASYNC_SUBMITTING_FLAG = 'data-submitting';

/**
 * 从提交事件中获取操作按钮绑定的表单动作，缺省返回表单action
 * @param {HTMLFormElement} form
 * @param {Event|Null} event
 * @returns {string}
 */
const getSubmitterFormAction = (form, event = null) => {
	//这里不能直接取 submitter.FormAction, FormAction会被浏览器赋值为当前页面地址。
	if(event && event.submitter && event.submitter.getAttribute('formaction')){
		return event.submitter.getAttribute('formaction');
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

	static onSuccess = new BizEvent();

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
		if(rsp.message){
			let tm = Toast.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS];
			Toast.showToast(rsp.message, Toast.TYPE_SUCCESS, tm);
			setTimeout(next, Math.max(tm - 500, 0));
		}else{
			next();
		}
	}

	static active(node, param, event){
		return new Promise((resolve, reject) => {
			event.preventDefault();
			if(node.getAttribute(ASYNC_SUBMITTING_FLAG)){
				return;
			}
			let url, data, method,
				//缺省使用全局ASync设定
				requestFormat = param.requestformat ? param.requestformat.toUpperCase() : ACAsync.REQUEST_FORMAT,
				onsuccess = ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE,
				submitter = null;

			if(param.onsuccess){
				if(typeof (param.onsuccess) === 'string'){
					onsuccess = window[param.onsuccess];
				}else{
					onsuccess = param.onsuccess;
				}
			}
			method = param.method;
			if(node.tagName === 'FORM'){
				url = getSubmitterFormAction(node, event);
				submitter = event.submitter;
				data = requestFormat === REQUEST_FORMAT.JSON ? formSerializeJSON(node) : formSerializeString(node);
				method = method || node.method;
			}else if(node.tagName === 'A'){
				url = node.href;
			}

			//优先使用参数传参
			url = param.url || url;
			data = param.data || data;

			//修正请求方法
			method = HTTP_METHOD.resolve(method);

			let loader = Toast.showLoadingLater('正在请求中，请稍候···');
			node.setAttribute(ASYNC_SUBMITTING_FLAG, '1');
			submitter && submitter.setAttribute(ASYNC_SUBMITTING_FLAG, '1');
			let sender = method === HTTP_METHOD.GET ? Net.get : Net.post;

			//当前Async仅支持JSON方式返回
			sender(url, data, {requestFormat, responseFormat:RESPONSE_FORMAT.JSON}).then(rsp => {
				if(rsp.code === 0){
					ACAsync.onSuccess.fire(node, rsp);
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
				node.removeAttribute(ASYNC_SUBMITTING_FLAG);
				submitter && submitter.removeAttribute(ASYNC_SUBMITTING_FLAG);
				loader && loader.hide();
			})
		})
	}
}
