'use strict';

const DOMAIN_DEFAULT = 'default';

const trans = (text, domain = DOMAIN_DEFAULT) => {
	return text;
};

/**
 * array_column
 * @param arr
 * @param col_name
 * @returns {Array}
 */
const arrayColumn = (arr, col_name)=>{
	let data = [];
	for(let i in arr){
		data.push(arr[i][col_name]);
	}
	return data;
};

const arrayIndex = (arr, val)=>{
	for(let i in arr){
		if(arr[i] === val){
			return i;
		}
	}
	return null;
};

/**
 * 数组去重
 * @param {Array} arr
 * @returns {*}
 */
const arrayDistinct = (arr)=>{
	let tmpMap = new Map();
	return arr.filter(item => {
		if(!tmpMap.has(item)){
			tmpMap.set(item, true);
			return true;
		}
	});
};

/**
 * array group
 * @param arr
 * @param by_key
 * @param limit limit one child
 * @returns {*}
 */
const arrayGroup = (arr, by_key, limit)=>{
	if(!arr || !arr.length){
		return arr;
	}
	let tmp_rst = {};
	arr.forEach(item=>{
		let k = item[by_key];
		if(!tmp_rst[k]){
			tmp_rst[k] = [];
		}
		tmp_rst[k].push(item);
	});
	if(!limit){
		return tmp_rst;
	}
	let rst = [];
	for(let i in tmp_rst){
		rst[i] = tmp_rst[i][0];
	}
	return rst;
};

/**
 * 检测指定值是否在指定区间内
 * @param {Number} val
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} includeEqual 是否包含等于判断
 * @returns {boolean}
 */
const between = (val, min, max, includeEqual = true) => {
	return includeEqual ? (val >= min && val <= max) : (val > min && val < max);
};

/**
 * 取整
 * @param {Number} num
 * @param {Number} precision 精度，默认为两位小数
 * @returns {number}
 */
const round = (num, precision = 2) => {
	let multiple = Math.pow(10, precision);
	return Math.round(num * multiple) / multiple;
};

class BizEvent {
	events = [];
	breakOnFalseReturn = false;

	/**
	 * 是否在返回false时中断事件继续执行
	 * @param {boolean} breakOnFalseReturn
	 */
	constructor(breakOnFalseReturn = false){
		this.breakOnFalseReturn = breakOnFalseReturn;
	}

	listen(payload){
		this.events.push(payload);
	}

	remove(payload){
		this.events = this.events.filter(ev => ev !== payload);
	}

	fire(...args){
		let breakFlag = false;
		this.events.forEach(event => {
			let ret = event.apply(null, args);
			if(this.breakOnFalseReturn && ret === false){
				breakFlag = true;
				return false;
			}
		});
		return !breakFlag;
	}
}

/**
 * hover event
 * @param {Node} node
 * @param {Function} hoverIn
 * @param {Function} hoverOut
 */
const onHover = (node, hoverIn, hoverOut)=>{
	node.addEventListener('mouseover', hoverIn);
	node.addEventListener('mouseout', hoverOut);
};

/**
 * on document ready
 * @param {Function} callback
 */
const onDocReady = (callback)=>{
	if (document.readyState === 'complete') {
		callback();
	} else {
		document.addEventListener("DOMContentLoaded", callback);
	}
};

/**
 * 触发HTML节点事件
 * @param {Node} node
 * @param {String} event
 */
const triggerDomEvent = (node, event) => {
	if("createEvent" in document){
		let evt = document.createEvent("HTMLEvents");
		evt.initEvent(event.toLowerCase(), false, true);
		node.dispatchEvent(evt);
	}else {
		node.fireEvent("on"+event.toLowerCase());
	}
};

/**
 * 事件代理
 * @param {Node} container
 * @param {String} selector
 * @param {String} eventName
 * @param {Function} payload
 */
const eventDelegate = (container, selector, eventName, payload)=>{
	container.addEventListener(eventName, ev=>{
		let target = ev.target;
		while(target){
			if(target.matches(selector)){
				payload.apply(target);
				return;
			}
			if(target === container){
				return;
			}
			target = target.parentNode;
		}
	});
};

const KEYS = {
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	0: 48,
	1: 49,
	2: 50,
	3: 51,
	4: 52,
	5: 53,
	6: 54,
	7: 55,
	8: 56,
	9: 57,

	BackSpace: 8,
	Esc: 27,
	RightArrow: 39,
	Tab: 9,
	Space: 32,
	DownArrow: 40,
	Clear: 12,
	PageUp: 33,
	Insert: 45,
	Enter: 13,
	PageDown: 34,
	Delete: 46,
	Shift: 16,
	End: 35,
	NumLock: 144,
	Control: 17,
	Home: 36,
	Alt: 18,
	LeftArrow: 37,
	CapsLock: 20,
	UpArrow: 38,

	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,

	NumPad0: 96,
	NumPad1: 97,
	NumPad2: 98,
	NumPad3: 99,
	NumPad4: 100,
	NumPad5: 101,
	NumPad6: 102,
	NumPad7: 103,
	NumPad8: 104,
	NumPad9: 105,
	NumPadMultiple: 106,
	NumPadPlus: 107,
	NumPadDash: 109,
	NumPadDot: 110,
	NumPadSlash: 111,
	NumPadEnter: 108
	///?	191
	//`~	192
	//	[{	219
	//:	186
// \|	220
	//=+	187
	//<	188
// ]}	221

	//-_	189
//.>	190
// '"	222
};

/**
 * 转义HTML
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = str => {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/[\r\n]/g, '<br/>');
};

/**
 * 反转义HTML
 * @param {String} html
 * @returns {string}
 */
const unescapeHtml = (html)=>{
	return String(html)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/<br.*>/, "\n");
};

/**
 * 转义HTML到属性值
 * @param {String} s
 * @param preserveCR
 * @returns {string}
 */
const escapeAttr = (s, preserveCR = '') => {
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
};

const stringToEntity = (str, radix) => {
	let arr = str.split('');
	radix = radix || 0;
	return arr.map(item =>
		`&#${(radix ? 'x' + item.charCodeAt(0).toString(16) : item.charCodeAt(0))};`).join('')
};

/**
 * 格式化数字
 * @param {Number} num
 * @param {Number} precision
 * @return {string|Number}
 */
const formatSize = (num, precision = 2) => {
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
};

/**
 * HTML实例转字符串
 * @param {string} entity
 * @returns {string}
 */
const entityToString = (entity) => {
	let entities = entity.split(';');
	entities.pop();
	return entities.map(item => String.fromCharCode(
		item[2] === 'x' ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join('')
};

let _helper_div;
const decodeHTMLEntities = (str) => {
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
};

/**
 * 中英文字符串截取（中文按照2个字符长度计算）
 * @param str
 * @param len
 * @param eclipse_text
 * @returns {*}
 */
const cutString = (str, len, eclipse_text)=>{
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
const regQuote = (str)=>{
	return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
};

/**
 * CSS 选择器转义
 * @param {String} str
 * @returns {String}
 */
const cssSelectorEscape = (str)=>{
	return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
};

const BASE64_KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const utf8Decode = (e) => {
	let t = "";
	let n = 0;
	let r = 0,
		c2 = 0,
		c3 = 0;
	while(n < e.length){
		r = e.charCodeAt(n);
		if(r < 128){
			t += String.fromCharCode(r);
			n++;
		}else if(r > 191 && r < 224){
			c2 = e.charCodeAt(n + 1);
			t += String.fromCharCode((r & 31) << 6 | c2 & 63);
			n += 2;
		}else {
			c2 = e.charCodeAt(n + 1);
			c3 = e.charCodeAt(n + 2);
			t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			n += 3;
		}
	}
	return t
};

const utf8Encode = (e) => {
	e = e.replace(/\r\n/g, "n");
	let t = "";
	for(let n = 0; n < e.length; n++){
		let r = e.charCodeAt(n);
		if(r < 128){
			t += String.fromCharCode(r);
		}else if(r > 127 && r < 2048){
			t += String.fromCharCode(r >> 6 | 192);
			t += String.fromCharCode(r & 63 | 128);
		}else {
			t += String.fromCharCode(r >> 12 | 224);
			t += String.fromCharCode(r >> 6 & 63 | 128);
			t += String.fromCharCode(r & 63 | 128);
		}
	}
	return t;
};

const base64UrlSafeEncode = (text) => {
	return utf8Encode(text)
		.replace('+', '-')
		.replace('/', '_');
};

const Base64Encode = (text) => {
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
			u = a = 64;
		}else if(isNaN(i)){
			a = 64;
		}
		t = t + BASE64_KEY_STR.charAt(s) + BASE64_KEY_STR.charAt(o) + BASE64_KEY_STR.charAt(u) + BASE64_KEY_STR.charAt(a);
	}
	return t
};

/**
 * base64 解码
 * @param {*} text
 * @returns
 */
const base64Decode = (text) => {
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
			t = t + String.fromCharCode(r);
		}
		if(a !== 64){
			t = t + String.fromCharCode(i);
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
const getUTF8StrLen = (str)=>{
	let realLength = 0;
	let len = str.length;
	let charCode = -1;
	for(let i = 0; i < len; i++){
		charCode = str.charCodeAt(i);
		if(charCode >= 0 && charCode <= 128){
			realLength += 1;
		}else {
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
const randomString = (length = 6, sourceStr = DEFAULT_RANDOM_STRING)=>{
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
const strToPascalCase = (str, capitalize_first = false)=>{
	let words = [];
	str.replace(/[-_\s+]/g, ' ').split(' ').forEach((word, idx) => {
		words.push((idx === 0 && !capitalize_first) ? word : capitalize(word));
	});
	return words.join('');
};

/**
 * @param s
 * @return {string}
 */
const capitalize = (s) => {
	if(typeof s !== 'string'){
		return ''
	}
	return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * 数值转为CSS可用样式
 * @param {Number|String} h
 * @returns {string}
 */
const dimension2Style = h => {
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
const isNum = (val)=>{
	return !isNaN(val);
};

const TRIM_BOTH = 0;
const TRIM_LEFT = 1;
const TRIM_RIGHT = 2;
const trim = (str, chars = '', dir = TRIM_BOTH)=>{
	if(chars.length){
		let regLeft = new RegExp('^['+regQuote(chars)+']+'),
		regRight = new RegExp('['+regQuote(chars)+']+$');
		return dir === TRIM_LEFT ? str.replace(regLeft, '') : (dir === TRIM_RIGHT ? str.replace(regRight, '') : str.replace(regLeft, '').replace(regRight, ''));
	}else {
		return dir === TRIM_BOTH ? str.trim() : (dir === TRIM_LEFT ? str.trimStart() : dir === str.trimEnd());
	}
};

/**
 * 高亮文本
 * @param {String} text 文本
 * @param {String} kw 关键字
 * @param {String} replaceTpl 替换模板
 * @returns {void|string|*}
 */
const highlightText = (text, kw, replaceTpl = '<span class="matched">%s</span>') => {
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
const convertBlobToBase64 = async (blob)=>{
	return await blobToBase64(blob);
};

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
const BLOCK_TAGS = [
	'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'div', 'address', 'pre', 'form',
	'table', 'li', 'ol', 'ul', 'tr', 'td', 'caption', 'blockquote', 'center','legend',
	'dl', 'dt', 'dd', 'dir', 'fieldset', 'noscript', 'noframes', 'menu', 'isindex', 'samp',
	'nav','header', 'aside', 'dialog','section', 'footer','article'
];

const REMOVABLE_TAGS = [
	'style', 'comment', 'select', 'option', 'script', 'title', 'head', 'button',
];

/**
 * Convert html to plain text
 * @param {String} html
 * @returns {string}
 */
const html2Text = (html)=>{
	//remove removable tags
	REMOVABLE_TAGS.forEach(tag=>{
		html = html.replace(new RegExp(tag, 'ig'), '');
	});

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
};

const getViewWidth = () => {
	return window.innerWidth;
};

const getViewHeight = () => {
	return window.innerHeight;
};

/**
 * @param {HTMLElement} dom
 */
const hide = (dom) => {
	dom.style.display = 'none';
};

/**
 * @param {HTMLElement} dom
 * @param dom
 */
const show = (dom) => {
	dom.style.display = '';
};

/**
 * @param {HTMLElement} dom
 * @param toShow
 */
const toggle = (dom, toShow) => {
	toShow ? show(dom) : hide(dom);
};

const getDomOffset = (target)=> {
	let top = 0, left = 0;
	while(target.offsetParent) {
		top += target.offsetTop;
		left += target.offsetLeft;
		target = target.offsetParent;
	}
	return {
		top: top,
		left: left,
	}
};

/**
 * 主动触发事件
 * @param {HTMLElement} el
 * @param event
 */
const fireEvent = (el, event) => {
	if("createEvent" in document){
		let evo = document.createEvent("HTMLEvents");
		evo.initEvent(event, false, true);
		el.dispatchEvent(evo);
	}else {
		el.fireEvent("on" + event);
	}
};

/**
 * 判断元素是否为按钮
 * @param {HTMLElement} el
 */
const isButton = (el)=>{
	return el.tagName === 'BUTTON' ||
		(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
};

/**
 * closest
 * @param {Node} dom
 * @param {String} selector
 * @return {(() => (Node | null))|ParentNode|ActiveX.IXMLDOMNode|null}
 */
const matchParent = (dom, selector)=>{
	let p = dom.parentNode;
	while(p){
		if(p.matches(selector)){
			return p;
		}
		p = p.parentNode;
	}
	return null;
};

/**
 * 检测元素是否可以输入（包含checkbox、radio类）
 * @param {HTMLElement} el
 * @returns {boolean}
 */
const inputAble = el=>{
	if(el.disabled ||
		el.readOnly ||
		el.tagName === 'BUTTON'||
		(el.tagName === 'INPUT' && ['HIDDEN', 'BUTTON', 'RESET'].includes(el.type))
	){
		return false;
	}
	return true;
};

/**
 * 检测child节点是否在container节点列表里面
 * @param {HTMLElement|HTMLElement[]|String} contains
 * @param {Node} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
const domContained = (contains, child, includeEqual = false) => {
	if(typeof contains === 'string'){
		contains = document.querySelectorAll(contains);
	}else if(Array.isArray(contains)); else if(typeof contains === 'object'){
		contains = [contains];
	}
	for(let i = 0; i < contains.length; i++){
		if((includeEqual ? contains[i] === child : false) ||
			contains[i].compareDocumentPosition(child) & 16){
			return true;
		}
	}
	return false;
};

/**
 * 绑定按钮触发（包括鼠标点击、键盘回车、键盘空格）
 * @param {HTMLElement} button
 * @param {CallableFunction} payload
 * @param {Boolean} cancelBubble
 */
const buttonActiveBind = (button, payload, cancelBubble = false) => {
	button.addEventListener('click', payload, cancelBubble);
	button.addEventListener('keyup', e => {
		console.log(e);
		if(e.keyCode === KEYS.Space || e.keyCode === KEYS.Enter){
			payload.call(button);
		}
	}, cancelBubble);
};

/**
 * 获取中间对齐布局
 * @param width
 * @param height
 * @param {Object} containerDimension
 * @param {Number} containerDimension.left
 * @param {Number} containerDimension.top
 * @param {Number} containerDimension.width
 * @param {Number} containerDimension.height
 * @return {Array} dimension [dimension.left, dimension.top]
 */
const keepRectCenter = (width, height, containerDimension = {
	left: 0,
	top: 0,
	width: window.innerWidth,
	height: window.innerHeight
}) => {
	return [
		Math.max((containerDimension.width - width) / 2 + containerDimension.left, 0),
		Math.max((containerDimension.height - height) / 2 + containerDimension.top, 0)
	];
};

/**
 * 保持对象尽量在容器内部，优先保证上边、左边显示
 * @param {Object} objDim
 * @param {Number} objDim.left
 * @param {Number} objDim.top
 * @param {Number} objDim.width
 * @param {Number} objDim.height
 * @param {Object} ctnDim
 * @param {Number} ctnDim.left
 * @param {Number} ctnDim.top
 * @param {Number} ctnDim.width
 * @param {Number} ctnDim.height
 * {Array} dimension [dimension.left, dimension.top]
 */
const keepRectInContainer = (objDim, ctnDim = {
	left: 0,
	top: 0,
	width: window.innerWidth,
	height: window.innerHeight
}) => {
	let ret = {left: objDim.left, top: objDim.top};

	//oversize
	if(objDim.width > ctnDim.width || objDim.height > ctnDim.height){
		return ret;
	}

	//右边超出
	if((objDim.width + objDim.left) > (ctnDim.width + ctnDim.left)){
		ret.left = objDim.left - ((objDim.width + objDim.left) - (ctnDim.width + ctnDim.left));
	}

	//底边超出
	if((objDim.height + objDim.top) > (ctnDim.height + ctnDim.top)){
		ret.top = objDim.top - ((objDim.height + objDim.top) - (ctnDim.height + ctnDim.top));
	}

	//优先保证左边露出
	if(objDim.left < ctnDim.left){
		ret.left = ctnDim.left;
	}

	//优先保证上边露出
	if(objDim.top < ctnDim.top){
		ret.top = ctnDim.top;
	}
	return ret;
};

/**
 * 矩形相交（包括边重叠情况）
 * @param {Object} rect1
 * @param {Object} rect2
 * @returns {boolean}
 */
const rectAssoc = (rect1, rect2) => {
	if(rect1.left <= rect2.left){
		return (rect1.left + rect1.width) >= rect2.left && (
			between(rect2.top, rect1.top, rect1.top + rect1.height) ||
			between(rect2.top + rect2.height, rect1.top, rect1.top + rect1.height) ||
			rect2.top >= rect1.top && rect2.height >= rect1.height
		);
	}else {
		return (rect2.left + rect2.width) >= rect1.left && (
			between(rect1.top, rect2.top, rect2.top + rect2.height) ||
			between(rect1.top + rect1.height, rect2.top, rect2.top + rect2.height) ||
			rect1.top >= rect2.top && rect1.height >= rect2.height
		);
	}
};


/**
 * isElement
 * @param {*} obj
 * @returns {boolean}
 */
const isElement = (obj) => {
	try{
		//Using W3 DOM2 (works for FF, Opera and Chrome)
		return obj instanceof HTMLElement;
	}catch(e){
		//Browsers not supporting W3 DOM2 don't have HTMLElement and
		//an exception is thrown and we end up here. Testing some
		//properties that all elements have. (works on IE7)
		return (typeof obj === "object") &&
			(obj.nodeType === 1) && (typeof obj.style === "object") &&
			(typeof obj.ownerDocument === "object");
	}
};

let _c = {};

/**
 * 挂载css文件
 * @param {String} file
 * @param {Boolean} forceReload 是否强制重新挂载，缺省不重复挂载
 */
const loadCss = (file, forceReload = false) => {
	if(!forceReload && _c[file]){
		return _c[file];
	}
	_c[file] = new Promise((resolve, reject)=>{
		let link = document.createElement('link');
		link.rel = "stylesheet";
		link.href = file;
		link.onload = ()=>{resolve();};
		link.onerror = ()=>{reject();};
		document.head.append(link);
	});
	return _c[file];
};

const loadScript = (file, forceReload = false)=>{
	if(!forceReload && _c[file]){
		return _c[file];
	}
	_c[file] = new Promise((resolve, reject)=>{
		let script = document.createElement('script');
		script.src = file;
		script.onload = ()=>{resolve();};
		script.onerror = ()=>{reject();};
		document.head.append(script);
	});
	return _c[file];
};

/**
 * insert style sheet in head
 * @param {String} styleSheetStr
 * @param {String} id
 * @return {HTMLStyleElement}
 */
const insertStyleSheet = (styleSheetStr, id='')=>{
	let style = document.createElement('style');
	document.head.appendChild(style);
	style.innerHTML = styleSheetStr;
	if(id){
		style.id = id;
	}
	return style;
};


/**
 * 获取DOM节点视觉呈现信息
 * @param win
 * @returns {{
 *  screenLeft: number,
 *  screenTop: number,
 *  visibleWidth: number,
 *  visibleHeight: number,
 *  horizonScroll: number,
 *  documentWidth: number,
 *  documentHeight: number,
 *  }}
 */
const getRegion = (win = window) => {
	let info = {};
	let doc = win.document;
	info.screenLeft = win.screenLeft ? win.screenLeft : win.screenX;
	info.screenTop = win.screenTop ? win.screenTop : win.screenY;

	//no ie
	if(win.innerWidth){
		info.visibleWidth = win.innerWidth;
		info.visibleHeight = win.innerHeight;
		info.horizenScroll = win.pageXOffset;
		info.verticalScroll = win.pageYOffset;
	}else {
		//IE + DOCTYPE defined || IE4, IE5, IE6+no DOCTYPE
		let tmp = (doc.documentElement && doc.documentElement.clientWidth) ?
			doc.documentElement : doc.body;
		info.visibleWidth = tmp.clientWidth;
		info.visibleHeight = tmp.clientHeight;
		info.horizenScroll = tmp.scrollLeft;
		info.verticalScroll = tmp.scrollTop;
	}

	let tag = (doc.documentElement && doc.documentElement.scrollWidth) ?
		doc.documentElement : doc.body;
	info.documentWidth = Math.max(tag.scrollWidth, info.visibleWidth);
	info.documentHeight = Math.max(tag.scrollHeight, info.visibleHeight);
	return info;
};

/**
 * 检测矩形是否在指定布局内部
 * @param rect
 * @param layout
 * @returns {*}
 */
const rectInLayout = (rect, layout) => {
	return between(rect.top, layout.top, layout.top + layout.height) && between(rect.left, layout.left, layout.left + layout.width) //左上角
		&& between(rect.top + rect.height, layout.top, layout.top + layout.height) && between(rect.left + rect.width, layout.left, layout.left + layout.width); //右下角
};

/**
 * 设置dom样式
 * @param {HTMLElement} dom
 * @param {Object} style 样式对象
 */
const setStyle = (dom, style = {})=>{
	for(let key in style){
		key = strToPascalCase(key);
		dom.style[key] = dimension2Style(style[key]);
	}
};

/**
 * 创建HTML节点
 * @param {String} html
 * @param {Node|null} parentNode 父级节点
 * @returns {HTMLElement|HTMLElement[]}
 */
const createDomByHtml = (html, parentNode = null) => {
	let tpl = document.createElement('template');
	html = html.trim();
	tpl.innerHTML = html;
	let nodes = [];
	if(parentNode){
		tpl.content.childNodes.forEach(node=>{
			nodes.push(parentNode.appendChild(node));
		});
	} else {
		nodes = tpl.content.childNodes;
	}
	return nodes.length === 1 ? nodes[0] : nodes;
};

/**
 * 强制重绘元素
 * @param {HTMLElement} element
 * @param {Number} delay
 */
function repaint(element, delay = 0){
	setTimeout(() => {
		try{
			// eslint-disable-next-line no-param-reassign
			element.hidden = true;

			// eslint-disable-next-line no-unused-expressions
			element.offsetHeight;

			// eslint-disable-next-line no-param-reassign
			element.hidden = false;
		}catch(_){
			// Do nothing
		}
	}, delay);
}

/**
 * 进入全屏模式
 * @param {HTMLElement} element
 */
const enterFullScreen = (element)=>{
	if(element.requestFullscreen){
		return element.requestFullscreen();
	}
	if(element.webkitRequestFullScreen){
		return element.webkitRequestFullScreen();
	}
	if(element.mozRequestFullScreen){
		element.mozRequestFullScreen();
	}
	if(element.msRequestFullScreen){
		element.msRequestFullScreen();
	}
	throw "Browser no allow full screen";
};

/**
 * 退出全屏
 * @returns {Promise<void>}
 */
const exitFullScreen = ()=>{
	return document.exitFullscreen();
};

/**
 * 切换全屏
 * @param element
 * @returns {Promise<unknown>}
 */
const toggleFullScreen = (element)=>{
	return new Promise((resolve, reject) => {
		if(!isInFullScreen()){
			enterFullScreen(element).then(resolve).catch(reject);
		} else {
			exitFullScreen().then(resolve).catch(reject);
		}
	})
};

/**
 * 检测是否正在全屏
 * @returns {boolean}
 */
const isInFullScreen = ()=>{
	return !!document.fullscreenElement;
};

/**
 * 获取form元素值。
 * 该函数过滤元素disabled情况，但不判断name是否存在
 * 针对多重选择，提取数据格式为数组
 * @param {HTMLFormElement} el
 * @returns {String|Array|null} 元素值，发生错误时返回null
 */
const getElementValue = (el) => {
	if(el.disabled){
		return null;
	}
	if(el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')){
		return el.checked ? el.value : null;
	}
	if(el.tagName === 'SELECT' && el.multiple){
		let vs = [];
		el.querySelectorAll('option[selected]').forEach(item=>{
			vs.push(item.value);
		});
		return vs;
	}
	return el.value;
};

/**
 * 表单元素校验
 * @param {HTMLElement} dom
 * @return boolean 是否校验通过
 */
const formValidate = (dom)=>{
	let els = dom.querySelectorAll('input,textarea,select');
	let pass = true;
	els = Array.from(els).filter(el => !isButton(el));
	Array.from(els).every(el => {
		if(el.disabled){
			return true;
		}
		if(!el.checkValidity()){
			el.reportValidity();
			pass = false;
			return false;
		}
		return true;
	});
	return pass;
};

/**
 * 获取指定DOM节点下表单元素包含的表单数据，并以JSON方式组装。
 * 该函数过滤表单元素处于 disabled、缺少name等不合理情况
 * @param {HTMLElement} dom
 * @param {Boolean} validate
 * @returns {Object|null} 如果校验失败，则返回null
 */
const formSerializeJSON = (dom, validate = true) => {
	if(!formValidate(dom)){
		return null;
	}
	let els = dom.querySelectorAll('input,textarea,select');
	let data = {};
	els = Array.from(els).filter(el => !isButton(el));
	let err = Array.from(els).every(el => {
		if(!el.name){
			console.warn('element no legal for fetch form data');
			return true;
		}
		let name = el.name;
		let value = getElementValue(el);
		if(value === null){
			return true;
		}
		let name_selector = cssSelectorEscape(name);
		let isArr = dom.querySelectorAll(`input[name=${name_selector}]:not([type=radio]),textarea[name=${name_selector}],select[name=${name_selector}]`).length > 1;
		if(isArr){
			if(data[name] === undefined){
				data[name] = [value];
			} else {
				data[name].push(value);
			}
		} else {
			data[name] = value;
		}
		return true;
	});
	return err === false ? null : data;
};

/**
 * 解析文件扩展名
 * @param {string} fileName
 * @return {string}
 */
const resolveFileExtension = fileName => {
	if(fileName.indexOf('.')<0){
		return '';
	}
	let segList = fileName.split('.');
	return segList[segList.length-1];
};

/**
 * 获取文件名
 * @param {string} fileName
 * @return {string}
 */
const resolveFileName = (fileName)=>{
	fileName = fileName.replace(/.*?[/|\\]/ig, '');
	return fileName.replace(/\.[^.]*$/g, "");
};

/**
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
const safeAdd = (x, y) => {
	let lsw = (x & 0xffff) + (y & 0xffff);
	let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xffff)
};

/**
* Bitwise rotate a 32-bit number to the left.
*/
const bitRotateLeft = (num, cnt) => {
	return (num << cnt) | (num >>> (32 - cnt))
};

/**
* These functions implement the four basic operations the algorithm uses.
*/
const md5cmn = (q, a, b, x, s, t) => {
	return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
};

const md5ff = (a, b, c, d, x, s, t) => {
	return md5cmn((b & c) | (~b & d), a, b, x, s, t)
};

const md5gg = (a, b, c, d, x, s, t) => {
	return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
};

const md5hh = (a, b, c, d, x, s, t) => {
	return md5cmn(b ^ c ^ d, a, b, x, s, t)
};

const md5ii = (a, b, c, d, x, s, t) => {
	return md5cmn(c ^ (b | ~d), a, b, x, s, t)
};

/**
* Calculate the MD5 of an array of little-endian words, and a bit length.
*/
const binlMD5 = (x, len) => {
	/* append padding */
	x[len >> 5] |= 0x80 << (len % 32);
	x[((len + 64) >>> 9 << 4) + 14] = len;

	let i;
	let olda;
	let oldb;
	let oldc;
	let oldd;
	let a = 1732584193;
	let b = -271733879;
	let c = -1732584194;
	let d = 271733878;

	for(i = 0; i < x.length; i += 16){
		olda = a;
		oldb = b;
		oldc = c;
		oldd = d;

		a = md5ff(a, b, c, d, x[i], 7, -680876936);
		d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
		c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
		a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
		d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
		b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
		a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
		c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
		b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
		d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
		c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

		a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
		d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
		b = md5gg(b, c, d, a, x[i], 20, -373897302);
		a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
		c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
		b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
		d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
		c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
		a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
		d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
		b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

		a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
		d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
		c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
		b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
		d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
		c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
		a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
		d = md5hh(d, a, b, c, x[i], 11, -358537222);
		c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
		b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
		a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
		c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
		b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

		a = md5ii(a, b, c, d, x[i], 6, -198630844);
		d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
		c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
		a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
		d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
		b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
		a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
		c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
		b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
		d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
		c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

		a = safeAdd(a, olda);
		b = safeAdd(b, oldb);
		c = safeAdd(c, oldc);
		d = safeAdd(d, oldd);
	}
	return [a, b, c, d]
};

/**
* Convert an array of little-endian words to a string
*/
const binl2rstr = (input) => {
	let i;
	let output = '';
	let length32 = input.length * 32;
	for(i = 0; i < length32; i += 8){
		output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
	}
	return output
};

/**
* Convert a raw string to an array of little-endian words
* Characters >255 have their high-byte silently ignored.
*/
const rstr2binl = (input) => {
	let i;
	let output = [];
	output[(input.length >> 2) - 1] = undefined;
	for(i = 0; i < output.length; i += 1){
		output[i] = 0;
	}
	let length8 = input.length * 8;
	for(i = 0; i < length8; i += 8){
		output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
	}
	return output
};

/**
* Calculate the MD5 of a raw string
*/
const rstrMD5 = (s) => {
	return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
};

/**
* Calculate the HMAC-MD5, of a key and some data (raw strings)
*/
const rstrHMACMD5 = (key, data) => {
	let i;
	let bkey = rstr2binl(key);
	let ipad = [];
	let opad = [];
	let hash;
	ipad[15] = opad[15] = undefined;
	if(bkey.length > 16){
		bkey = binlMD5(bkey, key.length * 8);
	}
	for(i = 0; i < 16; i += 1){
		ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5c5c5c5c;
	}
	hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
};

/**
* Convert a raw string to a hex string
*/
const rstr2hex = (input) => {
	let hexTab = '0123456789abcdef';
	let output = '';
	let x;
	let i;
	for(i = 0; i < input.length; i += 1){
		x = input.charCodeAt(i);
		output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
	}
	return output
};

/**
* Encode a string as utf-8
*/
const str2rstrUTF8 = (input) => {
	return unescape(encodeURIComponent(input))
};

/**
* Take string arguments and return either raw or hex encoded strings
*/
const rawMD5 = (s) => {
	return rstrMD5(str2rstrUTF8(s))
};

const hexMD5 = (s) => {
	return rstr2hex(rawMD5(s))
};

const rawHMACMD5 = (k, d) => {
	return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
};

const hexHMACMD5 = (k, d) => {
	return rstr2hex(rawHMACMD5(k, d))
};

const MD5 = (string, key, raw) => {
	if(!key){
		if(!raw){
			return hexMD5(string)
		}
		return rawMD5(string)
	}
	if(!raw){
		return hexHMACMD5(key, string)
	}
	return rawHMACMD5(key, string)
};

const CODE_TIMEOUT = 508;
const CODE_ABORT = 509;
const DEFAULT_TIMEOUT = 10000;

/**
 * HTTP请求方法
 * @type {{TRACE: string, HEAD: string, DELETE: string, POST: string, GET: string, CONNECT: string, OPTIONS: string, PUT: string}}
 */
const HTTP_METHOD = {
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
const REQUEST_FORMAT = {
	JSON: 'JSON',
	FORM_DATA: 'FORM_DATA',
};

/**
 * 响应格式
 * @type {{FORM: string, XML: string, JSON: string, HTML: string, TEXT: string}}
 */
const RESPONSE_FORMAT = {
	JSON: 'JSON',
	XML: 'XML',
	HTML: 'HTML',
	TEXT: 'TEXT',
	FORM: 'FORM_DATA',
};

/**
 * 合并请求参数
 * @param {String} uri
 * @param {String|Object} data
 * @returns {*}
 */
const mergerUriParam = (uri, data) => {
	return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
};

const setHash = data => {
	location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
};

const getHash = () => {
	return location.hash ? location.hash.substring(1) : '';
};

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
};

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
};

class Net {
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
			}else {
				this.onProgress.fire(null);
			}
		});
		this.xhr.onreadystatechange = () => {
			this.onStateChange.fire(this.xhr.status);
		};
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
			this.xhr.setRequestHeader('content-type', 'application/json');
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
const downloadFile = (src, save_name, ext) => {
	ext = ext || resolveFileExtension(src);
	save_name = save_name || resolveFileName(src);
	let link = document.createElement('a');
	link.href = src;
	link.download = save_name + ext;
	document.body.appendChild(link);
	link.click();
	link.parentNode.removeChild(link);
};

const QueryString = {
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
		if(typeof (data) === 'undefined' || typeof (data) !== 'object') return data
		let query = [];
		for(let param in data){
			if(data.hasOwnProperty(param)){
				if(typeof(data[param]) === 'object' && data[param].length){
					data[param].forEach(item=>{
						query.push(encodeURI(param + '=' + item));
					});
				}
				else if(typeof(data[param]) === 'object');
				else {
					query.push(encodeURI(param + '=' + data[param]));
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
const openLinkWithoutReferer = (link) => {
	let instance = window.open("about:blank");
	instance.document.write("<meta http-equiv=\"refresh\" content=\"0;url=" + link + "\">");
	instance.document.close();
	return false;
};

let hook_flag = false;
const RptEv = new BizEvent();
const doHook = () => {
	let observer = new ReportingObserver((reports) => {
		onReportApi.fire(reports);
	}, {
		types: ['deprecation'],
		buffered: true
	});
	observer.observe();
};

const onReportApi = {
	listen(payload){
		!hook_flag && doHook();
		hook_flag = true;
		RptEv.listen(payload);
	},
	remove(payload){
		return RptEv.remove(payload);
	},
	fire(...args){
		return RptEv.fire(...args);
	}
};

let payloads = [];

const pushState = (param, title = '') => {
	let url = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(param);
	window.history.pushState(param, title, url);
	exePayloads(param);
};

const exePayloads = (param) => {
	payloads.forEach(payload => {
		payload(param);
	});
};

window.onpopstate = function(e){
	let state = e.state ?? {};
	let hashObj = QueryString.parse(getHash());
	exePayloads({...state, ...hashObj});
};

const onStateChange = (payload) => {
	payloads.push(payload);
};

const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;
const ONE_DAY = 86400000;
const ONE_WEEK = 604800000;
const ONE_MONTH_30 = 2592000000;
const ONE_MONTH_31 = 2678400000;
const ONE_YEAR_365 = 31536000000;

function frequencyControl(payload, hz, executeOnFistTime = false){
	if(payload._frq_tm){
		clearTimeout(payload._frq_tm);
	}
	payload._frq_tm = setTimeout(() => {
		frequencyControl(payload, hz, executeOnFistTime);
	}, hz);
}

let _guid = 0;
const guid = (prefix = '') => {
	return 'guid_' + (prefix || randomString(6)) + (++_guid);
};

/**
 * 获取当前函数所在script路径
 * @return {string|null}
 */
const getCurrentScript = function(){
	let error = new Error()
		, source
		, currentStackFrameRegex = new RegExp(getCurrentScript.name + "\\s*\\((.*):\\d+:\\d+\\)")
		, lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/);
	if((source = currentStackFrameRegex.exec(error.stack.trim()))){
		return source[1];
	}else if((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] !== ""){
		return source[1];
	}else if(error['fileName'] !== undefined){
		return error['fileName'];
	}
	return null;
};

const CURRENT_FILE = '/Lang/Util.js';
const ENTRY_FILE = '/index.js';

/**
 * 获取当前库脚本调用地址（这里默认当前库只有两种调用形式：独立模块调用以及合并模块调用）
 * @return {string}
 */
const getLibEntryScript = ()=>{
	let script = getCurrentScript();
	if(!script){
		throw "Get script failed";
	}
	if(script.indexOf(CURRENT_FILE) >= 0){
		return script.replace(CURRENT_FILE, ENTRY_FILE);
	}
	return script;
};

/**
 * 加载当前库模块
 * @return {Promise<*>}
 */
const getLibModule = async () => {
	let script = getLibEntryScript();
	return await import(script);
};

/**
 * 获取顶部窗口模块（如果没有顶部窗口，则获取当前窗口模块）
 * @type {(function(): Promise<*>)|undefined}
 */
const getLibModuleTop =(()=>{
	if(top === window){
		return getLibModule;
	}
	if(top.WEBCOM_GET_LIB_MODULE){
		return top.WEBCOM_GET_LIB_MODULE;
	}
	throw "No WebCom library script loaded detected.";
})();

/**
 * 清理版本，去除无用字符
 * @param {String} version
 * @return {Number[]}
 */
const normalizeVersion = (version)=>{
	let trimmed = version ? version.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1") : '',
		pieces = trimmed.split('.'),
		partsLength,
		parts = [],
		value,
		piece,
		num,
		i;
	for(i = 0; i < pieces.length; i += 1){
		piece = pieces[i].replace(/\D/g, '');
		num = parseInt(piece, 10);
		if(isNaN(num)){
			num = 0;
		}
		parts.push(num);
	}
	partsLength = parts.length;
	for(i = partsLength - 1; i >= 0; i -= 1){
		value = parts[i];
		if(value === 0){
			parts.length -= 1;
		}else {
			break;
		}
	}
	return parts;
};

/**
 * 版本比较
 * @param {String} version1
 * @param {String} version2
 * @param {Number} index
 * @return {number|number}
 */
const versionCompare = (version1, version2, index)=>{
	let stringLength = index + 1,
		v1 = normalizeVersion(version1),
		v2 = normalizeVersion(version2);
	if(v1.length > stringLength){
		v1.length = stringLength;
	}
	if(v2.length > stringLength){
		v2.length = stringLength;
	}
	let size = Math.min(v1.length, v2.length),i;
	for(i = 0; i < size; i += 1){
		if(v1[i] !== v2[i]){
			return v1[i] < v2[i] ? -1 : 1;
		}
	}
	if(v1.length === v2.length){
		return 0;
	}
	return (v1.length < v2.length) ? -1 : 1;
};

window.WEBCOM_GET_LIB_MODULE = getLibModule;
window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;

const NS$1 = 'WebCom-';
const ICON_FONT_CLASS = NS$1 + `icon`;
const ICON_FONT = NS$1 + 'iconfont';
const DEFAULT_ICONFONT_CSS = `
@font-face {
  font-family: "${ICON_FONT}"; /* Project id 3359671 */
  src: url('//at.alicdn.com/t/c/font_3359671_tnam7ajg9ua.woff2?t=1677307651902') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_tnam7ajg9ua.woff?t=1677307651902') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_tnam7ajg9ua.ttf?t=1677307651902') format('truetype');
}

.${ICON_FONT_CLASS} {
	font-family: "${ICON_FONT}" !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
`;

insertStyleSheet(DEFAULT_ICONFONT_CSS);

const Theme = {
	Namespace: NS$1,
	IconFont: ICON_FONT,
	IconFontClass: ICON_FONT_CLASS,
	TipIndex: 10, //功能提示类(指向具体元素)
	MaskIndex: 100, //遮罩(（全局或指定面板遮罩类）
	DialogIndex: 1000, //对话框等窗口类垂直索引
	FullScreenModeIndex: 10000, //全屏类（全屏类
	ToastIndex: 100000, //消息提示（顶部呈现）
};

const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
const rotate_animate = Theme.Namespace + '-toast-rotate';
const fadeIn_animate = Theme.Namespace + '-toast-fadein';
const fadeOut_animate = Theme.Namespace + '-toast-fadeout';
const FADEIN_TIME = 200;
const FADEOUT_TIME = 500;

insertStyleSheet(`
	@keyframes ${rotate_animate} {
	    0% {transform: translate3d(-50%, -50%, 0) rotate(0deg);}
	    100% {transform: translate3d(-50%, -50%, 0) rotate(360deg);}
	}
	@keyframes ${fadeIn_animate} {
		0% { opacity: 0; }
		100% { opacity: 1; } 
	}
	@keyframes ${fadeOut_animate} {
		0% { opacity:1;}
		100% { opacity: 0} 
	}
	.${TOAST_CLS_MAIN}-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center; line-height:1.5; z-index:${Theme.ToastIndex}}
	.${TOAST_CLS_MAIN}>div {margin-bottom:0.5em;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:0.4em 1em 0.4em 2.1em;background-color:#fff;color:var(--color);box-shadow:4px 5px 13px 0px #32323238;position: relative; animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";position:absolute;font-family:${Theme.IconFont}; left:0.5em;top:0.45em;font-size:1.2em;width:1em;height:1em;overflow: hidden;line-height: 1;box-sizing: border-box;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;}
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform: translate3d(-50%, -50%, 0);will-change: transform;margin:0.52em 0 0 0.5em;}
`, Theme.Namespace + 'toast');

let toastWrap = null;

const getWrapper = () => {
	if(!toastWrap){
		toastWrap = document.createElement('div');
		document.body.appendChild(toastWrap);
		toastWrap.className = TOAST_CLS_MAIN + '-wrap';
	}
	return toastWrap;
};

class Toast {
	static TYPE_INFO = 'info';
	static TYPE_SUCCESS = 'success';
	static TYPE_WARNING = 'warning';
	static TYPE_ERROR = 'error';
	static TYPE_LOADING = 'loading';

	/**
	 * 各种类型提示默认隐藏时间
	 */
	static DEFAULT_TIME_MAP = {
		[Toast.TYPE_INFO]: 1500,
		[Toast.TYPE_SUCCESS]: 1500,
		[Toast.TYPE_WARNING]: 2000,
		[Toast.TYPE_ERROR]: 2500,
		[Toast.TYPE_LOADING]: 0,
	};

	message = '';
	type = Toast.TYPE_INFO;
	timeout = Toast.DEFAULT_TIME_MAP[this.type];

	dom = null;

	/**
	 * @param {String} message
	 * @param {String} type
	 * @param {Number} timeout 超时时间，0表示不关闭
	 */
	constructor(message, type = null, timeout = null){
		this.message = message;
		this.type = type || Toast.TYPE_SUCCESS;
		this.timeout = timeout === null ? Toast.DEFAULT_TIME_MAP[this.type] : timeout;
	}

	/**
	 * 显示提示
	 * @param {String} message
	 * @param {String} type
	 * @param {Number} timeout 超时时间，0表示不关闭
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @returns
	 */
	static showToast = (message, type = null, timeout = null, timeoutCallback = null) => {
		let toast = new Toast(message, type, timeout);
		toast.show(timeoutCallback);
		return toast;
	}

	/**
	 * 显示[提示]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showInfo = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_INFO, this.DEFAULT_TIME_MAP[Toast.TYPE_INFO], timeoutCallback);
	}

	/**
	 * 显示[成功]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showSuccess = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS], timeoutCallback);
	}

	/**
	 * 显示[告警]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showWarning = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_WARNING, this.DEFAULT_TIME_MAP[Toast.TYPE_WARNING], timeoutCallback);
	}

	/**
	 * 显示[错误]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showError = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_ERROR, this.DEFAULT_TIME_MAP[Toast.TYPE_ERROR], timeoutCallback);
	}

	/**
	 * 显示[加载中]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showLoading = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_LOADING, this.DEFAULT_TIME_MAP[Toast.TYPE_LOADING], timeoutCallback);
	}

	/**
	 * 显示提示
	 * @param {Function} onTimeoutClose 超时关闭回调
	 */
	show(onTimeoutClose = null){
		let wrapper = getWrapper();
		show(wrapper);
		this.dom = document.createElement('span');
		wrapper.appendChild(this.dom);
		this.dom.className = `${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-` + this.type;
		this.dom.innerHTML = `<span class="ctn">${this.message}</span><div></div>`;
		if(this.timeout){
			setTimeout(() => {
				this.hide(true);
				onTimeoutClose && onTimeoutClose();
			}, this.timeout);
		}
	}

	/**
	 * 隐藏提示信息
	 * @param {Boolean} fadeOut 是否使用渐隐式淡出
	 */
	hide(fadeOut = false){
		if(fadeOut){
			this.dom.classList.add(TOAST_CLS_MAIN+'-hide');
			setTimeout(()=>{
				this.hide(false);
			}, FADEOUT_TIME);
			return;
		}
		this.dom.parentNode.removeChild(this.dom);
		let wrapper = getWrapper();
		if(!wrapper.childNodes.length){
			hide(wrapper);
		}
	}
}

/**
 * copy text
 * @param {String} text
 * @param {Boolean} silent 是否在不兼容是进行提醒
 * @returns {boolean} 是否复制成功
 */
const copy = (text, silent = false) => {
	let txtNode = createDomByHtml('<textarea readonly="readonly">', document.body);
	txtNode.style.cssText = 'position:absolute; left:-9999px;';
	let y = window.pageYOffset || document.documentElement.scrollTop;
	txtNode.addEventListener('focus', function(){
		window.scrollTo(0, y);
	});
	txtNode.value = text;
	txtNode.select();
	try{
		let succeeded = document.execCommand('copy');
		!silent && Toast.showSuccess(trans('复制成功'));
		return succeeded;
	}catch(err){
		Toast.showWarning(trans('请按键: Ctrl+C, Enter复制内容'), text);
		console.error(err);
	} finally{
		txtNode.parentNode.removeChild(txtNode);
	}
	return false;
};

/**
 * Copy formatted html content
 * @param html
 * @param silent
 */
const copyFormatted = (html, silent = false) => {
	// Create container for the HTML
	let container = createDomByHtml(`
		<div style="position:fixed; pointer-events:none; opacity:0;">${html}</div>
	`, document.body);

	// Detect all style sheets of the page
	let activeSheets = Array.prototype.slice.call(document.styleSheets)
		.filter(function(sheet){
			return !sheet.disabled;
		});

	// Copy to clipboard
	window.getSelection().removeAllRanges();

	let range = document.createRange();
	range.selectNode(container);
	window.getSelection().addRange(range);

	document.execCommand('copy');
	for(let i = 0; i < activeSheets.length; i++){
		activeSheets[i].disabled = true;
	}
	document.execCommand('copy');
	for(let i = 0; i < activeSheets.length; i++){
		activeSheets[i].disabled = false;
	}
	document.body.removeChild(container);
	!silent && Toast.showSuccess(trans('复制成功'));
};

let masker = null;
let CSS_CLASS = Theme.Namespace+'-masker';

const showMasker = () => {
	if(!masker){
		masker = createDomByHtml(`<div class="${CSS_CLASS}"></div>`, document.body);
	}
	masker.style.display = '';
};

const hideMasker = () => {
	masker && (masker.style.display = 'none');
};

const Masker = {
	zIndex: Theme.MaskIndex,
	show: showMasker,
	hide: hideMasker
};

insertStyleSheet(`.${CSS_CLASS} {position:fixed;top:0;left:0;right:0;bottom:0;background:#33333342;backdrop-filter:blur(5px);
 z-index:${Masker.zIndex}}`, Theme.Namespace+'masker-style');

const DLG_CLS_PREF = Theme.Namespace + 'dialog';
const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
const DLG_CLS_OP = DLG_CLS_PREF + '-op';
const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
const DLG_CLS_INPUT = DLG_CLS_PREF + '-input';

const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';

const STATE_ACTIVE = 'active'; //激活状态。如果是存在模态对话框，只允许唯一一个激活，如果没有模态对话框情况，允许多个同时激活
const STATE_DISABLED = 'disabled'; //禁用状态。存在模态框情况下，全局只允许唯一一个激活，其余均为禁用状态
const STATE_HIDDEN = 'hidden'; //隐藏状态。通过主动调用hide方法使得对话框隐藏

/**
 * Content Type
 * @type {string}
 */
const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF + '-ctn-iframe';
const DLG_CTN_TYPE_HTML = DLG_CLS_PREF + '-ctn-html';

insertStyleSheet(`
	.${DLG_CLS_PREF} {display:block;border:1px solid #ddd; padding:0; box-sizing:border-box;width:calc(100% - 2 * 30px); --head-height:36px; background-color:white; color:#333; z-index:${Theme.DialogIndex};position:fixed;}
	.${DLG_CLS_PREF} .${DLG_CLS_PREF}-ti {font-size :16px; user-select:none; height:var(--head-height); box-sizing:border-box; padding:6px 10px 0 10px; font-weight:normal;color:#666}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE} {position:absolute; overflow:hidden; cursor:pointer; right:0; top:0; width:var(--head-height); height:var(--head-height); box-sizing:border-box; line-height:var(--head-height); text-align:center;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"×"; font-size:24px;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:hover {background-color:#eee;}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} {padding:0}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} iframe {width:100%; border:none; display:block;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:10px; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN} {margin-right:0.5em;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 50px); overflow-y:auto}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] {box-shadow:1px 1px 25px 0px #44444457; border-color:#ccc;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] .dialog-ti {color:#333}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"]:before {content:""; position:absolute; z-index:9999999999; width:100%; height:100%;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"] * {opacity:0.85 !important; user-select:none;}
`, Theme.Namespace + 'dialog-style');

/**
 * 绑定ESC按键事件关闭最上一层可关闭的对话框
 */
document.addEventListener('keyup', e => {
	if(e.keyCode === KEYS.Esc){
		let current = DialogManager.getFrontDialog();
		if(current && current.config.showTopCloseButton){
			DialogManager.close(current);
			return false;
		}
	}
});

/** @var Dialog[] **/
let DIALOG_COLLECTION = [];

/**
 * 对话框层级比较函数（层级高的排上面）
 * @param {Dialog} dialog1
 * @param {Dialog} dialog2
 * @return {number}
 */
const sortZIndex = (dialog1, dialog2) => {
	return dialog1.zIndex - dialog2.zIndex;
};

/**
 * 获取非隐藏的模态对话框列表
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {Dialog[]}
 */
const getModalDialogs = (excludedDialog = null) => {
	let list = DIALOG_COLLECTION.filter(d => {
		return d.state !== STATE_HIDDEN && d.config.modal && (!excludedDialog || d !== excludedDialog);
	});
	return list.sort(sortZIndex);
};

/**
 * 获取非隐藏的普通对话框列表
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {Dialog[]}
 */
const getNoModalDialogs = (excludedDialog = null) => {
	let list = DIALOG_COLLECTION.filter(d => {
		return d.state !== STATE_HIDDEN && !d.config.modal && (!excludedDialog || d !== excludedDialog);
	});
	return list.sort(sortZIndex);
};

/**
 * 获取所有非隐藏对话框
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {*[]}
 */
const getAllAvailableDialogs = (excludedDialog = null) => {
	let modalDialogs = getModalDialogs(excludedDialog);
	let noModalDialogs = getNoModalDialogs(excludedDialog);
	return noModalDialogs.concat(modalDialogs);
};

/**
 * 设置对话框状态
 * @param {Dialog} dlg
 * @param {String} state
 */
const setState = (dlg, state) => {
	dlg.state = state;
	dlg.dom.setAttribute('data-dialog-state', state);
	dlg.dom.style.display = state === STATE_HIDDEN ? 'none' : '';
};

/**
 * 设置对话框zIndex
 * @param {Dialog} dlg
 * @param {Number|String} zIndex
 */
const setZIndex = (dlg, zIndex) => {
	dlg.zIndex = dlg.dom.style.zIndex = String(zIndex);
};

/**
 * 对话框管理器
 */
const DialogManager = {
	register(dlg){
		DIALOG_COLLECTION.push(dlg);
	},

	/**
	 * 激活并显示对话框
	 * @param {Dialog} dlg
	 */
	show(dlg){
		if(dlg.config.showMasker){
			Masker.show();
		}
		dlg.state = STATE_DISABLED; //避免 getModal* 获取不到当前对话框

		let modalDialogs = getModalDialogs(dlg);
		let noModalDialogs = getNoModalDialogs(dlg);
		if(dlg.config.modal){
			noModalDialogs.forEach(d => {setState(d, STATE_DISABLED);});
			modalDialogs.forEach(d => {setState(d, STATE_DISABLED);});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + modalDialogs.length);
			setState(dlg, STATE_ACTIVE);
		}else {
			modalDialogs.forEach((d, idx) => {setZIndex(d, dlg.zIndex + idx + 1);});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length);
			setState(dlg, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
		}
		dlg.onShow.fire();
	},

	/**
	 * 关闭对话框
	 * @param {Dialog} dlg
	 * @param {Boolean} destroy 是否摧毁
	 */
	close: (dlg, destroy = true) => {
		if(dlg.onClose.fire() === false){
			console.warn('dialog close cancel by onClose events');
			return false;
		}
		let modalDialogs = getModalDialogs(dlg);
		let noModalDialogs = getNoModalDialogs(dlg);
		modalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + idx);
		});
		//active last modal dialog
		if(modalDialogs.length){
			setState(modalDialogs[modalDialogs.length - 1], STATE_ACTIVE);
		}
		noModalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
			setState(d, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
		});
		if(destroy){
			DIALOG_COLLECTION = DIALOG_COLLECTION.filter(d => d !== dlg);
			dlg.dom.parentNode.removeChild(dlg.dom);
		}else {
			setState(dlg, STATE_HIDDEN);
		}
		getAllAvailableDialogs().length || Masker.hide();
	},

	/**
	 * 隐藏对话框
	 * @param dlg
	 * @returns {boolean}
	 */
	hide(dlg){
		return this.close(dlg, false);
	},

	/**
	 * 获取当前激活的对话框
	 * @returns {Dialog|null}
	 */
	getFrontDialog(){
		let dialogs = getAllAvailableDialogs();
		return dialogs[dialogs.length - 1];
	},

	/**
	 * 尝试设置指定窗口前置
	 * @param {Dialog} dlg
	 * @return {boolean}
	 */
	trySetFront(dlg){
		let modalDialogs = getModalDialogs();
		let currentFrontDialog = this.getFrontDialog();

		if(currentFrontDialog === dlg){
			return true;
		}

		//模态模式下，不允许通过该方法切换对话框，
		//只有在对话框 show、hide的情况下自动调整层级
		if(modalDialogs.length){
			return false;
		}

		let otherNoModalDialogs = getNoModalDialogs(dlg);
		otherNoModalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
		});
		setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + otherNoModalDialogs.length);
	},

	/**
	 * 关闭全部对话框
	 */
	closeAll(){
		DIALOG_COLLECTION.forEach(dlg => {
			dlg.dom?.parentNode.removeChild(dlg.dom);
		});
		DIALOG_COLLECTION = [];
		Masker.hide();
	},

	/**
	 * 根据ID查找对话框
	 * @param id
	 * @returns {Dialog}
	 */
	findById(id){
		return DIALOG_COLLECTION.find(dlg => {
			return dlg.config.id === id
		});
	}
};

const resolveContentType = (content) => {
	if(typeof (content) === 'object' && content.src){
		return DLG_CTN_TYPE_IFRAME;
	}
	return DLG_CTN_TYPE_HTML;
};

/**
 * 构造DOM结构
 * @param {Dialog} dlg
 */
const domConstruct = (dlg) => {
	let html = `
		<div class="${DLG_CLS_PREF}" 
			id="${dlg.config.id}" 
			style="${dlg.state === STATE_HIDDEN ? 'display:none' : ''}; ${dlg.config.width ? 'width:' + dimension2Style(dlg.config.width) : ''}">
		${dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : ''}
		${dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" tabindex="0"></span>` : ''}
	`;

	let style = [];
	if(dlg.config.minContentHeight !== null){
		style.push('min-height:' + dimension2Style(dlg.config.minContentHeight));
	}
	html += `<div class="${DLG_CLS_CTN} ${resolveContentType(dlg.config.content)}" style="${style.join(';')}">${renderContent(dlg)}</div>`;
	if(dlg.config.buttons.length){
		html += `<div class="${DLG_CLS_OP}">`;
		dlg.config.buttons.forEach(button => {
			html += `<input type="button" class="${DLG_CLS_BTN}" ${button.default ? 'autofocus' : ''} tabindex="0" value="${escapeAttr(button.title)}">`;
		});
		html += '</div>';
	}
	html += '</div>';
	dlg.dom = createDomByHtml(html, document.body);

	//update content height
	if(dlg.config.height){
		adjustHeight(dlg, dlg.config.height, dlg.config.maxHeight);
	}

	updatePosition$1(dlg);

	//bind iframe content
	if(!dlg.config.height && resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
		let iframe = dlg.dom.querySelector('iframe');
		iframe.addEventListener('load', () => {
			try{
				let html = iframe.contentWindow.document.body.parentNode;
				let h = html.scrollHeight || html.clientHeight || html.offsetHeight;
				h = h + 40;
				adjustHeight(dlg, h, dlg.config.maxHeight);
			}catch(e){
				console.error('iframe load error', e);
			}
		});
	}
	dlg.dom.style.display = 'none';
};

/**
 * 事件绑定
 * @param {Dialog} dlg
 */
const eventBind = (dlg) => {
	//bind dialog active
	dlg.dom.addEventListener('mousedown', () => {
		dlg.state === STATE_ACTIVE && DialogManager.trySetFront(dlg);
	});

	//bind buttons event
	for(let i in dlg.config.buttons){
		let cb = dlg.config.buttons[i].callback || dlg.close;
		let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} .${DLG_CLS_BTN}`)[i];
		btn.addEventListener('click', cb.bind(dlg), false);
	}

	//bind move
	if(dlg.config.moveAble){
		let start_move = false;
		let last_click_offset = null;
		dlg.dom.querySelector('.' + DLG_CLS_TI).addEventListener('mousedown', (e) => {
			if(e.currentTarget && domContained(dlg.dom, e.currentTarget, true)){
				start_move = true;
				last_click_offset = {x: e.clientX - dlg.dom.offsetLeft, y: e.clientY - dlg.dom.offsetTop};
			}
		});
		document.body.addEventListener('mouseup', () => {
			start_move = false;
			last_click_offset = null;
		});
		document.body.addEventListener('mousemove', (e) => {
			if(start_move && last_click_offset){
				dlg.dom.style.left = Math.max(e.clientX - last_click_offset.x, 0) + 'px';
				dlg.dom.style.top = Math.max(e.clientY - last_click_offset.y, 0) + 'px';
			}
		});
	}

	//bind top close button event
	if(dlg.config.showTopCloseButton){
		let close_btn = dlg.dom.querySelector(`.${DLG_CLS_TOP_CLOSE}`);
		buttonActiveBind(close_btn, dlg.close.bind(dlg));
	}

	//bind window resize un-move-able dialog
	!dlg.config.moveAble && window.addEventListener('resize', () => {
		updatePosition$1(dlg);
	});
};

/**
 * 更新对话框位置
 * @param {Dialog} dlg
 */
const updatePosition$1 = (dlg) => {
	let _hidden = dlg.state === STATE_HIDDEN;
	let ml, mt;
	if(!_hidden){
		[ml, mt] = keepRectCenter(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
	}else {
		dlg.dom.style.visibility = 'hidden';
		dlg.dom.style.display = 'block';
		[ml, mt] = keepRectCenter(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
		dlg.dom.style.display = 'none';
		dlg.dom.style.visibility = 'visible';
	}
	dlg.dom.style.top = mt + 'px';
	dlg.dom.style.left = ml + 'px';
};

/**
 * 更新
 * @param {Dialog} dlg
 * @param {Number} h
 * @param {Number} max_h
 */
const adjustHeight = (dlg, h, max_h) => {
	let ctn = dlg.dom.querySelector(`.${DLG_CLS_CTN}`);
	ctn.style.height = dimension2Style(h);
	ctn.style.maxHeight = dimension2Style(max_h);
	if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
		let iframe = dlg.dom.querySelector('iframe');
		iframe.style.height = dimension2Style(h);
	}
};

/**
 * 渲染内容区域
 * @param {Dialog} dlg
 * @returns {string}
 */
const renderContent = (dlg) => {
	switch(resolveContentType(dlg.config.content)){
		case DLG_CTN_TYPE_IFRAME:
			return `<iframe src="${dlg.config.content.src}" ${IFRAME_ID_ATTR_FLAG}="1"></iframe>`;

		case DLG_CTN_TYPE_HTML:
			return dlg.config.content;

		default:
			console.error('Content type error', dlg.config.content);
			throw 'Content type error';
	}
};

class Dialog {
	static CONTENT_MIN_HEIGHT = 30; //最小高度
	static DEFAULT_WIDTH = 500; //默认宽度
	static DIALOG_INIT_Z_INDEX = Theme.DialogIndex;

	id = null;

	/** @var {HTMLElement} dom **/
	dom = null;

	state = STATE_HIDDEN;
	zIndex = Theme.DialogIndex;

	onClose = new BizEvent(true);
	onShow = new BizEvent(true);

	config = {
		id: null, //对话框ID，缺省为自动生成
		title: '', //对话框标题
		content: '',
		modal: false, //是否为模态窗口
		width: Dialog.DEFAULT_WIDTH,
		height: null, //高度，缺省为自动高度
		maxHeight: `calc(100vh - ${Dialog.CONTENT_MIN_HEIGHT}px)`,
		minContentHeight: Dialog.CONTENT_MIN_HEIGHT,
		moveAble: true, //是否可移动
		showMasker: true, //是否显示遮罩，如果是模态对话框，会强制显示遮罩
		buttons: [/** {title:'', default:true, callback }**/], //对话框配置按钮列表
		showTopCloseButton: true, //是否显示顶部关闭窗口
	};

	/**
	 * @param {Object} config
	 * @param {String|Null} config.id 为对话框指定ID
	 * @param {String} config.title 对话框标题
	 * @param {String} config.content 对话框内容，允许提交 {src:"http://"} 格式，渲染为iframe
	 * @param {Boolean} config.modal 是否为模态对话框
	 * @param {Number} config.width 宽度
	 * @param {Number} config.height 高度
	 * @param {Number} config.maxHeight 最大高度
	 * @param {Boolean} config.moveAble 是否可以移动
	 * @param {Array} config.buttons 按钮列表
	 * @param {Boolean} config.buttons.default 单个按钮对象中是否作为默认按钮（默认聚焦）
	 * @param {String} config.buttons.title 按钮标题
	 * @param {Function} config.buttons.callback 按钮点击后回调，缺省为关闭对话框
	 * @param {Boolean} config.showTopCloseButton 是否显示对话框右上角关闭按钮，如果显示按钮则支持ESC关闭对话框
	 */
	constructor(config = {}){
		this.config = Object.assign(this.config, config);
		this.config.id = this.config.id || 'dialog-' + Math.random();
		if(!this.config.showMasker && this.config.modal){
			console.warn('已矫正：模态窗口强制显示遮罩');
		}
		this.config.showMasker = this.config.modal || this.config.showMasker;
		domConstruct(this);
		eventBind(this);
		DialogManager.register(this);
	}

	show(){
		DialogManager.show(this);
	}

	hide(){
		DialogManager.hide(this);
	}

	close(){
		DialogManager.close(this);
	}

	updatePosition(){
		updatePosition$1(this);
	}

	/**
	 * 显示对话框
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} config
	 * @param {String|Null} config.id
	 * @param {Boolean} config.modal
	 * @param {Number} config.width
	 * @param {Number} config.height
	 * @param {Number} config.maxHeight
	 * @param {Boolean} config.moveAble
	 * @param {Array} config.buttons
	 * @param {Boolean} config.buttons.default
	 * @param {String} config.buttons.title
	 * @param {Function} config.buttons.callback
	 * @param {Boolean} config.showTopCloseButton
	 * @returns {Dialog}
	 */
	static show(title, content, config){
		let p = new Dialog({title, content, ...config});
		p.show();
		return p;
	}

	/**
	 * 确认框
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} opt
	 * @returns {Promise<unknown>}
	 */
	static confirm(title, content, opt = {}){
		return new Promise((resolve, reject) => {
			let p = new Dialog({
				title,
				content,
				buttons: [
					{
						title: '确定', default: true, callback: () => {
							p.close();
							resolve();
						}
					},
					{
						title: '取消', callback: () => {
							p.close();
							reject && reject();
						}
					}
				],
				showTopCloseButton: false,
				...opt
			});
			p.show();
		});
	}

	/**
	 * 提示框
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} opt
	 * @returns {Promise<unknown>}
	 */
	static alert(title, content, opt = {}){
		return new Promise(((resolve) => {
			let p = new Dialog({
				title,
				content,
				buttons: [
					{
						title: '确定', default: true, callback: () => {
							p.close();
							resolve();
						}
					},
				],
				showTopCloseButton: false,
				...opt
			});
			p.show();
		}));
	}

	/**
	 * 输入提示框
	 * @param {String} title
	 * @param {Object} option
	 * @param {String} option.initValue
	 * @returns {Promise<unknown>}
	 */
	static prompt(title, option = {initValue:""}){
		return new Promise((resolve, reject) => {
			let p = new Dialog({
				title: '请输入',
				content: `<div style="padding:0 10px;">
							<p style="padding-bottom:0.5em;">${title}</p>
							<input type="text" style="width:100%" class="${DLG_CLS_INPUT}" value="${escapeAttr(option.initValue || '')}"/>
						</div>`,
				buttons: [
					{
						title: '确定', default: true, callback: () => {
							let input = p.dom.querySelector('input');
							if(resolve(input.value) === false){
								return;
							}
							p.close();
						}
					},
					{title: '取消'}
				],
				showTopCloseButton: true,
				...option
			});
			p.onClose.listen(reject);
			p.onShow.listen(() => {
				let input = p.dom.querySelector('input');
				input.focus();
				input.addEventListener('keydown', e => {
					if(e.keyCode === KEYS.Enter){
						if(resolve(input.value) === false){
							return false;
						}
						p.close();
					}
				});
			});
			p.show();
		});
	}

	/**
	 * 获取当前页面（iframe）所在的对话框
	 * @returns {Dialog|null}
	 */
	static getCurrentFrameDialog(){
		if(!window.parent || !window.frameElement){
			console.warn('No in iframe');
			return null;
		}

		if(!parent.DialogManager){
			throw "No dialog manager found.";
		}

		let id = window.frameElement.getAttribute(IFRAME_ID_ATTR_FLAG);
		if(!id){
			throw "ID no found in iframe element";
		}
		return parent.DialogManager.findById(id);
	}
}

/**
 * 通过 src 加载图片
 * @param {String} src
 * @returns {Promise<HTMLImageElement>}
 */
const loadImgBySrc = (src)=>{
	return new Promise((resolve, reject) => {
		let img = new Image;
		img.onload = ()=>{
			resolve(img);
		};
		img.onabort = ()=>{
			reject('Image loading abort');
		};
		img.onerror = ()=>{
			reject('Image load failure');
		};
		img.src = src;
	});
};

const DOM_CLASS = Theme.Namespace + 'com-image-viewer';
const DEFAULT_VIEW_PADDING = 20;
const MAX_ZOOM_IN_RATIO = 2; //最大显示比率
const MIN_ZOOM_OUT_SIZE = 50; //最小显示像素

const THUMB_WIDTH = 50;
const THUMB_HEIGHT = 50;

const ATTR_W_BIND_KEY = 'data-original-width';
const ATTR_H_BIND_KEY = 'data-original-height';

const BASE_INDEX = Theme.FullScreenModeIndex;
const OP_INDEX = BASE_INDEX + 1;

const MODE_SINGLE = 1;
const MODE_MULTIPLE = 2;

let PREVIEW_DOM = null;
let CURRENT_MODE = 0;
let IMG_SRC_LIST = [];
let IMG_CURRENT_INDEX = 0;

insertStyleSheet(`
	@keyframes ${Theme.Namespace}spin{100%{transform:rotate(360deg);}}
	.${DOM_CLASS} {position: fixed; z-index:${BASE_INDEX}; background-color: #00000057; width: 100%; height: 100%; overflow:hidden;top: 0;left: 0;}
	.${DOM_CLASS} .civ-closer {position:absolute; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:10px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before {font-family: "${Theme.IconFont}", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover {background-color:#eeeeee75;}
	.${DOM_CLASS} .civ-nav-btn {padding:10px; z-index:${OP_INDEX}; border-radius:3px; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled] {color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:hover {background-color:none !important;}
	.${DOM_CLASS} .civ-nav-btn:before {font-family:"${Theme.IconFont}"; font-size:20px;}
	.${DOM_CLASS} .civ-prev {left:10px}
	.${DOM_CLASS} .civ-prev:before {content:"\\e6103"}
	.${DOM_CLASS} .civ-next {right:10px}
	.${DOM_CLASS} .civ-next:before {content:"\\e73b";}
	
	.${DOM_CLASS} .civ-nav-list-wrap {position:absolute; background-color:#fff3; padding-left:20px; padding-right:20px; bottom:10px; left:50%; transform: translate(-50%, 0); overflow:hidden; z-index:${OP_INDEX}; max-width:300px; min-width:300px; border:1px solid green;}
	.${DOM_CLASS} .civ-nav-list-prev:before,
	.${DOM_CLASS} .civ-nav-list-next:before {font-family:"${Theme.IconFont}"; font-size:18px; position:absolute; top:30%; left:0; width:20px; height:100%;}
	.${DOM_CLASS} .civ-nav-list-prev:before {content:"\\e6103"}
	.${DOM_CLASS} .civ-nav-list-next:before {content:"\\e73b"; left:auto; right:0;}
	.${DOM_CLASS} .civ-nav-list {height:${THUMB_HEIGHT}px}
	.${DOM_CLASS} .civ-nav-thumb {width:${THUMB_WIDTH}px; height:${THUMB_HEIGHT}px; overflow:hidden; display:inline-block; box-sizing:border-box; padding:0 5px;}
	.${DOM_CLASS} .civ-nav-thumb img {width:100%; height:100%; }
	
	.${DOM_CLASS} .civ-ctn {height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-error {margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading {--loading-size:50px; position:absolute; left:50%; top:50%; margin:calc(var(--loading-size) / 2) 0 0 calc(var(--loading-size) / 2)}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; animation: ${Theme.Namespace}spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size);}
	.${DOM_CLASS} .civ-img {height:100%; display:block; box-sizing:border-box; position:relative;}
	.${DOM_CLASS} .civ-img img {position:absolute; left:50%; top:50%; transition:width 0.1s, height 0.1s; transform: translate(-50%, -50%); box-shadow: 1px 1px 20px #898989; background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTZGMjU3QTNFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTZGMjU3QTJFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg2ugmUAAAAGUExURe7u7v///yjTqpoAAAAoSURBVHjaYmDAARhxAIZRDaMaRjWMaqCxhtHQGNUwqmFUwyDTABBgALZcBIFabzQ0AAAAAElFTkSuQmCC')}
	
	.${DOM_CLASS}[data-ip-mode="${MODE_SINGLE}"] .civ-nav-btn,
	.${DOM_CLASS} .civ-nav-list-wrap {display:none;} /** todo **/
`, Theme.Namespace + 'img-preview-style');

/**
 * 更新导航按钮状态
 */
const updateNavState = () => {
	let prev = PREVIEW_DOM.querySelector('.civ-prev');
	let next = PREVIEW_DOM.querySelector('.civ-next');
	let total = IMG_SRC_LIST.length;
	if(IMG_CURRENT_INDEX === 0){
		prev.setAttribute('disabled', 'disabled');
	}else {
		prev.removeAttribute('disabled');
	}
	if(IMG_CURRENT_INDEX === (total - 1)){
		next.setAttribute('disabled', 'disabled');
	}else {
		next.removeAttribute('disabled');
	}
};

const scaleFixCenter = ({
	                        contentWidth,
	                        contentHeight,
	                        containerWidth,
	                        containerHeight,
	                        spacing = 0,
	                        zoomIn = false
                        }) => {
	if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
		return {
			width: contentWidth,
			height: contentHeight
		};
	}
	let ratioX = containerWidth / contentWidth;
	let ratioY = containerHeight / contentHeight;

	let ratio = Math.min(ratioX, ratioY);
	return {
		width: contentWidth * ratio - spacing * 2,
		height: contentHeight * ratio - spacing * 2
	};
};

/**
 * 绑定图片移动
 * @param img
 */
const bindImgMove = (img) => {
	let moving = false;
	let lastOffset = {};
	img.addEventListener('mousedown', e => {
		moving = true;
		lastOffset = {
			clientX: e.clientX,
			clientY: e.clientY,
			marginLeft: parseInt(img.style.marginLeft || 0, 10),
			marginTop: parseInt(img.style.marginTop || 0, 10)
		};
		e.preventDefault();
	});
	['mouseup', 'mouseout'].forEach(ev => {
		img.addEventListener(ev, e => {
			moving = false;
		});
	});
	img.addEventListener('mousemove', e => {
		if(moving){
			img.style.marginLeft = dimension2Style(lastOffset.marginLeft + (e.clientX - lastOffset.clientX));
			img.style.marginTop = dimension2Style(lastOffset.marginTop + (e.clientY - lastOffset.clientY));
		}
	});
};

/**
 * 显示图片
 * @param {Number} img_index
 */
const showImgSrc = (img_index = 0) => {
	let imgSrc = IMG_SRC_LIST[img_index];
	let loading = PREVIEW_DOM.querySelector('.civ-loading');
	let err = PREVIEW_DOM.querySelector('.civ-error');
	let img_ctn = PREVIEW_DOM.querySelector('.civ-img');
	img_ctn.innerHTML = '';
	show(loading);
	hide(err);
	loadImgBySrc(imgSrc).then(img => {
		setStyle(img, scaleFixCenter({
			contentWidth: img.width,
			contentHeight: img.height,
			containerWidth: img_ctn.offsetWidth,
			containerHeight: img_ctn.offsetHeight,
			spacing: DEFAULT_VIEW_PADDING
		}));
		hide(loading);
		img_ctn.innerHTML = '';
		img.setAttribute(ATTR_W_BIND_KEY, img.width);
		img.setAttribute(ATTR_H_BIND_KEY, img.height);
		bindImgMove(img);
		img_ctn.appendChild(img);
	}, error => {
		console.warn(error);
		hide(loading);
		err.innerHTML = `图片加载失败，<a href="${imgSrc}" target="_blank">查看详情(${error})</a>`;
		show(err);
	});
};

const constructDom = () => {
	let nav_thumb_list_html = ``;

	PREVIEW_DOM = createDomByHtml(`
		<div class="${DOM_CLASS}" data-ip-mode="${CURRENT_MODE}">
			<span class="civ-closer" title="ESC to close">close</span>
			<span class="civ-nav-btn civ-prev"></span>
			<span class="civ-nav-btn civ-next"></span>
			<span class="civ-view-option"></span>
			<div class="civ-nav-list-wrap">
				<span class="civ-nav-list-prev"></span>
				<span class="civ-nav-list-next"></span>
				${nav_thumb_list_html}
			</div>
			<div class="civ-ctn">
				<span class="civ-loading"></span>
				<span class="civ-error"></span>
				<span class="civ-img"></span>
			</div>
		</div>
	`, document.body);

	//bind close click & space click
	PREVIEW_DOM.querySelector('.civ-closer').addEventListener('click', destroy);
	PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('click', e => {
		if(e.target.tagName !== 'IMG'){
			destroy();
		}
	});

	//bind navigate
	if(CURRENT_MODE === MODE_MULTIPLE){
		PREVIEW_DOM.querySelector('.civ-prev').addEventListener('click', () => {
			switchTo(true);
		});
		PREVIEW_DOM.querySelector('.civ-next').addEventListener('click', () => {
			switchTo(false);
		});
	}

	//bind scroll zoom
	PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('mousewheel', e => {
		zoom(e.wheelDelta > 0 ? 1.2 : 0.8);
		e.preventDefault();
		return false;
	});

	//bind resize
	window.addEventListener('resize', onWinResize);

	//bind key
	document.body.addEventListener('keydown', onKeyDown);
};

const onKeyDown = (e) => {
	if(e.key === 'Escape'){
		destroy();
	}
	if(e.key === 'ArrowLeft'){
		switchTo(true);
	}
	if(e.key === 'ArrowRight'){
		switchTo(false);
	}
};

let resize_tm = null;
const onWinResize = () => {
	resize_tm && clearTimeout(resize_tm);
	resize_tm = setTimeout(() => {
		resetView();
	}, 50);
};

/**
 * 销毁组件
 */
const destroy = () => {
	if(!PREVIEW_DOM){
		return;
	}
	PREVIEW_DOM.parentNode.removeChild(PREVIEW_DOM);
	PREVIEW_DOM = null;
	window.removeEventListener('resize', onWinResize);
	document.body.removeEventListener('keydown', onKeyDown);
};

/**
 * 重置视图
 */
const resetView = () => {
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	if(!img){
		return;
	}
	let container = PREVIEW_DOM.querySelector('.civ-img');
	setStyle(img, scaleFixCenter({
		contentWidth: img.getAttribute(ATTR_W_BIND_KEY),
		contentHeight: img.getAttribute(ATTR_H_BIND_KEY),
		containerWidth: container.offsetWidth,
		containerHeight: container.offsetHeight,
		spacing: DEFAULT_VIEW_PADDING
	}));
	setStyle(img, {marginLeft: 0, marginTop: 0});
};

/**
 * 图片切换
 * @param {Boolean} toPrev 是否切换到上一张
 * @return {boolean}
 */
const switchTo = (toPrev = false) => {
	let total = IMG_SRC_LIST.length;
	if((toPrev && IMG_CURRENT_INDEX === 0) || (!toPrev && IMG_CURRENT_INDEX === (total - 1))){
		return false;
	}
	toPrev ? IMG_CURRENT_INDEX-- : IMG_CURRENT_INDEX++;
	showImgSrc(IMG_CURRENT_INDEX);
	updateNavState();
};

/**
 * 缩放
 * @param {Number} ratioOffset 缩放比率(原尺寸百分比）
 */
const zoom = (ratioOffset) => {
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	let origin_width = img.getAttribute(ATTR_W_BIND_KEY);
	let origin_height = img.getAttribute(ATTR_H_BIND_KEY);

	let width = parseInt(img.style.width, 10) * ratioOffset;
	let height = parseInt(img.style.height, 10) * ratioOffset;

	//zoom in ratio limited
	if(ratioOffset > 1 && width > origin_width && ((width / origin_width) > MAX_ZOOM_IN_RATIO || (height / origin_height) > MAX_ZOOM_IN_RATIO)){
		console.warn('zoom in limited');
		return;
	}

	//限制任何一边小于最小值
	if(ratioOffset < 1 && width < origin_width && (width < MIN_ZOOM_OUT_SIZE || height < MIN_ZOOM_OUT_SIZE)){
		console.warn('zoom out limited');
		return;
	}
	img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
	img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
	img.style.width = dimension2Style(parseInt(img.style.width, 10) * ratioOffset);
	img.style.height = dimension2Style(parseInt(img.style.height, 10) * ratioOffset);
};

/**
 * 初始化
 * @param {Number} mode
 * @param {String[]} imgSrcList
 * @param {Number} startIndex
 */
const init = (mode, imgSrcList, startIndex = 0) => {
	destroy();
	CURRENT_MODE = mode;
	IMG_SRC_LIST = imgSrcList;
	IMG_CURRENT_INDEX = startIndex;
	constructDom();
	showImgSrc(IMG_CURRENT_INDEX);
	mode === MODE_MULTIPLE && updateNavState();
};

/**
 * 显示单张图片预览
 * @param imgSrc
 */
const showImgPreview = (imgSrc) => {
	init(MODE_SINGLE, [imgSrc]);
};

/**
 * 显示多图预览
 * @param {String[]} imgSrcList
 * @param {Number} startIndex
 */
const showImgListPreview = (imgSrcList, startIndex = 0) => {
	init(MODE_MULTIPLE, imgSrcList, startIndex);
};

/**
 * 通过绑定节点显示图片预览
 * @param {String} nodeSelector 触发绑定的节点选择器，可以是img本身节点，也可以是其他代理节点
 * @param {String} triggerEvent
 * @param {String|Function} srcFetcher 获取大图src的选择器，或者函数，如果是函数传入第一个参数为触发节点
 */
const bindImgPreviewViaSelector = (nodeSelector = 'img', triggerEvent = 'click', srcFetcher = 'src') => {
	let nodes = document.querySelectorAll(nodeSelector);
	let imgSrcList = [];
	if(!nodes.length){
		console.warn('no images found');
		return;
	}
	Array.from(nodes).forEach((node, idx) => {
		switch(typeof(srcFetcher)){
			case 'function':
				imgSrcList.push(srcFetcher(node));
				break;
			case 'string':
				imgSrcList.push(node.getAttribute(srcFetcher));
				break;
			default:
				throw "No support srcFetcher types:"+typeof(srcFetcher);
		}
		node.addEventListener(triggerEvent, e => {
			if(nodes.length > 1){
				showImgListPreview(imgSrcList, idx);
			}else {
				showImgPreview(imgSrcList[0]);
			}
		});
	});
};

let last_active_ladder = null;
let ladder_scrolling = false;

const Ladder = (ladder, opt)=>{
	opt = Object.assign({
		onAfterScrollTo: function($ladder_node, aim){},
		onBeforeScrollTo: function(aim){},
		ladderActiveClass: 'ladder-active',
		dataTag: 'href',
		animateTime: 400,
		addHistory: true,
		bindScroll: true,
		scrollContainer: 'body',
		preventDefaultEvent: true
	}, opt || {});

	let $selector = $(ladder).find('['+opt.dataTag+']');

	/**
	 * scroll to aim
	 * @param aim
	 * @param {Node} ladder_node
	 */
	let scroll_to = function(aim, ladder_node){
		let $n = (!$(aim).size() && aim === '#top') ? $('body') : $(aim);
		if(!$n.size() || false === opt.onBeforeScrollTo(aim)){
			return;
		}
		let pos = $n.offset().top;
		if(opt.ladderActiveClass){
			if(last_active_ladder){
				last_active_ladder.removeClass(opt.ladderActiveClass);
			}
			ladder_node.addClass(opt.ladderActiveClass);
			last_active_ladder = ladder_node;
		}
		ladder_scrolling = true;

		$(opt.scrollContainer).animate({scrollTop: pos}, opt.animateTime, function(){
			//fix JQuery animate complete but trigger window scroll event once still(no reason found yet)
			setTimeout(function(){
				if(opt.addHistory){
					if(window.history && window.history.pushState){
						history.pushState(null, null, aim);
					} else {
						location.hash = aim;
					}
				}
				ladder_scrolling = false;
				opt.onAfterScrollTo(ladder_node, aim);
			}, 50);
		});
	};

	//bind ladder node click
	$selector.click(function(){
		let $node = $(this);
		let aim = $node.attr(opt.dataTag);
		if(aim !== '#top' && !$(aim).size()){
			return;
		}

		if(!/^#\w+$/i.test(aim)){
			console.error('ladder pattern check fail: '+aim);
			return;
		}
		scroll_to(aim, $node);
		if(opt.preventDefaultEvent){
			return false;
		}
	});

	//init state from location hash information
	if(opt.addHistory){
		$(function(){
			$selector.each(function(){
				let aim = $(this).attr(opt.dataTag);
				let m = location.href.match(new RegExp(aim+'(&|#|$|=)'));
				if(m){
					//match anchor link node
					if($(aim).size() && $(aim)[0].tagName == 'A'){
						console.debug('ladder hit a:'+aim);
						return;
					}
					scroll_to(aim, $(this));
					return false;
				}
			});
		});
	}

	//bind scroll event
	if(opt.bindScroll){
		$(opt.scrollContainer === 'body' ? window : opt.scrollContainer).scroll(function(){
			let t = $(window).scrollTop();
			if(!ladder_scrolling){
				let $hit_node = null;
				let $hit_ladder_node = null;
				let hit_aim = '';
				$selector.each(function(){
					let $ladder_node = $(this);
					let aim = $ladder_node.attr(opt.dataTag);
					let $aim = $(aim);
					if($aim.size()){
						if(t >= $aim.offset().top){
							$hit_node = $aim;
							$hit_ladder_node = $ladder_node;
							hit_aim = aim;
						}
					}
				});

				if($hit_node){
					//make class
					if(opt.ladderActiveClass){
						if(last_active_ladder){
							last_active_ladder.removeClass(opt.ladderActiveClass);
						}
						$hit_ladder_node.addClass(opt.ladderActiveClass);
						last_active_ladder = $hit_ladder_node;
					}
					//trigger after scroll to
					opt.onAfterScrollTo($hit_ladder_node, hit_aim);
				}
			}
		}).trigger('scroll');
	}
};

const Thumb = {
	globalConfig: {},

	setThumbGlobalConfig({loadingClass, errorClass}){
		this.globalConfig.loadingClass = loadingClass;
		this.globalConfig.errorClass = errorClass;
	},

	bindThumbImgNode(imgNode, param){
		if(!param.src){
			console.error('Image src required');
			return;
		}
		let loadingClass = param.loadingClass || this.globalConfig.loadingClass;
		let errorClass = param.loadingClass || this.globalConfig.errorClass;
		let pNode = imgNode.parentNode;
		pNode.classList.add(loadingClass);
		pNode.classList.remove(errorClass);

		imgNode.addEventListener('error', () => {
			pNode.classList.add(errorClass);
			pNode.classList.remove(loadingClass);
			hide(imgNode);
		});
		imgNode.addEventListener('load', ()=>{
			pNode.classList.remove(loadingClass);
			pNode.classList.remove(errorClass);
			show(imgNode);
		});
		imgNode.setAttribute('src', param.src);
	}
};

let TIP_COLLECTION = {};
let GUID_BIND_KEY = Theme.Namespace+'-tip-guid';
let NS = Theme.Namespace + 'tip';
let TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

insertStyleSheet(`
	.${NS}-container-wrap {position:absolute; z-index:${Theme.TipIndex};}
	.${NS}-content {border:1px solid #cacaca; border-radius:4px; background-color:#fff; padding:10px; box-shadow:0 0 10px rgba(105, 105, 105, 0.4); max-width:500px; word-break:break-all}
	.${NS}-arrow {display:block; width:0; height:0; border:7px solid transparent; position:absolute; z-index:1}
	.${NS}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; color:gray;}
	.${NS}-close:hover {color:black;}
	
	/** top **/
	${NS}-container-wrap[data-tip-dir-0], .${NS}-container-wrap[data-tip-dir="1"], .${NS}-container-wrap[data-tip-dir="11"] {padding-top:7px;}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow {top:-5px; margin-left:-7px; border-bottom-color:white}
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow-pt {top:-6px; border-bottom-color:#dcdcdc;}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow {left:25%;}
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow {left:50%;}
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow {left:75%;}
	
	/** right **/
	.${NS}-container-wrap[data-tip-dir="8"], .${NS}-container-wrap[data-tip-dir="9"], .${NS}-container-wrap[data-tip-dir="10"] {padding-left:7px;}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-close {top:3px;}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow {left:-6px; margin-top:-7px; border-right-color:white}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow-pt {left:-7px; border-right-color:#dcdcdc;}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow {top:75%}
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow {top:50%}
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow {top:25%}
	
	/** bottom **/
	.${NS}-container-wrap[data-tip-dir="5"], .${NS}-container-wrap[data-tip-dir="6"], .${NS}-container-wrap[data-tip-dir="7"] {padding-bottom:7px;}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-close {top:3px;}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow {left:50%; bottom:-6px; margin-left:-7px; border-top-color:white}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow-pt {bottom:-7px; border-top-color:#dcdcdc;}
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow {left:30px}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow {left:75%}
	
	/** left **/
	.${NS}-container-wrap[data-tip-dir="2"], .${NS}-container-wrap[data-tip-dir="3"], .${NS}-container-wrap[data-tip-dir="4"] {padding-right:7px;}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-close {right:13px; top:3px;}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow {right:-6px; margin-top:-7px; border-left-color:white}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow-pt,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow-pt {right:-7px; border-left-color:#dcdcdc;}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow {top:25%}
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow {top:50%}
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow {top:75%}
`, Theme.Namespace + 'tip-style');

/**
 * 绑定事件
 */
let bindEvent = function(){
	if(this.option.showCloseButton){
		let btn = this.dom.querySelector(`.${NS}-close`);
		btn.addEventListener('click', () => {
			this.hide();
		}, false);
		document.body.addEventListener('keyup', (e) => {
			if(e.keyCode === KEYS.Esc){
				this.hide();
			}
		}, false);
	}
};

/**
 * 自动计算方位
 * @returns {number}
 */
let calDir = function(){
	let body = document.body;
	let width = this.dom.offsetWidth;
	let height = this.dom.offsetHeight;
	let px = this.relNode.offsetLeft;
	let py = this.relNode.offsetTop;
	let rh = this.relNode.offsetHeight;
	let rw = this.relNode.offsetWidth;

	let scroll_left = body.scrollLeft;
	let scroll_top = body.scrollTop;

	let viewRegion = getRegion();

	for(let i = 0; i < TRY_DIR_MAP.length; i++){
		let dir_offset = getDirOffset(TRY_DIR_MAP[i], width, height, rh, rw);
		let rect = {
			left: px + dir_offset[0],
			top: py + dir_offset[1],
			width: width,
			height: height
		};
		let layout_rect = {
			left: scroll_left,
			top: scroll_top,
			width: viewRegion.visibleWidth,
			height: viewRegion.visibleHeight
		};
		if(rectInLayout(rect, layout_rect)){
			return TRY_DIR_MAP[i];
		}
	}
	return 11;
};

/**
 * 方位偏移
 * @param {Number} dir
 * @param {Number} width
 * @param {Number} height
 * @param {Number} rh
 * @param {Number} rw
 * @returns {*}
 */
let getDirOffset = function(dir, width, height, rh, rw){
	let offset = {
		11: [-width * 0.25 + rw / 2, rh],
		0: [-width * 0.5 + rw / 2, rh],
		1: [-width * 0.75 + rw / 2, rh],
		2: [-width, -height * 0.25 + rh / 2],
		3: [-width, -height * 0.5 + rh / 2],
		4: [-width, -height * 0.75 + rh / 2],
		5: [-width * 0.75 + rw / 2, -height],
		6: [-width * 0.5 + rw / 2, -height],
		7: [-width * 0.25 + rw / 2, -height],
		8: [rw, -height * 0.75 + rh / 2],
		9: [rw, -height * 0.5 + rh / 2],
		10: [rw, -height * 0.25 + rh / 2]
	};
	return offset[dir];
};

/**
 * 更新位置信息
 */
const updatePosition = function(){
	let direction = this.option.direction;
	let width = this.dom.offsetWidth;
	let height = this.dom.offsetHeight;
	let pos = getDomOffset(this.relNode);
	let px = pos.left;
	let py = pos.top;
	let rh = this.relNode.offsetHeight;
	let rw = this.relNode.offsetWidth;
	if(direction === 'auto'){
		direction = calDir.call(this);
	}
	this.dom.setAttribute('data-tip-dir',direction);
	let offset = getDirOffset(direction, width, height, rh, rw);
	this.dom.style.left = dimension2Style(px + offset[0]);
	this.dom.style.top = dimension2Style(py + offset[1]);
};

class Tip {
	guid = null;
	relNode = null;

	/** @var {HtmlElement} dom **/
	dom = null;
	option = {
		showCloseButton: false,
		width: 'auto',
		direction: 'auto',
	};

	_hideTm = null;

	onShow = new BizEvent(true);
	onHide = new BizEvent(true);
	onDestroy = new BizEvent(true);

	constructor(content, relNode, opt = {}){
		this.guid = guid();
		this.relNode = relNode;
		this.option = {...this.option, ...opt};

		let close_button_html = this.option.showCloseButton ? `<span class="${NS}-close">&#10005;</span>` : ``;
		this.dom = createDomByHtml(
			`<div class="${NS}-container-wrap" style="display:none;">
				<s class="${NS}-arrow ${NS}-arrow-pt"></s>
				<s class="${NS}-arrow ${NS}-arrow-bg"></s>
				${close_button_html}
				<div class="${NS}-content">${content}</div>
			</div>`, document.body);

		this.dom.style.width = dimension2Style(this.option.width);
		bindEvent.call(this);
		TIP_COLLECTION[this.guid] = this;
	}

	/**
	 * 设置提示内容
	 * @param {String} html
	 */
	setContent(html){
		this.dom.querySelector(`.${NS}-content`).innerHTML = html;
		updatePosition.call(this);
	}

	/**
	 * 去重判断，避免onShow时间多次触发
	 */
	show(){
		show(this.dom);
		updatePosition.call(this);
		this.onShow.fire(this);
	}

	hide(){
		console.log('hide call');
		hide(this.dom);
		this.onHide.fire(this);
	}

	destroy(){
		this.dom.parentNode.removeChild(this.dom);
		this.onDestroy.fire();
		for(let i in TIP_COLLECTION){
			if(TIP_COLLECTION[i] === this){
				delete(TIP_COLLECTION[i]);
			}
		}
	}

	/**
	 * 快速显示Tip
	 * @param {String} content
	 * @param {HTMLElement} relNode
	 * @param option
	 * @returns {Tip}
	 */
	static show(content, relNode, option = {}){
		let tip = new Tip(content, relNode, option);
		tip.show();
		return tip;
	}

	/**
	 * 隐藏所有Tip
	 */
	static hideAll(){
		for(let i in TIP_COLLECTION){
			TIP_COLLECTION[i].hide();
		}
	}

	/**
	 * 绑定节点
	 * @param {String} content
	 * @param {HTMLElement} relNode
	 * @param {Object} option
	 * @return {Tip}
	 */
	static bindNode(content, relNode, option = {}){
		let guid = relNode.getAttribute(GUID_BIND_KEY);
		let tipObj = TIP_COLLECTION[guid];
		if(!tipObj){
			tipObj = new Tip(content, relNode, option);
			relNode.setAttribute(GUID_BIND_KEY, tipObj.guid);
			relNode.addEventListener('mouseover', ()=>{
				tipObj.show();
			});
			let tm = null;
			let hide = ()=>{
				tm && clearTimeout(tm);
				tm = setTimeout(()=>{
					tipObj.hide();
				}, 100);
			};
			let show = ()=>{
				tm && clearTimeout(tm);
				tipObj.show();
			};
			relNode.addEventListener('mouseout', hide);
			tipObj.dom.addEventListener('mouseout', hide);
			tipObj.dom.addEventListener('mouseover', show);
		}
		return tipObj;
	}

	/**
	 * 通过异步获取数据方式绑定显示Tip
	 * @param {HTMLElement} relNode
	 * @param {Function} dataFetcher 返回 Promise 对象
	 * @param {Object} option
	 */
	static bindAsync(relNode, dataFetcher, option = {}){
		let guid = relNode.getAttribute(`data-${GUID_BIND_KEY}`);
		let obj = TIP_COLLECTION[guid];
		if(!obj){
			let loading = false;
			obj = Tip.bindNode('loading...', relNode, option);
			obj.onShow.listen(() => {
				if(loading){
					return;
				}
				loading = true;
				dataFetcher().then(rspHtml => {
					loading = false;
					obj.setContent(rspHtml);
				}, error => {
					loading = false;
					obj.setContent(error);
				});
			});
		}
	};
}

let CLS = Theme.Namespace + 'toc';

insertStyleSheet(`
	.${CLS} {position:fixed; padding:10px; box-shadow:1px 1px 10px #ccc;}
`, Theme.Namespace + 'toc-style');

const resolveTocListFromDom = (dom = document.body, levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
	let allHeads = dom.querySelectorAll(levelMaps.join(','));
	let tocList = [];
	let serials = [];

	levelMaps.forEach(selector => {
		serials.push(Array.from(dom.querySelectorAll(selector)));
	});

	let calcLvl = (h) => {
		for(let i = 0; i < serials.length; i++){
			if(serials.includes(h)){
				return i;
			}
		}
	};

	allHeads.forEach(h => {
		tocList.push({
			text: h.innerText,
			refNode: h,
			level: calcLvl(h)
		});
	});
	return tocList;
};

const Toc = (dom, levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
	let tocList = resolveTocListFromDom(dom, levelMaps);
	let tocHtml = '';
	tocList.forEach(item => {
		let id = Theme.Namespace+'toc' + guid();
		let helpNode = document.createElement('A');
		helpNode.id = id;
		item.refNode.parentNode.insertBefore(item.refNode, helpNode);
		tocHtml.push(`<a href="#${id}" data-level="${item.level}">${escapeHtml(item.text)}</a>`);
	});
	createDomByHtml(`
	<dl class="${CLS}">
		<dt>本页目录</dt>
		<dd>
			${tocHtml}
		</dd>
	</dl>`, document.body);
};

exports.BLOCK_TAGS = BLOCK_TAGS;
exports.Base64Encode = Base64Encode;
exports.BizEvent = BizEvent;
exports.Dialog = Dialog;
exports.DialogManager = DialogManager;
exports.HTTP_METHOD = HTTP_METHOD;
exports.KEYS = KEYS;
exports.Ladder = Ladder;
exports.MD5 = MD5;
exports.Masker = Masker;
exports.Net = Net;
exports.ONE_DAY = ONE_DAY;
exports.ONE_HOUR = ONE_HOUR;
exports.ONE_MINUTE = ONE_MINUTE;
exports.ONE_MONTH_30 = ONE_MONTH_30;
exports.ONE_MONTH_31 = ONE_MONTH_31;
exports.ONE_WEEK = ONE_WEEK;
exports.ONE_YEAR_365 = ONE_YEAR_365;
exports.QueryString = QueryString;
exports.REMOVABLE_TAGS = REMOVABLE_TAGS;
exports.REQUEST_FORMAT = REQUEST_FORMAT;
exports.RESPONSE_FORMAT = RESPONSE_FORMAT;
exports.TRIM_BOTH = TRIM_BOTH;
exports.TRIM_LEFT = TRIM_LEFT;
exports.TRIM_RIGHT = TRIM_RIGHT;
exports.Theme = Theme;
exports.Thumb = Thumb;
exports.Tip = Tip;
exports.Toast = Toast;
exports.Toc = Toc;
exports.arrayColumn = arrayColumn;
exports.arrayDistinct = arrayDistinct;
exports.arrayGroup = arrayGroup;
exports.arrayIndex = arrayIndex;
exports.base64Decode = base64Decode;
exports.base64UrlSafeEncode = base64UrlSafeEncode;
exports.between = between;
exports.bindImgPreviewViaSelector = bindImgPreviewViaSelector;
exports.buttonActiveBind = buttonActiveBind;
exports.capitalize = capitalize;
exports.convertBlobToBase64 = convertBlobToBase64;
exports.copy = copy;
exports.copyFormatted = copyFormatted;
exports.createDomByHtml = createDomByHtml;
exports.cssSelectorEscape = cssSelectorEscape;
exports.cutString = cutString;
exports.decodeHTMLEntities = decodeHTMLEntities;
exports.dimension2Style = dimension2Style;
exports.domContained = domContained;
exports.downloadFile = downloadFile;
exports.enterFullScreen = enterFullScreen;
exports.entityToString = entityToString;
exports.escapeAttr = escapeAttr;
exports.escapeHtml = escapeHtml;
exports.eventDelegate = eventDelegate;
exports.exitFullScreen = exitFullScreen;
exports.fireEvent = fireEvent;
exports.formSerializeJSON = formSerializeJSON;
exports.formValidate = formValidate;
exports.formatSize = formatSize;
exports.frequencyControl = frequencyControl;
exports.getCurrentScript = getCurrentScript;
exports.getDomOffset = getDomOffset;
exports.getElementValue = getElementValue;
exports.getHash = getHash;
exports.getLibEntryScript = getLibEntryScript;
exports.getLibModule = getLibModule;
exports.getLibModuleTop = getLibModuleTop;
exports.getRegion = getRegion;
exports.getUTF8StrLen = getUTF8StrLen;
exports.getViewHeight = getViewHeight;
exports.getViewWidth = getViewWidth;
exports.guid = guid;
exports.hide = hide;
exports.highlightText = highlightText;
exports.html2Text = html2Text;
exports.inputAble = inputAble;
exports.insertStyleSheet = insertStyleSheet;
exports.isButton = isButton;
exports.isElement = isElement;
exports.isInFullScreen = isInFullScreen;
exports.isNum = isNum;
exports.keepRectCenter = keepRectCenter;
exports.keepRectInContainer = keepRectInContainer;
exports.loadCss = loadCss;
exports.loadScript = loadScript;
exports.matchParent = matchParent;
exports.mergerUriParam = mergerUriParam;
exports.onDocReady = onDocReady;
exports.onHover = onHover;
exports.onReportApi = onReportApi;
exports.onStateChange = onStateChange;
exports.openLinkWithoutReferer = openLinkWithoutReferer;
exports.pushState = pushState;
exports.randomString = randomString;
exports.rectAssoc = rectAssoc;
exports.rectInLayout = rectInLayout;
exports.regQuote = regQuote;
exports.repaint = repaint;
exports.resolveFileExtension = resolveFileExtension;
exports.resolveFileName = resolveFileName;
exports.resolveTocListFromDom = resolveTocListFromDom;
exports.round = round;
exports.setHash = setHash;
exports.setStyle = setStyle;
exports.show = show;
exports.showImgListPreview = showImgListPreview;
exports.showImgPreview = showImgPreview;
exports.strToPascalCase = strToPascalCase;
exports.stringToEntity = stringToEntity;
exports.toggle = toggle;
exports.toggleFullScreen = toggleFullScreen;
exports.trans = trans;
exports.triggerDomEvent = triggerDomEvent;
exports.trim = trim;
exports.unescapeHtml = unescapeHtml;
exports.utf8Decode = utf8Decode;
exports.utf8Encode = utf8Encode;
exports.versionCompare = versionCompare;
