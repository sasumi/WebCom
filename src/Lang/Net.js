import {resolveFileExtension, resolveFileName} from "./File.js";
import {BizEvent} from "./Event.js";
import {Toast} from "../Widget/Toast.js";
import {remove} from "./Dom.js";

const CODE_TIMEOUT = 508;
const CODE_ABORT = 509;
const DEFAULT_TIMEOUT = 0;

/**
 * HTTP请求方法
 * @type {{TRACE: string, HEAD: string, DELETE: string, POST: string, GET: string, CONNECT: string, OPTIONS: string, PUT: string}}
 */
export const HTTP_METHOD = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	OPTIONS: 'OPTIONS',
	HEAD: 'HEAD',
	CONNECT: 'CONNECT',
	TRACE: 'TRACE',
};

/**
 * 请求格式
 * @type {{FORM: string, JSON: string}}
 */
export const REQUEST_FORMAT = {
	JSON: 'JSON',
	FORM: 'FORM',
}

/**
 * 请求格式对应的 Content-Type
 * @type {{}}
 */
const REQUEST_CONTENT_TYPE_MAP = {
	[REQUEST_FORMAT.JSON]: 'application/json',
	[REQUEST_FORMAT.FORM]: 'application/x-www-form-urlencoded',
};

/**
 * 请求数据格式处理
 * @type {{}}
 */
const REQUEST_DATA_HANDLE_MAP = {
	[REQUEST_FORMAT.JSON]: (data, method) => {
		if(method === HTTP_METHOD.GET){
			return '';
		}
		if(data instanceof FormData){
			let obj = {};
			data.forEach((v,k)=>{
				obj[k] = v;
			});
			return JSON.stringify(obj);
		}
		return JSON.stringify(data);
	},
	[REQUEST_FORMAT.FORM]: (data, method) => {
		if(method === HTTP_METHOD.GET){
			return '';
		}
		return data instanceof FormData ? data : QueryString.stringify(data);
	}
};

/**
 * 响应格式
 * @type {{XML: string, JSON: string, HTML: string, TEXT: string}}
 */
export const RESPONSE_FORMAT = {
	JSON: 'JSON',
	XML: 'XML',
	HTML: 'HTML',
	TEXT: 'TEXT',
}

/**
 * 响应格式对应的 Accept 头
 * @type {{}}
 */
const RESPONSE_ACCEPT_TYPE_MAP = {
	[RESPONSE_FORMAT.JSON]: 'application/json',
	[RESPONSE_FORMAT.XML]: 'text/xml',
	[RESPONSE_FORMAT.HTML]: 'text/html',
	[RESPONSE_FORMAT.TEXT]: 'text/plain',
};

/**
 * 合并请求参数
 * @param {String} uri
 * @param {String|Object} data
 * @returns {*}
 */
export const mergerUriParam = (uri, data) => {
	return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
}

export const setHash = data => {
	location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
}

export const getHash = () => {
	return location.hash ? location.hash.substring(1) : '';
}

/**
 * JSON方式请求
 * @param {String} url
 * @param {Object|String} data 数据，当前仅支持对象或queryString
 * @param {String} method
 * @param {Object} option
 * @param {String} option.timeout 请求超时时间（ms）超过指定时间将主动断开链接，0 表示不设置超时时间。
 * @param {String} option.timeoutCallback 超时回调
 * @param {String} option.requestFormat 请求类型（FORM_DATA|JSON） 默认为 REQUEST_FORMAT.JSON 格式
 * @param {String} option.responseFormat 响应类型（JSON）默认为 RESPONSE_FORMAT.JSON 格式，暂不支持其他类型
 * @return {Promise<unknown>}
 */
export const requestJSON = (url, data, method = HTTP_METHOD.GET, option = {}) => {
	return method === HTTP_METHOD.GET ? Net.getJSON(url, data, option) : Net.postJSON(url, data, option);
}

/**
 * 文件上传，同时发送 Accept=application/json，以方便调用方返回
 * @param {String} url 接口地址
 * @param {Object} fileMap 文件映射对象，key为变量名称，如：{name:File}
 * @param callbacks
 * @param {Function} callbacks.onSuccess 成功回调
 * @param {Function} callbacks.onProgress 进度更新回调
 * @param {Function} callbacks.onError 错误回调
 * @param {Function} callbacks.onAbort 中断回调
 * @param {Object|null} extParam 额外传递body变量
 * @return {XMLHttpRequest}
 */
export const uploadFile = (url, fileMap, callbacks, extParam = null) => {
	let {onSuccess, onProgress, onError, onAbort} = callbacks;

	//缺省值
	onProgress = onProgress || function(){};
	onError = onError || function(err){Toast.showError(err)};
	onAbort = onAbort || onError;

	let formData = new FormData();
	let total = 0;
	for(let name in fileMap){
		formData.append(name, fileMap[name]);
		total += fileMap[name].size;
	}
	if(extParam){
		for(let k in extParam){
			formData.append(k, extParam[k]);
		}
	}
	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.upload.addEventListener('progress', e => {
		onProgress(e.loaded, total);
	}, false);
	xhr.addEventListener('load', () => {
		if(xhr.readyState === 4){
			if(xhr.status === 200){
				onProgress(total, total);
				onSuccess(xhr.responseText);
			}else{
				onError(xhr.responseText || xhr.statusText);
			}
		}
	});
	xhr.addEventListener('error', e => {
		onError(e);
	});
	xhr.addEventListener('abort', () => {
		onAbort('请求中断');
	});
	xhr.open('POST', url);
	xhr.setRequestHeader('Accept', RESPONSE_ACCEPT_TYPE_MAP[RESPONSE_FORMAT.JSON])
	xhr.send(formData);
	return xhr;
}

/**
 * XHR 网络请求
 */
export class Net {
	cgi = null; //请求接口
	data = null; //请求数据
	option = {
		method: HTTP_METHOD.GET, //请求方法
		timeout: DEFAULT_TIMEOUT, //超时时间(毫秒)(超时将纳入onError处理)
		requestFormat: REQUEST_FORMAT.FORM, //请求数据格式
		responseFormat: RESPONSE_FORMAT.TEXT, //响应数据格式
		headers: {}, //请求头部信息
	};
	xhr = null;
	onError = new BizEvent(); //(error,code)
	onResponse = new BizEvent(); //(body)
	onStateChange = new BizEvent(); //(state) http 状态码
	onProgress = new BizEvent(); //(percent)

	/**
	 * 构造器
	 * @param {String} cgi
	 * @param {String|*} data
	 * @param {Object} option
	 */
	constructor(cgi, data, option = {}){
		this.cgi = cgi;
		this.data = data;
		this.option = {
			...this.option,
			...option
		};
		//patch GET request parameter
		if(this.option.method === HTTP_METHOD.GET && this.data){
			this.cgi = mergerUriParam(this.cgi, this.data);
		}
		this.xhr = new XMLHttpRequest();
		this.xhr.open(this.option.method, this.cgi, true);
		this.xhr.addEventListener("progress", e => {
			if(e.lengthComputable){
				this.onProgress.fire(e.loaded / e.total);
			}else{
				this.onProgress.fire(null);
			}
		});
		this.xhr.onreadystatechange = () => {
			this.onStateChange.fire(this.xhr.status);
		}
		this.xhr.addEventListener("load", () => {
			let ret;
			switch(option.responseFormat){
				case RESPONSE_FORMAT.JSON:
					try {
						ret = JSON.parse(this.xhr.responseText);
					} catch(err){
						this.onError.fire('JSON解析失败：'+err, this.xhr.status);
					}
					break;
				case RESPONSE_FORMAT.XML:
				case RESPONSE_FORMAT.TEXT:
				case RESPONSE_FORMAT.HTML:
				default:
					ret = this.xhr.responseText
					break;
			}
			this.onResponse.fire(ret);
		});
		this.xhr.addEventListener("error", () => {
			this.onError.fire(this.xhr.statusText, this.xhr.status);
		});
		this.xhr.addEventListener("abort", () => {
			this.onError.fire('Request aborted.', CODE_ABORT);
		});
		this.xhr.setRequestHeader('content-type', REQUEST_CONTENT_TYPE_MAP[this.option.requestFormat]);
		this.xhr.setRequestHeader('Accept', RESPONSE_ACCEPT_TYPE_MAP[this.option.responseFormat]);
		for(let key in this.option.headers){
			this.xhr.setRequestHeader(key, this.option.headers[key]);
		}
		if(this.option.timeout){
			setTimeout(() => {
				this.xhr.abort();
				this.onError.fire('Request timeout', CODE_TIMEOUT);
			}, this.option.timeout);
		}
	}

	/**
	 * 发送请求
	 */
	send(){
		let data = this.data ? REQUEST_DATA_HANDLE_MAP[this.option.requestFormat](this.data) : null;
		this.xhr.send(data);
	}

	/**
	 * 终止请求
	 */
	abort(){
		this.xhr.abort();
	}

	static get(cgi, data, option = {}){
		option.method = option.method || HTTP_METHOD.GET;
		return Net.request(cgi, data, option);
	}

	static getJSON(cgi, data, option = {}){
		option.requestFormat = option.requestFormat || REQUEST_FORMAT.JSON;
		option.responseFormat = option.responseFormat || RESPONSE_FORMAT.JSON;
		return Net.get(cgi, data, option);
	}

	static post(cgi, data, option = {}){
		option.method = option.method || HTTP_METHOD.POST;
		return Net.request(cgi, data, option);
	}

	static postJSON(cgi, data, option = {}){
		option.requestFormat = option.requestFormat || REQUEST_FORMAT.JSON;
		option.responseFormat = option.responseFormat || RESPONSE_FORMAT.JSON;
		return Net.post(cgi, data, option);
	}

	static request(cgi, data, option = {}){
		return new Promise((resolve, reject) => {
			let req = new Net(cgi, data, option);
			req.onResponse.listen(ret => {
				resolve(ret);
			});
			req.onError.listen(error => {
				reject(error);
			});
			req.send();
		});
	}
}

/**
 * 文件下载
 * 注意：在浏览器中如果非同域，自定义保存名称无效
 * @param src 文件地址
 * @param save_name 保存名称（包含扩展名，为空表示自动从src中提取）
 */
export const downloadFile = (src, save_name) => {
	if(!save_name){
		save_name = resolveFileName(src) + '.' + resolveFileExtension(src);
	}
	let link = document.createElement('a');
	link.href = src;
	link.download = save_name;
	document.body.appendChild(link);
	link.click();
	remove(link);
};

export const QueryString = {
	parse(str){
		if(str[0] === '?'){
			str = str.substring(1);
		}
		let retObj = {};
		let qs = str.split('&');
		qs.forEach(q => {
			let [k, v] = q.split('=');
			if(!k.length){
				return;
			}
			retObj[decodeURIComponent(k)] = decodeURIComponent(v);
		});
		return retObj;
	},

	stringify(data){
		if(typeof (data) === 'undefined' || typeof (data) !== 'object'){
			return data
		}
		let query = []
		for(let param in data){
			if(data.hasOwnProperty(param)){
				if(data[param] === null){
					continue; //null数据不提交
				}
				if(typeof (data[param]) === 'object' && data[param].length){
					data[param].forEach(item => {
						query.push(encodeURI(param + '=' + item))
					});
				}else if(typeof (data[param]) === 'object'){
					//todo 不处理子级object、空数组情况
				}else{
					query.push(encodeURI(param + '=' + data[param]))
				}
			}
		}
		return query.join('&')
	}
};

/**
 * open link without referer
 * @param link
 * @returns {boolean}
 */
export const openLinkWithoutReferer = (link) => {
	let instance = window.open("about:blank");
	instance.document.write("<meta http-equiv=\"refresh\" content=\"0;url=" + link + "\">");
	instance.document.close();
	return false;
};
