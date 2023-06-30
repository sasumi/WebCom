import {resolveFileExtension, resolveFileName} from "./File.js";
import {BizEvent} from "./Event.js";

const CODE_TIMEOUT = 508;
const CODE_ABORT = 509;
const DEFAULT_TIMEOUT = 10000;

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
	FORM: 'FORM', // application/x-www-form-urlencoded
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
	return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
}

export const setHash = data => {
	location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
}

export const getHash = () => {
	return location.hash ? location.hash.substring(1) : '';
}

/**
 * 格式化请求数据
 * @param {Object} data
 * @param {String} format
 * @returns {String}
 */
const formatReqData = (data, format) => {
	switch(format){
		case REQUEST_FORMAT.JSON:
			return JSON.stringify(data);
		case REQUEST_FORMAT.FORM:
			return QueryString.stringify(data);
		default:
			throw `Data format illegal(${format})`;
	}
}

/**
 * 解析响应结果
 * @param {String} rspStr
 * @param {String} format
 * @returns {{}|any}
 */
const parserRspDataAsObj = (rspStr, format) => {
	switch(format){
		case RESPONSE_FORMAT.JSON:
			return JSON.parse(rspStr);
		case RESPONSE_FORMAT.FORM:
			return QueryString.parse(rspStr);
		default:
			throw `Response string type no support now(${format})`;
	}
}

/**
 * JSON方式请求
 * @param {String} url
 * @param {Object|String} data 数据，当前仅支持对象或queryString
 * @param {String} method
 * @param {Object} ext_option
 * @param {String} ext_option.requestFormat 请求类型（FORM_DATA|JSON） 默认为 REQUEST_FORMAT.JSON 格式
 * @param {String} ext_option.responseFormat 响应类型（JSON）默认为 RESPONSE_FORMAT.JSON 格式，暂不支持其他类型
 * @return {Promise<unknown>}
 */
export const requestJSON = (url, data, method = HTTP_METHOD.GET, ext_option = {}) => {
	return new Promise((resolve, reject) => {
		ext_option = Object.assign({
			requestFormat: REQUEST_FORMAT.JSON,
			responseFormat: RESPONSE_FORMAT.JSON
		}, ext_option);

		method = method.toUpperCase();
		if(HTTP_METHOD[method] === undefined){
			throw "method no supported:" + method;
		}
		if(ext_option.responseFormat !== RESPONSE_FORMAT.JSON){
			throw "response type no supported: " + opt.responseFormat;
		}
		let opt = {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		};
		if(method === HTTP_METHOD.GET){
			url = mergerUriParam(url, data);
		}else{
			switch(ext_option.requestFormat){
				case REQUEST_FORMAT.JSON:
					opt.headers['Content-Type'] = 'application/json';
					opt.body = typeof (data) === 'string' ? data : JSON.stringify(data);
					break;
				case REQUEST_FORMAT.FORM:
					opt.headers['Content-Type'] = 'application/x-www-form-urlencoded';
					opt.body = QueryString.stringify(data);
					break;
				default:
					throw "request format no supported:" + ext_option.requestFormat;
			}
		}
		fetch(url, opt).then(rsp => {
			return rsp.json();
		}).then(rsp => {
			resolve(rsp);
		}).catch(err => {
			reject(err);
		})
	});
}

/**
 * xhr 网络请求
 */
export class Net {
	cgi = null; //请求接口
	data = null; //请求数据
	option = {
		method: HTTP_METHOD.GET, //请求方法
		timeout: DEFAULT_TIMEOUT, //超时时间(毫秒)(超时将纳入onError处理)
		requestDataFormat: REQUEST_FORMAT.FORM, //请求数据格式
		responseDataFormat: RESPONSE_FORMAT.TEXT, //响应数据格式
		headers: {}, //请求头部信息
	};
	xhr = null;
	onError = new BizEvent(); //(error,code)
	onResponse = new BizEvent(); //(body)
	onStateChange = new BizEvent(); //(state) http 状态码
	onProgress = new BizEvent(); //(percent)

	constructor(cgi, data, option = {}){
		this.cgi = cgi;
		this.data = data;
		this.option = {
			...this.option,
			...option
		};
		this.xhr = new XMLHttpRequest();
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
			this.onResponse.fire(parserRspDataAsObj(this.xhr.responseText, this.option.responseDataFormat));
		});
		this.xhr.addEventListener("error", () => {
			this.onError.fire(this.xhr.statusText, this.xhr.status);
		});
		this.xhr.addEventListener("abort", () => {
			this.onError.fire('Request aborted.', CODE_ABORT);
		});
		for(let key in this.option.headers){
			this.xhr.setRequestHeader(key, this.option.headers[key]);
		}
		if(this.option.requestDataFormat === REQUEST_FORMAT.JSON){
			this.xhr.setRequestHeader('content-type', 'application/json')
		}
		if(this.option.timeout){
			setTimeout(() => {
				this.onError.fire('Request timeout', CODE_TIMEOUT);
			}, this.option.timeout);
		}
	}

	send(){
		this.xhr.open(this.option.method, this.cgi, true);
		if(this.option.method === 'POST'){
			this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		this.xhr.send(formatReqData(this.data, this.option.requestDataFormat));
	}

	abort(){
		this.xhr.abort();
	}

	static get(cgi, data, option = {}){
		option.method = option.method || HTTP_METHOD.GET;
		return Net.request(cgi, data, option);
	}

	static getJSON(cgi, data, option = {}){
		option.requestDataFormat = option.requestDataFormat || REQUEST_FORMAT.JSON;
		option.responseDataFormat = option.responseDataFormat || RESPONSE_FORMAT.JSON;
		return Net.get(cgi, data, option);
	}

	static post(cgi, data, option = {}){
		option.method = option.method || HTTP_METHOD.POST;
		return Net.request(cgi, data, option);
	}

	static postJSON(cgi, data, option = {}){
		option.requestDataFormat = option.requestDataFormat || REQUEST_FORMAT.JSON;
		option.responseDataFormat = option.responseDataFormat || RESPONSE_FORMAT.JSON;
		return Net.post(cgi, data, option);
	}

	static request(cgi, data, option = {}){
		return new Promise((resolve, reject) => {
			let req = new Net(cgi, data, option);
			req.onResponse = resolve;
			req.onError = reject;
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
	link.parentNode.removeChild(link);
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
