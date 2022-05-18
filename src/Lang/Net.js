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
 * @type {{FORM_DATA: string, JSON: string}}
 */
export const REQUEST_FORMAT = {
	JSON: 'JSON',
	FORM_DATA: 'FORM_DATA',
}

/**
 * 响应格式
 * @type {{FORM: string, XML: string, JSON: string, HTML: string, TEXT: string}}
 */
export const RESPONSE_FORMAT = {
	JSON: 'JSON',
	XML: 'XML',
	HTML: 'HTML',
	TEXT: 'TEXT',
	FORM: 'FORM_DATA',
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
		case REQUEST_FORMAT.FORM_DATA:
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

export class Net {
	cgi = null; //请求接口
	data = null; //请求数据
	option = {
		method: HTTP_METHOD.GET, //请求方法
		timeout: DEFAULT_TIMEOUT, //超时时间(毫秒)(超时将纳入onError处理)
		requestDataFormat: REQUEST_FORMAT.FORM_DATA, //请求数据格式
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
		this.xhr.onreadystatechange = (e) => {
			this.onStateChange.fire(this.xhr.status);
		}
		this.xhr.addEventListener("load", () => {
			this.onResponse.fire(parserRspDataAsObj(this.xhr.responseText, this.option.responseDataFormat));
		});
		this.xhr.addEventListener("error", e => {
			this.onError.fire(this.xhr.statusText, this.xhr.status);
		});
		this.xhr.addEventListener("abort", e => {
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
 * @param src 文件地址
 * @param save_name 保存名称
 * @param ext 保存扩展名，缺省自动解析文件地址后缀
 */
export const downloadFile = (src, save_name, ext) => {
	ext = ext || resolveFileExtension(src);
	save_name = save_name || resolveFileName(src);
	let link = document.createElement('a');
	link.href = src;
	link.download = save_name + ext;
	document.body.appendChild(link);
	link.click();
	link.parentNode.removeChild(link);
};

/**
 * 获取表单提交的数据
 * @description 不包含文件表单(后续HTML5版本可能会提供支持)
 * @param {HTMLFormElement} form
 * @returns {string}
 */
export const getFormData = (form) => {
	let data = {};
	let elements = form.elements;

	elements.forEach(function(item){
		let name = item.name;
		if(!data[name]){
			data[name] = [];
		}
		if(item.type === 'radio'){
			if(item.checked){
				data[name].push(item.value);
			}
		}else if(item.getAttribute('name') !== undefined && item.getAttribute('value') !== undefined){
			data[name].push(item.value);
		}
	});
	return QueryString.stringify(data);
};

export const QueryString = {
	parse(str){
		if(str[0] === '?'){
			str = str.substring(1);
		}
		let retObj = {};
		let qs = str.split('&');
		qs.forEach(q=>{
			let [k,v]=q.split('=');
			if(!k.length){
				return;
			}
			retObj[decodeURIComponent(k)] = decodeURIComponent(v);
		});
		return retObj;
	},

	stringify(data){
		if(typeof (data) === 'string'){
			return data;
		}
		let strList = [];
		if(typeof (data) === 'object'){
			for(let i in data){
				strList.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
			}
		}
		return strList.join('&');
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