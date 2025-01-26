import {resolveFileExtension, resolveFileName} from "./File.js";
import {BizEvent} from "./Event.js";
import {remove} from "./Dom.js";
import {regQuote} from "./String.js";

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
 * 合并请求参数
 * @param {String} uri
 * @param {String|Object} data
 * @returns {*}
 */
export const mergerUriParam = (uri, data) => {
	if(data === null ||
		data === undefined ||
		(Array.isArray(data) && data.length === 0) ||
		(typeof (data) === 'string' && data.length === 0)
	){
		return uri;
	}
	return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
}

export const setHash = data => {
	location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
}

export const getHash = () => {
	return location.hash ? location.hash.substring(1) : '';
}

const CODE_TIMEOUT = 508;
const CODE_ABORT = 509;
const DEFAULT_TIMEOUT = 0;

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
			data.forEach((v, k) => {
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
 * 转换数据到FormData
 * @param {*} data
 * @return {FormData}
 */
const dataToFormData = (data) => {
	let fd = new FormData;
	if(!data){
		return fd;
	}
	if(typeof (data) === 'string'){
		let dataMap = QueryString.parse(data);
		for(let k in dataMap){
			fd.append(k, dataMap[k]);
		}
	}else if(data.toString.indexOf('FormData') >= 0){
		data.forEach((val, name) => {
			fd.append(name, val);
		})
	}else if(typeof (data) === 'object'){
		for(let k in data){
			fd.append(k, data[k]);
		}
	}
	let err = "Convert data to FormData fail";
	console.error(err, data);
	throw err;
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
 * XHR 网络请求
 */
export class Net {
	cgi = null; //请求接口
	data = null; //请求数据
	fileMap = null;
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
	 * @param {String} cgi 请求URL
	 * @param {*} data 请求发送数据
	 * @param {Object} option 选项
	 * @param {Object|null} fileMap 发送文件map
	 */
	constructor(cgi, data, option = {}, fileMap = null){
		this.cgi = cgi;
		this.data = data;
		this.fileMap = fileMap;
		this.option = {
			...this.option,
			...option
		};

		//文件上传，强制选项：POST，去除ContentType（浏览器默认 multipart/form-data; boundary=***
		if(this.fileMap){
			this.option.method = HTTP_METHOD.POST;
			this.option.requestFormat = null;
		}

		//patch GET request parameter
		if(this.option.method === HTTP_METHOD.GET && this.data){
			this.cgi = mergerUriParam(this.cgi, this.data);
		}
		this.xhr = new XMLHttpRequest();
		this.xhr.withCredentials = true;
		this.xhr.open(this.option.method, this.cgi, true);
		this.xhr.addEventListener("progress", e => {
			if(e.lengthComputable){
				this.onProgress.fire(e.loaded / e.total);
			}
		});
		this.xhr.onreadystatechange = () => {
			this.onStateChange.fire(this.xhr.status);
		}
		this.xhr.addEventListener("load", e => {
			if(this.xhr.readyState === 4){
				if(this.xhr.status === 200){
					this.onProgress.fire(e.total, e.total || e.loaded); //fix loaded == 0 in onload event
					let ret;
					switch(option.responseFormat){
						case RESPONSE_FORMAT.JSON:
							try{
								ret = JSON.parse(this.xhr.responseText);
							}catch(err){
								this.onError.fire('JSON解析失败：' + err, this.xhr.status);
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
				}else{
					this.onError.fire(this.xhr.responseText || this.xhr.statusText);
				}
			}
		});
		this.xhr.addEventListener("error", () => {
			this.onError.fire(this.xhr.statusText, this.xhr.status);
		});
		this.xhr.addEventListener("abort", () => {
			this.onError.fire('Request aborted.', CODE_ABORT);
		});
		if(this.option.requestFormat){
			this.xhr.setRequestHeader('content-type', REQUEST_CONTENT_TYPE_MAP[this.option.requestFormat]);
		}
		if(this.option.responseFormat){
			this.xhr.setRequestHeader('Accept', RESPONSE_ACCEPT_TYPE_MAP[this.option.responseFormat]);
		}
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
	 * 文件上传需要合并参数
	 */
	send(){
		if(this.fileMap){
			let data = new FormData();
			for(let name in this.fileMap){
				data.append(name, this.fileMap[name]);
			}
			if(this.data){
				let d = dataToFormData(this.data);
				d.forEach((val, name) => {
					data.append(name, val);
				});
			}
			this.xhr.send(data);
		}else{
			let data = this.data ? REQUEST_DATA_HANDLE_MAP[this.option.requestFormat](this.data) : null;
			this.xhr.send(data);
		}
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

	/**
	 * 以JSON方式请求，并以JSON方式处理响应
	 * @param cgi
	 * @param data
	 * @param option
	 * @return {Promise<unknown>}
	 */
	static getJSON(cgi, data, option = {}){
		//强制，如果不适用请使用 get() 方法
		option.requestFormat = REQUEST_FORMAT.JSON;
		option.responseFormat = RESPONSE_FORMAT.JSON;
		return Net.get(cgi, data, option);
	}

	/**
	 * 请求JSONP
	 * @param {String} url 请求URL
	 * @param {String|Object} data 请求参数
	 * @param {String} callback_name 回调函数名称，建议固定避免CSRF
	 * @param {Number} timeout 超时时间（毫秒）
	 * @return {Promise<unknown>}
	 */
	static getJSONP(url, data, callback_name = 'callback', timeout = 3000){
		return new Promise((resolve, reject) => {
			let tm = window.setTimeout(function(){
				window[callback_name] = function(){
				};
				reject(`timeout in ${timeout}ms`);
			}, timeout);

			window[callback_name] = function(data){
				window.clearTimeout(tm);
				resolve(data);
			}

			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = mergerUriParam(url, data);
			document.getElementsByTagName('head')[0].appendChild(script);
		});
	}

	static post(cgi, data, option = {}){
		option.method = option.method || HTTP_METHOD.POST;
		return Net.request(cgi, data, option);
	}

	/**
	 * 以JSON方式请求，并以JSON方式处理响应
	 * @param cgi
	 * @param data
	 * @param option
	 * @return {Promise<unknown>}
	 */
	static postJSON(cgi, data, option = {}){
		//强制，如果不适用请使用 post() 方法
		option.requestFormat = REQUEST_FORMAT.JSON;
		option.responseFormat = RESPONSE_FORMAT.JSON;
		return Net.post(cgi, data, option);
	}

	/**
	 * 上传文件（缺省采用post方式，服务器响应JSON）
	 * @param {String} url
	 * @param {Object} fileMap
	 * @param {Object|null} data
	 * @param {Object} option
	 * @return {Net}
	 */
	static uploadFile = (url, fileMap, data = null, option = {}) => {
		let n = new Net(url, data, option, fileMap);
		//异步发送，外部可以对n绑定事件
		setTimeout(() => {
			n.send();
		}, 0);
		return n;
	}

	static request(cgi, data, option = {}, fileMap = null){
		return new Promise((resolve, reject) => {
			let req = new Net(cgi, data, option, fileMap);
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

	/**
	 * 替换制定URL中变量
	 * @param {String} queryString
	 * @param {String} key
	 * @param {String} newValue
	 * @return {string}
	 */
	replace(queryString, key, newValue){
		if(!new RegExp('[?&]' + regQuote(key) + '=').test(queryString)){
			return queryString + (queryString.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(newValue);
		}
		return queryString.replace(new RegExp('([?&])(' + encodeURIComponent(key) + '=)[^\\&]+'), '$1$2' + encodeURIComponent(newValue));
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
