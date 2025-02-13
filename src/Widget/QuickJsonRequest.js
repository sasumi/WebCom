import {isObject} from "../Lang/Util.js";
import {HTTP_METHOD, requestJSON} from "../Lang/Net.js";
import {Toast} from "./Toast.js";

/**
 * @param showMsg
 * @return {{success: boolean, pending: boolean, error: boolean}}
 */
const getToastOption = (showMsg) => {
	if(typeof showMsg === 'boolean' || showMsg === null){
		return {
			pending: !!showMsg,
			success: !!showMsg,
			error: !!showMsg,
		};
	}
	if(isObject(showMsg)){
		return {
			pending: !!showMsg.pending,
			success: !!showMsg.success,
			error: !!showMsg.error,
		};
	}
	throw "silent config param illegal";
}

export const QuickJsonRequest = {
	/**
	 * 默认请求提示语（允许重置）
	 */
	PENDING_MSG: '正在请求，请稍候···',

	/**
	 * 默认请求成功、错误判断（允许重置）
	 * @param {Object} rsp
	 * @return {string[]} 返回[成功提示语, 错误提示语] 如果相应提示语不为空,表示发生成功或失败
	 * @constructor
	 */
	RESPONSE_SUCCESS_ERROR: (rsp) => {
		return (rsp && rsp.code && rsp.code === 0) ? [rsp.message || '操作成功', ''] : ['', rsp.message || '请求发生错误'];
	},

	request: (method, url, data, showMsg = true) => {
		let toastOpt = getToastOption(showMsg);
		let pendingToast = null;
		if(toastOpt.pending){
			pendingToast = Toast.showLoadingLater(QuickJsonRequest.PENDING_MSG);
		}
		return new Promise((resolve, reject) => {
			requestJSON(url, data, method)
				.then(rsp => {
					let [successMsg, errorMsg] = QuickJsonRequest.RESPONSE_SUCCESS_ERROR(rsp);
					if(successMsg){
						toastOpt.success && Toast.showSuccess(successMsg);
						resolve(rsp);
					}else if(errorMsg){
						toastOpt.error && Toast.showError(errorMsg);
						reject(rsp);
					}else{
						throw "response error";
					}
				})
				.finally(() => {
					pendingToast && pendingToast.hide();
				});
		});
	},

	/**
	 * 快速 GET JSON请求
	 * @param {String} url
	 * @param {Object|String} data
	 * @param {Object|Boolean} showMsg
	 * @return {Promise<Object,String>}
	 */
	get(url, data, showMsg = true){
		return QuickJsonRequest.request(HTTP_METHOD.GET, url, data, showMsg);
	},

	/**
	 * 快速 POST JSON请求
	 * @param {String} url
	 * @param {Object|String} data
	 * @param {Object|Boolean} showMsg
	 * @return {Promise<Object,String>}
	 */
	post(url, data, showMsg = true){
		return QuickJsonRequest.request(HTTP_METHOD.POST, url, data, showMsg);
	}
}