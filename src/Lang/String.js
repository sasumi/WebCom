import {round} from "./Math.js";

/**
 * 混合ES6模板字符串
 * @example extract("hello ${user_name}", {user_name:"Jack"});
 * @param {String} es_template 模板
 * @param {Object} params 数据对象
 * @return {String}
 */
export const extract = (es_template, params)=>{
	const names = Object.keys(params);
	const values = Object.values(params);
	return new Function(...names, `return \`${es_template}\`;`)(...values);
}

/**
 * 反转义字符串
 * @param str
 * @returns {string}
 * @description:
 *       discuss at: https://locutus.io/php/stripslashes/
 *      original by: Kevin van Zonneveld (https://kvz.io)
 *      improved by: Ates Goral (https://magnetiq.com)
 *      improved by: marrtins
 *      improved by: rezna
 *         fixed by: Mick@el
 *      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
 *      bugfixed by: Brett Zamir (https://brett-zamir.me)
 *         input by: Rick Waldron
 *         input by: Brant Messenger (https://www.brantmessenger.com/)
 * reimplemented by: Brett Zamir (https://brett-zamir.me)
 *        example 1: stripslashes('Kevin\'s code')
 *        returns 1: "Kevin's code"
 *        example 2: stripslashes('Kevin\\\'s code')
 *        returns 2: "Kevin\'s code"
 */
export const stripSlashes = (str) => {
	return (str + '')
		.replace(/\\(.?)/g, function(s, n1){
			switch(n1){
				case '\\':
					return '\\'
				case '0':
					return '\u0000'
				case '':
					return ''
				default:
					return n1
			}
		})
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
 * @param {String} srcStr
 * @return {string}
 */
export const utf8Decode = (srcStr) => {
	let t = "";
	let n = 0;
	let r = 0,
		c1 = 0,
		c2 = 0,
		c3 = 0;
	while(n < srcStr.length){
		r = srcStr.charCodeAt(n);
		if(r < 128){
			t += String.fromCharCode(r);
			n++
		}else if(r > 191 && r < 224){
			c2 = srcStr.charCodeAt(n + 1);
			t += String.fromCharCode((r & 31) << 6 | c2 & 63);
			n += 2
		}else{
			c2 = srcStr.charCodeAt(n + 1);
			c3 = srcStr.charCodeAt(n + 2);
			t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			n += 3
		}
	}
	return t
};

/**
 * 检测字符串是否为合法URL
 * @param {String} urlString
 * @returns {boolean}
 */
export const isValidUrl = urlString => {
	try{
		return Boolean(new URL(urlString));
	}catch(e){
		return false;
	}
}

/**
 * 判断字符串是否符合 JSON 标准
 * @param {String} json
 * @returns {boolean}
 */
export const isJSON = (json)=>{
	let is_json = false;
	try {
		JSON.parse(json);
		is_json = true;
	} catch (error) {
	}
	return is_json;
}

/**
 * @param {String} srcStr
 * @returns {string}
 */
export const utf8Encode = (srcStr) => {
	srcStr = srcStr.replace(/\r\n/g, "n");
	let t = "";
	for(let n = 0; n < srcStr.length; n++){
		let r = srcStr.charCodeAt(n);
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
 * 字符串转换层大写
 * @param {String} str
 * @return {string}
 */
export const capitalize = (str) => {
	if(typeof str !== 'string'){
		return ''
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
}

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

/**
 * 去除字符串首尾指定字符或空白
 * @param {String} str 源字符串
 * @param {String} chars 指定字符，默认为空白
 * @param {Number} dir 方向
 * @returns {*|boolean}
 */
export const trim = (str, chars = '', dir = TRIM_BOTH)=>{
	if(chars.length){
		let regLeft = new RegExp('^['+regQuote(chars)+']+'),
		regRight = new RegExp('['+regQuote(chars)+']+$');
		return dir === TRIM_LEFT ? str.replace(regLeft, '') : (dir === TRIM_RIGHT ? str.replace(regRight, '') : str.replace(regLeft, '').replace(regRight, ''));
	}else{
		return dir === TRIM_BOTH ? str.trim() : (dir === TRIM_LEFT ? str.trimStart() : dir === str.trimEnd());
	}
}
