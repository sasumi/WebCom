define(['exports'], (function (exports) { 'use strict';

	const DOMAIN_DEFAULT = 'default';

	const trans = (text, domain = DOMAIN_DEFAULT) => {
		return text;
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

	const triggerDomEvent = (el, event) => {
		if("createEvent" in document){
			let evt = document.createEvent("HTMLEvents");
			evt.initEvent(event.toLowerCase(), false, true);
			el.dispatchEvent(evt);
		}else {
			el.fireEvent("on"+event.toLowerCase());
		}
	};

	const ACMultiSelect = (node, param) => {
		let targetSelector = param.target || 'input[type=checkbox]:not([disabled])';
		let checks = document.querySelectorAll(targetSelector);
		if(!checks.length){
			throw new Error('No checkbox found:'+targetSelector);
		}

		let updLock = false;
		let updState = () => {
			if(updLock){
				console.log('lock by checkbox trigger manual');
				return;
			}
			let checked_list = Array.from(checks).filter(chk => {
				return chk.checked;
			});
			node.indeterminate = false;
			if(checked_list.length === checks.length){
				node.checked = true;
			}else if(checked_list.length === 0){
				node.checked = false;
			}else {
				node.indeterminate = true;
			}
		};

		node.addEventListener('change',()=>{
			checks.forEach(chk=>{
				chk.checked = node.checked;
				updLock = true;
				triggerDomEvent(chk, 'change');
				updLock = false;
			});
		});

		checks.forEach(chk=>{
			chk.addEventListener('change', updState);
		});
		updState();
	};

	/**
	 * 转义HTML
	 * @param {string} str
	 * @returns {string}
	 */
	const escapeHtml = str => {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	/**
	 * 反转义HTML
	 * @param {String} str
	 * @returns {string}
	 */
	const unescapeHtml = (str)=>{
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
		let tmp = arr.map(item =>
			`&#${(radix ? 'x' + item.charCodeAt(0).toString(16) : item.charCodeAt(0))};`).join('');
		return tmp
	};

	const entityToString = (entity) => {
		let entities = entity.split(';');
		entities.pop();
		let tmp = entities.map(item => String.fromCharCode(
			item[2] === 'x' ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join('');
		return tmp
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
			codes += sourceStr.substring(Math.round(Math.random()*(sourceStr.length - 1)), 1);
		}
		return codes;
	};

	/**
	 * 数值转为CSS可用样式
	 * @param {Number|String} h
	 * @returns {string}
	 */
	const dimension2Style = h => {
		if(/^\d+$/.test(h)){
			return h + 'px';
		}
		return h+'';
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

	/**
	 * html to text
	 * @param {String} html
	 * @returns {string}
	 */
	const html2Text = (html)=>{
		//remove text line break
		html = html.replace(/[\r|\n]/g, '');

		//convert block tags to line break
		html = html.replace(/<(\w+)([^>]*)>/g, function(ms, tag, tail){
			if(BLOCK_TAGS.includes(tag.toLowerCase())){
				return "\n";
			}
		});

		//remove tag's postfix
		html = html.replace(/<\/(\w+)([^>]*)>/g, function(ms, tag, tail){
			if(BLOCK_TAGS.includes(tag.toLowerCase())){
				return "";
			}
		});

		//remove other tags, likes img, input, etc...
		html = html.replace(/<[^>]+>/g, '');

		//convert other html entity
		return decodeHTMLEntities(html);
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
	const guid$2 = () => {
		return 'guid_' + (new Date()).getTime() + randomString();
	};

	const between = (val, min, max)=>{
		return val >= min && val <= max;
	};

	/**
	 * 取整
	 * @param {Number} num
	 * @param {Number} digits 小数点位数
	 * @returns {number}
	 */
	const round = (num, digits) => {
		digits = digits === undefined ? 2 : digits;
		let multiple = Math.pow(10, digits);
		return Math.round(num * multiple) / multiple;
	};

	const getViewWidth = () => {
		return window.innerWidth;
	};

	const getViewHeight = () => {
		return window.innerHeight;
	};


	const hide = (dom) => {
		dom.style.display = 'none';
	};

	const show = (dom) => {
		dom.style.display = '';
	};

	const toggle = (dom, toShow) => {
		toShow ? show(dom) : hide(dom);
	};

	/**
	 * 主动触发事件
	 * @param el
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
	 * 检测child节点是否在container节点列表里面
	 * @param {Node|Node[]|String} contains
	 * @param {Node} child
	 * @param {Boolean} includeEqual 是否包括等于关系
	 * @returns {boolean}
	 */
	const domContained = (contains, child, includeEqual = false) => {
		if(typeof contains === 'string'){
			contains = document.querySelectorAll(contains);
		}else if(typeof contains === 'object'){
			contains = [contains];
		}

		for(let i = 0; i < contains.length; i--){
			if((includeEqual ? contains[i] === child : false) ||
				contains[i].compareDocumentPosition(child) & 16){
				return true;
			}
		}
		return false;
	};

	/**
	 * 绑定按钮触发（包括鼠标点击、键盘回车、键盘空格）
	 * @param {Node} button
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
	 *
	 * @param width
	 * @param height
	 * @param {Object} containerDimension
	 * @param {Number} containerDimension.left
	 * @param {Number} containerDimension.top
	 * @param {Number} containerDimension.width
	 * @param {Number} containerDimension.height
	 * @return {Array} dimension
	 * @return {Number} dimension.left
	 * @return {Number} dimension.top
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
	 * 矩形相交（包括边重叠情况）
	 * @param rect1
	 * @param rect2
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
	 * @param obj
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
			return;
		}
		_c[file] = true;
		let link = document.createElement('link');
		link.rel = "stylesheet";
		link.href = file;
		document.head.append(link);
	};

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
	 * 获取窗口的相关测量信息
	 * @returns {{}}
	 */
	const getRegion = (win) => {
		let info = {};
		win = win || window;
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
	let _img_ins_cache = {
		//src: {state:PENDING, SUCCESS, ERROR
	};
	const loadImageInstance = (imgSrc)=>{
		return new Promise((resolve, reject) => {
			if(_img_ins_cache[imgSrc]){
				return resolve(_img_ins_cache[imgSrc])
			}

		})
	};

	/**
	 * 创建HTML节点
	 * @param {String} html
	 * @param {Node|null} parentNode 父级节点
	 * @returns {ChildNode}
	 */
	const createDomByHtml = (html, parentNode = null) => {
		let tpl = document.createElement('template');
		html = html.trim();
		tpl.innerHTML = html;
		if(parentNode){
			parentNode.appendChild(tpl.content.firstChild);
		}
		return tpl.content.firstChild;
	};

	const NS = 'WebCom-';
	const ICON_FONT_CLASS = NS + `icon`;
	const ICON_FONT = NS+'iconfont';
	const DEFAULT_ICONFONT_CSS = `
@font-face {
  font-family: "${ICON_FONT}"; /* Project id 3359671 */
  src: url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.woff2?t=1651059735967') format('woff2'),
       url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.woff?t=1651059735967') format('woff'),
       url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.ttf?t=1651059735967') format('truetype');
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
		Namespace: NS,
		IconFont: ICON_FONT,
		IconFontClass: ICON_FONT_CLASS,
		DialogIndex: 1000,
		MaskIndex: 100,
		FullScreenModeIndex: 10000
	};

	let masker = null;
	let CSS_CLASS = 'dialog-masker';

	const showMasker = () => {
		if(!masker){
			masker = document.createElement('div');
			document.body.appendChild(masker);
			masker.className = CSS_CLASS;
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

	insertStyleSheet(`.${CSS_CLASS} {position:fixed;top:0;left:0;right:0;bottom:0;background:#33333342; z-index:${Masker.zIndex}}`, Theme.Namespace+'masker-style');

	const DLG_CLS_PREF = Theme.Namespace+'dialog';
	const DLG_CLS_ACTIVE = DLG_CLS_PREF + '-active';
	const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
	const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
	const DLG_CLS_OP = DLG_CLS_PREF + '-op';
	const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
	const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';

	const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';

	/**
	 * Content Type
	 * @type {string}
	 */
	const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF+'-ctn-iframe';
	const DLG_CTN_TYPE_HTML = DLG_CLS_PREF+'-ctn-html';

	insertStyleSheet(`
	.${DLG_CLS_PREF} {display:block;border:1px solid #ddd; padding:0; box-sizing:border-box;width:calc(100% - 2 * 30px); --head-height:36px; background-color:white; color:#333; z-index:10000;position:fixed;}
	.${DLG_CLS_PREF} .${DLG_CLS_PREF}-ti {font-size :16px; user-select:none; height:var(--head-height); box-sizing:border-box; padding:6px 10px 0 10px; font-weight:normal;color:#666}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE} {position:absolute; overflow:hidden; cursor:pointer; right:0; top:0; width:var(--head-height); height:var(--head-height); box-sizing:border-box; line-height:var(--head-height); text-align:center;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"×"; font-size:24px;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:hover {background-color:#eee;}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto; padding:10px;}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} {padding:0}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} iframe {width:100%; border:none; display:block;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:10px; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN} {margin-right:0.5em;}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} iframe {border:none; width:100%;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 50px); overflow-y:auto}
	.${DLG_CLS_PREF}.${DLG_CLS_ACTIVE} {box-shadow:1px 1px 25px 0px #44444457; border-color:#aaa;}
	.${DLG_CLS_PREF}.${DLG_CLS_ACTIVE} .dialog-ti {color:#333}
`, Theme.Namespace+'dialog-style');

	/** @var Dialog[] **/
	let dialogs = [];

	let closeDlg =  (dlg, destroy = true) => {
		if(dlg.onClose.fire() === false){
			console.warn('dialog close cancel by onClose events');
			return false;
		}
		dialogs = dialogs.filter(d => dlg !== d);
		let nextShow = dialogs.find(d=> d.active);
		if(!nextShow){
			nextShow = dialogs.find(d => d.visible);
		}
		if(nextShow){
			DialogManager.show(nextShow);
		}else {
			Masker.hide();
		}
		if(destroy){
			dlg.dom.parentNode.removeChild(dlg.dom);
		} else {
			dlg.active = false;
			dlg.visible = false;
			dlg.dom.style.display = 'none';
		}
	};

	/**
	 * 对话框管理器
	 */
	const DialogManager = {
		register(dlg){
			dialogs.push(dlg);
		},

		/**
		 * 激活并显示对话框
		 * @param {Dialog} dlg
		 */
		show(dlg){
			if(dlg.onShow.fire() === false){
				console.warn('dialog show cancel by onShow events');
				return false;
			}
			Masker.show();
			let zIndex = Dialog.DIALOG_INIT_Z_INDEX;
			dialogs = dialogs.filter(d => {
				if(d !== dlg){
					d.active = false;
					d.dom.classList.remove(DLG_CLS_ACTIVE);
					d.dom.style.zIndex = zIndex++ + '';
					return true;
				}
				return false;
			});
			dlg.active = true;
			dlg.visible = true;
			dlg.dom.style.display = '';
			dlg.dom.style.zIndex = zIndex++ + '';
			dlg.dom.classList.add(DLG_CLS_ACTIVE);
			dialogs.push(dlg);
		},

		/**
		 * 关闭对话框
		 */
		close: closeDlg,

		/**
		 * 隐藏对话框
		 * @param dlg
		 * @returns {boolean}
		 */
		hide(dlg){
			return closeDlg(dlg, false);
		},

		/**
		 * 获取当前激活的对话框
		 * @returns {Dialog|null}
		 */
		getCurrentActive(){
			for(let i = dialogs.length - 1; i >= 0; i--){
				if(dialogs[i].active){
					return dialogs[i];
				}
			}
			return null;
		},

		/**
		 * 关闭全部对话框
		 */
		closeAll(){
			dialogs.forEach(dlg => DialogManager.close(dlg));
			Masker.hide();
		},

		/**
		 * 根据ID查找对话框
		 * @param id
		 * @returns {Dialog}
		 */
		findById(id){
			return dialogs.find(dlg => {return dlg.id === id});
		}
	};

	window['DialogManager'] = DialogManager;

	const resolveContentType = (content)=>{
		if(typeof (content) === 'object' && content.src){
			return DLG_CTN_TYPE_IFRAME;
		}
		return DLG_CTN_TYPE_HTML;
	};

	/**
	 * 构造DOM结构
	 */
	const domConstruct = (dlg) => {
		dlg.dom = document.createElement('div');
		dlg.dom.className = DLG_CLS_PREF;
		dlg.dom.id = dlg.config.id;
		if(dlg.config.width){
			dlg.dom.style.width = dlg.config.width + 'px';
		}

		let html = '';
		html += dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : '';
		html += dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" tabindex="0"></span>` : '';
		let style = [];
		if(dlg.config.minContentHeight !== null){
			style.push('min-height:' + dimension2Style(dlg.config.minContentHeight) + 'px');
		}
		html += `<div class="${DLG_CLS_CTN} ${resolveContentType(dlg.config.content)}" style="${style.join(';')}">${renderContent(dlg)}</div>`;
		if(dlg.config.buttons.length){
			html += `<div class="${DLG_CLS_OP}">`;
			dlg.config.buttons.forEach(button => {
				html += `<input type="button" class="${DLG_CLS_BTN}" ${button.default ? 'autofocus' : ''} tabindex="0" value="${escapeAttr(button.title)}">`;
			});
			html += '</div>';
		}
		dlg.dom.innerHTML = html;

		document.body.appendChild(dlg.dom);

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
	let _bind_esc = false;
	const eventBind = (dlg) => {
		//bind buttons event
		for(let i in dlg.config.buttons){
			let cb = dlg.config.buttons[i].callback || dlg.close;
			let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} .${DLG_CLS_BTN}`)[i];
			btn.addEventListener('click', cb.bind(dlg), false);
		}

		//bind active
		dlg.dom.addEventListener('mousedown', e => {
			DialogManager.show(dlg);
		});

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

		//bind window resize
		if(!dlg.config.moveAble){
			window.addEventListener('resize', () => {
				updatePosition$1(dlg);
			});
		}

		//bind esc to close current active dialog
		if(!_bind_esc){
			_bind_esc = true;
			document.addEventListener('keyup', e => {
				if(e.keyCode === KEYS.Esc){
					let current = DialogManager.getCurrentActive();
					if(current && current.config.showTopCloseButton){
						DialogManager.close(current);
						return false;
					}
				}
			});
		}
	};

	/**
	 *
	 * @param {Dialog} dlg
	 */
	const updatePosition$1 = (dlg) => {
		let [ml, mt] = keepRectCenter(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
		dlg.dom.style.top = mt + 'px';
		dlg.dom.style.left = ml + 'px';
		dlg.dom.style.visibility = 'visible';

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
		static CONTENT_MIN_HEIGHT = 100; //最小高度
		static DEFAULT_WIDTH = 600; //默认宽度
		static DIALOG_INIT_Z_INDEX = 1000;

		id = null;
		/** @var {Element} dom **/
		dom = null;

		visible = false;
		active = false;

		onClose = new BizEvent(true);
		onShow = new BizEvent(true);

		config = {
			id: '',
			title: '',
			content: '',
			modal: false,
			width: Dialog.DEFAULT_WIDTH,
			height: null,
			maxHeight: `calc(100vh - ${Dialog.CONTENT_MIN_HEIGHT}px)`,
			minContentHeight: Dialog.CONTENT_MIN_HEIGHT,
			moveAble: true,
			buttons: [/** {title:'', default:true, callback }**/],
			showTopCloseButton: true,
		};

		/**
		 * @param {Object} config
		 * @param {String|Null} config.id
		 * @param {String} config.title
		 * @param {String} config.content
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
		 */
		constructor(config = {}){
			this.config = Object.assign(this.config, config);
			this.id = this.id || 'dialog-' + Math.random();
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
		static confirm(title, content, opt={}){
			return new Promise((resolve, reject) => {
				let p = new Dialog({
					title,
					content,
					buttons: [
						{title: '确定', default: true, callback:()=>{p.close();resolve();}},
						{title: '取消', callback:()=>{p.close(); reject();}}
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
		static alert(title, content, opt={}){
			return new Promise(((resolve) => {
				let p = new Dialog({
					title,
					content,
					buttons: [
						{title: '确定', default: true, callback:()=>{p.close(); resolve();}},
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
		 * @param {String} content
		 * @param {Object} opt
		 * @returns {Promise<unknown>}
		 */
		static prompt(title, content, opt={}){
			return new Promise(((resolve, reject) => {
				let input;
				let p = new Dialog({
					title,
					content:'<input type="text" style="width:100%"/>',
					buttons: [
						{
							title: '确定', default: true, callback: () => {
								if(resolve(input.value) === false){
									return;
								}
								p.close();
							}
						},
						{title: '取消', callback: reject}
					],
					showTopCloseButton: true,
					...opt
				});
				p.onClose.listen(reject);
				p.show();

				input = p.dom.querySelector('input');
				input.addEventListener('keydown', e=>{
					if(e.key === 'Enter'){
						if(resolve(input.value) === false){
							return false;
						}
						p.close();
					}
				});
			}));
		}

		/**
		 * 获取当前激活的对话框
		 * @returns {Dialog|null}
		 */
		static getCurrentActiveDialog(){
			return DialogManager.getCurrentActive();
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

		/**
		 * 关闭全部对话框
		 */
		static closeAll(){
			DialogManager.closeAll(dialog => dialog.close());
		}
	}

	const ACConfirm = (node, param) => {
		ACEventChainBind(node, 'click', next=>{
			Dialog.confirm('确认', param.message).then(()=>{
				next();
			}, ()=>{
				console.log('cancel');
			});
		});
	};

	const ACMultiOperate = (node, param) => {
		let targetSelector = param.target || 'input[type=checkbox][name][value]:not([disabled])';
		let checks = document.querySelectorAll(targetSelector);
		if(!checks.length){
			console.error('No checkbox found:'+targetSelector);
			return;
		}
		let updState = () => {
			let chk = Array.from(checks).filter(chk => {
				return chk.checked
			});
			chk.length ? node.removeAttribute('disabled') : node.setAttribute('disabled', 'disabled');
		};
		checks.forEach(chk => chk.addEventListener('change', updState));
		updState();
	};

	const ACAsync = (node, param) => {
		if(!param.url && node.nodeName === 'A' && node.href){
			param.url = node.href;
		}

		if(node.nodeName === 'A'){
			node.getAttribute('href');
		}
		ACEventChainBind(node, 'click', next => {
			console.log('send async');
			next();
		});
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

	function ACThumb(imgNode, param){
		Thumb.bindThumbImgNode(imgNode, param);
	}

	const COM_ATTR_KEY = 'data-com';
	const COM_BIND_FLAG = COM_ATTR_KEY + '-flag';

	const ComponentMaps = {
		Async: ACAsync,
		Confirm: ACConfirm,
		MultiSelect: ACMultiSelect,
		MultiOperate: ACMultiOperate,
		Thumb: ACThumb,
	};

	const resolveParam = (node, Name) => {
		let param = {};
		let prefix = 'data-' + Name.toLowerCase() + '-';
		node.getAttributeNames().forEach(attr => {
			if(attr.indexOf(prefix) === 0){
				let k = attr.substring(prefix.length);
				let v = node.getAttribute(attr);
				param[k] = v;
			}
		});
		return param;
	};

	/**
	 * 校验组件列表
	 * @param ComStrList
	 * @returns {*[]}
	 */
	const validateComponents = (ComStrList) => {
		let cs = [];
		for(let i = 0; i < ComStrList.length; i++){
			if(!ComponentMaps[ComStrList[i]]){
				throw "Component ID no found:" + ComStrList[i];
			}
			cs.push(ComponentMaps[ComStrList[i]]);
		}
		return cs;
	};

	let DOM_UUID_INDEX = 1;
	let EVENT_MAPS = {};
	const EVENT_CHAIN_UUID_KEY = 'trigger-once-uuid';

	/**
	 * event chain bind
	 * @param {Element} dom
	 * @param {String} event
	 * @param {Function} payload (next_callback)
	 * @constructor
	 */
	const ACEventChainBind = (dom, event, payload)=>{
		let uuid = dom[EVENT_CHAIN_UUID_KEY];
		if(!dom[EVENT_CHAIN_UUID_KEY]){
			uuid = dom[EVENT_CHAIN_UUID_KEY] = DOM_UUID_INDEX++;
			dom.addEventListener(event, e => {
				EventChainTrigger([].concat(EVENT_MAPS[uuid]));
			});
		}
		if(!EVENT_MAPS[uuid]){
			EVENT_MAPS[uuid] = [];
		}
		EVENT_MAPS[uuid].push(payload);
	};

	/**
	 * trigger event chain
	 * @param {Array} payloads
	 * @constructor
	 */
	const EventChainTrigger = (payloads)=>{
		if(!payloads.length){
			return;
		}
		let payload = payloads.shift();
		payload(()=>{
			EventChainTrigger(payloads);
		});
	};

	const ACGetComponents = (node) => {
		let ComList = node.getAttribute(COM_ATTR_KEY).split(',');
		return validateComponents(ComList);
	};

	const ACBindComponent = (dom, withModifiedEvent = false) => {
		dom.querySelectorAll(`[${COM_ATTR_KEY}]:not([${COM_BIND_FLAG}="1"])`).forEach(node => {
			node.setAttribute(COM_BIND_FLAG, '1');
			let Components = ACGetComponents(node);
			if(!Components.length){
				return;
			}
			Components.forEach(Com => {
				let params = resolveParam(node, Com.name);
				console.info(`Component <${Com.name}> init`, params);
				Com(node, params);
			});
		});

		if(withModifiedEvent){
			dom.addEventListener('DOMSubtreeModified', e=>{
				ACBindComponent(dom, false);
			});
		}
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

	const resolveFileExtension = fileName => {
		fileName = fileName.replace(/.*?[/|\\]/ig, '');
		return fileName.replace(/\.[^.]*$/g, "");
	};

	const resolveFileName = (src)=>{
		let f = /\/([^/]+)$/ig.exec(src);
		if(f){
			let t = /([\w]+)/.exec(f[1]);
			if(t){
				return t[1];
			}
		}
		return null;
	};

	/*
	  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	  * to work around bugs in some JS interpreters.
	  */
	function safeAdd(x, y){
		let lsw = (x & 0xffff) + (y & 0xffff);
		let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff)
	}

	/*
	* Bitwise rotate a 32-bit number to the left.
	*/
	function bitRotateLeft(num, cnt){
		return (num << cnt) | (num >>> (32 - cnt))
	}

	/*
	* These functions implement the four basic operations the algorithm uses.
	*/
	function md5cmn(q, a, b, x, s, t){
		return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
	}

	function md5ff(a, b, c, d, x, s, t){
		return md5cmn((b & c) | (~b & d), a, b, x, s, t)
	}

	function md5gg(a, b, c, d, x, s, t){
		return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
	}

	function md5hh(a, b, c, d, x, s, t){
		return md5cmn(b ^ c ^ d, a, b, x, s, t)
	}

	function md5ii(a, b, c, d, x, s, t){
		return md5cmn(c ^ (b | ~d), a, b, x, s, t)
	}

	/*
	* Calculate the MD5 of an array of little-endian words, and a bit length.
	*/
	function binlMD5(x, len){
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
	}

	/*
	* Convert an array of little-endian words to a string
	*/
	function binl2rstr(input){
		let i;
		let output = '';
		let length32 = input.length * 32;
		for(i = 0; i < length32; i += 8){
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
		}
		return output
	}

	/*
	* Convert a raw string to an array of little-endian words
	* Characters >255 have their high-byte silently ignored.
	*/
	function rstr2binl(input){
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
	}

	/*
	* Calculate the MD5 of a raw string
	*/
	function rstrMD5(s){
		return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
	}

	/*
	* Calculate the HMAC-MD5, of a key and some data (raw strings)
	*/
	function rstrHMACMD5(key, data){
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
	}

	/*
	* Convert a raw string to a hex string
	*/
	function rstr2hex(input){
		let hexTab = '0123456789abcdef';
		let output = '';
		let x;
		let i;
		for(i = 0; i < input.length; i += 1){
			x = input.charCodeAt(i);
			output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
		}
		return output
	}

	/*
	* Encode a string as utf-8
	*/
	function str2rstrUTF8(input){
		return unescape(encodeURIComponent(input))
	}

	/*
	* Take string arguments and return either raw or hex encoded strings
	*/
	function rawMD5(s){
		return rstrMD5(str2rstrUTF8(s))
	}

	function hexMD5(s){
		return rstr2hex(rawMD5(s))
	}

	function rawHMACMD5(k, d){
		return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
	}

	function hexHMACMD5(k, d){
		return rstr2hex(rawHMACMD5(k, d))
	}

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
	const DEFAULT_TIMEOUT = 10;

	/**
	 * 构建queryString
	 * @param {String|Object} data
	 * @returns {string}
	 */
	const buildParam = data => {
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
	const mergerUriParam = (uri, data)=>{
		return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + buildParam(data);
	};

	const setHash = data => {
		location.href = location.href.replace(/#.*$/g, '') + '#' + buildParam(data);
	};

	const getHash = () => {
		return location.hash ? location.hash.substring(1) : '';
	};

	const getHashObject = (key = '') => {
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
	};

	function Net(url, data, options = {}){
		this.url = url;
		this.data = data;
		this.option = {method: 'GET', timeout: DEFAULT_TIMEOUT, headers: {}, ...options};
		this.xhr = new XMLHttpRequest();
		this.xhr.addEventListener("progress", e => {
			if(e.lengthComputable){
				this.onProgress(e.loaded, e.total);
			}else {
				this.onProgress();
			}
		});
		this.xhr.onreadystatechange = (e) => {
			this.onStateChange(this.xhr.status);
		};
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
	};

	Net.prototype.abort = function(){
		this.xhr.abort();
	};

	Net.prototype.onError = (error, code) => {
	};
	Net.prototype.onResponse = (body) => {
	};
	Net.prototype.onStateChange = state => {
	};
	Net.prototype.onProgress = percent => {
	};

	Net.get = (url, data) => {
		return new Promise((resolve, reject) => {
			let req = new Net(url, data);
			req.onResponse = resolve;
			req.onError = reject;
			req.send();
		});
	};

	Net.post = (url, data) => {
		return new Promise((resolve, reject) => {
			let req = new Net(url, data, {method: 'POST'});
			req.onResponse = resolve;
			req.onError = reject;
			req.send();
		});
	};

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

	/**
	 * 获取表单提交的数据
	 * @description 不包含文件表单(后续HTML5版本可能会提供支持)
	 * @param {HTMLFormElement} form
	 * @returns {string}
	 */
	const getFormData = (form) => {
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
			});
		});
		return data_str.join('&');
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

	let payloads = [];

	const pushState = (param, title = '') => {
		let url = location.href.replace(/#.*$/g, '') + '#' + buildParam(param);
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
		let hashObj = getHashObject();
		exePayloads({...state, ...hashObj});
	};

	const onStateChange = (payload) => {
		payloads.push(payload);
	};

	function frequencyControl(payload, hz, executeOnFistTime = false){
		if(payload._frq_tm){
			clearTimeout(payload._frq_tm);
		}
		payload._frq_tm = setTimeout(()=>{
			frequencyControl(payload,hz, executeOnFistTime);
		}, hz);
	}

	/**
	 * 类型定义
	 */
	const TYPE_INFO = 'info';
	const TYPE_SUCCESS = 'success';
	const TYPE_WARING = 'warning';
	const TYPE_ERROR = 'error';
	const TYPE_LOADING = 'loading';

	let TOAST_COLLECTION = [];
	let CLASS_TOAST_WRAP = 'toast-wrap';

	insertStyleSheet(`
	.${CLASS_TOAST_WRAP} {position:absolute; z-index:10; top:5px; left:0; width:100%;display: flex; justify-content: center; flex-direction:column; align-items: center;}
	.toast {padding:10px 35px 10px 15px; position:relative; margin-top:10px; min-width:100px; display:inline-block; border-radius:3px; box-shadow:5px 4px 12px #0003;}
	.toast-close {position:absolute; opacity:0.6; display:inline-block; padding:4px 8px; top:3px; right:0; cursor:pointer;}
	.toast-close:before {content:"×"; font-size:18px; line-height:1;}
	.toast-close:hover {opacity:1}
	.toast-${TYPE_INFO} {background-color:#fffffff0;}
	.toast-${TYPE_SUCCESS} {background-color:#fffffff0;}
	.toast-${TYPE_WARING} {background-color:#ff88008c; color:white;}
	.toast-${TYPE_ERROR} {background-color:#ff00008c; color:white;}
	.toast-${TYPE_LOADING} {background-color:#fffffff0; text-shadow:1px 1px 1px #eee;}
`, Theme.Namespace+'toast-style');

	const getToastWrap = () => {
		let toastWrap = document.querySelector(`.${CLASS_TOAST_WRAP}`);
		if (!toastWrap) {
			toastWrap = document.createElement('div');
			toastWrap.className = CLASS_TOAST_WRAP;
			toastWrap.style.display = 'none';
			document.body.appendChild(toastWrap);
		}
		return toastWrap;
	};

	let _guid = 0;
	const guid$1 = prefix => {
		return prefix + (++_guid);
	};

	/**
	 * 默认隐藏时间
	 */
	const DEFAULT_ELAPSED_TIME = {
		[TYPE_INFO]: 2000,
		[TYPE_SUCCESS]: 1500,
		[TYPE_WARING]: 3000,
		[TYPE_ERROR]: 3500,
		[TYPE_LOADING]: 10000,
	};

	class Toast {
		id = null;
		dom = null;
		_closeTm = null;

		constructor(text, opt) {
			let option = Object.assign({
				id: guid$1('Toast-'),
				timeout: 400000,
				show: true,
				closeAble: true,
				class: ''
			}, opt);
			let close_html = option.closeAble ? '<span class="toast-close"></span>' : '';
			this.id = option.id;
			this.dom = document.createElement(`span`);
			this.dom.setAttribute('id', this.id);
			this.dom.className = `toast toast-${option.class}`;
			this.dom.style.display = 'none';
			this.dom.innerHTML = close_html + ' ' + text;
			let toastWrap = getToastWrap();
			toastWrap.appendChild(this.dom);
			if (option.closeAble) {
				this.dom.querySelector('.toast-close').addEventListener('click', () => {
					this.close();
				});
			}
			TOAST_COLLECTION.push(this);

			if (option.show) {
				this.show();
				if (option.timeout) {
					this._closeTm = setTimeout(() => {
						this.close();
					}, option.timeout);
				}
			}
		}

		setHtml(html) {
			this.dom.innerHTML = html;
		}

		show() {
			this.dom.style.display = '';
			let toastWrap = getToastWrap();
			toastWrap.style.display = 'flex';
		}

		close() {
			this.dom.parentNode.removeChild(this.dom);
			let toastWrap = getToastWrap();
			if (!toastWrap.childNodes.length) {
				toastWrap.parentNode.removeChild(toastWrap);
			}
			delete(TOAST_COLLECTION[TOAST_COLLECTION.indexOf(this)]);
			clearTimeout(this._closeTm);
		}

		static closeAll() {
			TOAST_COLLECTION.forEach(t => {
				t.close();
			});
		}

		static showSuccess(text, opt) {
			return new Toast(text, {
				timeout: DEFAULT_ELAPSED_TIME[TYPE_SUCCESS],
				...opt,
				class: TYPE_SUCCESS
			});
		}

		static showInfo(text, opt) {
			return new Toast(text, {
				timeout: DEFAULT_ELAPSED_TIME[TYPE_INFO],
				...opt,
				class: TYPE_INFO
			});
		}

		static showWarning(text, opt) {
			return new Toast(text, {
				timeout: DEFAULT_ELAPSED_TIME[TYPE_WARING],
				...opt,
				class: TYPE_WARING
			});
		}

		static showError(text, opt = {}) {
			return new Toast(text, {
				timeout: DEFAULT_ELAPSED_TIME[TYPE_ERROR],
				...opt,
				class: TYPE_ERROR
			});
		}

		/**
		 * Show loading toast
		 * @param text
		 * @param opt
		 * @returns {Toast}
		 */
		static showLoading(text = '加载中···', opt = {}) {
			return new Toast(text, Object.assign({
				timeout: 0,
				class: 'loading'
			}, opt));
		};
	}

	/**
	 * copy text
	 * @param {String} text
	 * @param {Boolean} silent 是否在不兼容是进行提醒
	 * @returns {boolean} 是否复制成功
	 */
	const copy = (text, silent = false) => {
		let t = createDomByHtml('<textarea readonly="readonly">', document.body);
		t.style.cssText = 'position:absolute; left:-9999px;';
		let y = window.pageYOffset || document.documentElement.scrollTop;
		t.addEventListener('focus', function(){
			window.scrollTo(0, y);
		});
		t.value = text;
		t.select();
		try{
			let succeeded = document.execCommand('copy');
			!silent && Toast.showSuccess(trans('复制成功'));
			return succeeded;
		}catch(err){
			Toast.showWarning(trans('请按键: Ctrl+C, Enter复制内容'), text);
			console.error(err);
		} finally{
			t.parentNode.removeChild(t);
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
		let container = document.createElement('div');
		container.innerHTML = html;
		container.style.position = 'fixed';
		container.style.pointerEvents = 'none';
		container.style.opacity = "0";

		// Detect all style sheets of the page
		let activeSheets = Array.prototype.slice.call(document.styleSheets)
			.filter(function(sheet){
				return !sheet.disabled;
			});

		// Mount the container to the DOM to make `contentWindow` available
		document.body.appendChild(container);

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

	let cache = {
		//src: {state:STATE_*, data: null, error:'', callbacks: []}
	};

	const STATE_PENDING = 1;
	const STATE_SUCCESS = 2;
	const STATE_ERROR = 3;

	const processCallback = (src) => {
		let ch = cache[src];
		if(ch.state === STATE_PENDING){
			return;
		}
		if(ch.state === STATE_SUCCESS){
			let img = new Image();
			img.src = ch.data;
			ch.success_callbacks.forEach(resolve => {
				resolve(img);
			});
			ch.success_callbacks = [];
		}
		else if(ch.state === STATE_ERROR){
			ch.error_callbacks.forEach(reject=>{
				reject(ch.error);
			});
			ch.error_callbacks = [];
		}
	};

	/**
	 * 加载一次图片
	 * @param {String} src
	 * @returns {Promise<unknown>}
	 */
	const loadSingleton = (src) => {
		return new Promise((resolve, reject) => {
			if(!cache[src]){
				cache[src] = {
					state: null,
					data: null,
					error: '',
					success_callbacks: [],
					error_callbacks: []
				};
			}
			cache[src].success_callbacks.push(resolve);
			cache[src].error_callbacks.push(reject);

			if(!cache[src].data){
				let xhr = new XMLHttpRequest();
				xhr.open('GET', src, true);
				xhr.responseType = 'blob';
				xhr.onload = function(){
					if(this.status === 200){
						let blob = this.response;
						let d = convertBlobToBase64(blob);
						d.then(base64 => {
							cache[src].state = STATE_SUCCESS;
							cache[src].data = base64;
							processCallback(src);
						}).catch(error => {
							cache[src].error = error;
							cache[src].state = STATE_ERROR;
							processCallback(src);
						});
					}
				};
				xhr.onerror = function() {
					cache[src].error = 'Error:'+this.statusText;
					cache[src].state = STATE_ERROR;
					processCallback(src);
				};
				xhr.onabort = function(){
					cache[src].error = 'Request abort';
					cache[src].state = STATE_ERROR;
					processCallback(src);
				};
				xhr.send();
			}
			processCallback(src);
		});
	};

	let _base_cache = {};
	const getBase64FromImage = (img) => {
		let src = img.src;
		if(src.indexOf('data:') === 0){
			return img.src;
		}
		if(_base_cache[src]){
			return _base_cache[src];
		}
		let canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		_base_cache[src] = canvas.toDataURL("image/png");
		return _base_cache[src];
	};

	const Img = {
		getBase64FromImage,
		loadSingleton
	};

	const DOM_CLASS = Theme.Namespace+'com-image-viewer';
	const PADDING = '20px';

	const BASE_INDEX = Theme.FullScreenModeIndex;
	const OP_INDEX = BASE_INDEX+1;

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
	.${DOM_CLASS} .civ-ctn {text-align:center; height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-loading, .${DOM_CLASS} .civ-error {position:absolute; top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; font-size:60px; color:#ffffff6e; display:block; animation: ${Theme.Namespace}spin 3s infinite linear;}
	.${DOM_CLASS} .civ-img {height: calc(100% - ${PADDING}*2); padding:0 ${PADDING}; margin-top:${PADDING}; display: flex; justify-content: center; align-items: center;}
	.${DOM_CLASS} .civ-img img {max-height:100%; max-width:100%; box-shadow: 1px 1px 20px #898989;}
`, Theme.Namespace+'img-preview-style');

	class ImgPreview {
		previewDom = null;
		imgSrcList = [];
		currentIndex = 0;
		mode = ImgPreview.MODE_SINGLE;

		static MODE_SINGLE = 1;
		static MODE_MULTIPLE = 2;

		constructor({mode = ImgPreview.MODE_SINGLE} = {}){
			this.previewDom = document.querySelector('.com-image-viewer');
			this.mode = mode;

			if(!this.previewDom){
				this.previewDom = document.createElement('div');
				this.previewDom.style.display = 'none';
				this.previewDom.className = DOM_CLASS;
				this.previewDom.innerHTML =
					`<span class="civ-closer" title="ESC to close">close</span>
				<span class="civ-nav-btn civ-prev" style="display:none;"></span>
				<span class="civ-nav-btn civ-next" style="display:none;"></span>
				<span class="civ-view-option">
					span.
				</span>
				<div class="civ-ctn">
					<span class="civ-loading"></span>
					<span class="civ-error"></span>
					<span class="civ-img"></span>
				</div>`;
				this.previewDom.querySelector('.civ-closer').addEventListener('click', ()=>{this.close();});
				this.previewDom.querySelector('.civ-ctn').addEventListener('click', e=>{
					if(e.target.tagName !== 'IMG'){
						this.close();
					}
				});
				let prev = this.previewDom.querySelector('.civ-prev');
				let next = this.previewDom.querySelector('.civ-next');

				let nav = (toPrev = false)=>{
					let total = this.imgSrcList.length;
					if((toPrev && this.currentIndex === 0) || (!toPrev && this.currentIndex === (total-1))){
						return false;
					}
					toPrev ? this.currentIndex-- : this.currentIndex++;
					this.show(this.imgSrcList[this.currentIndex]);
					this.updateNavState();
				};

				prev.addEventListener('click', e=>{nav(true);});
				next.addEventListener('click', e=>{nav(false);});

				document.body.addEventListener('keydown', e=>{
					if(!this.previewDom){
						return;
					}
					console.log(e);
					if(e.key === 'Escape'){
						this.close();
					}
					if(e.key === 'ArrowLeft'){
						nav(true);
					}
					if(e.key === 'ArrowRight'){
						nav(false);
					}
				});
				document.body.appendChild(this.previewDom);
			}
		}

		/**
		 * show image or image list
		 * @param {String|String[]} imgSrc
		 * @param currentIndex
		 */
		static showImg(imgSrc, currentIndex = 0){
			let mode = typeof(imgSrc) === 'object' ? ImgPreview.MODE_MULTIPLE : ImgPreview.MODE_SINGLE;
			let ip = new ImgPreview({mode});

			if(mode === ImgPreview.MODE_SINGLE){
				let ip = new ImgPreview();
				ip.show(imgSrc);
			} else {
				ip.imgSrcList = imgSrc;
				ip.currentIndex = currentIndex;
				ip.updateNavState();
				ip.show(imgSrc[currentIndex]);
			}
		}

		updateNavState(){
			if(this.mode === ImgPreview.MODE_SINGLE){
				return;
			}

			let prev = this.previewDom.querySelector('.civ-prev');
			let next = this.previewDom.querySelector('.civ-next');
			show(prev);
			show(next);
			let total = this.imgSrcList.length;
			if(this.currentIndex === 0){
				prev.setAttribute('disabled', 'disabled');
			} else {
				prev.removeAttribute('disabled');
			}
			if(this.currentIndex === (total-1)){
				next.setAttribute('disabled', 'disabled');
			}
			else {
				next.removeAttribute('disabled');
			}
		}

		/**
		 * 通过选择器绑定图片查看器
		 * @param {String} imgSelector
		 * @param {String} triggerEvent 触发事件类型，可为 click、dblclick之类的
		 */
		static bindImageViaSelector(imgSelector='img', triggerEvent='click'){
			let images = document.querySelectorAll(imgSelector);
			let imgSrcList = [];
			if(!images.length){
				return;
			}
			Array.from(images).forEach((img,idx)=>{
				imgSrcList.push(img.getAttribute('src'));
				img.addEventListener(triggerEvent, e=>{
					ImgPreview.showImg(imgSrcList, idx);
				});
			});
		}

		show(imgSrc){
			show(this.previewDom);
			let loading = this.previewDom.querySelector('.civ-loading');
			let err = this.previewDom.querySelector('.civ-error');
			let img_ctn = this.previewDom.querySelector('.civ-img');
			img_ctn.innerHTML = '';
			show(loading);
			hide(err);
			Img.loadSingleton(imgSrc).then(img=>{
				hide(loading);
				img_ctn.innerHTML = '';
				img_ctn.appendChild(img);
			}, error=>{
				console.warn(error);
				err.innerHTML = `图片加载失败，<a href="${imgSrc}" target="_blank">查看详情(${error})</a>`;
				show(err);
			});
		}

		close(){
			if(!this.previewDom){
				return;
			}
			this.previewDom.parentNode.removeChild(this.previewDom);
			this.previewDom = null;
		}
	}

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
			if(aim != '#top' && !$(aim).size()){
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

	let OBJ_COLLECTION = {};
	let PRIVATE_VARS = {};
	let GUID_BIND_KEY = 'ywj-com-tip-guid';
	let TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	/**
	 * 绑定事件
	 */
	let bindEvent = function(){
		if(PRIVATE_VARS[this.guid].opt.closeBtn){
			let btn = this.getDom().querySelector('.ywj-tip-close');
			let _this = this;
			btn.addEventListener('click', ()=>{
				this.hide();
			}, false);
			document.body.addEventListener('keyup', function(e){
				if(e.keyCode === KEYS.Esc){
					_this.hide();
				}
			}, false);
		}
	};

	/**
	 * 自动计算方位
	 * @returns {number}
	 */
	let calDir = function(){
		let $body = $('body');
		let $container = this.getDom();
		let width = $container.outerWidth();
		let height = $container.outerHeight();
		let px = this.rel_tag.offset().left;
		let py = this.rel_tag.offset().top;
		let rh = this.rel_tag.outerHeight();
		let rw = this.rel_tag.outerWidth();

		let scroll_left = $body.scrollLeft();
		let scroll_top = $body.scrollTop();

		let viewRegion = getRegion();

		for(let i=0; i<TRY_DIR_MAP.length; i++){
			let dir_offset = getDirOffset(TRY_DIR_MAP[i], width, height, rh, rw);
			let rect = {
				left:px+dir_offset[0],
				top:py+dir_offset[1],
				width: width,
				height: height
			};
			let layout_rect = {
				left:scroll_left,
				top:scroll_top,
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
	 * @param dir
	 * @param width
	 * @param height
	 * @param rh
	 * @param rw
	 * @returns {*}
	 */
	let getDirOffset = function(dir, width, height, rh, rw){
		let offset = {
			11: [-width*0.25+rw/2, rh],
			0: [-width*0.5+rw/2, rh],
			1: [-width*0.75+rw/2, rh],
			2: [-width, -height*0.25+rh/2],
			3: [-width, -height*0.5+rh/2],
			4: [-width, -height*0.75+rh/2],
			5: [-width*0.75+rw/2, -height],
			6: [-width*0.5+rw/2, -height],
			7: [-width*0.25+rw/2, -height],
			8: [rw, -height*0.75 + rh/2],
			9: [rw, -height*0.5 + rh/2],
			10: [rw, -height*0.25 + rh/2]
		};
		return offset[dir];
	};

	/**
	 * 更新位置信息
	 */
	const updatePosition = function(){
		let vars = PRIVATE_VARS[this.guid];
		let dir = vars.opt.dir;
		let $container = this.getDom();
		let width = $container.outerWidth();
		let height = $container.outerHeight();
		let px = this.rel_tag.offset().left;
		let py = this.rel_tag.offset().top;
		let rh = this.rel_tag.outerHeight();
		let rw = this.rel_tag.outerWidth();

		if(dir === 'auto'){
			dir = calDir.call(this);
		}
		$container.attr('class', 'ywj-tip-container-wrap ywj-tip-'+dir);
		let offset = getDirOffset(dir, width, height, rh, rw);
		let x = px + offset[0];
		let y = py + offset[1];

		$container.css({
			left: parseInt(x,10),
			top: parseInt(y,10)
		});
	};

	/**
	 * TIP组件
	 * @param content
	 * @param rel_tag
	 * @param opt
	 * @constructor
	 */
	let Tip = function(content, rel_tag, opt){
		this.guid = guid();
		this.rel_tag = $(rel_tag);
		this.onShow = Hooker(true);
		this.onHide = Hooker(true);
		this.onDestory = Hooker(true);
		PRIVATE_VARS[this.guid] = {};

		opt = Object.assign({
			closeBtn: false, //是否显示关闭按钮
			timeout: 0,
			width: 'auto',
			dir: 'auto'
		}, opt || {});

		let close_html = opt.closeBtn ? `<span class="ywj-tip-close">&#10005;</span>` : ``;
		let html =
			`<div class="ywj-tip-container-wrap" style="display:none;">
			<s class="ywj-tip-arrow ywj-tip-arrow-pt"></s>
			<s class="ywj-tip-arrow ywj-tip-arrow-bg"></s>
			${close_html}
			<div class="ywj-tip-content">${content}</div>
		</div>`;

		PRIVATE_VARS[this.guid].opt = opt;
		let $container = $(html).appendTo($('body'));
		$container.css('width', opt.width);
		PRIVATE_VARS[this.guid].container = $container;
		OBJ_COLLECTION[this.guid] = this;
		bindEvent.call(this);
	};

	/**
	 * @returns {Element|null}
	 */
	Tip.prototype.getDom = function(){
		let vars = PRIVATE_VARS[this.guid];
		return vars.container;
	};

	/**
	 * update content
	 * @param html
	 */
	Tip.prototype.updateContent = function(html){
		this.getDom().find('.ywj-tip-content').html(html);
		updatePosition.call(this);
	};

	Tip.prototype.show = function(){
		//去重判断，避免onShow时间多次触发
		if(this.isShow()){
			return;
		}
		let vars = PRIVATE_VARS[this.guid];
		let _this = this;
		this.getDom().show().stop().animate({opacity:1}, 'fast');
		updatePosition.call(this);
		this.onShow.fire(this);
		if(vars.opt.timeout){
			setTimeout(function(){
				_this.hide();
			}, vars.opt.timeout);
		}
	};

	Tip.prototype.isShow = function(){
		return this.getDom().is(':visible');
	};

	Tip.prototype.hide = function(){
		let _this = this;
		this.getDom().stop().animate({opacity:0}, 'fast', function(){_this.getDom().hide();});
		this.onHide.fire(this);
	};

	Tip.prototype.destroy = function(){
		this.getDom().remove();
		this.onDestory.fire(this);
	};

	Tip.hideAll = function(){
		for(let i in OBJ_COLLECTION){
			OBJ_COLLECTION[i].hide();
		}
	};

	Tip.show = function(content, rel_tag, opt){
		let tip = new Tip(content, rel_tag, opt);
		tip.show();
		return tip;
	};

	/**
	 * 简单节点绑定
	 * @param content
	 * @param rel_tag
	 * @param opt
	 * @returns {*}
	 */
	Tip.bind = function(content, rel_tag, opt){
		let guid = $(rel_tag).data(GUID_BIND_KEY);
		let obj = OBJ_COLLECTION[guid];
		if(!obj){
			let tm;
			let hide = function(){
				tm = setTimeout(function(){
					obj && obj.hide();
				}, 10);
			};

			let show = function(){
				clearTimeout(tm);
				obj.show();
			};

			obj = new Tip(content, rel_tag, opt);
			$(rel_tag).data(GUID_BIND_KEY, obj.guid);

			obj.getDom().hover(show, hide);
			$(rel_tag).hover(show, hide);
		}
		return obj;
	};

	/***
	 * 绑定异步处理函数
	 * @param rel_tag
	 * @param opt
	 * @param loader
	 */
	Tip.bindAsync = function(rel_tag, loader, opt){
		let guid = $(rel_tag).data(GUID_BIND_KEY);
		let obj = OBJ_COLLECTION[guid];
		if(!obj){
			let loading = false;
			obj = Tip.bind('loading...', rel_tag, opt);
			obj.onShow(function(){
				if(loading){
					return;
				}
				loading = true;
				loader(function(html){
					loading = false;
					obj.updateContent(html);
				}, function(error){
					loading = false;
					obj.updateContent(error);
				});
			}, opt.refresh);
		}
	};

	/**
	 * @param $node
	 * @param {Object} param {url, content, refresh}
	 */
	Tip.nodeInit = function($node, param){
		let url = param.url;
		let content = param.content;
		if(url){
			Tip.bindAsync($node, function(on_success, on_error){
				Net.get(url,param).then(function(rsp){
					if(rsp && !rsp.code){
						on_success(rsp.data);
					} else {
						on_error(rsp.message);
					}
				});
			});
		} else {
			Tip.bind(content, $node, param);
		}
	};

	let CLS = 'com-toc';
	let CLS_ACTIVE = 'active';

	let resolve_level = function($h){
		return parseInt($h[0].tagName.replace(/\D/, ''), 10);
	};

	let scroll_top = function(){
		return $(window).scrollTop() || $('body').scrollTop();
	};

	const toc = ($content)=>{
		let html = '<ul class="' + CLS + '">';
		let hs = 'h1,h2,h3,h4,h5';

		//top
		let top_id = 'toc' + guid$2();
		html += '<a href="#' + top_id + '" class="com-toc-top">本页目录</a>';
		createDomByHtml(`<a name="${top_id}"></a>`, document.body);
		let last_lvl = 0;
		let start_lvl = 0;
		$content.find(hs).each(function(){
			let $h = $(this);
			let id = 'toc' + guid$2();
			$('<a name="' + id + '"></a>').insertBefore($h);
			let lv = resolve_level($h);
			if(!start_lvl){
				start_lvl = lv;
			}
			if(!last_lvl){
				html += '<li><a href="#' + id + '">' + $h.text() + '</a>';
			}else if(lv === last_lvl){
				html += '</li><li><a href="#' + id + '">' + $h.text() + '</a>';
			}else if(lv > last_lvl){
				html += '<ul><li><a href="#' + id + '">' + $h.text() + '</a>';
			}else if(lv < last_lvl){
				html += '</li></ul></li>';
				html += '<li><a href="#' + id + '">' + $h.text() + '</a>';
			}
			last_lvl = lv;
		});
		for(let i = 0; i <= (last_lvl - start_lvl); i++){
			html += '</li></ul>';
		}

		let $toc = $(html).appendTo('body');
		$toc.find('a').click(function(){
			let $a = $(this);
			let id = $a.attr('href').replace('#', '');
			$('a[name=' + id + ']');
			location.hash = '#' + id;
			return false;
		});

		//init
		let hash = location.hash.replace('#', '');
		if(hash){
			let $anchor = $('body').find('a[name=' + hash + ']');
			if($anchor.size());
		}

		let upd = function(){
			let top = Math.max($content.offset().top, scroll_top());
			$toc.css({
				left: $content.offset().left + $content.outerWidth(),
				top: top
			});
			$toc.find('li').removeClass(CLS_ACTIVE);
			$toc.find('a').each(function(){
				let $a = $(this);
				let id = $a.attr('href').replace('#', '');
				let $anchor = $('a[name=' + id + ']');
				if($anchor.offset().top > scroll_top()){
					$a.parents('li').addClass(CLS_ACTIVE);
					return false;
				}
			});
		};
		$(window).resize(upd).scroll(upd);
		upd();
	};

	exports.ACBindComponent = ACBindComponent;
	exports.ACEventChainBind = ACEventChainBind;
	exports.ACGetComponents = ACGetComponents;
	exports.BLOCK_TAGS = BLOCK_TAGS;
	exports.Base64Encode = Base64Encode;
	exports.BizEvent = BizEvent;
	exports.COM_ATTR_KEY = COM_ATTR_KEY;
	exports.Dialog = Dialog;
	exports.DialogManager = DialogManager;
	exports.ImgPreview = ImgPreview;
	exports.KEYS = KEYS;
	exports.Ladder = Ladder;
	exports.MD5 = MD5;
	exports.Masker = Masker;
	exports.Net = Net;
	exports.Theme = Theme;
	exports.Thumb = Thumb;
	exports.Tip = Tip;
	exports.Toast = Toast;
	exports.arrayColumn = arrayColumn;
	exports.arrayGroup = arrayGroup;
	exports.arrayIndex = arrayIndex;
	exports.base64Decode = base64Decode;
	exports.base64UrlSafeEncode = base64UrlSafeEncode;
	exports.between = between;
	exports.buildParam = buildParam;
	exports.buttonActiveBind = buttonActiveBind;
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
	exports.entityToString = entityToString;
	exports.escapeAttr = escapeAttr;
	exports.escapeHtml = escapeHtml;
	exports.fireEvent = fireEvent;
	exports.frequencyControl = frequencyControl;
	exports.getFormData = getFormData;
	exports.getHash = getHash;
	exports.getHashObject = getHashObject;
	exports.getRegion = getRegion;
	exports.getUTF8StrLen = getUTF8StrLen;
	exports.getViewHeight = getViewHeight;
	exports.getViewWidth = getViewWidth;
	exports.guid = guid$2;
	exports.hide = hide;
	exports.highlightText = highlightText;
	exports.html2Text = html2Text;
	exports.insertStyleSheet = insertStyleSheet;
	exports.isElement = isElement;
	exports.keepRectCenter = keepRectCenter;
	exports.loadCss = loadCss;
	exports.loadImageInstance = loadImageInstance;
	exports.mergerUriParam = mergerUriParam;
	exports.onStateChange = onStateChange;
	exports.openLinkWithoutReferer = openLinkWithoutReferer;
	exports.pushState = pushState;
	exports.randomString = randomString;
	exports.rectAssoc = rectAssoc;
	exports.rectInLayout = rectInLayout;
	exports.regQuote = regQuote;
	exports.resolveFileExtension = resolveFileExtension;
	exports.resolveFileName = resolveFileName;
	exports.round = round;
	exports.setHash = setHash;
	exports.show = show;
	exports.stringToEntity = stringToEntity;
	exports.toc = toc;
	exports.toggle = toggle;
	exports.trans = trans;
	exports.triggerDomEvent = triggerDomEvent;
	exports.unescapeHtml = unescapeHtml;
	exports.utf8Decode = utf8Decode;
	exports.utf8Encode = utf8Encode;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
