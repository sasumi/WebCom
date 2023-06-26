(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebCom = {}));
})(this, (function (exports) { 'use strict';

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
	const arrayColumn = (arr, col_name) => {
		let data = [];
		for(let i in arr){
			data.push(arr[i][col_name]);
		}
		return data;
	};

	/**
	 * @param arr
	 * @param val
	 * @return {string|null}
	 */
	const arrayIndex = (arr, val) => {
		for(let i in arr){
			if(arr[i] === val){
				return i;
			}
		}
		return null;
	};

	/**
	 * @param obj1
	 * @param obj2
	 * @return {false|this is string[]}
	 */
	const isEquals = (obj1, obj2) => {
		let keys1 = Object.keys(obj1);
		let keys2 = Object.keys(obj2);
		//return true when the two json has same length and all the properties has same value key by key
		return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] === obj2[key]);
	};

	/**
	 * 数组去重
	 * @param {Array} arr
	 * @returns {*}
	 */
	const arrayDistinct = (arr) => {
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
	const arrayGroup = (arr, by_key, limit) => {
		if(!arr || !arr.length){
			return arr;
		}
		let tmp_rst = {};
		arr.forEach(item => {
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
	 * 按照对象 KEY 排序
	 * @param {Object} obj
	 * @param {String} dir
	 * @return {{}}
	 */
	const sortByKey = (obj, dir = 'asc') => {
		return Object.keys(obj).sort().reduce(function(result, key){
			result[key] = obj[key];
			return result;
		}, {});
	};

	/**
	 * 数组分块
	 * @param {Array} list 数据
	 * @param {Number} size 每块大小
	 * @return {Array[]}
	 */
	const chunk = (list, size) => {
		let len = list.length;
		if(size < 1 || !len){
			return [];
		}
		if(size > len){
			return [list];
		}
		let res = [];
		let integer = Math.floor(len / size);
		let rest = len % size;
		for(let i = 1; i <= integer; i++){
			res.push(list.splice(0, size));
		}
		if(rest){
			res.push(list.splice(0, rest));
		}
		return res;
	};

	/**
	 * @param path
	 * @param value
	 * @param srcObj
	 * @param glue
	 * @return {*}
	 */
	const objectPushByPath = (path, value, srcObj = {}, glue = '-') => {
		let segments = path.split(glue),
			cursor = srcObj,
			segment,
			i;

		for(i = 0; i < segments.length - 1; ++i){
			segment = segments[i];
			cursor = cursor[segment] = cursor[segment] || {};
		}

		return cursor[segments[i]] = value;
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
	 * @param {HTMLElement} node
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
	 * @param {HTMLElement} node
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
	 * @param {HTMLElement} container
	 * @param {String} selector
	 * @param {String} eventName
	 * @param {Function} payload
	 */
	const eventDelegate = (container, selector, eventName, payload)=>{
		container.addEventListener(eventName, ev=>{
			let target = ev.target;
			while(target){
				if(target.matches(selector)){
					payload.call(target, target);
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
	 * 混合ES6模板字符串
	 * @example extract("hello ${user_name}", {user_name:"Jack"});
	 * @param {String} es_template 模板
	 * @param {Object} params 数据对象
	 * @return {String}
	 */
	const extract = (es_template, params)=>{
		const names = Object.keys(params);
		const values = Object.values(params);
		return new Function(...names, `return \`${es_template}\`;`)(...values);
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

	const getDomOffset = (target) => {
		let top = 0, left = 0;
		while(target.offsetParent){
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
	const isButton = (el) => {
		return el.tagName === 'BUTTON' ||
			(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
	};

	/**
	 * closest
	 * @param {HTMLElement} dom
	 * @param {String} selector
	 * @return {(() => (HTMLElement | null))|ParentNode|ActiveX.IXMLDOMNode|null}
	 */
	const matchParent = (dom, selector) => {
		let p = dom.parentNode;
		while(p && p !== document){
			if(p.matches(selector)){
				return p;
			}
			p = p.parentNode;
		}
		return null;
	};

	/**
	 * 检测child节点是否在container节点列表里面
	 * @param {HTMLElement|HTMLElement[]|String} contains
	 * @param {HTMLElement} child
	 * @param {Boolean} includeEqual 是否包括等于关系
	 * @returns {boolean}
	 */
	const domContained = (contains, child, includeEqual = false) => {
		if(typeof contains === 'string'){
			contains = document.querySelectorAll(contains);
		}else if(Array.isArray(contains));else if(typeof contains === 'object'){
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

	const keepDomInContainer = (target, container = document.body) => {
		keepRectInContainer({
			left: target.left,
			top: target.top,
			width: target.clientWidth,
			height: target.clientHeight,
		}, {}, posAbs = true);
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
	 * 获取对象宽、高
	 * 通过设置 visibility 方式进行获取
	 * @param {HTMLElement} dom
	 * @return {{width: number, height: number}}
	 */
	const getDomDimension = (dom) => {
		let org_visibility = dom.style.visibility;
		let org_display = dom.style.display;
		let width, height;

		dom.style.visibility = 'hidden';
		dom.style.display = '';
		width = dom.clientWidth;
		height = dom.clientHeight;
		dom.style.visibility = org_visibility;
		dom.style.display = org_display;
		return {width, height};
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
		_c[file] = new Promise((resolve, reject) => {
			let link = document.createElement('link');
			link.rel = "stylesheet";
			link.href = file;
			link.onload = () => {
				resolve();
			};
			link.onerror = () => {
				reject();
			};
			document.head.append(link);
		});
		return _c[file];
	};

	/**
	 * 加载script脚本
	 * @param {String} src 脚本地址
	 * @param {Boolean} forceReload 是否强制重新加载，缺省为去重加载
	 * @return {Promise}
	 */
	const loadScript = (src, forceReload = false) => {
		if(!forceReload && _c[src]){
			return _c[src];
		}
		_c[src] = new Promise((resolve, reject) => {
			let script = document.createElement('script');
			script.src = src;
			script.onload = () => {
				resolve();
			};
			script.onerror = () => {
				reject();
			};
			document.head.append(script);
		});
		return _c[src];
	};

	/**
	 * insert style sheet in head
	 * @param {String} styleSheetStr
	 * @param {String} id
	 * @return {HTMLStyleElement}
	 */
	const insertStyleSheet = (styleSheetStr, id = '', doc = document) => {
		let style = doc.createElement('style');
		doc.head.appendChild(style);
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
	const setStyle = (dom, style = {}) => {
		for(let key in style){
			key = strToPascalCase(key);
			dom.style[key] = dimension2Style(style[key]);
		}
	};

	/**
	 * 创建HTML节点
	 * @param {String} html
	 * @param {HTMLElement|null} parentNode 父级节点
	 * @returns {HTMLElement|HTMLElement[]}
	 */
	const createDomByHtml = (html, parentNode = null) => {
		let tpl = document.createElement('template');
		html = html.trim();
		tpl.innerHTML = html;
		let nodes = [];
		if(parentNode){
			tpl.content.childNodes.forEach(node => {
				nodes.push(parentNode.appendChild(node));
			});
		}else {
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
	const enterFullScreen = (element) => {
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
	const exitFullScreen = () => {
		return document.exitFullscreen();
	};

	/**
	 * 切换全屏
	 * @param element
	 * @returns {Promise<unknown>}
	 */
	const toggleFullScreen = (element) => {
		return new Promise((resolve, reject) => {
			if(!isInFullScreen()){
				enterFullScreen(element).then(resolve).catch(reject);
			}else {
				exitFullScreen().then(resolve).catch(reject);
			}
		})
	};

	/**
	 * 检测是否正在全屏
	 * @returns {boolean}
	 */
	const isInFullScreen = () => {
		return !!document.fullscreenElement;
	};

	let CURRENT_WINDOW;

	/**
	 * @param win
	 */
	const setContextWindow = (win) => {
		CURRENT_WINDOW = win;
	};

	/**
	 * 获取当前上下文 文档，缺省为获取top
	 * @return {Document}
	 */
	const getContextDocument = () => {
		let win = getContextWindow();
		return win.document;
	};

	/**
	 * 获取上下文窗口
	 * @return {Window}
	 */
	const getContextWindow = () => {
		if(CURRENT_WINDOW){
			return CURRENT_WINDOW;
		}
		let win;
		try{
			win = window;
			while(win != win.parent){
				win = win.parent;
			}
		}catch(err){
			console.warn('context window assign fail:', err);
		}
		return win || window;
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

	/**
	 * 节流
	 * 规定在一个单位时间内，只能触发一次函数。如果这个函数单位时间内触发多次函数，只有一次生效。
	 * @param fn
	 * @param intervalMiSec
	 * @return {(function(): void)|*}
	 */
	const throttle = (fn, intervalMiSec) => {
		let context, args;
		let previous = 0;
		return function(){
			let now = +new Date();
			context = this;
			args = arguments;
			if(now - previous > intervalMiSec){
				fn.apply(context, args);
				previous = now;
			}
		}
	};

	/**
	 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
	 * @param fn
	 * @param intervalMiSec
	 * @return {(function(): void)|*}
	 */
	const debounce = (fn, intervalMiSec) => {
		let timeout;
		return function(){
			let context = this;
			let args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				fn.apply(context, args);
			}, intervalMiSec);
		}
	};

	const CURRENT_FILE = '/Lang/Util.js';
	const ENTRY_FILE = '/index.js';

	/**
	 * 获取当前库脚本调用地址（这里默认当前库只有两种调用形式：独立模块调用以及合并模块调用）
	 * @return {string}
	 */
	const getLibEntryScript = () => {
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
	const getLibModuleTop = (() => {
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
	const normalizeVersion = (version) => {
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
	const versionCompare = (version1, version2, index) => {
		let stringLength = index + 1,
			v1 = normalizeVersion(version1),
			v2 = normalizeVersion(version2);
		if(v1.length > stringLength){
			v1.length = stringLength;
		}
		if(v2.length > stringLength){
			v2.length = stringLength;
		}
		let size = Math.min(v1.length, v2.length), i;
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

	const NS$2 = 'WebCom-';
	const ICON_FONT_CLASS = NS$2 + `icon`;
	const ICON_FONT = NS$2 + 'iconfont';
	const DEFAULT_ICONFONT_CSS = `
@font-face {
  font-family: "${ICON_FONT}"; /* Project id 3359671 */
  src: url('//at.alicdn.com/t/c/font_3359671_62pcmuaniih.woff2?t=1680087001855') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_62pcmuaniih.woff?t=1680087001855') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_62pcmuaniih.ttf?t=1680087001855') format('truetype');

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
		Namespace: NS$2,
		IconFont: ICON_FONT,
		IconFontClass: ICON_FONT_CLASS,
		TipIndex: 10, //功能提示类(指向具体元素)
		MaskIndex: 100, //遮罩(（全局或指定面板遮罩类）
		DialogIndex: 1000, //对话框等窗口类垂直索引
		FullScreenModeIndex: 10000, //全屏类（全屏类
		ContextIndex: 100000, //右键菜单
		ToastIndex: 1000000, //消息提示（顶部呈现）
	};

	/**
	 * 检测元素是否可以输入（包含checkbox、radio类）
	 * @param {HTMLElement} el
	 * @returns {boolean}
	 */
	const inputAble = el => {
		if(el.disabled || //禁用
			el.readOnly || //只读
			el.tagName === 'BUTTON' || //按钮
			(el.tagName === 'INPUT' && ['hidden', 'button','submit', 'reset'].includes(el.type)) //隐藏表单、按钮、提交按钮、重置按钮
		){
			return false;
		}
		return true;
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
			el.querySelectorAll('option[selected]').forEach(item => {
				vs.push(item.value);
			});
			return vs;
		}
		return el.value;
	};

	/**
	 * 表单元素同步变更
	 * 该方法会检测元素数据合法性（表单校验）
	 * @param {HTMLElement} dom
	 * @param {Function} getter 函数执行返回 Promise，返回null时，不填充input
	 * @param {Function} setter 函数执行返回 Promise，checkbox、radio类型元素未选择时，返回null，设置失败元素将还原初始值
	 */
	const formSync = (dom, getter, setter) => {
		let els = getAvailableElements(dom);
		els.forEach(function(el){
			let name = el.name;
			let current_val = getElementValue(el);
			el.disabled = true;
			getter(name).then(v => {
				el.disabled = false;
				if(el.type === 'radio' || el.type === 'checkbox'){
					el.checked = el.value == v;
					current_val = v;
				}else if(v !== null){
					el.value = v;
					current_val = v;
				}
			});
			el.addEventListener('change', e => {
				el.disabled = true;
				if(!el.checkValidity()){
					el.reportValidity();
					return;
				}
				let val = el.value;
				if((el.type === 'radio' || el.type === 'checkbox') && !el.checked){
					val = null;
				}
				setter(el.name, val).then(() => {
					el.disabled = false;
				}, () => {
					if(el.type === 'radio' || el.type === 'checkbox'){
						el.checked = el.value == current_val;
					}else if(current_val !== null){
						el.value = current_val;
					}
				});
			});
		});
	};


	/**
	 * 获取指定容器下所有可用表单元素
	 * @param {HTMLElement} dom
	 * @param {Boolean} ignore_empty_name 是否忽略没有name属性的元素，缺省为必须校验
	 * @return {HTMLFormElement[]}
	 */
	const getAvailableElements = (dom, ignore_empty_name = false) => {
		let els = dom.querySelectorAll('input,textarea,select');
		return Array.from(els).filter(el => {
			return !isButton(el) && !el.disabled && (ignore_empty_name || el.name);
		});
	};

	/**
	 * 表单元素校验
	 * @param {HTMLElement} dom
	 * @param {Boolean} name_validate 是否校验名称必填
	 * @return boolean 是否校验通过
	 */
	const formValidate = (dom, name_validate = false) => {
		let els = getAvailableElements(dom, !name_validate);
		let pass = true;
		Array.from(els).every(el => {
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
	 * @param {Boolean} validate 是否校验表单数据合法
	 * @returns {Object|null} 如果校验失败，则返回null
	 */
	const formSerializeJSON = (dom, validate = true) => {
		if(validate && !formValidate(dom)){
			return null;
		}
		let els = getAvailableElements(dom);
		let data = {};
		let err = Array.from(els).every(el => {
			let name = el.name;
			let value = getElementValue(el);
			if(value === null){
				return true;
			}
			let name_selector = cssSelectorEscape(name);
			let isArr = dom.querySelectorAll(`input[name=${name_selector}]:not([type=radio]), textarea[name=${name_selector}], select[name=${name_selector}]`).length > 1;
			if(isArr){
				if(data[name] === undefined){
					data[name] = [value];
				}else {
					data[name].push(value);
				}
			}else {
				data[name] = value;
			}
			return true;
		});
		return err === false ? null : data;
	};

	/**
	 * 转换表单数据对象到JSON对象
	 * @example convertFormDataToObject({name:"hello", age:"10", isBoy:0, ext:"{city:'shenzhen'}"}, {name:"", age:0, isBoy:true, ext:{}})，
	 * 结果返回： {name:"hello", age:10, isBoy:false, ext:{city:shenzhen}}
	 * @param {Object} formDataMap 数据对象（从表单获取到的数据都是字符串类型的）
	 * @param {Object} formatSchema 格式定义对象，如： {name:"Jack", age:10, isBoy:true}
	 * @param {Boolean} mustExistsInSchema 是否必须存在格式定义中
	 * @return {Object}
	 */
	const convertFormDataToObject = (formDataMap, formatSchema, mustExistsInSchema = true) => {
		let ret = {};
		for(let key in formDataMap){
			let value = formDataMap[key];
			let define = formatSchema[key];
			if(define === undefined){
				if(mustExistsInSchema){
					continue;
				}
				ret[key] = value;
				continue;
			}
			switch(typeof (define)){
				case 'string':
					ret[key] = value;
					break;
				case 'boolean':
					ret[key] = value === '1' || value === 'true';
					break;
				case 'number':
					ret[key] = parseInt(value, 10);
					break;
				case 'object':
					ret[key] = value ? JSON.parse(value) : {};
					break;
				default:
					throw "format schema no supported";
			}
		}
		return ret;
	};

	let _form_data_cache_init = {};
	let _form_data_cache_new = {};
	let _form_us_msg = {};
	let _form_us_sid_attr_key = Theme.Namespace+'form-unsaved-sid';

	/**
	 * 绑定页面离开时，表单未保存警告
	 * @param {HTMLFormElement} form
	 * @param {String} alertMsg
	 */
	const bindFormUnSavedUnloadAlert = (form, alertMsg = '您的表单尚未保存，是否确认离开？')=>{
		if(form.getAttribute(_form_us_sid_attr_key)){
			return;
		}
		let us_sid = guid();
		_form_us_msg[us_sid] = alertMsg;
		form.setAttribute(_form_us_sid_attr_key, us_sid);
		window.addEventListener('beforeunload', (e) => {
			if(!document.body.contains(form)){
				return "";
			}
			let msg = validateFormChanged(form);
			console.log('unchanged msg', msg);
			if(msg){
				e.preventDefault();
				e.returnValue = msg;
				return msg;
			}
		});
		let els = getAvailableElements(form, true);
		els.forEach(el=>{
			el.addEventListener('input', ()=>{
				_form_data_cache_new[us_sid] = formSerializeJSON(form, false);
			});
		});
		resetFormChangedState(form);
	};

	/**
	 * 校验表单内容是否变更
	 * @param {HTMLFormElement} form
	 * @return {boolean|String}
	 */
	const validateFormChanged = (form) => {
		let us_sid = form.getAttribute(_form_us_sid_attr_key);
		if(!us_sid){
			throw "Form no init by bindFormUnSavedAlert()";
		}
		if(!isEquals(_form_data_cache_init[us_sid], _form_data_cache_new[us_sid])){
			return _form_us_msg[us_sid];
		}
		return false;
	};

	/**
	 * 重置表单未保存提示状态
	 * @param {HTMLFormElement} form
	 */
	const resetFormChangedState = (form) => {
		let us_sid = form.getAttribute(_form_us_sid_attr_key);
		if(!us_sid){
			throw "Form no init by bindFormUnSavedAlert()";
		}
		_form_data_cache_init[us_sid] = _form_data_cache_new[us_sid] = formSerializeJSON(form, false);
	};

	/**
	 * 转换对象为表单元素数值
	 * @param {Object} objectMap
	 * @param {Array} boolMapping
	 * @return {Object}
	 */
	const convertObjectToFormData = (objectMap, boolMapping = ["1", "0"]) => {
		let ret = {};
		for(let key in objectMap){
			let value = objectMap[key];
			switch(typeof (value)){
				case 'string':
				case 'number':
					ret[key] = String(value);
					break;
				case 'boolean':
					ret[key] = value ? boolMapping[0] : boolMapping[1];
					break;
				case 'object':
					ret[key] = JSON.stringify(value);
					break;
				default:
					throw "format schema no supported";
			}
		}
		return ret;
	};

	/**
	 * 构建 HTML Input:hidden 标签
	 * @param {Object} maps {key:value}
	 * @return {string}
	 */
	const buildHtmlHidden = (maps)=>{
		let html = '';
		for(let key in maps){
			let val = maps[key] === null ? '' : maps[key];
			html += `<input type="hidden" name="${escapeAttr(key)}" value="${escapeAttr(val)}"/>`;
		}
		return html;
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

	/**
	 * JSON方式请求
	 * @param {String} url
	 * @param {*} data
	 * @param {String} method
	 * @return {Promise<unknown>}
	 */
	const requestJSON = (url, data, method) => {
		return new Promise((resolve, reject) => {
			method = method.toUpperCase();
			let opt = {
				method: method,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			};
			if(method === 'POST'){
				opt.body = JSON.stringify(data);
			}else {
				url = mergerUriParam(url, data);
			}
			fetch(url, opt).then(rsp => {
				return rsp.json();
			}).then(rsp => {
				resolve(rsp);
			}).catch(err => {
				reject(err);
			});
		});
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
	 * 注意：在浏览器中如果非同域，自定义保存名称无效
	 * @param src 文件地址
	 * @param save_name 保存名称（包含扩展名，为空表示自动从src中提取）
	 */
	const downloadFile = (src, save_name) => {
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
	let popstate_bind = false;

	/**
	 * 压栈状态
	 * @param {Object} param
	 * @param {String} title
	 */
	const pushState = (param, title = '') => {
		let url = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(param);
		window.history.pushState(param, title, url);
		exePayloads(param);
	};

	/**
	 * 监听 window onpopstate 事件
	 * @param {Function} payload
	 */
	const onStateChange = (payload) => {
		if(!popstate_bind){
			popstate_bind = true;
			window.addEventListener('popstate', e=>{
				let state = e.state ?? {};
				let hashObj = QueryString.parse(getHash());
				exePayloads({...state, ...hashObj});
			});
		}
		payloads.push(payload);
	};

	const exePayloads = (param) => {
		payloads.forEach(payload => {
			payload(param);
		});
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

	/**
	 * 获取指定月份天数
	 * @param {Number} year
	 * @param {Number} month 月份，从1开始
	 * @returns {number}
	 */
	const getMonthLastDay = (year, month) => {
		const date1 = new Date(year, month, 0);
		return date1.getDate()
	};

	/**
	 * 获取指定上一个月份
	 * @param {Number} year
	 * @param {Number} month 当前月份，从1开始
	 * @returns {Array}
	 */
	const getLastMonth = (year, month) => {
		return month === 1 ? [year - 1, 12] : [year, month - 1];
	};

	/**
	 * 获取指定下一个月份
	 * @param {Number} year
	 * @param {Number} month 当前月份，从1开始
	 * @returns {Array}
	 */
	const getNextMonth = (year, month) => {
		return month === 12 ? [year + 1, 1] : [year, month + 1];
	};

	/**
	 * 格式化时间长度
	 * @param {Number} micSec 毫秒
	 * @param {String} delimiter 单位之间的间隔文本
	 * @return {string}
	 */
	const prettyTime = (micSec, delimiter = '') => {
		let d = 0, h = 0, m = 0, s = 0;
		if(micSec > ONE_DAY){
			d = Math.floor(micSec / ONE_DAY);
			micSec -= d * ONE_DAY;
		}
		if(micSec > ONE_HOUR){
			h = Math.floor(micSec / ONE_HOUR);
			micSec -= h * ONE_HOUR;
		}
		if(micSec > ONE_MINUTE){
			m = Math.floor(micSec / ONE_MINUTE);
			micSec -= m * ONE_MINUTE;
		}
		if(micSec > 1000){
			s = Math.floor(micSec / 1000);
			micSec -= s * 1000;
		}
		let txt = '';
		txt += d ? `${d}天` : '';
		txt += (txt || h) ? `${delimiter}${h}小` : '';
		txt += (txt || m) ? `${delimiter}${m}分` : '';
		txt += (txt || s) ? `${delimiter}${s}秒` : '';
		return txt.trim();
	};

	/**
	 * 指定偏移月数计算
	 * @param {Number} monthNum
	 * @param {Date|Null} start_date
	 * @return {{month: number, year: number}} 返回年、月（以1开始）
	 */
	const monthsOffsetCalc = (monthNum, start_date = new Date())=>{
		let year = start_date.getFullYear();
		let month = start_date.getMonth()+1;
		month = month + monthNum;
		if(month > 12){
			let yearNum = parseInt((month - 1) / 12);
			month = month % 12 === 0 ? 12 : month % 12;
			year += yearNum;
		}else if(month <= 0){
			month = Math.abs(month);
			let yearNum = parseInt((month + 12) / 12);
			let n = month % 12;
			if(n === 0){
				year -= yearNum;
				month = 12;
			}else {
				year -= yearNum;
				month = Math.abs(12 - n);
			}
		}
		return {year, month}
	};

	const COM_ID$2 = Theme.Namespace + 'toast';

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
	.${TOAST_CLS_MAIN}-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center; z-index:${Theme.ToastIndex}}
	.${TOAST_CLS_MAIN}>div {margin-bottom:0.5em;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:0.4em 1em 0.4em 2.1em; text-align:left; background-color:#fff;color:var(--color);box-shadow:4px 5px 13px 0px #32323238;position: relative; animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";position:absolute;font-family:${Theme.IconFont}; left:0.5em;top:0.45em;font-size:1.2em;width:1em;height:1em;overflow: hidden;line-height: 1;box-sizing: border-box;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;}
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform: translate3d(-50%, -50%, 0);will-change: transform;margin:0.52em 0 0 0.5em;}
`, COM_ID$2 + '-style');

	let toastWrap = null;

	const getWrapper = () => {
		if(!toastWrap){
			toastWrap = document.createElement('div');
			document.body.appendChild(toastWrap);
			toastWrap.className = TOAST_CLS_MAIN + '-wrap';
		}
		return toastWrap;
	};

	class Toast{
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
		 * 延期显示 loading（推荐使用）
		 * 在一些业务后台能够快速响应场景，不显示loading过程能够提升用户体验
		 * @param {String} message
		 * @param {Number} delayMicroseconds 延迟显示
		 * @param {Function} timeoutCallback
		 * @return {Toast}
		 */
		static showLoadingLater = (message, delayMicroseconds = 200, timeoutCallback = null) => {
			let time = Toast.DEFAULT_TIME_MAP[Toast.TYPE_LOADING];
			let toast = new Toast(message, Toast.TYPE_LOADING, time);
			toast.show(timeoutCallback);
			hide(toast.dom);
			setTimeout(() => {
				toast.dom && show(toast.dom);
			}, delayMicroseconds);
			return toast;
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
			//稍微容错下，避免setTimeout后没有父节点
			if(!this.dom || !document.body.contains(this.dom)){
				return;
			}
			if(fadeOut){
				this.dom.classList.add(TOAST_CLS_MAIN + '-hide');
				setTimeout(() => {
					this.hide(false);
				}, FADEOUT_TIME);
				return;
			}
			this.dom.parentNode.removeChild(this.dom);
			this.dom = null;
			let wrapper = getWrapper();
			if(!wrapper.childNodes.length){
				hide(wrapper);
			}
		}
	}

	window[COM_ID$2] = Toast;
	let CONTEXT_WINDOW$2 = getContextWindow();
	let ToastClass = CONTEXT_WINDOW$2[COM_ID$2] || Toast;

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

	insertStyleSheet(`
.${CSS_CLASS} {
	position:fixed;
	top:0;left:0;
	right:0;
	bottom:0;
	background:#33333342;
	backdrop-filter:blur(5px);
	z-index:${Masker.zIndex}}
`, Theme.Namespace + 'masker-style');

	const COM_ID$1 = Theme.Namespace + 'dialog';
	const DLG_CLS_PREF = COM_ID$1;
	const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
	const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
	const DLG_CLS_OP = DLG_CLS_PREF + '-op';
	const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
	const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';

	const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';

	const STATE_ACTIVE = 'active'; //激活状态。如果是存在模态对话框，只允许唯一一个激活，如果没有模态对话框情况，允许多个同时激活
	const STATE_DISABLED = 'disabled'; //禁用状态。存在模态框情况下，全局只允许唯一一个激活，其余均为禁用状态
	const STATE_HIDDEN = 'hidden'; //隐藏状态。通过主动调用hide方法使得对话框隐藏

	const DIALOG_TYPE_ATTR_KEY = 'data-dialog-type';
	const TYPE_IFRAME = 'iframe';
	const TYPE_ALERT = 'alert';
	const TYPE_PROMPT = 'prompt';
	const TYPE_CONFIRM = 'confirm';

	/**
	 * Content Type
	 * @type {string}
	 */
	const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF + '-ctn-iframe';
	const DLG_CTN_TYPE_HTML = DLG_CLS_PREF + '-ctn-html';

	insertStyleSheet(`
	.${DLG_CLS_PREF} {display:block; border-radius:4px; overflow:hidden; padding:0; box-sizing:border-box; width:calc(100% - 2 * 5em); background-color:white; color:#333; z-index:${Theme.DialogIndex};position:fixed;}
	.${DLG_CLS_PREF} .${DLG_CLS_PREF}-ti {user-select:none; box-sizing:border-box; line-height:1; padding:0.75em 2.5em 0.75em 0.75em; font-weight:normal;color:#666}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE} {position:absolute; display:flex; align-items:center; line-height:1; width:2.5em; height:2.5em; overflow:hidden; opacity:0.6; cursor:pointer; right:0; top:0;box-sizing:border-box; text-align:center;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"\\e61a"; font-size:0.9em; font-family:${Theme.IconFont}; line-height:1; display:block; flex:1}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:hover {opacity:1;}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:.75em 0.5em; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN} {margin-right:0.5em;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 50px); overflow-y:auto}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] {box-shadow:1px 1px 25px 0px #44444457; border-color:#ccc;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] .dialog-ti {color:#333}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"]:before {content:""; position:absolute; z-index:9999999999; width:100%; height:100%;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"] * {opacity:0.85 !important; user-select:none;}
	
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_IFRAME}"] iframe {width:100%; border:none; display:block;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_ALERT}"] .${DLG_CLS_CTN},
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_CTN} {padding:1em;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} {padding:0.5em 1em;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} label {padding-bottom:0.5em; display:block;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} input[type=text] {width:100%; box-sizing:border-box;}
	
`, COM_ID$1 + '-style');

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

	const setType = (dlg, type)=>{
		dlg.dom.setAttribute('data-dialog-type', type);
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
		${dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" title="关闭" tabindex="0"></span>` : ''}
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

		if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
			setType(dlg, TYPE_IFRAME);
		}

		//bind iframe content
		if(!dlg.config.height && resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
			let iframe = dlg.dom.querySelector('iframe');
			iframe.addEventListener('load', () => {
				try{
					let html = iframe.contentWindow.document.body.parentNode;
					let h = html.scrollHeight || html.clientHeight || html.offsetHeight;
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
		innerEvent = new BizEvent(true);

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
				setType(p, TYPE_CONFIRM);
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
			return new Promise(resolve => {
				let p = new Dialog({
					title,
					content,
					buttons: [{title: '确定', default: true, callback: () => {p.close();resolve();}},],
					showTopCloseButton: false,
					...opt
				});
				setType(p, TYPE_ALERT);
				p.show();
			});
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
				let input_id = guid(Theme.Namespace + '-prompt-input');
				let input = null;
				let p = new Dialog({
					title: '请输入',
					content: `<label for="${input_id}">${title}</label><input type="text" id="${input_id}" value="${escapeAttr(option.initValue || '')}"/>`,
					buttons: [
						{
							title: '确定', default: true, callback: () => {
								if(resolve(input.value) === false){
									return false;
								}
								p.close();
							}
						},
						{title: '取消'}
					],
					showTopCloseButton: true,
					...option
				});
				input = p.dom.querySelector('input[type=text]');
				setType(p, TYPE_PROMPT);
				p.onClose.listen(reject);
				p.onShow.listen(() => {
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

	window[COM_ID$1] = Dialog;
	let CONTEXT_WINDOW$1 = getContextWindow();
	let DialogClass = CONTEXT_WINDOW$1[COM_ID$1] || Dialog;

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
			!silent && ToastClass.showSuccess(trans('复制成功'));
			return succeeded;
		}catch(err){
			console.error(err);
			DialogClass.prompt('复制失败，请手工复制', {initValue:text});
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
		!silent && ToastClass.showSuccess(trans('复制成功'));
	};

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

	/**
	 * 从 img.srcset 属性中解析出最高分辨率突破
	 * @param {String} srcset_str
	 * @return {string}
	 */
	const getHighestResFromSrcSet = (srcset_str) => {
		return srcset_str
			.split(",")
			.reduce(
				(acc, item) => {
					let [url, width] = item.trim().split(" ");
					width = parseInt(width);
					if(width > acc.width) return {width, url};
					return acc;
				},
				{width: 0, url: ""}
			).url;
	};

	const json_decode = (v) => {
		return v === null ? null : JSON.parse(v);
	};

	const json_encode = (v) => {
		return JSON.stringify(v);
	};

	let callbacks = [];
	let handler_callbacks = (key, newVal, oldVal)=>{
		callbacks.forEach(cb=>{cb(key, newVal, oldVal);});
	};

	let ls_listen_flag = false;

	/**
	 * 基于LocalStorage的设置项存储
	 * localStorage中按照 key-value 方式进行存储，value支持数据类型
	 */
	class LocalStorageSetting {
		namespace = '';
		settingKeys = [];
		constructor(defaultSetting, namespace = ''){
			this.namespace = namespace;
			this.settingKeys = Object.keys(defaultSetting);
			for(let key in defaultSetting){
				let v = this.get(key);
				if(v === null){
					this.set(key, defaultSetting[key]);
				}
			}
		}

		/**
		 * 获取配置
		 * @param {String} key
		 * @return {null|any}
		 */
		get(key){
			let v = localStorage.getItem(this.namespace+key);
			if(v === null){
				return null;
			}
			return json_decode(v);
		}

		/**
		 * 设置配置
		 * @param {String} key
		 * @param {any} value
		 */
		set(key, value){
			handler_callbacks(key, value, this.get(key));
			localStorage.setItem(this.namespace+key, json_encode(value));
		}

		/**
		 * 移除指定配置
		 * @param {String} key
		 */
		remove(key){
			handler_callbacks(key, null, this.get(key));
			localStorage.removeItem(this.namespace+key);
		}

		/**
		 * 配置更新回调（包含配置变更、配置删除）
		 * @param {Function} callback (key, newValue, oldValue)
		 */
		onUpdated(callback){
			callbacks.push(callback);
			if(!ls_listen_flag){
				ls_listen_flag = true;
				window.addEventListener('storage', e => {
					if(!this.namespace || e.key.indexOf(this.namespace) === 0){
						handler_callbacks(e.key.substring(this.namespace.length), json_decode(e.newValue), json_decode(e.oldValue));
					}
				});
			}
		}

		/**
		 * 遍历
		 * @param {Function} payload (key, value)
		 */
		each(payload){
			this.settingKeys.forEach(k=>{
				payload(k, this.get(k));
			});
		}

		/**
		 * 移除所有
		 */
		removeAll(){
			this.settingKeys.forEach(k=>{
				this.remove(k);
			});
		}

		/**
		 * 获取所有
		 * @return {Object} {key:value}
		 */
		getAll(){
			let obj = {};
			this.settingKeys.forEach(k=>{
				obj[k] = this.get(k);
			});
			return obj;
		}
	}

	let CTX_CLASS_PREFIX = Theme.Namespace + 'context-menu';
	let CTX_Z_INDEX = Theme.ContextIndex;
	let LAST_MENU_EL = null;

	insertStyleSheet(`
	.${CTX_CLASS_PREFIX} {z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX},
	.${CTX_CLASS_PREFIX} ul {position:absolute; padding: 0.5em 0; list-style:none; backdrop-filter:blur(5px); box-shadow:1px 1px 10px 0px #44444457;border-radius:4px;background:#ffffffd9;min-width:12em; display:none;}
	.${CTX_CLASS_PREFIX} ul {left:100%; top:0;}
	.${CTX_CLASS_PREFIX} li:not([disabled]):hover>ul {display:block;}
	.${CTX_CLASS_PREFIX} li[role=menuitem] {padding:0 1em; line-height:1; position:relative; min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5; cursor:default;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]) {cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX} .has-child:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:gray;}
	.${CTX_CLASS_PREFIX} .has-child:not([disabled]):hover:after {color:black}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`);

	const buildItem = (item) => {
		if(item === '-'){
			return '<li class="sep"></li>';
		}
		return `<li role="menuitem" class="${Array.isArray(item[1]) ? 'has-child':''}" ${item[2] ? 'disabled="disabled"' : ''}>${item[0]}` +
			(Array.isArray(item[1]) ? '<ul>' + item[1].reduce((retVal, subItem, idx) => {
				return retVal + buildItem(subItem);
			}, '') + '</ul>' : '')
			+ `</li>`;
	};

	/**
	 * 显示菜单
	 * @param {Array} commands [{title, payload, disabled=false}, {title, [submenus], disabled], '-',...]
	 * @param {HTMLElement} container
	 */
	const showMenu = (commands, container = null) => {
		hideLastMenu();
		let menu = createDomByHtml(`
		<ul class="${CTX_CLASS_PREFIX}">
			${commands.reduce((lastVal, item, idx) => {
				return lastVal + buildItem(item);
			}, '')}
		</ul>`, container || document.body);
		eventDelegate(menu, '[role=menuitem]', 'click', target => {
			let idx = arrayIndex(menu.querySelectorAll('li'), target);
			let [title, cmd, disabled] = commands[idx];
			if(disabled){
				return;
			}
			if(!cmd || cmd() !== false){ //cmd 可以通过返回false阻止菜单关闭
				hideLastMenu();
			}
		});

		menu.addEventListener('contextmenu', e => {
			e.preventDefault();
			e.stopPropagation();
			return false;
		});

		//简单避开全局 click 隐藏当前菜单
		setTimeout(() => {
			LAST_MENU_EL = menu;
		}, 0);
		menu.style.display = 'block';
		return menu;
	};

	/**
	 * 隐藏最后一个菜单
	 */
	const hideLastMenu = () => {
		if(LAST_MENU_EL){
			LAST_MENU_EL.parentNode.removeChild(LAST_MENU_EL);
			LAST_MENU_EL = null;
		}
	};

	/**
	 * 绑定对象显示定制右键菜单
	 * @param {HTMLElement} target
	 * @param {Array} commands
	 */
	const bindTargetContextMenu = (target, commands) => {
		target.addEventListener('contextmenu', e => {
			let context_menu_el = showMenu(commands, document.body);
			let menu_dim = getDomDimension(context_menu_el);
			let dim = keepRectInContainer({
				left: e.clientX,
				top: e.clientY,
				width: menu_dim.width,
				height: menu_dim.height
			});
			context_menu_el.addEventListener('contextmenu', e => {
				e.preventDefault();
				return false;
			});
			context_menu_el.style.left = dimension2Style(dim.left);
			context_menu_el.style.top = dimension2Style(dim.top);
			e.preventDefault();
			return false;
		});
	};

	document.addEventListener('click', e => {
		if(LAST_MENU_EL && !domContained(LAST_MENU_EL, e.target, true)){
			hideLastMenu();
		}
	});
	document.addEventListener('keyup', e => {
		if(LAST_MENU_EL && e.keyCode === KEYS.Esc){
			e.stopImmediatePropagation();
			e.preventDefault();
			hideLastMenu();
			return false;
		}
	});

	const COM_ID = Theme.Namespace + 'com-image-viewer';
	const CONTEXT_WINDOW = getContextWindow();
	if(!CONTEXT_WINDOW[COM_ID]){
		CONTEXT_WINDOW[COM_ID] = {};
	}

	const DOM_CLASS = COM_ID;

	const DEFAULT_VIEW_PADDING = 20;
	const MAX_ZOOM_IN_RATIO = 2; //最大显示比率
	const MIN_ZOOM_OUT_SIZE = 50; //最小显示像素

	const THUMB_WIDTH = 50;

	const ZOOM_IN_RATIO = 0.8; //缩小比率
	const ZOOM_OUT_RATIO = 1.2; //放大比率

	const ATTR_W_BIND_KEY = 'data-original-width';
	const ATTR_H_BIND_KEY = 'data-original-height';

	const DISABLED_ATTR_KEY = 'data-disabled';

	const GRID_IMG_BG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAABlBMVEXv7+////9mUzfqAAAAFElEQVQIW2NksN/ISAz+f9CBGAwAxtEddZlnB4IAAAAASUVORK5CYII=';

	const BASE_INDEX = Theme.FullScreenModeIndex;
	const OP_INDEX = BASE_INDEX + 1;
	const OPTION_DLG_INDEX = BASE_INDEX + 2;

	const IMG_PREVIEW_MODE_SINGLE = 1;
	const IMG_PREVIEW_MODE_MULTIPLE = 2;

	const IMG_PREVIEW_MS_SCROLL_TYPE_NONE = 0;
	const IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = 1;
	const IMG_PREVIEW_MS_SCROLL_TYPE_NAV = 2;

	let PREVIEW_DOM = null;
	let CURRENT_MODE = 0;

	//id, title, payload
	const CMD_CLOSE = ['close', '关闭', () => {
		destroy();
	}];
	const CMD_NAV_TO = ['nav_to', '关闭', (target) => {
		navTo(target.getAttribute('data-dir') !== '1');
	}];
	const CMD_SWITCH_TO = ['switch_to', '关闭', (target) => {
		switchTo(target.getAttribute('data-index'));
	}];
	const CMD_THUMB_SCROLL_PREV = ['thumb_scroll_prev', '关闭', () => {
		thumbScroll();
	}];
	const CMD_THUMB_SCROLL_NEXT = ['thumb_scroll_next', '关闭', () => {
		thumbScroll();
	}];
	const CMD_ZOOM_OUT = ['zoom_out', '放大', () => {
		zoom(ZOOM_OUT_RATIO);
		return false
	}];
	const CMD_ZOOM_IN = ['zoom_in', '缩小', () => {
		zoom(ZOOM_IN_RATIO);
		return false
	}];
	const CMD_ZOOM_ORG = ['zoom_org', '原始比例', () => {
		zoom(null);
		return false
	}];
	const CMD_ROTATE_LEFT = ['rotate_left', '左旋90°', () => {
		rotate(-90);
		return false
	}];
	const CMD_ROTATE_RIGHT = ['rotate_right', '右旋90°', () => {
		rotate(90);
		return false
	}];
	const CMD_VIEW_ORG = ['view_org', '查看原图', () => {
		viewOriginal();
	}];
	const CMD_DOWNLOAD = ['download', '下载图片', () => {
		downloadFile(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original);
	}];
	const CMD_OPTION = ['option', '选项', () => {
		showOptionDialog();
	}];

	//srcset支持格式请使用 srcSetResolve 进行解析使用，规则如下
	// ① src或[src]: 只有一种图源模式；
	// ② [src1,src2]，1为缩略图，2为大图、原图；
	// ③ [src1,src2,src3] 1为缩略图，2为大图，3为原图
	let IMG_SRC_LIST = [/** srcset1, srcset2 **/];
	let IMG_CURRENT_INDEX = 0;

	const DEFAULT_SETTING = {
		mouse_scroll_type: IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
		allow_move: true,
		show_thumb_list: false,
		show_toolbar: true,
		show_context_menu: true,
	};
	let LocalSetting = new LocalStorageSetting(DEFAULT_SETTING, Theme.Namespace + 'com-image-viewer/');

	/**
	 * 解析图片src集合
	 * @param {Array|String} srcSet
	 * @return {{normal: string, original: string, thumb: string}}
	 */
	const srcSetResolve = srcSet => {
		srcSet = typeof (srcSet) === 'string' ? [srcSet] : srcSet;
		return {
			thumb: srcSet[0],
			normal: srcSet[1] || srcSet[0],
			original: srcSet[2] || srcSet[1] || srcSet[0]
		};
	};

	insertStyleSheet(`
	 @keyframes WebCom-spin{
		100%{transform:rotate(360deg);}
	}
	.${DOM_CLASS}{position:fixed;z-index:${BASE_INDEX};width:100%;height:100%;overflow:hidden;top:0;left:0;}
	.${DOM_CLASS} .civ-closer{position:absolute; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:10px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before{font-family:"WebCom-iconfont", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover{background-color:#eeeeee75;}
	.${DOM_CLASS} .civ-nav-btn{padding:10px; z-index:${OP_INDEX}; transition:all 0.1s linear; border-radius:3px; opacity:0.8; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled]{color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:not([disabled]):hover{opacity:1;}
	.${DOM_CLASS} .civ-nav-btn:before{font-family:"WebCom-iconfont"; font-size:20px;}
	.${DOM_CLASS} .civ-prev{left:10px}
	.${DOM_CLASS} .civ-prev:before{content:"\\e6103"}
	.${DOM_CLASS} .civ-next{right:10px}
	.${DOM_CLASS} .civ-next:before{content:"\\e73b";}

	.${DOM_CLASS} .civ-view-option {position:absolute;display:flex;background-color: #6f6f6f26;backdrop-filter:blur(4px);padding:0.25em 0.5em;left:50%;transform:translate(-50%, 0);z-index:${OP_INDEX};gap: 0.5em;border-radius:4px;}
	.${DOM_CLASS} .civ-opt-btn {cursor:pointer;flex:1;user-select:none;width: var(--opt-btn-size);height: var(--opt-btn-size);overflow: hidden; color: white;--opt-btn-size: 1.5em;padding: 0.2em;border-radius: 4px;transition: all 0.1s linear;opacity: 0.7;}
	.${DOM_CLASS} .civ-opt-btn:before {font-family:"${Theme.IconFont}";font-size: var(--opt-btn-size);display: block;width: 100%;height: 100%;}
	.${DOM_CLASS} .civ-opt-btn:hover {background-color: #ffffff3b;opacity: 1;}
	
	.${DOM_CLASS}-icon:before {content:""; font-family:"${Theme.IconFont}"; font-style:normal;}
	.${DOM_CLASS}-icon-${CMD_ZOOM_OUT[0]}:before {content: "\\e898";}
	.${DOM_CLASS}-icon-${CMD_ZOOM_IN[0]}:before {content:"\\e683"} 
	.${DOM_CLASS}-icon-${CMD_ZOOM_ORG[0]}:before {content:"\\e64a"} 
	.${DOM_CLASS}-icon-${CMD_ROTATE_LEFT[0]}:before {content:"\\e7be"} 
	.${DOM_CLASS}-icon-${CMD_ROTATE_RIGHT[0]}:before {content:"\\e901"} 
	.${DOM_CLASS}-icon-${CMD_VIEW_ORG[0]}:before {content:"\\e7de"} 
	.${DOM_CLASS}-icon-${CMD_DOWNLOAD[0]}:before {content:"\\e839"} 
	.${DOM_CLASS}-icon-${CMD_OPTION[0]}:before {content:"\\e9cb";}

	.${DOM_CLASS} .civ-nav-wrap{position:absolute;opacity: 0.8;transition:all 0.1s linear;background-color: #ffffff26;bottom:10px;left:50%;transform:translate(-50%, 0);z-index:${OP_INDEX};display: flex;padding: 5px 6px;max-width: calc(100% - 100px);min-width: 100px;border-radius: 5px;backdrop-filter: blur(4px);box-shadow: 1px 1px 30px #6666666b;}
	.${DOM_CLASS} .civ-nav-wrap:hover {opacity:1}
	.${DOM_CLASS} .civ-nav-list-wrap {width: calc(100% - 40px);overflow:hidden;}
	.${DOM_CLASS} .civ-nav-list-prev,
	.${DOM_CLASS} .civ-nav-list-next {flex: 1;width:20px;cursor: pointer;opacity: 0.5;line-height: 48px;transition: all 0.1s linear;}
	.${DOM_CLASS} .civ-nav-list-prev:hover,
	.${DOM_CLASS} .civ-nav-list-next:hover {opacity:1}
	.${DOM_CLASS} .civ-nav-list-prev:before,
	.${DOM_CLASS} .civ-nav-list-next:before{font-family:"WebCom-iconfont";font-size:18px;}
	.${DOM_CLASS} .civ-nav-list-prev {}
	.${DOM_CLASS} .civ-nav-list-next {right: -20px;}
	.${DOM_CLASS} .civ-nav-list-prev:before{content:"\\e6103"}
	.${DOM_CLASS} .civ-nav-list-next:before{content:"\\e73b";}
	.${DOM_CLASS} .civ-nav-list{height: 50px;}
	.${DOM_CLASS} .civ-nav-thumb{width: 50px;height: 100%;transition:all 0.1s linear;overflow:hidden;display:inline-block;box-sizing:border-box;margin-right: 5px;opacity: 0.6;border: 4px solid transparent;cursor: pointer;}
	.${DOM_CLASS} .civ-nav-thumb.active,
	.${DOM_CLASS} .civ-nav-thumb:hover {border: 3px solid white;opacity: 1;}
	.${DOM_CLASS} .civ-nav-thumb img{width:100%; height:100%; object-fit:cover;}

	.${DOM_CLASS} .civ-ctn{height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-error{margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading{--loading-size:50px; position:absolute; left:50%; top:50%; margin:calc(var(--loading-size) / 2) 0 0 calc(var(--loading-size) / 2)}
	.${DOM_CLASS} .civ-loading:before{content:"\\e635"; font-family:"WebCom-iconfont" !important; animation:WebCom-spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size); line-height:var(--loading-size)}
	.${DOM_CLASS} .civ-img{height:100%; display:block; box-sizing:border-box; position:relative;}
	.${DOM_CLASS} .civ-img img{position:absolute; left:50%; top:50%; transition:width 0.1s, height 0.1s, transform 0.1s; transform:translate(-50%, -50%); box-shadow:1px 1px 20px #898989; background:url('${GRID_IMG_BG}')}

	.${DOM_CLASS}[data-ip-mode="1"] .civ-nav-btn,
	.${DOM_CLASS}[data-ip-mode="1"] .civ-nav-wrap{display:none;}

	.${DOM_CLASS}-option-list {padding: 1em 2em 2em;display: block;list-style: none;font-size:1rem;}
	.${DOM_CLASS}-option-list>li {margin-bottom: 1em;padding-left: 5em;}
	.${DOM_CLASS}-option-list>li:last-child {margin:0;}
	.${DOM_CLASS}-option-list>li>label:first-child {display:block;float: left;width: 5em;margin-left: -5em;user-select:none;}
	.${DOM_CLASS}-option-list>li>label:not(:first-child) {display:block;user-select:none;margin-bottom: 0.25em;}

	.${DOM_CLASS}-tools-menu {position:fixed;background: white;padding: 5px 0;min-width: 150px;border-radius: 4px;box-shadow: 1px 1px 10px #3e3e3e94;}
	.${DOM_CLASS}-tools-menu>li {padding: 0.45em 1em;}
	.${DOM_CLASS}-tools-menu>li:hover {background: #eee;cursor: pointer;user-select: none;}

	.${DOM_CLASS}[show_thumb_list="false"] .civ-nav-wrap,
	.${DOM_CLASS}[show_toolbar="false"] .civ-view-option {display:none;}
`, Theme.Namespace + 'img-preview-style');

	/**
	 * 销毁组件
	 */
	const destroy = () => {
		if(!PREVIEW_DOM){
			return;
		}
		PREVIEW_DOM.parentNode.removeChild(PREVIEW_DOM);
		PREVIEW_DOM = null;
		Masker.hide();
		window.removeEventListener('resize', onWinResize);
		document.removeEventListener('keyup', bindKeyUp);
		document.removeEventListener('keydown', bindKeyDown);
	};

	/**
	 * 更新导航按钮状态
	 */
	const updateNavState = () => {
		let prev = PREVIEW_DOM.querySelector('.civ-prev');
		let next = PREVIEW_DOM.querySelector('.civ-next');
		let total = IMG_SRC_LIST.length;
		if(IMG_CURRENT_INDEX === 0){
			prev.setAttribute(DISABLED_ATTR_KEY, '1');
		}else {
			prev.removeAttribute(DISABLED_ATTR_KEY);
		}
		if(IMG_CURRENT_INDEX === (total - 1)){
			next.setAttribute(DISABLED_ATTR_KEY, '1');
		}else {
			next.removeAttribute(DISABLED_ATTR_KEY);
		}

		updateThumbNavState();
	};

	const updateThumbNavState = () => {
		PREVIEW_DOM.querySelectorAll(`.civ-nav-list .civ-nav-thumb`).forEach(item => item.classList.remove('active'));
		PREVIEW_DOM.querySelector(`.civ-nav-list .civ-nav-thumb[data-index="${IMG_CURRENT_INDEX}"]`).classList.add('active');
	};

	const listenSelector = (parentNode, selector, event, handler) => {
		parentNode.querySelectorAll(selector).forEach(target => {
			target.addEventListener(event, handler);
		});
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
	 * @param {HTMLImageElement} img
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
		if(LocalSetting.get('show_context_menu')){
			let context_commands = [];
			CONTEXT_MENU_OPTIONS.forEach(cmdInfo => {
				if(cmdInfo === '-'){
					context_commands.push('-');
				}else {
					let [cmd_id, title, payload] = cmdInfo;
					context_commands.push([`<i class="${DOM_CLASS}-icon ${DOM_CLASS}-icon-${cmd_id}"></i>` + title, payload]);
				}
			});
			bindTargetContextMenu(img, context_commands);
		}

		['mouseup', 'mouseout'].forEach(ev => {
			img.addEventListener(ev, e => {
				moving = false;
			});
		});
		img.addEventListener('mousemove', e => {
			if(moving && LocalSetting.get('allow_move')){
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
		return new Promise((resolve, reject) => {
			let imgItem = srcSetResolve(IMG_SRC_LIST[img_index]);
			let loading = PREVIEW_DOM.querySelector('.civ-loading');
			let err = PREVIEW_DOM.querySelector('.civ-error');
			let img_ctn = PREVIEW_DOM.querySelector('.civ-img');
			img_ctn.innerHTML = '';
			Masker.show();
			show(loading);
			hide(err);
			loadImgBySrc(imgItem.normal).then(img => {
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
				resolve(img);
			}, error => {
				hide(loading);
				err.innerHTML = `图片加载失败，<a href="${imgItem.normal}" target="_blank">查看详情(${error})</a>`;
				show(err);
				reject(err);
			});
		});
	};

	const constructDom = () => {
		let nav_thumb_list_html = '';
		if(CURRENT_MODE === IMG_PREVIEW_MODE_MULTIPLE){
			nav_thumb_list_html = `
		<div class="civ-nav-wrap">
			<span class="civ-nav-list-prev" data-cmd="${CMD_THUMB_SCROLL_PREV[0]}"></span>
			<div class="civ-nav-list-wrap">
				<div class="civ-nav-list" style="width:${THUMB_WIDTH * IMG_SRC_LIST.length}px">
				${IMG_SRC_LIST.reduce((preStr, item, idx) => {
			return preStr + `<span class="civ-nav-thumb" data-cmd="${CMD_SWITCH_TO[0]}" data-index="${idx}"><img src="${srcSetResolve(item).thumb}"/></span>`;
		}, "")}
				</div>
			</div>
			<span class="civ-nav-list-next" data-cmd="${CMD_THUMB_SCROLL_NEXT[0]}"></span>
		</div>`;
		}

		let option_html = `
	<span class="civ-view-option">
		${TOOLBAR_OPTIONS.reduce((lastVal, cmdInfo, idx) => {
		return lastVal + `<span class="civ-opt-btn ${DOM_CLASS}-icon ${DOM_CLASS}-icon-${cmdInfo[0]}" data-cmd="${cmdInfo[0]}" title="${cmdInfo[1]}"></span>`;
	}, "")}
	</span>`;

		PREVIEW_DOM = createDomByHtml(`
		<div class="${DOM_CLASS}" data-ip-mode="${CURRENT_MODE}">
			<span class="civ-closer" data-cmd="${CMD_CLOSE[0]}" title="ESC to close">close</span>
			<span class="civ-nav-btn civ-prev" data-cmd="${CMD_NAV_TO[0]}" data-dir="0"></span>
			<span class="civ-nav-btn civ-next" data-cmd="${CMD_NAV_TO[0]}" data-dir="1"></span>
			${option_html}
			${nav_thumb_list_html}
			<div class="civ-ctn">
				<span class="civ-loading"></span>
				<span class="civ-error"></span>
				<span class="civ-img"></span>
			</div>
		</div>
	`, document.body);

		LocalSetting.each((k, v) => {
			PREVIEW_DOM.setAttribute(k, JSON.stringify(v));
		});
		LocalSetting.onUpdated((k, v) => {
			PREVIEW_DOM && PREVIEW_DOM.setAttribute(k, JSON.stringify(v));
		});

		//bind close click & space click
		eventDelegate(PREVIEW_DOM, '[data-cmd]', 'click', target => {
			let cmd = target.getAttribute('data-cmd');
			if(target.getAttribute(DISABLED_ATTR_KEY)){
				return false;
			}
			let cmdInfo = getCmdViaID(cmd);
			if(cmdInfo){
				return cmdInfo[2](target);
			}
			throw "no command found.";
		});

		PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('click', e => {
			if(e.target.tagName !== 'IMG'){
				destroy();
			}
		});

		//bind scroll zoom
		listenSelector(PREVIEW_DOM, '.civ-ctn', 'mousewheel', e => {
			switch(LocalSetting.get('mouse_scroll_type')){
				case IMG_PREVIEW_MS_SCROLL_TYPE_SCALE:
					zoom(e.wheelDelta > 0 ? ZOOM_OUT_RATIO : ZOOM_IN_RATIO);
					break;
				case IMG_PREVIEW_MS_SCROLL_TYPE_NAV:
					navTo(e.wheelDelta > 0);
					break;
			}
			e.preventDefault();
			return false;
		});

		//bind resize
		window.addEventListener('resize', onWinResize);

		document.addEventListener('keydown', bindKeyDown);
		console.log('[IP] start bind key up');
		document.addEventListener('keyup', bindKeyUp);
	};

	const bindKeyUp = (e) => {
		if(e.keyCode === KEYS.Esc){
			destroy();
		}
	};

	const bindKeyDown = (e) => {
		if(e.keyCode === KEYS.LeftArrow){
			navTo(true);
		}
		if(e.keyCode === KEYS.RightArrow){
			navTo(false);
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
	const navTo = (toPrev = false) => {
		let total = IMG_SRC_LIST.length;
		if((toPrev && IMG_CURRENT_INDEX === 0) || (!toPrev && IMG_CURRENT_INDEX === (total - 1))){
			return false;
		}
		toPrev ? IMG_CURRENT_INDEX-- : IMG_CURRENT_INDEX++;
		showImgSrc(IMG_CURRENT_INDEX);
		updateNavState();
	};

	const switchTo = (index) => {
		IMG_CURRENT_INDEX = index;
		showImgSrc(IMG_CURRENT_INDEX);
		updateNavState();
	};

	const thumbScroll = (toPrev) => {
		PREVIEW_DOM.querySelector('.civ-nav-list');
	};

	/**
	 * 缩放
	 * @param {Number} ratioOffset 缩放比率(原尺寸百分比）
	 */
	const zoom = (ratioOffset) => {
		let img = PREVIEW_DOM.querySelector('.civ-img img');
		let origin_width = img.getAttribute(ATTR_W_BIND_KEY);
		let origin_height = img.getAttribute(ATTR_H_BIND_KEY);

		if(ratioOffset === null){
			ratioOffset = 1;
			img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
			img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
			img.style.width = dimension2Style(parseInt(origin_width, 10) * ratioOffset);
			img.style.height = dimension2Style(parseInt(origin_height, 10) * ratioOffset);
			return;
		}

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

	const rotate = (degreeOffset) => {
		let img = PREVIEW_DOM.querySelector('.civ-img img');
		let rotate = parseInt(img.getAttribute('data-rotate') || 0, 10);
		let newRotate = rotate + degreeOffset;
		img.setAttribute('data-rotate', newRotate);
		img.style.transform = `translate(-50%, -50%) rotate(${newRotate}deg)`;
	};

	const viewOriginal = () => {
		window.open(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original);
	};

	const showOptionDialog = () => {
		let html = `
<ul class="${DOM_CLASS}-option-list">
	<li>
		<label>界面：</label>
		<label>
			<input type="checkbox" name="show_toolbar" value="1">显示顶部操作栏
		</label>
		<label>
			<input type="checkbox" name="show_thumb_list" value="1">显示底部缩略图列表（多图模式）
		</label>
	</li>	
	<li>
		<label>鼠标滚轮：</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NAV}">切换前一张、后一张图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_SCALE}">缩放图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NONE}">无动作</label>
	</li>
	<li>
		<label>移动：</label>
		<label><input type="checkbox" name="allow_move" value="1">允许移动图片</label>
	</li>
</ul>
	`;
		let dlg = DialogClass.show('设置', html, {
			showMasker: false,
			modal: false
		});
		dlg.dom.style.zIndex = OPTION_DLG_INDEX + "";
		dlg.onClose.listen(() => {
			setTimeout(() => {
				if(PREVIEW_DOM){
					Masker.show();
				}
			}, 0);
		});
		let lsSetterTip = null;
		formSync(dlg.dom, (name) => {
			return new Promise((resolve, reject) => {
				let tmp = convertObjectToFormData({[name]: LocalSetting.get(name)});
				resolve(tmp[name]);
			});
		}, (name, value) => {
			return new Promise((resolve, reject) => {
				let obj = convertFormDataToObject({[name]: value}, DEFAULT_SETTING);
				LocalSetting.set(name, obj[name]);
				lsSetterTip && lsSetterTip.hide();
				lsSetterTip = ToastClass.showSuccess('设置已保存');
				resolve();
			});
		});
	};

	const ALL_COMMANDS = [
		CMD_CLOSE,
		CMD_NAV_TO,
		CMD_SWITCH_TO,
		CMD_THUMB_SCROLL_PREV,
		CMD_THUMB_SCROLL_NEXT,
		CMD_ZOOM_OUT,
		CMD_ZOOM_IN,
		CMD_ZOOM_ORG,
		CMD_ROTATE_LEFT,
		CMD_ROTATE_RIGHT,
		CMD_VIEW_ORG,
		CMD_DOWNLOAD,
		CMD_OPTION,
	];

	const TOOLBAR_OPTIONS = [
		CMD_ZOOM_OUT,
		CMD_ZOOM_IN,
		CMD_ZOOM_ORG,
		CMD_ROTATE_LEFT,
		CMD_ROTATE_RIGHT,
		CMD_VIEW_ORG,
		CMD_DOWNLOAD,
		CMD_OPTION
	];

	const CONTEXT_MENU_OPTIONS = [
		CMD_ZOOM_OUT,
		CMD_ZOOM_IN,
		CMD_ZOOM_ORG,
		'-',
		CMD_ROTATE_LEFT,
		CMD_ROTATE_RIGHT,
		'-',
		CMD_VIEW_ORG,
		CMD_DOWNLOAD,
		'-',
		CMD_OPTION
	];

	/**
	 * 获取命令信息
	 * @param {String} id
	 * @return {null|Object}
	 */
	const getCmdViaID = (id) => {
		for(let k in ALL_COMMANDS){
			let [_id] = ALL_COMMANDS[k];
			if(id === _id){
				return ALL_COMMANDS[k];
			}
		}
		return null;
	};


	/**
	 * 初始化
	 * @param {Object} option
	 * @param {Number} option.mode 显示模式：IMG_PREVIEW_MODE_SINGLE 单图模式，IMG_PREVIEW_MODE_MULTIPLE 多图模式
	 * @param {String[]} option.srcList 图片列表，单图或者多图模式都需要以数组方式传参
	 * @param {Boolean} option.showToolbar 是否显示选项条（缺省使用默认配置）
	 * @param {Boolean} option.showThumbList [多图模式]是否显示缩略图列表（缺省使用默认配置）
	 * @param {Number|0} option.mouse_scroll_type 鼠标滚动控制类型：IMG_PREVIEW_MS_SCROLL_TYPE_NONE，IMG_PREVIEW_MS_SCROLL_TYPE_SCALE，IMG_PREVIEW_MS_SCROLL_TYPE_NAV（缺省使用默认配置）
	 * @param {Number|0} option.startIndex [多图模式]开始图片索引
	 * @param {Boolean} option.preloadSrcList [多图模式]是否预加载列表
	 */
	const init = ({
		              mode,
		              srcList,
		              mouse_scroll_type = IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
		              startIndex = 0,
		              showContextMenu = null,
		              showToolbar = null,
		              showThumbList = null,
		              preloadSrcList = null,
	              }) => {
		destroy();
		CURRENT_MODE = mode;
		IMG_SRC_LIST = srcList;
		IMG_CURRENT_INDEX = startIndex;

		mouse_scroll_type !== null && LocalSetting.set('mouse_scroll_type', mouse_scroll_type);
		showThumbList !== null && LocalSetting.set('show_thumb_list', showThumbList);
		showToolbar !== null && LocalSetting.set('show_toolbar', showToolbar);
		showContextMenu !== null && LocalSetting.set('show_context_menu', showContextMenu);

		constructDom();
		showImgSrc(IMG_CURRENT_INDEX).finally(() => {
			if(preloadSrcList){
				srcList.forEach(src => {
					new Image().src = src;
				});
			}
		});
		if(mode === IMG_PREVIEW_MODE_MULTIPLE){
			updateNavState();
		}
	};

	/**
	 * 显示单张图片预览
	 * @param {String} imgSrc
	 * @param {Object} option
	 */
	const showImgPreview = CONTEXT_WINDOW[COM_ID]['showImgPreview'] || function(imgSrc, option = {}){
		init({mode: IMG_PREVIEW_MODE_SINGLE, srcList: [imgSrc], ...option});
	};

	/**
	 * 显示多图预览
	 * @param {String[]} imgSrcList
	 * @param {Number} startIndex
	 * @param {Object} option
	 */
	const showImgListPreview = CONTEXT_WINDOW[COM_ID]['showImgListPreview'] || function(imgSrcList, startIndex = 0, option = {}){
		init({mode: IMG_PREVIEW_MODE_MULTIPLE, srcList: imgSrcList, startIndex, ...option});
	};

	/**
	 * 通过绑定节点显示图片预览
	 * @param {String} nodeSelector 触发绑定的节点选择器，可以是img本身节点，也可以是其他代理节点
	 * @param {String} triggerEvent
	 * @param {String|Function} srcFetcher 获取大图src的选择器，或者函数，如果是函数传入第一个参数为触发节点
	 * @param {Object} option
	 */
	const bindImgPreviewViaSelector = (nodeSelector = 'img', triggerEvent = 'click', srcFetcher = 'src', option = {}) => {
		let nodes = document.querySelectorAll(nodeSelector);
		let imgSrcList = [];
		if(!nodes.length){
			console.warn('no images found');
			return;
		}
		Array.from(nodes).forEach((node, idx) => {
			switch(typeof (srcFetcher)){
				case 'function':
					imgSrcList.push(srcFetcher(node));
					break;
				case 'string':
					imgSrcList.push(node.getAttribute(srcFetcher));
					break;
				default:
					throw "No support srcFetcher types:" + typeof (srcFetcher);
			}
			node.addEventListener(triggerEvent, e => {
				if(nodes.length > 1){
					showImgListPreview(imgSrcList, idx, option);
				}else {
					showImgPreview(imgSrcList[0], option);
				}
			});
		});
	};

	window[COM_ID] = {
		showImgPreview,
		showImgListPreview,
		bindImgPreviewViaSelector,
	};

	let showImgPreviewFn = CONTEXT_WINDOW[COM_ID]['showImgPreview'] || showImgPreview;
	let showImgListPreviewFn = CONTEXT_WINDOW[COM_ID]['showImgListPreview'] || showImgListPreview;

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
		 * @param {HTMLElement} ladder_node
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
	let NS$1 = Theme.Namespace + 'tip';
	let TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	insertStyleSheet(`
	.${NS$1}-container-wrap {position:absolute; z-index:${Theme.TipIndex};}
	.${NS$1}-content {border:1px solid #cacaca; border-radius:4px; background-color:#fff; padding:10px; box-shadow:0 0 10px rgba(105, 105, 105, 0.4); max-width:500px; word-break:break-all}
	.${NS$1}-arrow {display:block; width:0; height:0; border:7px solid transparent; position:absolute; z-index:1}
	.${NS$1}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; color:gray;}
	.${NS$1}-close:hover {color:black;}
	
	/** top **/
	${NS$1}-container-wrap[data-tip-dir-0], .${NS$1}-container-wrap[data-tip-dir="1"], .${NS$1}-container-wrap[data-tip-dir="11"] {padding-top:7px;}
	.${NS$1}-container-wrap[data-tip-dir="11"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="0"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="1"] .${NS$1}-arrow {top:-5px; margin-left:-7px; border-bottom-color:white}
	.${NS$1}-container-wrap[data-tip-dir="0"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="11"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="1"] .${NS$1}-arrow-pt {top:-6px; border-bottom-color:#dcdcdc;}
	.${NS$1}-container-wrap[data-tip-dir="11"] .${NS$1}-arrow {left:25%;}
	.${NS$1}-container-wrap[data-tip-dir="0"] .${NS$1}-arrow {left:50%;}
	.${NS$1}-container-wrap[data-tip-dir="1"] .${NS$1}-arrow {left:75%;}
	
	/** right **/
	.${NS$1}-container-wrap[data-tip-dir="8"], .${NS$1}-container-wrap[data-tip-dir="9"], .${NS$1}-container-wrap[data-tip-dir="10"] {padding-left:7px;}
	.${NS$1}-container-wrap[data-tip-dir="8"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="9"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="10"] .${NS$1}-close {top:3px;}
	.${NS$1}-container-wrap[data-tip-dir="8"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="9"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="10"] .${NS$1}-arrow {left:-6px; margin-top:-7px; border-right-color:white}
	.${NS$1}-container-wrap[data-tip-dir="8"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="9"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="10"] .${NS$1}-arrow-pt {left:-7px; border-right-color:#dcdcdc;}
	.${NS$1}-container-wrap[data-tip-dir="8"] .${NS$1}-arrow {top:75%}
	.${NS$1}-container-wrap[data-tip-dir="9"] .${NS$1}-arrow {top:50%}
	.${NS$1}-container-wrap[data-tip-dir="10"] .${NS$1}-arrow {top:25%}
	
	/** bottom **/
	.${NS$1}-container-wrap[data-tip-dir="5"], .${NS$1}-container-wrap[data-tip-dir="6"], .${NS$1}-container-wrap[data-tip-dir="7"] {padding-bottom:7px;}
	.${NS$1}-container-wrap[data-tip-dir="5"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="6"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="7"] .${NS$1}-close {top:3px;}
	.${NS$1}-container-wrap[data-tip-dir="5"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="6"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="7"] .${NS$1}-arrow {left:50%; bottom:-6px; margin-left:-7px; border-top-color:white}
	.${NS$1}-container-wrap[data-tip-dir="5"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="6"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="7"] .${NS$1}-arrow-pt {bottom:-7px; border-top-color:#dcdcdc;}
	.${NS$1}-container-wrap[data-tip-dir="7"] .${NS$1}-arrow {left:30px}
	.${NS$1}-container-wrap[data-tip-dir="5"] .${NS$1}-arrow {left:75%}
	
	/** left **/
	.${NS$1}-container-wrap[data-tip-dir="2"], .${NS$1}-container-wrap[data-tip-dir="3"], .${NS$1}-container-wrap[data-tip-dir="4"] {padding-right:7px;}
	.${NS$1}-container-wrap[data-tip-dir="2"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="3"] .${NS$1}-close,
	.${NS$1}-container-wrap[data-tip-dir="4"] .${NS$1}-close {right:13px; top:3px;}
	.${NS$1}-container-wrap[data-tip-dir="2"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="3"] .${NS$1}-arrow,
	.${NS$1}-container-wrap[data-tip-dir="4"] .${NS$1}-arrow {right:-6px; margin-top:-7px; border-left-color:white}
	.${NS$1}-container-wrap[data-tip-dir="2"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="3"] .${NS$1}-arrow-pt,
	.${NS$1}-container-wrap[data-tip-dir="4"] .${NS$1}-arrow-pt {right:-7px; border-left-color:#dcdcdc;}
	.${NS$1}-container-wrap[data-tip-dir="2"] .${NS$1}-arrow {top:25%}
	.${NS$1}-container-wrap[data-tip-dir="3"] .${NS$1}-arrow {top:50%}
	.${NS$1}-container-wrap[data-tip-dir="4"] .${NS$1}-arrow {top:75%}
`, Theme.Namespace + 'tip-style');

	/**
	 * 绑定事件
	 */
	let bindEvent = function(){
		if(this.option.showCloseButton){
			let btn = this.dom.querySelector(`.${NS$1}-close`);
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

		/** @var {HTMLElement} dom **/
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

			let close_button_html = this.option.showCloseButton ? `<span class="${NS$1}-close">&#10005;</span>` : ``;
			this.dom = createDomByHtml(
				`<div class="${NS$1}-container-wrap" style="display:none;">
				<s class="${NS$1}-arrow ${NS$1}-arrow-pt"></s>
				<s class="${NS$1}-arrow ${NS$1}-arrow-bg"></s>
				${close_button_html}
				<div class="${NS$1}-content">${content}</div>
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
			this.dom.querySelector(`.${NS$1}-content`).innerHTML = html;
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

	const NS = Theme.Namespace + '-uploader';
	insertStyleSheet(`
	.${NS} {}
	
	.${NS}-btn {display:inline-block; use-select:none; cursor:pointer}
	.${NS}-btn-reset:before {content:"重新上传"}
	.${NS}-btn-cancel:before {content:"取消"}
	.${NS}-btn-delete:before {content:"删除"}
`);

	const UPLOAD_STATE_INIT = 0;
	const UPLOAD_STATE_PENDING = 1;
	const UPLOAD_STATE_ERROR = 2;
	const UPLOAD_STATE_SUCCESS = 3;

	const UPLOAD_ERROR_FILE_SIZE_OVERLOAD = 'file_size_overload';
	const UPLOAD_ERROR_FILE_EMPTY = 'file_empty';

	const FILE_TYPE_IMAGE = 'image/*';
	const FILE_TYPE_VIDEO = 'video/*';
	const FILE_TYPE_AUDIO = 'audio/*';
	const FILE_TYPE_DOC = '.txt,.md,.doc,.docx';
	const FILE_TYPE_SHEET = '.xls,.xlsx,.csv';

	/**
	 * 缺省后端返回格式处理器
	 * @param rsp
	 * @return {{thumb, error: *, value}}
	 * @constructor
	 */
	const DEFAULT_RSP_HANDLE = (rsp) => {
		return {
			error: rsp.code !== 0 ? rsp.message : '',
			value: rsp.data,
			thumb: rsp.data
		}
	};

	/**
	 * @param {Uploader} up
	 * @param {File} file
	 */
	const startUpload = (up, file) => {
		let xhr = new XMLHttpRequest();
		up.xhr = xhr;
		let formData = new FormData();
		formData.append(up.option.uploadFileFieldName, file);
		xhr.withCredentials = true;
		xhr.upload.addEventListener('progress', e => {
			up.onUploading.fire(e.loaded, e.total);
		}, false);
		xhr.addEventListener('load', e => {
			up.option.uploadResponseHandle(e.returnValue);
		});
		xhr.addEventListener('error', e => {
		});
		xhr.addEventListener('abort', e => {
			up.onAbort.fire();
		});
		xhr.open('POST', up.option.uploadUrl);
		xhr.send(formData);
	};

	/**
	 * @param {Uploader} up
	 */
	const renderDom = (up) => {
		let acceptStr = up.option.allowFileTypes.join(',');
		const html =
			`<div class="${NS}" data-state="${up.state}">
		<label class="${NS}-file">
			<input type="file" accept="${acceptStr}" value="${up.option.initValue || ''}" ${up.option.required ? 'required' : ''}>
		</label>
		<div class="${NS}-progress">
			<progress max="100" value="0">0%</progress>
			<span>0%</span>
		</div>
		<div class="${NS}-content"></div>
		<div class="${NS}-handle">
			<span role="button" class="${NS}-btn ${NS}-btn-reset"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-clean"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-cancel"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-delete"></span>
		</div>
	</div>`;
		const dom = createDomByHtml(html, up.container);
		const fileEl = dom.querySelector('input[type=file]');

		dom.querySelector(`.${NS}-btn-reset`).addEventListener('click', e => {
			resetUpload(up);
		});
		dom.querySelector(`.${NS}-btn-clean`).addEventListener('click', e => {
		});

		dom.querySelector(`.${NS}-btn-delete`).addEventListener('click', e => {

		});

		dom.querySelector(`.${NS}-btn-cancel`).addEventListener('click', e => {
			up.abort();
		});

		fileEl.addEventListener('change', e => {
			let file = fileEl.files[0];
			if(file){
				if(!file.size < 1){
					up.onError.fire('所选的文件内容为空', UPLOAD_ERROR_FILE_EMPTY);
					resetUpload(up);
					return;
				}
				if(up.option.fileSizeLimit && file.size < up.option.fileSizeLimit){
					up.onError.fire('所选的文件大小超出限制', UPLOAD_ERROR_FILE_SIZE_OVERLOAD);
					resetUpload(up);
					return;
				}
				updateState(up, UPLOAD_STATE_PENDING);
				startUpload(up, file);
			}
		});
	};

	const mergeNoNull = (target, source) => {
		for(let i in source){
			if(source[i] !== null){
				target[i] = source[i];
			}
		}
	};

	const resetUpload = (up) => {
		const fileEl = up.container.querySelector('input[type=file]');
		fileEl.value = up.initValue;
		updateState(up, UPLOAD_STATE_INIT);
	};

	const updateState = (up, state) => {
		const dom = up.container.querySelector('.' + NS);
		dom.setAttribute('data-state', state);
		switch(state){
			case UPLOAD_STATE_PENDING:
				up.onUploading.fire();
				break;
			case UPLOAD_STATE_SUCCESS:
				up.onSuccess.fire();
				break;
			case UPLOAD_STATE_ERROR:
				up.onError.fire();
				break;
		}
	};

	class Uploader {
		/**
		 * 状态
		 * @type {number}
		 */
		state = UPLOAD_STATE_INIT;
		xhr = null;

		/**
		 * 渲染容器
		 * @type {HTMLElement}
		 */
		container = null;

		static globalUploadUrl = '';

		option = {
			uploadUrl: '',
			required: false,
			initValue: null,
			initThumb: null,
			allowFileTypes: [],
			fileSizeLimit: 0,
			uploadFileFieldName: 'file',
			uploadResponseHandle: DEFAULT_RSP_HANDLE
		};

		constructor(container, option = {
			uploadUrl: null, //上传URL【必填】
			required: null,
			initValue: null,
			initThumb: null,
			fileSizeLimit: null,
			allowFileTypes: null,
			uploadResponseHandle: null
		}){
			this.container = container;
			mergeNoNull(this.option, option);
			option.uploadUrl = option.uploadUrl || Uploader.globalUploadUrl;
			if(!option.uploadUrl){
				throw "upload url required";
			}
			renderDom(this);
		}

		abort(){
			if(this.xhr && this.xhr.abort()){
				resetUpload(this);
			}
		}

		getData(){

		}

		getDataAsync(){
			return new Promise((resolve, reject) => {
				if(this.state !== UPLOAD_STATE_PENDING){
					resolve(this.getData());
				}else {
					let fn = () => {
						resolve(this.getData());
						this.onSuccess.remove(fn);
					};
					this.onSuccess.listen(fn);
				}
			});
		}

		onSuccess = new BizEvent();
		onAbort = new BizEvent();
		onResponse = new BizEvent();
		onUploading = new BizEvent();
		onDelete = new BizEvent();
		onError = new BizEvent();
	}

	/**
	 * 异步组件
	 * 参数：
	 * node[data-async-url] | a[href] | form[action] 请求url
	 * node[data-async-method] | form[method] 请求方法，缺省为GET
	 * node[data-async-data] | form{*} 请求数据
	 */
	class ACAsync {
		//默认成功回调处理函数
		static COMMON_SUCCESS_RESPONSE_HANDLE = (rsp) => {
			let next = () => {
				if(rsp.forward_url){
					parent.location.href = rsp.forward_url;
				}else {
					parent.location.reload();
				}
			};
			rsp.message ? ToastClass.showSuccess(rsp.message, next) : next();
		};

		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let url, data, method,
					onsuccess = param.onsuccess || ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE;
				if(node.tagName === 'FORM'){
					url = node.action;
					data = formSerializeJSON(node);
					method = node.method.toLowerCase() === 'post' ? 'post' : 'get';
				}else if(node.tagName === 'A'){
					url = node.href;
					method = 'get';
				}

				//优先使用参数传参
				url = param.url || url;
				method = param.method || method || 'get';
				data = param.data || data;

				let loader = ToastClass.showLoadingLater('正在请求中，请稍候···');
				requestJSON(url, data, method).then(rsp => {
					if(rsp.code === 0){
						onsuccess(rsp);
						resolve();
					}else {
						ToastClass.showError(rsp.message || '系统错误');
					}
				}, err => {
					ToastClass.showError(err);
				}).finally(()=>{
					loader && loader.hide();
				});
			})
		}
	}

	/**
	 * 确认对话框
	 * 参数：
	 * node[data-confirm-title] 标题，缺省为”确认“
	 * node[data-confirm-message] 内容
	 */
	class ACConfirm {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let title = param.title;
				let message = param.message;
				DialogClass.confirm(title || '确认', message).then(resolve, reject);
			});
		}
	}

	class ACCopy {
		static init(node, param){

		}
	}

	/**
	 * 对话框组件
	 * 参数：
	 * node[data-dialog-url] iframe对话框页面地址
	 * node[data-content] 对话框内容
	 * a[title] | node[text] 对话框标题
	 */
	class ACDialog {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let title, url, content;

				if(node.tagName === 'A'){
					url = node.href || url;
					title = node.title || title;
				}
				if(node.innerText){
					title = cutString(node.innerText, 30);
				}

				title = param.title || title;
				url = param.url || url;
				content = param.content || content;
				if(url){
					content = {src: url};
				}
				DialogClass.show(title || '对话框', content, param);
				resolve();
			})
		}
	}

	class ACTip {
		static init(node, {content}){
			return new Promise((resolve, reject) => {
				new Tip(content, node);
				resolve();
			});
		}
	}

	class ACToast {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let message = param.message || '提示信息';
				let type = param.type || ToastClass.TYPE_INFO;
				ToastClass.showToast(message, type, ToastClass.DEFAULT_TIME_MAP[type], resolve);
			});
		}
	}

	const resolveSrc = (node) => {
		let src = node.dataset.src;
		//src获取优先级：param.src > img[data-src] > img[srcset] > img[src]
		if(node.tagName === 'IMG'){
			if(!src && node.srcset){
				src = getHighestResFromSrcSet(node.srcset) || node.src;
			}
		}else if(!src && node.tagName === 'A'){
			src = node.href;
		}
		return src;
	};

	/**
	 * 图片预览
	 */
	class ACPreview {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let src = param.src || resolveSrc(node);
				let selector = param.selector;
				if(!src){
					console.warn('image preview src empty', node);
					return;
				}
				if(selector){
					let index = 0, imgSrcList = [];
					document.querySelectorAll(selector).forEach((n, idx) => {
						if(node === n){
							index = idx;
						}
						imgSrcList.push(resolveSrc(n));
					});
					showImgListPreviewFn(imgSrcList, index);
				}else {
					showImgPreviewFn(src);
				}
				resolve();
			});
		}
	}

	const DEFAULT_ATTR_COM_FLAG = 'data-component'; //data-com="com1,com2"
	const COMPONENT_BIND_FLAG_KEY = 'component-init-bind';

	let AC_COMPONENT_MAP = {
		'async': ACAsync,
		'dialog': ACDialog,
		'confirm': ACConfirm,
		'preview': ACPreview,
		'copy': ACCopy,
		'tip': ACTip,
		'toast': ACToast,
	};

	const parseComponents = function(attr){
		let tmp = attr.split(',');
		let cs = [];
		tmp.forEach(v => {
			v = v.trim();
			if(v){
				cs.push(v);
			}
		});
		return cs;
	};

	/**
	 * 从节点中解析出使用 data-key- 为前缀的属性
	 * @param node
	 * @param key
	 * @return {{}}
	 */
	const resolveDataParam = (node, key) => {
		let param = {};
		Array.from(node.attributes).forEach(attr => {
			if(attr.name.indexOf('data-' + key + '-') >= 0){
				let objKeyPath = attr.name.substring(('data-' + key).length + 1);
				objectPushByPath(objKeyPath, attr.value, param);
			}
		});
		return param;
	};

	const bindNode = function(container = document, attr_flag = DEFAULT_ATTR_COM_FLAG){
		container.querySelectorAll(`:not([${COMPONENT_BIND_FLAG_KEY}])[${attr_flag}]`).forEach(node => {
			node.setAttribute(COMPONENT_BIND_FLAG_KEY, "1");
			let cs = parseComponents(node.getAttribute(attr_flag));
			let activeStacks = [];
			cs.forEach(com => {
				let C = AC_COMPONENT_MAP[com];
				if(!C){
					console.warn('component no found', com);
					return false;
				}
				let data = resolveDataParam(node, com);
				console.info('com detected:', com);
				if(C.init){
					C.init(node, data);
				}
				if(C.active){
					activeStacks.push([C.active, data]);
				}
				return true;
			});
			if(activeStacks.length){
				bindActiveChain(node, activeStacks);
			}
		});
	};

	const TEXT_TYPES = ['text', 'number', 'password', 'search', 'address', 'date', 'datetime', 'time', 'checkbox', 'radio'];

	/**
	 * 是否为可输入元素
	 * @param {HTMLFormElement} node
	 * @return {boolean}
	 */
	const isInputAble = (node) => {
		if(node.disabled || node.readonly){
			return false;
		}
		return node.tagName === 'TEXTAREA' ||
			(node.tagName === 'INPUT' && (!node.type || TEXT_TYPES.includes(node.type.toLowerCase())));
	};

	const bindActiveChain = (node, activeStacks) => {
		let event = 'click';
		if(isInputAble(node)){
			event = 'keyup';
		}else if(node.tagName === 'FORM'){
			event = 'submit';
		}else {
			event = 'click';
		}
		node.addEventListener(event, e => {
			let [func, args] = activeStacks[0];
			let pro = func(node, args);
			for(let i = 1; i < activeStacks.length; i++){
				pro = pro.then(() => {
					return activeStacks[i][0](node, activeStacks[i][1]);
				}, () => {
				});
			}
			e.preventDefault();
			return false;
		});
	};

	const ACComponent = {
		/**
		 * 监听组件
		 * @param {Node} container
		 * @param {String} attr_flag 绑定属性格式，缺省为 data-component形式
		 */
		watch: (container = document, attr_flag = DEFAULT_ATTR_COM_FLAG) => {
			let m_tm = null;
			console.log('watch');
			let observer = new MutationObserver(mutations => {
				console.log('sub tree modify');
				clearTimeout(m_tm);
				m_tm = setTimeout(function(){
					bindNode(container, attr_flag);
				}, 0);
			});
			observer.observe(container, {childList: true, subtree: true});
			bindNode(container, attr_flag);
		},

		/**
		 * 注册组件
		 * @param {String}  componentName
		 * @param {Object} define
		 * @param {Function} define.init 节点初始化函数
		 * @param {Function} define.active 节点交互函数（交互行为包括：表单提交、链接点击、按钮点击、输入框回车提交等）
		 */
		register: (componentName, define) => {
			AC_COMPONENT_MAP[componentName] = define;
		},

		/**
		 * 取消注册组件
		 * @param {String} componentName
		 */
		unRegister: (componentName) => {
			delete (AC_COMPONENT_MAP[componentName]);
		}
	};

	exports.ACAsync = ACAsync;
	exports.ACComponent = ACComponent;
	exports.ACConfirm = ACConfirm;
	exports.ACCopy = ACCopy;
	exports.ACDialog = ACDialog;
	exports.ACTip = ACTip;
	exports.BLOCK_TAGS = BLOCK_TAGS;
	exports.Base64Encode = Base64Encode;
	exports.BizEvent = BizEvent;
	exports.Dialog = DialogClass;
	exports.DialogManager = DialogManager;
	exports.FILE_TYPE_AUDIO = FILE_TYPE_AUDIO;
	exports.FILE_TYPE_DOC = FILE_TYPE_DOC;
	exports.FILE_TYPE_IMAGE = FILE_TYPE_IMAGE;
	exports.FILE_TYPE_SHEET = FILE_TYPE_SHEET;
	exports.FILE_TYPE_VIDEO = FILE_TYPE_VIDEO;
	exports.HTTP_METHOD = HTTP_METHOD;
	exports.IMG_PREVIEW_MODE_MULTIPLE = IMG_PREVIEW_MODE_MULTIPLE;
	exports.IMG_PREVIEW_MODE_SINGLE = IMG_PREVIEW_MODE_SINGLE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NAV = IMG_PREVIEW_MS_SCROLL_TYPE_NAV;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NONE = IMG_PREVIEW_MS_SCROLL_TYPE_NONE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = IMG_PREVIEW_MS_SCROLL_TYPE_SCALE;
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
	exports.Toast = ToastClass;
	exports.Toc = Toc;
	exports.UPLOAD_ERROR_FILE_EMPTY = UPLOAD_ERROR_FILE_EMPTY;
	exports.UPLOAD_ERROR_FILE_SIZE_OVERLOAD = UPLOAD_ERROR_FILE_SIZE_OVERLOAD;
	exports.UPLOAD_STATE_ERROR = UPLOAD_STATE_ERROR;
	exports.UPLOAD_STATE_INIT = UPLOAD_STATE_INIT;
	exports.UPLOAD_STATE_PENDING = UPLOAD_STATE_PENDING;
	exports.UPLOAD_STATE_SUCCESS = UPLOAD_STATE_SUCCESS;
	exports.Uploader = Uploader;
	exports.arrayColumn = arrayColumn;
	exports.arrayDistinct = arrayDistinct;
	exports.arrayGroup = arrayGroup;
	exports.arrayIndex = arrayIndex;
	exports.base64Decode = base64Decode;
	exports.base64UrlSafeEncode = base64UrlSafeEncode;
	exports.between = between;
	exports.bindFormUnSavedUnloadAlert = bindFormUnSavedUnloadAlert;
	exports.bindImgPreviewViaSelector = bindImgPreviewViaSelector;
	exports.bindTargetContextMenu = bindTargetContextMenu;
	exports.buildHtmlHidden = buildHtmlHidden;
	exports.buttonActiveBind = buttonActiveBind;
	exports.capitalize = capitalize;
	exports.chunk = chunk;
	exports.convertBlobToBase64 = convertBlobToBase64;
	exports.convertFormDataToObject = convertFormDataToObject;
	exports.convertObjectToFormData = convertObjectToFormData;
	exports.copy = copy;
	exports.copyFormatted = copyFormatted;
	exports.createDomByHtml = createDomByHtml;
	exports.cssSelectorEscape = cssSelectorEscape;
	exports.cutString = cutString;
	exports.debounce = debounce;
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
	exports.extract = extract;
	exports.fireEvent = fireEvent;
	exports.formSerializeJSON = formSerializeJSON;
	exports.formSync = formSync;
	exports.formValidate = formValidate;
	exports.formatSize = formatSize;
	exports.frequencyControl = frequencyControl;
	exports.getAvailableElements = getAvailableElements;
	exports.getContextDocument = getContextDocument;
	exports.getContextWindow = getContextWindow;
	exports.getCurrentScript = getCurrentScript;
	exports.getDomDimension = getDomDimension;
	exports.getDomOffset = getDomOffset;
	exports.getElementValue = getElementValue;
	exports.getHash = getHash;
	exports.getLastMonth = getLastMonth;
	exports.getLibEntryScript = getLibEntryScript;
	exports.getLibModule = getLibModule;
	exports.getLibModuleTop = getLibModuleTop;
	exports.getMonthLastDay = getMonthLastDay;
	exports.getNextMonth = getNextMonth;
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
	exports.isEquals = isEquals;
	exports.isInFullScreen = isInFullScreen;
	exports.isNum = isNum;
	exports.keepDomInContainer = keepDomInContainer;
	exports.keepRectCenter = keepRectCenter;
	exports.keepRectInContainer = keepRectInContainer;
	exports.loadCss = loadCss;
	exports.loadScript = loadScript;
	exports.matchParent = matchParent;
	exports.mergerUriParam = mergerUriParam;
	exports.monthsOffsetCalc = monthsOffsetCalc;
	exports.objectPushByPath = objectPushByPath;
	exports.onDocReady = onDocReady;
	exports.onHover = onHover;
	exports.onReportApi = onReportApi;
	exports.onStateChange = onStateChange;
	exports.openLinkWithoutReferer = openLinkWithoutReferer;
	exports.prettyTime = prettyTime;
	exports.pushState = pushState;
	exports.randomString = randomString;
	exports.rectAssoc = rectAssoc;
	exports.rectInLayout = rectInLayout;
	exports.regQuote = regQuote;
	exports.repaint = repaint;
	exports.requestJSON = requestJSON;
	exports.resetFormChangedState = resetFormChangedState;
	exports.resolveFileExtension = resolveFileExtension;
	exports.resolveFileName = resolveFileName;
	exports.resolveTocListFromDom = resolveTocListFromDom;
	exports.round = round;
	exports.setContextWindow = setContextWindow;
	exports.setHash = setHash;
	exports.setStyle = setStyle;
	exports.show = show;
	exports.showImgListPreview = showImgListPreviewFn;
	exports.showImgPreview = showImgPreviewFn;
	exports.showMenu = showMenu;
	exports.sortByKey = sortByKey;
	exports.strToPascalCase = strToPascalCase;
	exports.stringToEntity = stringToEntity;
	exports.throttle = throttle;
	exports.toggle = toggle;
	exports.toggleFullScreen = toggleFullScreen;
	exports.trans = trans;
	exports.triggerDomEvent = triggerDomEvent;
	exports.trim = trim;
	exports.unescapeHtml = unescapeHtml;
	exports.utf8Decode = utf8Decode;
	exports.utf8Encode = utf8Encode;
	exports.validateFormChanged = validateFormChanged;
	exports.versionCompare = versionCompare;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
