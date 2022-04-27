import {resolveFileExtension, resolveFileName} from "./File.js";

const CODE_TIMEOUT = 508;
const CODE_ABORT = 509;
const DEFAULT_TIMEOUT = 10;

/**
 * 构建queryString
 * @param {String|Object} data
 * @returns {string}
 */
export const buildParam = data => {
	if(typeof (data) === 'string'){
		return data;
	}
	let str = [];
	if(typeof (data) === 'object'){
		for(let i in data){
			str.push(encodeURI(i) + '=' + encodeURI(data[i]));
		}
	}
	return str.join('&');
};

/**
 * 合并请求参数
 * @param {String} uri
 * @param {String|Object} data
 * @returns {*}
 */
export const mergerUriParam = (uri, data)=>{
	return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + buildParam(data);
}

export const setHash = data => {
	location.href = location.href.replace(/#.*$/g, '') + '#' + buildParam(data);
}

export const getHash = () => {
	return location.hash ? location.hash.substring(1) : '';
}

export const getHashObject = (key = '') => {
	let hash = getHash();
	if(!hash){
		return {};
	}
	let obj = {};
	let ps = hash.split('&');
	for(let i = 0; i < ps.length; i++){
		let [k, v] = ps[i].split('=').map(decodeURIComponent);
		obj[k] = v;
	}
	return key ? obj[key] : obj;
}

export function Net(url, data, options = {}){
	this.url = url;
	this.data = data;
	this.option = {method: 'GET', timeout: DEFAULT_TIMEOUT, headers: {}, ...options};
	this.xhr = new XMLHttpRequest();
	this.xhr.addEventListener("progress", e => {
		if(e.lengthComputable){
			this.onProgress(e.loaded, e.total);
		}else{
			this.onProgress();
		}
	});
	this.xhr.onreadystatechange = (e) => {
		this.onStateChange(this.xhr.status);
	}
	this.xhr.addEventListener("load", () => {
		this.onResponse(this.xhr.responseText);
	});
	this.xhr.addEventListener("error", e => {
		this.onError(this.xhr.statusText, this.xhr.status);
	});
	this.xhr.addEventListener("abort", e => {
		this.onError('Request aborted.', CODE_ABORT);
	});
	for(let key in this.option.headers){
		this.xhr.setRequestHeader(key, this.option.headers[key]);
	}
	if(this.option.timeout){
		setTimeout(() => {
			this.onError('Request timeout', CODE_TIMEOUT);
		}, this.option.timeout * 1000);
	}
}

Net.prototype.send = function(){
	this.xhr.open(this.option.method, this.url, true);
	if(this.option.method === 'POST'){
		this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}
	this.xhr.send(buildParam(this.data));
}

Net.prototype.abort = function(){
	this.xhr.abort();
}

Net.prototype.onError = (error, code) => {
}
Net.prototype.onResponse = (body) => {
}
Net.prototype.onStateChange = state => {
}
Net.prototype.onProgress = percent => {
}

Net.get = (url, data) => {
	return new Promise((resolve, reject) => {
		let req = new Net(url, data);
		req.onResponse = resolve;
		req.onError = reject;
		req.send();
	});
}

Net.post = (url, data) => {
	return new Promise((resolve, reject) => {
		let req = new Net(url, data, {method: 'POST'});
		req.onResponse = resolve;
		req.onError = reject;
		req.send();
	});
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

	let data_str = [];
	data.forEach(function(v, key){
		v.forEach(function(val, k){
			data_str.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
		})
	});
	return data_str.join('&');
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