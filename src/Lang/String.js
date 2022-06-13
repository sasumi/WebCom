/**
 * 转义HTML
 * @param {string} str
 * @returns {string}
 */
import {round} from "./Math.js";

export const escapeHtml = str => {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * 反转义HTML
 * @param {String} str
 * @returns {string}
 */
export const unescapeHtml = (str)=>{
	return String(str)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
};

/**
 * 转义HTML到属性值
 * @param {String} s
 * @param preserveCR
 * @returns {string}
 */
export const escapeAttr = (s, preserveCR = '') => {
	preserveCR = preserveCR ? '&#13;' : '\n';
	return ('' + s) /* Forces the conversion to string. */
		.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
		.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		/*
		You may add other replacements here for HTML only
		(but it's not necessary).
		Or for XML, only if the named entities are defined in its DTD.
		*/
		.replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
		.replace(/[\r\n]/g, preserveCR);
}

export const stringToEntity = (str, radix) => {
	let arr = str.split('')
	radix = radix || 0
	return arr.map(item =>
		`&#${(radix ? 'x' + item.charCodeAt(0).toString(16) : item.charCodeAt(0))};`).join('')
}

/**
 * 格式化数字
 * @param {Number} num
 * @param {Number} precision
 * @return {string|Number}
 */
export const formatSize = (num, precision = 2) => {
	if(isNaN(num)){
		return num;
	}
	let str = '', i, mod = 1024;
	if(num < 0){
		str = '-';
		num = Math.abs(num);
	}
	let units = 'B KB MB GB TB PB'.split(' ');
	for(i = 0; num > mod; i++){
		num /= mod;
	}
	return str + round(num, precision) + units[i];
}

export const entityToString = (entity) => {
	let entities = entity.split(';')
	entities.pop()
	return entities.map(item => String.fromCharCode(
		item[2] === 'x' ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join('')
}

let _helper_div;
export const decodeHTMLEntities = (str) => {
	if(!_helper_div){
		_helper_div = document.createElement('div');
	}
	// strip script/html tags
	str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
	str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
	_helper_div.innerHTML = str;
	str = _helper_div.textContent;
	_helper_div.textContent = '';
	return str;
}

/**
 * 中英文字符串截取（中文按照2个字符长度计算）
 * @param str
 * @param len
 * @param eclipse_text
 * @returns {*}
 */
export const cutString = (str, len, eclipse_text)=>{
	if(eclipse_text === undefined){
		eclipse_text = '...';
	}
	let r = /[^\x00-\xff]/g;
	if(str.replace(r, "mm").length <= len){
		return str;
	}
	let m = Math.floor(len / 2);
	for(let i = m; i < str.length; i++){
		if(str.substr(0, i).replace(r, "mm").length >= len){
			return str.substr(0, i) + eclipse_text;
		}
	}
	return str;
};

/**
 * 正则表达式转义
 * @param str
 * @returns {string}
 */
export const regQuote = (str)=>{
	return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
};

/**
 * CSS 选择器转义
 * @param {String} str
 * @returns {String}
 */
export const cssSelectorEscape = (str)=>{
	return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
};

const BASE64_KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
export const utf8Decode = (e) => {
	let t = "";
	let n = 0;
	let r = 0,
		c1 = 0,
		c2 = 0,
		c3 = 0;
	while(n < e.length){
		r = e.charCodeAt(n);
		if(r < 128){
			t += String.fromCharCode(r);
			n++
		}else if(r > 191 && r < 224){
			c2 = e.charCodeAt(n + 1);
			t += String.fromCharCode((r & 31) << 6 | c2 & 63);
			n += 2
		}else{
			c2 = e.charCodeAt(n + 1);
			c3 = e.charCodeAt(n + 2);
			t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			n += 3
		}
	}
	return t
};

export const utf8Encode = (e) => {
	e = e.replace(/\r\n/g, "n");
	let t = "";
	for(let n = 0; n < e.length; n++){
		let r = e.charCodeAt(n);
		if(r < 128){
			t += String.fromCharCode(r)
		}else if(r > 127 && r < 2048){
			t += String.fromCharCode(r >> 6 | 192);
			t += String.fromCharCode(r & 63 | 128)
		}else{
			t += String.fromCharCode(r >> 12 | 224);
			t += String.fromCharCode(r >> 6 & 63 | 128);
			t += String.fromCharCode(r & 63 | 128)
		}
	}
	return t;
};

export const base64UrlSafeEncode = (text) => {
	return utf8Encode(text)
		.replace('+', '-')
		.replace('/', '_');
};

export const Base64Encode = (text) => {
	let t = "";
	let n, r, i, s, o, u, a;
	let f = 0;
	text = utf8Encode(text);
	while(f < text.length){
		n = text.charCodeAt(f++);
		r = text.charCodeAt(f++);
		i = text.charCodeAt(f++);
		s = n >> 2;
		o = (n & 3) << 4 | r >> 4;
		u = (r & 15) << 2 | i >> 6;
		a = i & 63;
		if(isNaN(r)){
			u = a = 64
		}else if(isNaN(i)){
			a = 64
		}
		t = t + BASE64_KEY_STR.charAt(s) + BASE64_KEY_STR.charAt(o) + BASE64_KEY_STR.charAt(u) + BASE64_KEY_STR.charAt(a)
	}
	return t
};

export const base64Decode = (text) => {
	let t = "";
	let n, r, i;
	let s, o, u, a;
	let f = 0;
	text = text.replace(/\+\+[++^A-Za-z0-9+/=]/g, "");
	while(f < text.length){
		s = BASE64_KEY_STR.indexOf(text.charAt(f++));
		o = BASE64_KEY_STR.indexOf(text.charAt(f++));
		u = BASE64_KEY_STR.indexOf(text.charAt(f++));
		a = BASE64_KEY_STR.indexOf(text.charAt(f++));
		n = s << 2 | o >> 4;
		r = (o & 15) << 4 | u >> 2;
		i = (u & 3) << 6 | a;
		t = t + String.fromCharCode(n);
		if(u !== 64){
			t = t + String.fromCharCode(r)
		}
		if(a !== 64){
			t = t + String.fromCharCode(i)
		}
	}
	t = utf8Decode(t);
	return t
};


/**
 * 获取u8字符串长度(一个中文字按照3个字数计算)
 * @param str
 * @returns {number}
 */
export const getUTF8StrLen = (str)=>{
	let realLength = 0;
	let len = str.length;
	let charCode = -1;
	for(let i = 0; i < len; i++){
		charCode = str.charCodeAt(i);
		if(charCode >= 0 && charCode <= 128){
			realLength += 1;
		}else{
			realLength += 3;
		}
	}
	return realLength;
};

const DEFAULT_RANDOM_STRING = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';

/**
 * 产生随机字符串
 * @param {Number} length
 * @param {String} sourceStr
 * @returns {String}
 */
export const randomString = (length = 6, sourceStr = DEFAULT_RANDOM_STRING)=>{
	let codes = '';
	for(let i = 0; i < length; i++){
		let rnd =Math.round(Math.random()*(sourceStr.length - 1));
		codes += sourceStr.substring(rnd, rnd + 1);
	}
	return codes;
};

/**
 * 字符串转成首字母大写
 * @param {String} str
 * @param {Boolean} capitalize_first 是否将第一个单词首字母大写
 * @return {string}
 */
export const strToPascalCase = (str, capitalize_first = false)=>{
	let words = [];
	str.replace(/[-_\s+]/g, ' ').split(' ').forEach((word, idx) => {
		words.push((idx === 0 && !capitalize_first) ? word : capitalize(word));
	});
	return words.join('');
}

/**
 * @param s
 * @return {string}
 */
export const capitalize = (s) => {
	if(typeof s !== 'string'){
		return ''
	}
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * 数值转为CSS可用样式
 * @param {Number|String} h
 * @returns {string}
 */
export const dimension2Style = h => {
	if(isNum(h)){
		return h + 'px';
	}
	return h+'';
};

/**
 * 检测是否为数值
 * @param val
 * @return {boolean}
 */
export const isNum = (val)=>{
	return !isNaN(val);
}

export const TRIM_BOTH = 0;
export const TRIM_LEFT = 1;
export const TRIM_RIGHT = 2;
export const trim = (str, chars = '', dir = TRIM_BOTH)=>{
	if(chars.length){
		let regLeft = new RegExp('^['+regQuote(chars)+']+'),
		regRight = new RegExp('['+regQuote(chars)+']+$');
		return dir === TRIM_LEFT ? str.replace(regLeft, '') : (dir === TRIM_RIGHT ? str.replace(regRight, '') : str.replace(regLeft, '').replace(regRight, ''));
	}else{
		return dir === TRIM_BOTH ? str.trim() : (dir === TRIM_LEFT ? str.trimStart() : dir === str.trimEnd());
	}
}

/**
 * 高亮文本
 * @param {String} text 文本
 * @param {String} kw 关键字
 * @param {String} replaceTpl 替换模板
 * @returns {void|string|*}
 */
export const highlightText = (text, kw, replaceTpl = '<span class="matched">%s</span>') => {
	if(!kw){
		return text;
	}
	return text.replace(new RegExp(regQuote(kw), 'ig'), match => {
		return replaceTpl.replace('%s', match);
	});
};

/**
 * 转换blob数据到base64
 * @param {Blob} blob
 * @returns {Promise<unknown>}
 */
export const convertBlobToBase64 = async (blob)=>{
	return await blobToBase64(blob);
}

/**
 * 转换blob数据到Base64
 * @param {Blob} blob
 * @returns {Promise<unknown>}
 */
const blobToBase64 = blob => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});

/**
 * 块元素
 * @type {string[]}
 */
export const BLOCK_TAGS = [
	'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'div', 'address', 'pre', 'form',
	'table', 'li', 'ol', 'ul', 'tr', 'td', 'caption', 'blockquote', 'center','legend',
	'dl', 'dt', 'dd', 'dir', 'fieldset', 'noscript', 'noframes', 'menu', 'isindex', 'samp',
	'nav','header', 'aside', 'dialog','section', 'footer','article'
];

export const REMOVABLE_TAGS = [
	'style', 'comment', 'select', 'option', 'script', 'title', 'head', 'button',
];

/**
 * Convert html to plain text
 * @param {String} html
 * @returns {string}
 */
export const html2Text = (html)=>{
	//remove removable tags
	REMOVABLE_TAGS.forEach(tag=>{
		html = html.replace(new RegExp(tag, 'ig'), '');
	})

	//remove text line break
	html = html.replace(/[\r|\n]/g, '');

	//convert block tags to line break
	html = html.replace(/<(\w+)([^>]*)>/g, function(ms, tag, tail){
		if(BLOCK_TAGS.includes(tag.toLowerCase())){
			return "\n";
		}
		return "";
	});

	//remove tag's postfix
	html = html.replace(/<\/(\w+)([^>]*)>/g, function(ms, tag, tail){
		return "";
	});

	//remove other tags, likes <img>, input, etc...
	html = html.replace(/<[^>]+>/g, '');

	//convert entity by names
	let entityNamesMap = [
		[/&nbsp;/ig, ' '],
		[/&lt;/ig, '<'],
		[/&gt;/ig, '>'],
		[/&quot;/ig, '"'],
		[/&apos;/ig, '\''],
	];
	entityNamesMap.forEach(([matchReg, replacement])=>{
		html = html.replace(matchReg, replacement);
	});

	//convert entity dec code
	html = html.replace(/&#(\d+);/, function(ms, dec){
		return String.fromCharCode(dec);
	});

	//replace last &amp;
	html = html.replace(/&amp;/ig, '&');

	//trim head & tail space
	html = html.trim();

	return html;
}
