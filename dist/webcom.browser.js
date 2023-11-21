var WebCom = (function (exports) {
	'use strict';

	const GOLDEN_RATIO = (1+Math.sqrt(5))/2 - 1;
	const between = (val, min, max, includeEqual = true) => {
		return includeEqual ? (val >= min && val <= max) : (val > min && val < max);
	};
	const round = (num, precision = 2) => {
		let multiple = Math.pow(10, precision);
		return Math.round(num * multiple) / multiple;
	};

	class BizEvent {
		events = [];
		breakOnFalseReturn = false;
		constructor(breakOnFalseReturn = false){
			this.breakOnFalseReturn = breakOnFalseReturn;
		}
		listen(payload){
			this.events.push(payload);
		}
		remove(payload){
			this.events = this.events.filter(ev => ev !== payload);
		}
		clean(){
			this.events = [];
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
	const onHover = (node, hoverIn, hoverOut)=>{
		node.addEventListener('mouseover', hoverIn);
		node.addEventListener('mouseout', hoverOut);
	};
	const onDocReady = (callback)=>{
		if (document.readyState === 'complete') {
			callback();
		} else {
			document.addEventListener("DOMContentLoaded", callback);
		}
	};
	const triggerDomEvent = (node, event) => {
		if("createEvent" in document){
			let evt = document.createEvent("HTMLEvents");
			evt.initEvent(event.toLowerCase(), false, true);
			node.dispatchEvent(evt);
		}else {
			node.fireEvent("on"+event.toLowerCase());
		}
	};
	const eventDelegate = (container, selector, eventName, payload)=>{
		container.addEventListener(eventName, ev=>{
			let target = ev.target;
			while(target){
				if(target.matches(selector)){
					payload.call(target, target, ev);
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
	};

	const extract = (es_template, params)=>{
		const names = Object.keys(params);
		const values = Object.values(params);
		return new Function(...names, `return \`${es_template}\`;`)(...values);
	};
	const stripSlashes = (str) => {
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
	};
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
	const regQuote = (str)=>{
		return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
	};
	const utf8Decode = (srcStr) => {
		let t = "";
		let n = 0;
		let r = 0,
			c2 = 0,
			c3 = 0;
		while(n < srcStr.length){
			r = srcStr.charCodeAt(n);
			if(r < 128){
				t += String.fromCharCode(r);
				n++;
			}else if(r > 191 && r < 224){
				c2 = srcStr.charCodeAt(n + 1);
				t += String.fromCharCode((r & 31) << 6 | c2 & 63);
				n += 2;
			}else {
				c2 = srcStr.charCodeAt(n + 1);
				c3 = srcStr.charCodeAt(n + 2);
				t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
				n += 3;
			}
		}
		return t
	};
	const isValidUrl = urlString => {
		try{
			return Boolean(new URL(urlString));
		}catch(e){
			return false;
		}
	};
	const isJSON = (json)=>{
		let is_json = false;
		try {
			JSON.parse(json);
			is_json = true;
		} catch (error) {
		}
		return is_json;
	};
	const utf8Encode = (srcStr) => {
		srcStr = srcStr.replace(/\r\n/g, "n");
		let t = "";
		for(let n = 0; n < srcStr.length; n++){
			let r = srcStr.charCodeAt(n);
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
	const randomString = (length = 6, sourceStr = DEFAULT_RANDOM_STRING)=>{
		let codes = '';
		for(let i = 0; i < length; i++){
			let rnd =Math.round(Math.random()*(sourceStr.length - 1));
			codes += sourceStr.substring(rnd, rnd + 1);
		}
		return codes;
	};
	const strToPascalCase = (str, capitalize_first = false)=>{
		let words = [];
		str.replace(/[-_\s+]/g, ' ').split(' ').forEach((word, idx) => {
			words.push((idx === 0 && !capitalize_first) ? word : capitalize(word));
		});
		return words.join('');
	};
	const capitalize = (str) => {
		if(typeof str !== 'string'){
			return ''
		}
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
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

	const BLOCK_TAGS = [
		'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'div', 'address', 'pre', 'form',
		'table', 'li', 'ol', 'ul', 'tr', 'td', 'caption', 'blockquote', 'center','legend',
		'dl', 'dt', 'dd', 'dir', 'fieldset', 'noscript', 'noframes', 'menu', 'isindex', 'samp',
		'nav','header', 'aside', 'dialog','section', 'footer','article'
	];
	const REMOVABLE_TAGS = [
		'style', 'comment', 'select', 'option', 'script', 'title', 'head', 'button',
	];
	const html2Text = (html)=>{
		REMOVABLE_TAGS.forEach(tag=>{
			html = html.replace(new RegExp(tag, 'ig'), '');
		});
		html = html.replace(/[\r|\n]/g, '');
		html = html.replace(/<(\w+)([^>]*)>/g, function(ms, tag, tail){
			if(BLOCK_TAGS.includes(tag.toLowerCase())){
				return "\n";
			}
			return "";
		});
		html = html.replace(/<\/(\w+)([^>]*)>/g, function(ms, tag, tail){
			return "";
		});
		html = html.replace(/<[^>]+>/g, '');
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
		html = html.replace(/&#(\d+);/, function(ms, dec){
			return String.fromCharCode(dec);
		});
		html = html.replace(/&amp;/ig, '&');
		html = html.trim();
		return html;
	};
	const dimension2Style = h => {
		if(isNum(h)){
			return h + 'px';
		}
		return h+'';
	};
	const cssSelectorEscape = (str)=>{
		return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	};
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
		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		_helper_div.innerHTML = str;
		str = _helper_div.textContent;
		_helper_div.textContent = '';
		return str;
	};
	const escapeHtml = str => {
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\s/g, "&nbsp;")
			.replace(/[\r\n]/g, '<br/>');
	};
	const unescapeHtml = (html)=>{
		return String(html)
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/<br.*>/, "\n");
	};
	const escapeAttr = (s, preserveCR = '') => {
		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s)
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\r\n/g, preserveCR)
			.replace(/[\r\n]/g, preserveCR);
	};
	const stringToEntity = (str, radix) => {
		let arr = str.split('');
		radix = radix || 0;
		return arr.map(item =>
			`&#${(radix ? 'x' + item.charCodeAt(0).toString(16) : item.charCodeAt(0))};`).join('')
	};
	const highlightText = (text, kw, replaceTpl = '<span class="matched">%s</span>') => {
		if(!kw){
			return text;
		}
		return text.replace(new RegExp(regQuote(kw), 'ig'), match => {
			return replaceTpl.replace('%s', match);
		});
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
	const getDomOffset = (target) => {
		let rect = target.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
			top: rect.top,
			bottom: rect.bottom,
			left: rect.left,
			right: rect.right,
			x: rect.x,
			y: rect.y,
		}
	};
	const fireEvent = (el, event) => {
		if("createEvent" in document){
			let evo = document.createEvent("HTMLEvents");
			evo.initEvent(event, false, true);
			el.dispatchEvent(evo);
		}else {
			el.fireEvent("on" + event);
		}
	};
	const isButton = (el) => {
		return el.tagName === 'BUTTON' ||
			(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
	};
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
	const buttonActiveBind = (button, payload, cancelBubble = false) => {
		button.addEventListener('click', payload, cancelBubble);
		button.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Space || e.keyCode === KEYS.Enter){
				payload.call(button, e);
			}
		}, cancelBubble);
	};
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
	const keepRectInContainer = (objDim, ctnDim = {
		left: 0,
		top: 0,
		width: window.innerWidth,
		height: window.innerHeight
	}) => {
		let ret = {left: objDim.left, top: objDim.top};
		if(objDim.width > ctnDim.width || objDim.height > ctnDim.height){
			return ret;
		}
		if((objDim.width + objDim.left) > (ctnDim.width + ctnDim.left)){
			ret.left = objDim.left - ((objDim.width + objDim.left) - (ctnDim.width + ctnDim.left));
		}
		if((objDim.height + objDim.top) > (ctnDim.height + ctnDim.top)){
			ret.top = objDim.top - ((objDim.height + objDim.top) - (ctnDim.height + ctnDim.top));
		}
		if(objDim.left < ctnDim.left){
			ret.left = ctnDim.left;
		}
		if(objDim.top < ctnDim.top){
			ret.top = ctnDim.top;
		}
		return ret;
	};
	const getDomDimension = (dom) => {
		let org_visibility = dom.style.visibility;
		let org_display = dom.style.display;
		let width, height;
		dom.style.visibility = 'hidden';
		dom.style.display = 'block';
		width = dom.clientWidth;
		height = dom.clientHeight;
		dom.style.visibility = org_visibility;
		dom.style.display = org_display;
		return {width, height};
	};
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
	const isElement = (obj) => {
		try{
			return obj instanceof HTMLElement;
		}catch(e){
			return (typeof obj === "object") &&
				(obj.nodeType === 1) && (typeof obj.style === "object") &&
				(typeof obj.ownerDocument === "object");
		}
	};
	let _c = {};
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
	const insertStyleSheet = (styleSheetStr, id = '', doc = document) => {
		let style = doc.createElement('style');
		doc.head.appendChild(style);
		style.innerHTML = styleSheetStr;
		if(id){
			style.id = id;
		}
		return style;
	};
	const getRegion = (win = window) => {
		let info = {};
		let doc = win.document;
		info.screenLeft = win.screenLeft ? win.screenLeft : win.screenX;
		info.screenTop = win.screenTop ? win.screenTop : win.screenY;
		if(win.innerWidth){
			info.visibleWidth = win.innerWidth;
			info.visibleHeight = win.innerHeight;
			info.horizenScroll = win.pageXOffset;
			info.verticalScroll = win.pageYOffset;
		}else {
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
	const rectInLayout = (rect, layout) => {
		return between(rect.top, layout.top, layout.top + layout.height) && between(rect.left, layout.left, layout.left + layout.width)
			&& between(rect.top + rect.height, layout.top, layout.top + layout.height) && between(rect.left + rect.width, layout.left, layout.left + layout.width);
	};
	const setStyle = (dom, style = {}) => {
		for(let key in style){
			key = strToPascalCase(key);
			dom.style[key] = dimension2Style(style[key]);
		}
	};
	const nodeHighlight = (node, pattern, hlClass) => {
		let skip = 0;
		if(node.nodeType === 3){
			pattern = new RegExp(pattern, 'i');
			let pos = node.data.search(pattern);
			if(pos >= 0 && node.data.length > 0){
				let match = node.data.match(pattern);
				let spanNode = document.createElement('span');
				spanNode.className = hlClass;
				let middleBit = node.splitText(pos);
				middleBit.splitText(match[0].length);
				let middleClone = middleBit.cloneNode(true);
				spanNode.appendChild(middleClone);
				middleBit.parentNode.replaceChild(spanNode, middleBit);
				skip = 1;
			}
		}else if(node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)){
			for(let i = 0; i < node.childNodes.length; ++i){
				i += nodeHighlight(node.childNodes[i], pattern, hlClass);
			}
		}
		return skip;
	};
	const tabConnect = (tabs, contents, option = {}) => {
		let {contentActiveClass = 'active', tabActiveClass = 'active', triggerEvent = 'click'} = option;
		if(typeof(tabs) === 'string'){
			tabs = document.querySelectorAll(tabs);
		}
		if(typeof(contents) === 'string'){
			contents = document.querySelectorAll(contents);
		}
		tabs.forEach((tab, idx) => {
			tab.addEventListener(triggerEvent, e => {
				contents.forEach(ctn => {
					ctn.classList.remove(contentActiveClass);
				});
				contents[idx].classList.add(contentActiveClass);
				tabs.forEach(t => {
					t.classList.remove(tabActiveClass);
				});
				tab.classList.add(tabActiveClass);
			});
		});
	};
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
	function repaint(element, delay = 0){
		setTimeout(() => {
			try{
				element.hidden = true;
				element.offsetHeight;
				element.hidden = false;
			}catch(_){
			}
		}, delay);
	}
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
	const exitFullScreen = () => {
		return document.exitFullscreen();
	};
	const toggleFullScreen = (element) => {
		return new Promise((resolve, reject) => {
			if(!isInFullScreen()){
				enterFullScreen(element).then(resolve).catch(reject);
			}else {
				exitFullScreen().then(resolve).catch(reject);
			}
		})
	};
	const isInFullScreen = () => {
		return !!document.fullscreenElement;
	};
	let CURRENT_WINDOW;
	const setContextWindow = (win) => {
		CURRENT_WINDOW = win;
	};
	const getContextDocument = () => {
		let win = getContextWindow();
		return win.document;
	};
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
	const setCookie = (name, value, days, path='/') => {
		var expires = "";
		if(days){
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path="+path;
	};
	const getCookie = (name) => {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++){
			var c = ca[i];
			while(c.charAt(0) == ' ') c = c.substring(1, c.length);
			if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	};
	const deleteCookie = (name) => {
		document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	};

	const NS$1 = 'WebCom-';
	const VAR_PREFIX = '--' + NS$1;
	const ICON_FONT = NS$1 + 'iconfont';
	const CSS_VAR_COLOR = VAR_PREFIX + 'color';
	const CSS_VAR_COLOR_LIGHTEN = VAR_PREFIX + 'color-lighten';
	const CSS_VAR_DISABLE_COLOR = VAR_PREFIX + 'disable-color';
	const CSS_VAR_BACKGROUND_COLOR = VAR_PREFIX + 'background-color';
	const CSS_VAR_PANEL_SHADOW = VAR_PREFIX + 'panel-shadow';
	const CSS_VAR_PANEL_BORDER = VAR_PREFIX + 'panel-border';
	const CSS_VAR_PANEL_BORDER_COLOR = VAR_PREFIX + 'panel-border-color';
	const CSS_VAR_PANEL_RADIUS = VAR_PREFIX + 'panel-radius';
	const CSS_VAR_FULL_SCREEN_BACKDROP_FILTER = VAR_PREFIX + 'full-screen-backdrop-filter';
	const CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR = VAR_PREFIX + 'full-screen-background-color';
	insertStyleSheet(`
@font-face {
	font-family: '${ICON_FONT}';  /* Project id 3359671 */
	src: url('//at.alicdn.com/t/c/font_3359671_had9uz7ihif.woff2?t=1692238550574') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_had9uz7ihif.woff?t=1692238550574') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_had9uz7ihif.ttf?t=1692238550574') format('truetype');
}
:root {
	${CSS_VAR_COLOR}:#333;
	${CSS_VAR_COLOR_LIGHTEN}:#666;
	${CSS_VAR_DISABLE_COLOR}:#aaa;
	${CSS_VAR_BACKGROUND_COLOR}:#fff;
	
	${CSS_VAR_PANEL_SHADOW}:1px 1px 5px #bcbcbcb3;
	${CSS_VAR_PANEL_BORDER_COLOR}:#ccc;
	${CSS_VAR_PANEL_BORDER}:1px solid var(${CSS_VAR_PANEL_BORDER_COLOR});
	${CSS_VAR_PANEL_RADIUS}:4px;
	
	${CSS_VAR_FULL_SCREEN_BACKDROP_FILTER}:blur(4px);
	${CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR}:#33333342;
}`, NS$1+'style');
	const Theme = {
		Namespace: NS$1,
		CssVarPrefix: VAR_PREFIX,
		CssVar: {
			'COLOR': CSS_VAR_COLOR,
			'CSS_LIGHTEN': CSS_VAR_COLOR_LIGHTEN,
			'DISABLE_COLOR': CSS_VAR_DISABLE_COLOR,
			'BACKGROUND_COLOR': CSS_VAR_BACKGROUND_COLOR,
			'PANEL_SHADOW': CSS_VAR_PANEL_SHADOW,
			'PANEL_BORDER': CSS_VAR_PANEL_BORDER,
			'PANEL_BORDER_COLOR': CSS_VAR_PANEL_BORDER_COLOR,
			'PANEL_RADIUS': CSS_VAR_PANEL_RADIUS,
			'FULL_SCREEN_BACKDROP_FILTER': CSS_VAR_FULL_SCREEN_BACKDROP_FILTER,
			'FULL_SCREEN_BACKGROUND_COLOR': CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR,
		},
		IconFont: ICON_FONT,
		TipIndex: 10,
		MaskIndex: 100,
		DialogIndex: 1000,
		FullScreenModeIndex: 10000,
		ContextIndex: 100000,
		ToastIndex: 1000000,
	};

	const COM_ID$4 = Theme.Namespace + 'toast';
	const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
	const rotate_animate = Theme.Namespace + '-toast-rotate';
	const fadeIn_animate = Theme.Namespace + '-toast-fadein';
	const fadeOut_animate = Theme.Namespace + '-toast-fadeout';
	const FADEIN_TIME = 200;
	const FADEOUT_TIME = 500;
	insertStyleSheet(`
	@keyframes ${rotate_animate} {
	    0% {transform:scale(1.4) rotate(0deg);}
	    100% {transform:scale(1.4) rotate(360deg);}
	}
	@keyframes ${fadeIn_animate} {
		0% { opacity: 0; }
		100% { opacity: 1; } 
	}
	@keyframes ${fadeOut_animate} {
		0% { opacity:1;}
		100% { opacity: 0} 
	}
	.${TOAST_CLS_MAIN}-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center; z-index:${Theme.ToastIndex};}
	.${TOAST_CLS_MAIN}>div {margin-bottom:0.5rem;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:.5rem 1rem .5rem 2.8rem; text-align:left; line-height:1.5rem; background-color:var(${Theme.CssVar.BACKGROUND_COLOR});color:var(${Theme.CssVar.COLOR});box-shadow:var(${Theme.CssVar.PANEL_SHADOW}); animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";font-family:${Theme.IconFont}; position:absolute; font-size:1.4rem; margin-left:-1.8rem;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;} 
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform:scale(1.4);will-change: transform}
`, COM_ID$4 + '-style');
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
		constructor(message, type = null, timeout = null){
			this.message = message;
			this.type = type || Toast.TYPE_SUCCESS;
			this.timeout = timeout === null ? Toast.DEFAULT_TIME_MAP[this.type] : timeout;
		}
		static showToast = (message, type = null, timeout = null, timeoutCallback = null) => {
			let toast = new Toast(message, type, timeout);
			toast.show(timeoutCallback);
			return toast;
		}
		static showInfo = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_INFO, this.DEFAULT_TIME_MAP[Toast.TYPE_INFO], timeoutCallback);
		}
		static showSuccess = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS], timeoutCallback);
		}
		static showWarning = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_WARNING, this.DEFAULT_TIME_MAP[Toast.TYPE_WARNING], timeoutCallback);
		}
		static showError = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_ERROR, this.DEFAULT_TIME_MAP[Toast.TYPE_ERROR], timeoutCallback);
		}
		static showLoading = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_LOADING, this.DEFAULT_TIME_MAP[Toast.TYPE_LOADING], timeoutCallback);
		}
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
		hide(fadeOut = false){
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
	window[COM_ID$4] = Toast;
	let CONTEXT_WINDOW$2 = getContextWindow();
	let ToastClass = CONTEXT_WINDOW$2[COM_ID$4] || Toast;

	const resolveFileExtension = fileName => {
		if(fileName.indexOf('.')<0){
			return '';
		}
		let segList = fileName.split('.');
		return segList[segList.length-1];
	};
	const resolveFileName = (fileName)=>{
		fileName = fileName.replace(/.*?[/|\\]/ig, '');
		return fileName.replace(/\.[^.]*$/g, "");
	};
	const readFileInLine = (file, linePayload, onFinish = null, onError = null) => {
		const CHUNK_SIZE = 1024;
		const reader = new FileReader();
		let offset = 0;
		let line_buff = '';
		const seek = () => {
			if(offset < file.size){
				let slice = file.slice(offset, offset + CHUNK_SIZE);
				reader.readAsArrayBuffer(slice);
				offset += CHUNK_SIZE;
			} else {
				onFinish();
			}
		};
		reader.onload = evt => {
			line_buff += new TextDecoder().decode(new Uint8Array(reader.result));
			if(line_buff.indexOf("\n") >= 0){
				let break_down = false;
				let lines = line_buff.split("\n");
				line_buff = lines.pop();
				lines.find(line => {
					if(linePayload(line) === false){
						break_down = true;
						return true;
					}
				});
				if(break_down){
					return;
				}
			}
			seek();
		};
		reader.onerror = (err) => {
			console.error(err);
			onError(err);
		};
		seek();
	};

	const CODE_TIMEOUT = 508;
	const CODE_ABORT = 509;
	const DEFAULT_TIMEOUT = 0;
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
	const REQUEST_FORMAT = {
		JSON: 'JSON',
		FORM: 'FORM',
	};
	const REQUEST_CONTENT_TYPE_MAP = {
		[REQUEST_FORMAT.JSON]: 'application/json',
		[REQUEST_FORMAT.FORM]: 'application/x-www-form-urlencoded',
	};
	const REQUEST_DATA_HANDLE_MAP = {
		[REQUEST_FORMAT.JSON]: (data, method) => {
			if(method === HTTP_METHOD.GET){
				return '';
			}
			return JSON.stringify(data);
		},
		[REQUEST_FORMAT.FORM]: (data, method) => {
			if(method === HTTP_METHOD.GET){
				return '';
			}
			return QueryString.stringify(data);
		}
	};
	const RESPONSE_FORMAT = {
		JSON: 'JSON',
		XML: 'XML',
		HTML: 'HTML',
		TEXT: 'TEXT',
	};
	const RESPONSE_ACCEPT_TYPE_MAP = {
		[RESPONSE_FORMAT.JSON]: 'application/json',
		[RESPONSE_FORMAT.XML]: 'text/xml',
		[RESPONSE_FORMAT.HTML]: 'text/html',
		[RESPONSE_FORMAT.TEXT]: 'text/plain',
	};
	const mergerUriParam = (uri, data) => {
		return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
	};
	const setHash = data => {
		location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
	};
	const getHash = () => {
		return location.hash ? location.hash.substring(1) : '';
	};
	const requestJSON = (url, data, method = HTTP_METHOD.GET, option = {}) => {
		return method === HTTP_METHOD.GET ? Net.getJSON(url, data, option) : Net.postJSON(url, data, option);
	};
	class Net {
		cgi = null;
		data = null;
		option = {
			method: HTTP_METHOD.GET,
			timeout: DEFAULT_TIMEOUT,
			requestFormat: REQUEST_FORMAT.FORM,
			responseFormat: RESPONSE_FORMAT.TEXT,
			headers: {},
		};
		xhr = null;
		onError = new BizEvent();
		onResponse = new BizEvent();
		onStateChange = new BizEvent();
		onProgress = new BizEvent();
		constructor(cgi, data, option = {}){
			this.cgi = cgi;
			this.data = data;
			this.option = {
				...this.option,
				...option
			};
			if(this.option.method === HTTP_METHOD.GET && this.data){
				this.cgi = mergerUriParam(this.cgi, this.data);
			}
			this.xhr = new XMLHttpRequest();
			this.xhr.open(this.option.method, this.cgi, true);
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
				let ret;
				switch(option.responseFormat){
					case RESPONSE_FORMAT.JSON:
						ret = JSON.parse(this.xhr.responseText);
						break;
					case RESPONSE_FORMAT.XML:
					case RESPONSE_FORMAT.TEXT:
					case RESPONSE_FORMAT.HTML:
					default:
						ret = this.xhr.responseText;
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
		send(){
			let data = this.data ? REQUEST_DATA_HANDLE_MAP[this.option.requestFormat](this.data) : null;
			this.xhr.send(data);
		}
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
				req.onResponse.listen(ret=>{
					resolve(ret);
				});
				req.onError.listen(error=>{
					reject(error);
				});
				req.send();
			});
		}
	}
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
			let query = [];
			for(let param in data){
				if(data.hasOwnProperty(param)){
					if(data[param] === null){
						continue;
					}
					if(typeof (data[param]) === 'object' && data[param].length){
						data[param].forEach(item => {
							query.push(encodeURI(param + '=' + item));
						});
					}else if(typeof (data[param]) === 'object');else {
						query.push(encodeURI(param + '=' + data[param]));
					}
				}
			}
			return query.join('&')
		}
	};
	const openLinkWithoutReferer = (link) => {
		let instance = window.open("about:blank");
		instance.document.write("<meta http-equiv=\"refresh\" content=\"0;url=" + link + "\">");
		instance.document.close();
		return false;
	};

	let _guid = 0;
	const guid = (prefix = '') => {
		return 'guid_' + (prefix || randomString(6)) + (++_guid);
	};
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
	const getLibModule = async () => {
		let script = getLibEntryScript();
		return await import(script);
	};
	const getLibModuleTop = (() => {
		if(top === window){
			return getLibModule;
		}
		if(top.WEBCOM_GET_LIB_MODULE){
			return top.WEBCOM_GET_LIB_MODULE;
		}
		throw "No WebCom library script loaded detected.";
	})();
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
	const doOnce = (markKey, dataFetcher = null, storageType = 'storage') => {
		const MARKUP_STR_VAL = 'TRUE';
		let getMarkState = (key) => {
			switch(storageType.toLowerCase()){
				case 'cookie':
					return getCookie(key) === MARKUP_STR_VAL;
				case 'storage':
					return window.localStorage.getItem(key) === MARKUP_STR_VAL;
				case 'session':
					return window.sessionStorage.getItem(key) === MARKUP_STR_VAL;
				default:
					throw "no support:" + storageType;
			}
		};
		let markUp = (key) => {
			switch(storageType.toLowerCase()){
				case 'cookie':
					return setCookie(key, MARKUP_STR_VAL);
				case 'storage':
					return window.localStorage.setItem(key, MARKUP_STR_VAL);
				case 'session':
					return window.sessionStorage.setItem(key, MARKUP_STR_VAL);
				default:
					throw "no support:" + storageType;
			}
		};
		return new Promise((onHit, noHit) => {
			if(!getMarkState(markKey)){
				if(typeof (dataFetcher) === 'function'){
					dataFetcher().then(() => {
						markUp(markKey);
						onHit();
					}, () => {
						markUp(markKey);
						noHit();
					});
				}else {
					markUp(markKey);
					onHit();
				}
			}else {
				noHit();
			}
		});
	};
	class ParallelPromise {
		parallel_limit = 0;
		current_running_count = 0;
		task_stack = [
		];
		constructor(parallelLimit){
			if(parallelLimit < 1){
				throw "最大并发数量必须大于0";
			}
			this.parallel_limit = parallelLimit;
		}
		loop(){
			for(let i = 0; i < (this.parallel_limit - this.current_running_count); i++){
				if(!this.task_stack.length){
					return;
				}
				this.current_running_count++;
				let {promiseFn, args, resolve, reject} = this.task_stack.shift();
				promiseFn(...args).then(resolve, reject).finally(() => {
					this.current_running_count--;
					this.loop();
				});
			}
		}
		addPromiseFn(promiseFn, ...args){
			console.log('并发任务添加：', args);
			return new Promise((resolve, reject) => {
				this.task_stack.push({
					promiseFn: promiseFn,
					args: args,
					resolve,
					reject
				});
				this.loop();
			});
		}
	}
	const isObject = (item) => {
		return (item && typeof item === 'object' && !Array.isArray(item));
	};
	const mergeDeep = (target, ...sources) => {
		if(!sources.length) return target;
		const source = sources.shift();
		if(isObject(target) && isObject(source)){
			for(const key in source){
				if(isObject(source[key])){
					if(!target[key]){
						Object.assign(target, {[key]: {}});
					}else {
						target[key] = Object.assign({}, target[key]);
					}
					mergeDeep(target[key], source[key]);
				}else {
					Object.assign(target, {[key]: source[key]});
				}
			}
		}
		return mergeDeep(target, ...sources);
	};
	const isPromise = (obj)=>{
		return obj && typeof(obj) === 'object' && obj.then && typeof(obj.then) === 'function';
	};
	const PROMISE_STATE_PENDING = 'pending';
	const PROMISE_STATE_FULFILLED = 'fulfilled';
	const PROMISE_STATE_REJECTED = 'rejected';
	const getPromiseState = (promise)=>{
		const t = {};
		return Promise.race([promise, t])
			.then(v => (v === t) ? PROMISE_STATE_PENDING : PROMISE_STATE_FULFILLED)
			.catch(() => PROMISE_STATE_REJECTED);
	};
	window.WEBCOM_GET_LIB_MODULE = getLibModule;
	window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;

	const arrayColumn = (arr, col_name) => {
		let data = [];
		for(let i in arr){
			data.push(arr[i][col_name]);
		}
		return data;
	};
	const arrayIndex = (arr, val) => {
		for(let i in arr){
			if(arr[i] === val){
				return i;
			}
		}
		return null;
	};
	const isEquals = (obj1, obj2) => {
		let keys1 = Object.keys(obj1);
		let keys2 = Object.keys(obj2);
		return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] === obj2[key]);
	};
	const arrayDistinct = (arr) => {
		let tmpMap = new Map();
		return arr.filter(item => {
			if(!tmpMap.has(item)){
				tmpMap.set(item, true);
				return true;
			}
		});
	};
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
	const sortByKey = (obj) => {
		return Object.keys(obj).sort().reduce(function(result, key){
			result[key] = obj[key];
			return result;
		}, {});
	};
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
	const objectPushByPath = (path, value, srcObj = {}, glue = '.') => {
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
	const objectGetByPath = (obj, path, glue = '.') => {
		let ps = path.split(glue);
		for(let i = 0, len = ps.length; i < len; i++){
			if(obj[ps[i]] === undefined){
				return null;
			}
			obj = obj[ps[i]];
		}
		return obj;
	};
	const arrayFilterTree = (parent_id, all_list, option = {}, level = 0, group_by_parents = []) => {
		option = Object.assign({
			return_as_tree: false,
			level_key: 'tree_level',
			id_key: 'id',
			parent_id_key: 'parent_id',
			children_key: 'children'
		}, option);
		let pn_k = option.parent_id_key;
		let lv_k = option.level_key;
		let id_k = option.id_key;
		let as_tree = option.return_as_tree;
		let c_k = option.children_key;
		let result = [];
		group_by_parents = group_by_parents.length ?  group_by_parents : arrayGroup(all_list, pn_k);
		all_list.forEach(item=>{
			if(item[pn_k] === parent_id){
				item[lv_k] = level;
				if(!option.return_as_tree){
					result.push(item);
				}
				if(item[id_k] !== undefined && group_by_parents[item[id_k]] !== undefined && group_by_parents[item[id_k]]){
					let subTrees = arrayFilterTree(item[id_k], all_list, option, level + 1, group_by_parents);
					if(subTrees){
						if(as_tree){
							item[c_k] = subTrees;
						}else {
							result = result.concat(...subTrees);
						}
					}
				}
				if(as_tree){
					result.push(item);
				}
			}
		});
		return result;
	};

	const inputAble = el => {
		if(el.disabled ||
			el.readOnly ||
			el.tagName === 'BUTTON' ||
			(el.tagName === 'INPUT' && ['hidden', 'button','submit', 'reset'].includes(el.type))
		){
			return false;
		}
		return true;
	};
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
	const getAvailableElements = (dom, ignore_empty_name = false) => {
		let els = dom.querySelectorAll('input,textarea,select');
		return Array.from(els).filter(el => {
			return !isButton(el) && !el.disabled && (ignore_empty_name || el.name);
		});
	};
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
	const formSerializeString = (dom, validate= true)=>{
		let data_list = getFormDataAvailable(dom, validate);
		let data_string_list = [];
		data_list.forEach(item => {
			let [name, value] = item;
			data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(value)));
		});
		return data_string_list.join('&');
	};
	const serializePhpFormToJSON = (dom, validate = true)=>{
		let data_list = getFormDataAvailable(dom, validate);
		let json_obj = {};
		data_list.forEach(item => {
			let [name, value] = item;
			if(name.indexOf('[') < 0){
				json_obj[name] = value;
				return;
			}
			let name_path = name.replace(/\[]$/, '.0').replace(/]/g, '').replace(/\[/g, '.');
			objectPushByPath(name_path, value, json_obj, '.');
		});
		return json_obj;
	};
	const getFormDataAvailable = (dom, validate = true) => {
		if(validate && !formValidate(dom)){
			return [];
		}
		let els = getAvailableElements(dom);
		let data_list = [];
		els.forEach(el=>{
			let name = el.name;
			let value = getElementValue(el);
			if(value !== null){
				data_list.push([name, value]);
			}
		});
		return data_list;
	};
	const formSerializeJSON = (dom, validate = true) => {
		let json_obj = {};
		let data_list = getFormDataAvailable(dom, validate);
		let name_counts = {};
		data_list.forEach(item=>{
			let [name, value] = item;
			if(name_counts[name] === undefined){
				name_counts[name] = 1;
			} else {
				name_counts[name]++;
			}
		});
		data_list.forEach(item => {
			let [name, value] = item;
			if(name_counts[name] > 1){
				if(json_obj[name] === undefined){
					json_obj[name] = [value];
				}else {
					json_obj[name].push(value);
				}
			}else {
				json_obj[name] = value;
			}
		});
		return json_obj;
	};
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
	const resetFormChangedState = (form) => {
		let us_sid = form.getAttribute(_form_us_sid_attr_key);
		if(!us_sid){
			throw "Form no init by bindFormUnSavedAlert()";
		}
		_form_data_cache_init[us_sid] = _form_data_cache_new[us_sid] = formSerializeJSON(form, false);
	};
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
	const buildHtmlHidden = (maps)=>{
		let html = '';
		for(let key in maps){
			let val = maps[key] === null ? '' : maps[key];
			html += `<input type="hidden" name="${escapeAttr(key)}" value="${escapeAttr(val)}"/>`;
		}
		return html;
	};

	const fixFormAction = (form, event = null) => {
		if(event && event.submitter && event.submitter.formAction){
			return event.submitter.formAction;
		}
		return form.action;
	};
	class ACAsync {
		static REQUEST_FORMAT = REQUEST_FORMAT.JSON;
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
		static active(node, param = {}, event = null){
			return new Promise((resolve, reject) => {
				let url, data, method,
					onsuccess = ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE;
				if(param.onsuccess){
					if(typeof (param.onsuccess) === 'string'){
						onsuccess = window[param.onsuccess];
					}else {
						onsuccess = param.onsuccess;
					}
				}
				if(node.tagName === 'FORM'){
					url = fixFormAction(node, event);
					data = ACAsync.REQUEST_FORMAT === REQUEST_FORMAT.JSON ? formSerializeJSON(node) : formSerializeString(node);
					method = node.method.toLowerCase() === 'post' ? 'post' : 'get';
				}else if(node.tagName === 'A'){
					url = node.href;
					method = 'get';
				}
				url = param.url || url;
				method = param.method || method || 'get';
				data = param.data || data;
				let loader = ToastClass.showLoadingLater('正在请求中，请稍候···');
				requestJSON(url, data, method, {requestFormat: ACAsync.REQUEST_FORMAT}).then(rsp => {
					if(rsp.code === 0){
						onsuccess(rsp);
						resolve();
					}else {
						console.error('Request Error:', url, data, method, rsp);
						ToastClass.showError(rsp.message || '系统错误');
						reject(`系统错误(${rsp.message})`);
					}
				}, err => {
					ToastClass.showError(err);
					reject(err);
				}).finally(() => {
					loader && loader.hide();
				});
			})
		}
	}

	let default_masker = null;
	let CSS_CLASS = Theme.Namespace + '-masker';
	const showMasker = (masker) => {
		if(!masker){
			masker = createDomByHtml(`<div class="${CSS_CLASS}"></div>`, document.body);
		}
		masker.style.display = '';
		return masker;
	};
	const hideMasker = (masker) => {
		masker && (masker.style.display = 'none');
	};
	const Masker = {
		zIndex: Theme.MaskIndex,
		show: () => {
			default_masker = showMasker(default_masker);
		},
		hide: () => {
			hideMasker(default_masker);
		},
		instance: () => {
			let new_masker;
			return {
				show: () => {
					new_masker = showMasker(new_masker);
				},
				hide: () => {
					hideMasker(new_masker);
				}
			}
		}
	};
	insertStyleSheet(`
.${CSS_CLASS} {
	position:fixed;
	top:0;left:0;
	right:0;
	bottom:0;
	background:var(${Theme.CssVar.FULL_SCREEN_BACKGROUND_COLOR});
	backdrop-filter:var(${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER});
	z-index:${Masker.zIndex}}
`, Theme.Namespace + 'masker-style');

	const COM_ID$3 = Theme.Namespace + 'dialog';
	const DLG_CLS_PREF = COM_ID$3;
	const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
	const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
	const DLG_CLS_OP = DLG_CLS_PREF + '-op';
	const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
	const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
	const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';
	const STATE_ACTIVE = 'active';
	const STATE_DISABLED = 'disabled';
	const STATE_HIDDEN = 'hidden';
	const DIALOG_TYPE_ATTR_KEY = 'data-dialog-type';
	const TYPE_NORMAL = 'normal';
	const TYPE_PROMPT = 'prompt';
	const TYPE_CONFIRM = 'confirm';
	const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF + '-ctn-iframe';
	const DLG_CTN_TYPE_HTML = DLG_CLS_PREF + '-ctn-html';
	insertStyleSheet(`
	.${DLG_CLS_PREF} {display:block; border-radius:var(${Theme.CssVar.PANEL_RADIUS}); overflow:hidden; padding:0; box-sizing:border-box; width:calc(100% - 2 * 5em); background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); color:var(${Theme.CssVar.COLOR}); z-index:${Theme.DialogIndex};position:absolute;}
	.${DLG_CLS_PREF}[data-transparent] {background-color:transparent !important; box-shadow:none !important}
	.${DLG_CLS_PREF} .${DLG_CLS_PREF}-ti {user-select:none; box-sizing:border-box; line-height:1; padding:0.75em 2.5em 0.75em 0.75em; font-weight:normal;color:var(${Theme.CssVar.CSS_LIGHTEN})}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE} {position:absolute; display:flex; align-items:center; line-height:1; width:2.5em; height:2.5em; overflow:hidden; opacity:0.6; cursor:pointer; right:0; top:0;box-sizing:border-box; text-align:center;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"\\e61a"; font-size:0.9em; font-family:${Theme.IconFont}; line-height:1; display:block; flex:1}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:hover {opacity:1;}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:.75em; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN}:first-child {margin-left:0;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN} {margin-left:0.5em;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 100px); overflow-y:auto}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] {box-shadow:1px 1px 25px 0px #44444457; border-color:#ccc;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] .dialog-ti {color:#333}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"]:before {content:""; position:absolute; z-index:9999999999; width:100%; height:100%;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"] * {opacity:0.85 !important; user-select:none;}
	
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_CTN} {padding:1.5em 1.5em 1em 1.5em; min-height:40px;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_PREF}-confirm-ti {font-size:1.2em; margin-bottom:.75em;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} {padding:2em 2em 1em 2em}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} label {font-size:1.1em; margin-bottom:.75em; display:block;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} input[type=text] {width:100%; box-sizing:border-box;}
	
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe {padding:0 !important}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe iframe {width:100%; border:none; display:block; min-height:30px;}
`, COM_ID$3 + '-style');
	document.addEventListener('keyup', e => {
		if(e.keyCode === KEYS.Esc){
			let current = DialogManager.getFrontDialog();
			if(current && current.config.showTopCloseButton){
				DialogManager.close(current);
				return false;
			}
		}
	});
	let DIALOG_COLLECTION = [];
	const sortZIndex = (dialog1, dialog2) => {
		return dialog1.zIndex - dialog2.zIndex;
	};
	const getModalDialogs = (excludedDialog = null) => {
		let list = DIALOG_COLLECTION.filter(d => {
			return d.state !== STATE_HIDDEN && d.config.modal && (!excludedDialog || d !== excludedDialog);
		});
		return list.sort(sortZIndex);
	};
	const getNoModalDialogs = (excludedDialog = null) => {
		let list = DIALOG_COLLECTION.filter(d => {
			return d.state !== STATE_HIDDEN && !d.config.modal && (!excludedDialog || d !== excludedDialog);
		});
		return list.sort(sortZIndex);
	};
	const getAllAvailableDialogs = (excludedDialog = null) => {
		let modalDialogs = getModalDialogs(excludedDialog);
		let noModalDialogs = getNoModalDialogs(excludedDialog);
		return noModalDialogs.concat(modalDialogs);
	};
	const setState = (dlg, state) => {
		dlg.state = state;
		dlg.dom.setAttribute('data-dialog-state', state);
		dlg.dom.style.display = state === STATE_HIDDEN ? 'none' : '';
	};
	const setZIndex = (dlg, zIndex) => {
		dlg.zIndex = dlg.dom.style.zIndex = String(zIndex);
	};
	const setType = (dlg, type) => {
		dlg.dom.setAttribute('data-dialog-type', type);
	};
	const DialogManager = {
		register(dlg){
			DIALOG_COLLECTION.push(dlg);
		},
		show(dlg){
			if(dlg.config.showMasker){
				Masker.show();
			}
			dlg.state = STATE_DISABLED;
			let modalDialogs = getModalDialogs(dlg);
			let noModalDialogs = getNoModalDialogs(dlg);
			if(dlg.config.modal){
				noModalDialogs.forEach(d => {
					setState(d, STATE_DISABLED);
				});
				modalDialogs.forEach(d => {
					setState(d, STATE_DISABLED);
				});
				setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + modalDialogs.length);
				setState(dlg, STATE_ACTIVE);
			}else {
				modalDialogs.forEach((d, idx) => {
					setZIndex(d, dlg.zIndex + idx + 1);
				});
				setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length);
				setState(dlg, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
			}
			dlg.onShow.fire();
		},
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
		hide(dlg){
			return this.close(dlg, false);
		},
		getFrontDialog(){
			let dialogs = getAllAvailableDialogs();
			return dialogs[dialogs.length - 1];
		},
		trySetFront(dlg){
			let modalDialogs = getModalDialogs();
			let currentFrontDialog = this.getFrontDialog();
			if(currentFrontDialog === dlg){
				return true;
			}
			if(modalDialogs.length){
				return false;
			}
			let otherNoModalDialogs = getNoModalDialogs(dlg);
			otherNoModalDialogs.forEach((d, idx) => {
				setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
			});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + otherNoModalDialogs.length);
		},
		closeAll(){
			DIALOG_COLLECTION.forEach(dlg => {
				dlg.dom?.parentNode.removeChild(dlg.dom);
			});
			DIALOG_COLLECTION = [];
			Masker.hide();
		},
		findById(id){
			return DIALOG_COLLECTION.find(dlg => {
				return dlg.id === id
			});
		}
	};
	const resolveContentType = (content) => {
		if(typeof (content) === 'object' && content.src){
			return DLG_CTN_TYPE_IFRAME;
		}
		return DLG_CTN_TYPE_HTML;
	};
	const domConstruct = (dlg) => {
		let html = `
		<div class="${DLG_CLS_PREF}" 
			id="${dlg.id}" 
			data-dialog-type="${TYPE_NORMAL}"
			${dlg.config.transparent ? 'data-transparent':''}
			style="${dlg.state === STATE_HIDDEN ? 'display:none' : ''}; ${dlg.config.width ? 'width:' + dimension2Style(dlg.config.width) : ''}">
		${dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : ''}
		${dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" title="关闭" tabindex="0"></span>` : ''}
	`;
		let style = [];
		if(dlg.config.minContentHeight){
			style.push('min-height:' + dimension2Style(dlg.config.minContentHeight));
		}
		if(dlg.config.maxContentHeight){
			style.push('max-height:' + dimension2Style(dlg.config.maxContentHeight));
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
		if(dlg.config.height){
			adjustHeight(dlg, dlg.config.height);
		}
		updatePosition$1(dlg);
		if(!dlg.config.height && resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
			let iframe = dlg.dom.querySelector('iframe');
			let obs;
			try{
				let upd = () => {
					let bdy = iframe.contentWindow.document.body;
					if(bdy){
						let h = bdy.scrollHeight || bdy.clientHeight || bdy.offsetHeight;
						adjustHeight(dlg, h);
						updatePosition$1(dlg);
					}
				};
				iframe.addEventListener('load', () => {
					obs = new MutationObserver(upd);
					obs.observe(iframe.contentWindow.document.body, {attributes: true, subtree: true, childList: true});
					upd();
				});
			}catch(err){
				try{
					obs && obs.disconnect();
				}catch(err){
					console.error('observer disconnect fail', err);
				}
				console.warn('iframe content upd', err);
			}
		}
		dlg.dom.style.display = 'none';
	};
	const eventBind = (dlg) => {
		dlg.dom.addEventListener('mousedown', () => {
			dlg.state === STATE_ACTIVE && DialogManager.trySetFront(dlg);
		});
		for(let i in dlg.config.buttons){
			let cb = dlg.config.buttons[i].callback || dlg.close;
			let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} .${DLG_CLS_BTN}`)[i];
			btn.addEventListener('click', cb.bind(dlg), false);
		}
		if(dlg.config.moveAble){
			let start_move = false;
			let last_click_offset = null;
			if(dlg.config.title){
				dlg.dom.querySelector('.' + DLG_CLS_TI).addEventListener('mousedown', (e) => {
					if(e.currentTarget && domContained(dlg.dom, e.currentTarget, true)){
						start_move = true;
						last_click_offset = {x: e.clientX - dlg.dom.offsetLeft, y: e.clientY - dlg.dom.offsetTop};
					}
				});
			}
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
		if(dlg.config.showTopCloseButton){
			let close_btn = dlg.dom.querySelector(`.${DLG_CLS_TOP_CLOSE}`);
			buttonActiveBind(close_btn, dlg.close.bind(dlg));
		}
		!dlg.config.moveAble && window.addEventListener('resize', () => {
			updatePosition$1(dlg);
		});
	};
	const calcBetterPos = (width, height) => {
		let vw = window.innerWidth;
		let vh = window.innerHeight;
		let new_left = Math.max((vw - width) / 2, 0);
		let new_top = Math.max((vh - height) * (1 - GOLDEN_RATIO), 0);
		return [new_top, new_left];
	};
	const updatePosition$1 = (dlg) => {
		let _hidden = dlg.state === STATE_HIDDEN;
		let ml, mt;
		if(!_hidden){
			[mt, ml]= calcBetterPos(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
		}else {
			dlg.dom.style.visibility = 'hidden';
			dlg.dom.style.display = 'block';
			[mt, ml] = calcBetterPos(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
			dlg.dom.style.display = 'none';
			dlg.dom.style.visibility = 'visible';
		}
		dlg.dom.style.top = mt + 'px';
		dlg.dom.style.left = ml + 'px';
	};
	const adjustHeight = (dlg, h) => {
		let ctn = dlg.dom.querySelector(`.${DLG_CLS_CTN}`);
		ctn.style.height = dimension2Style(h);
		if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
			let iframe = dlg.dom.querySelector('iframe');
			iframe.style.height = dimension2Style(h);
		}
	};
	const renderContent = (dlg) => {
		switch(resolveContentType(dlg.config.content)){
			case DLG_CTN_TYPE_IFRAME:
				return `<iframe src="${dlg.config.content.src}" ${IFRAME_ID_ATTR_FLAG}="${dlg.id}"></iframe>`;
			case DLG_CTN_TYPE_HTML:
				return dlg.config.content;
			default:
				console.error('Content type error', dlg.config.content);
				throw 'Content type error';
		}
	};
	const CUSTOM_EVENT_BUCKS = {
	};
	class Dialog {
		static CONTENT_MIN_HEIGHT = 30;
		static DEFAULT_WIDTH = 500;
		static DIALOG_INIT_Z_INDEX = Theme.DialogIndex;
		id = null;
		dom = null;
		state = STATE_HIDDEN;
		zIndex = Theme.DialogIndex;
		onClose = new BizEvent(true);
		onShow = new BizEvent(true);
		config = {
			title: '',
			content: '',
			modal: false,
			transparent:false,
			width: Dialog.DEFAULT_WIDTH,
			height: null,
			maxContentHeight: null,
			minContentHeight: Dialog.CONTENT_MIN_HEIGHT,
			moveAble: true,
			showMasker: true,
			buttons: [],
			showTopCloseButton: true,
		};
		constructor(config = {}){
			this.config = Object.assign(this.config, config);
			this.id = this.id || 'dialog-' + Math.random();
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
		fireCustomEvent(event, ...args){
			if(CUSTOM_EVENT_BUCKS[this.id] && CUSTOM_EVENT_BUCKS[this.id][event]){
				CUSTOM_EVENT_BUCKS[this.id][event].fire(...args);
				return true;
			}
			return false;
		}
		listenCustomEvent(event, callback){
			if(CUSTOM_EVENT_BUCKS[this.id] === undefined){
				CUSTOM_EVENT_BUCKS[this.id] = {};
			}
			if(CUSTOM_EVENT_BUCKS[this.id][event] === undefined){
				CUSTOM_EVENT_BUCKS[this.id][event] = new BizEvent();
			}
			CUSTOM_EVENT_BUCKS[this.id][event].listen(callback);
		}
		updatePosition(){
			updatePosition$1(this);
		}
		static show(title, content, config){
			let p = new Dialog({title, content, ...config});
			p.show();
			return p;
		}
		static confirm(title, content, opt = {}){
			return new Promise((resolve, reject) => {
				let p = new Dialog({
					content:`<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
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
					width:420,
					showTopCloseButton: false,
					...opt
				});
				setType(p, TYPE_CONFIRM);
				p.show();
			});
		}
		static alert(title, content, opt = {}){
			return new Promise(resolve => {
				let p = new Dialog({
					content:`<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
					buttons: [{
						title: '确定', default: true, callback: () => {
							p.close();
							resolve();
						}
					},],
					width:420,
					showTopCloseButton: false,
					...opt
				});
				setType(p, TYPE_CONFIRM);
				p.show();
			});
		}
		static iframe(title = null, iframeSrc, opt = {}){
			return Dialog.show(title, {src: iframeSrc}, opt);
		}
		static prompt(title, option = {initValue: ""}){
			return new Promise((resolve, reject) => {
				let input_id = guid(Theme.Namespace + '-prompt-input');
				let input = null;
				let p = new Dialog({
					width:400,
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
	}
	const getCurrentFrameDialog = () => {
		return new Promise((resolve, reject) => {
			if(!window.parent || !window.frameElement){
				reject('no in iframe');
				return;
			}
			if(!parent[COM_ID$3].DialogManager){
				reject('No dialog manager found.');
				return;
			}
			let id = window.frameElement.getAttribute(IFRAME_ID_ATTR_FLAG);
			if(!id){
				reject("ID no found in iframe element");
			}
			let dlg = parent[COM_ID$3].DialogManager.findById(id);
			if(dlg){
				resolve(dlg);
			}else {
				reject('no dlg find:' + id);
			}
		});
	};
	if(!window[COM_ID$3]){
		window[COM_ID$3] = {};
	}
	window[COM_ID$3].Dialog = Dialog;
	window[COM_ID$3].DialogManager = DialogManager;
	let CONTEXT_WINDOW$1 = getContextWindow();
	let DialogClass = CONTEXT_WINDOW$1[COM_ID$3].Dialog || Dialog;
	let DialogManagerClass = CONTEXT_WINDOW$1[COM_ID$3].DialogManager || DialogManager;

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

	class ACConfirm {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let title = param.title;
				let message = param.message;
				DialogClass.confirm(title || '确认', message).then(resolve, reject);
			});
		}
	}

	const GUID_BIND_KEY = Theme.Namespace+'-tip-guid';
	const NS = Theme.Namespace + 'tip';
	const DEFAULT_DIR = 11;
	const TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let TIP_COLLECTION = {};
	insertStyleSheet(`
	.${NS}-container-wrap {position:absolute; filter:drop-shadow(var(${Theme.CssVar.PANEL_SHADOW})); --tip-arrow-size:10px; --tip-gap:calc(var(--tip-arrow-size) * 0.7071067811865476); --tip-mgr:calc(var(--tip-gap) - var(--tip-arrow-size) / 2); color:var(${Theme.CssVar.COLOR}); z-index:${Theme.TipIndex};}
	.${NS}-arrow {display:block; background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); clip-path:polygon(0% 0%, 100% 100%, 0% 100%); width:var(--tip-arrow-size); height:var(--tip-arrow-size); position:absolute; z-index:1}
	.${NS}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; opacity:.5}
	.${NS}-close:hover {opacity:1}
	.${NS}-content {border-radius:var(${Theme.CssVar.PANEL_RADIUS}); background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); padding:1em;  max-width:30em; word-break:break-all}
	
	/** top **/
	.${NS}-container-wrap[data-tip-dir="11"],
	.${NS}-container-wrap[data-tip-dir="0"],
	.${NS}-container-wrap[data-tip-dir="1"]{padding-top:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow{top:var(--tip-mgr); transform:rotate(135deg);}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow{left:calc(25% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow{left:calc(50% - var(--tip-gap));background:orange;}
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow{left:calc(75% - var(--tip-gap));}
	
	/** left **/
	.${NS}-container-wrap[data-tip-dir="8"],
	.${NS}-container-wrap[data-tip-dir="9"],
	.${NS}-container-wrap[data-tip-dir="10"]{padding-left:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-close{top:3px;}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow{left:var(--tip-mgr); transform:rotate(45deg);}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow{top:calc(75% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow{top:calc(25% - var(--tip-gap));}
	
	/** bottom **/
	.${NS}-container-wrap[data-tip-dir="5"],
	.${NS}-container-wrap[data-tip-dir="6"],
	.${NS}-container-wrap[data-tip-dir="7"]{padding-bottom:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-close{top:3px;}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow{bottom:var(--tip-mgr); transform:rotate(-45deg);}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow{right: calc(25% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow{right: calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow{right: calc(75% - var(--tip-gap));}
	
	/** right **/
	.${NS}-container-wrap[data-tip-dir="2"],
	.${NS}-container-wrap[data-tip-dir="3"],
	.${NS}-container-wrap[data-tip-dir="4"]{padding-right:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-close{right:13px;top:3px;}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow{right:var(--tip-mgr);transform: rotate(-135deg);}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow{top:calc(25% - var(--tip-gap))}
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow{top:calc(75% - var(--tip-gap))}
`, Theme.Namespace + 'tip-style');
	let bindEvent = (tip)=>{
		if(tip.option.showCloseButton){
			let close_btn = tip.dom.querySelector(`.${NS}-close`);
			close_btn.addEventListener('click', () => {tip.hide();}, false);
			document.addEventListener('keyup', (e) => {
				if(e.keyCode === KEYS.Esc){
					tip.hide();
				}
			}, false);
		}
	};
	let calDir = (tipObj)=>{
		let tipWidth = tipObj.dom.offsetWidth;
		let tipHeight = tipObj.dom.offsetHeight;
		let relateNodeHeight = tipObj.relateNode.offsetHeight;
		let relateNodeWidth = tipObj.relateNode.offsetWidth;
		let relateNodeOffset = getDomOffset(tipObj.relateNode);
		let viewRegion = getRegion();
		for(let i = 0; i < TRY_DIR_MAP.length; i++){
			let [offsetLeft, offsetTop] = calcTipPositionByDir(TRY_DIR_MAP[i], tipWidth, tipHeight, relateNodeHeight, relateNodeWidth);
			let rect = {
				left: relateNodeOffset.left + offsetLeft,
				top: relateNodeOffset.top + offsetTop,
				width: tipWidth,
				height: tipHeight
			};
			let layout_rect = {
				left: document.body.scrollLeft,
				top: document.body.scrollTop,
				width: viewRegion.visibleWidth,
				height: viewRegion.visibleHeight
			};
			if(rectInLayout(rect, layout_rect)){
				return TRY_DIR_MAP[i];
			}
		}
		return DEFAULT_DIR;
	};
	let calcTipPositionByDir = function(dir, tipWidth, tipHeight, relateNodeHeight, relateNodeWidth){
		let offset = {
			11: [-tipWidth * 0.25 + relateNodeWidth / 2, relateNodeHeight],
			0: [-tipWidth * 0.5 + relateNodeWidth / 2, relateNodeHeight],
			1: [-tipWidth * 0.75 + relateNodeWidth / 2, relateNodeHeight],
			2: [-tipWidth, -tipHeight * 0.25 + relateNodeHeight / 2],
			3: [-tipWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
			4: [-tipWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
			5: [-tipWidth * 0.75 + relateNodeWidth / 2, -tipHeight],
			6: [-tipWidth * 0.5 + relateNodeWidth / 2, -tipHeight],
			7: [-tipWidth * 0.25 + relateNodeWidth / 2, -tipHeight],
			8: [relateNodeWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
			9: [relateNodeWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
			10: [relateNodeWidth, -tipHeight * 0.25 + relateNodeHeight / 2]
		};
		return offset[dir];
	};
	const updatePosition = (tipObj)=>{
		let direction = tipObj.option.direction;
		let tipWidth = tipObj.dom.offsetWidth;
		let tipHeight = tipObj.dom.offsetHeight;
		let relateNodePos = getDomOffset(tipObj.relateNode);
		let rh = tipObj.relateNode.offsetHeight;
		let rw = tipObj.relateNode.offsetWidth;
		if(direction === 'auto'){
			direction = calDir(tipObj);
		}
		tipObj.dom.setAttribute('data-tip-dir',direction);
		let [offsetLeft, offsetTop] = calcTipPositionByDir(direction, tipWidth, tipHeight, rh, rw);
		tipObj.dom.style.left = dimension2Style(relateNodePos.left + offsetLeft);
		tipObj.dom.style.top = dimension2Style(relateNodePos.top + offsetTop);
	};
	class Tip {
		id = null;
		relateNode = null;
		dom = null;
		option = {
			showCloseButton: true,
			width: 'auto',
			direction: 'auto',
		};
		onShow = new BizEvent(true);
		onHide = new BizEvent(true);
		onDestroy = new BizEvent(true);
		constructor(content, relateNode, opt = {}){
			this.id = guid();
			this.relateNode = relateNode;
			this.option = Object.assign(this.option, opt);
			this.dom = createDomByHtml(
				`<div class="${NS}-container-wrap" style="display:none; ${this.option.width ? 'width:'+dimension2Style(this.option.width) : ''}">
				<s class="${NS}-arrow"></s>
				${this.option.showCloseButton ? `<span class="${NS}-close">&#10005;</span>` : ''}
				<div class="${NS}-content">${content}</div>
			</div>`);
			bindEvent(this);
			TIP_COLLECTION[this.id] = this;
		}
		setContent(html){
			this.dom.querySelector(`.${NS}-content`).innerHTML = html;
			updatePosition(this);
		}
		show(){
			if(!document.contains(this.dom)){
				document.body.appendChild(this.dom);
			}
			show(this.dom);
			updatePosition(this);
			this.onShow.fire(this);
		}
		hide(){
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
		static show(content, relateNode, option = {}){
			let tip = new Tip(content, relateNode, option);
			tip.show();
			return tip;
		}
		static hideAll(){
			for(let i in TIP_COLLECTION){
				TIP_COLLECTION[i].hide();
			}
		}
		static bindNode(content, relateNode, option = {triggerType:'hover'}){
			let guid = relateNode.getAttribute(GUID_BIND_KEY);
			let tipObj = TIP_COLLECTION[guid];
			if(!tipObj){
				tipObj = new Tip(content, relateNode, option);
				relateNode.setAttribute(GUID_BIND_KEY, tipObj.id);
				let tm = null;
				let hide = ()=>{
					tm && clearTimeout(tm);
					tm = setTimeout(()=>{
						tipObj.hide();
					}, 10);
				};
				let show = ()=>{
					tm && clearTimeout(tm);
					tipObj.show();
				};
				switch(option.triggerType){
					case 'hover':
						relateNode.addEventListener('mouseover', show);
						relateNode.addEventListener('mouseout', hide);
						tipObj.dom.addEventListener('mouseout', hide);
						tipObj.dom.addEventListener('mouseover', show);
						break;
					case 'click':
						relateNode.addEventListener('click', ()=>{
							let isShow = tipObj.dom.style.display !== 'none';
							!isShow ? show() : hide();
						});
						document.addEventListener('click', e=>{
							if(!domContained(relateNode, e.target, true) && !domContained(tipObj.dom, e.target, true)){
								hide();
							}
						});
						break;
					default:
						throw "option.triggerType no supported:" + option.triggerType;
				}
			}
			return tipObj;
		}
		static bindAsync(relateNode, dataFetcher, option = {}){
			let guid = relateNode.getAttribute(`data-${GUID_BIND_KEY}`);
			let tipObj = TIP_COLLECTION[guid];
			if(!tipObj){
				let loading = false;
				tipObj = Tip.bindNode('loading...', relateNode, option);
				tipObj.onShow.listen(() => {
					if(loading){
						return;
					}
					loading = true;
					dataFetcher().then(rspHtml => {
						tipObj.setContent(rspHtml);
					}, error => {
						tipObj.setContent(error);
					}).finally(()=>{
						loading = false;
					});
				});
			}
		};
	}

	class ACTip {
		static init(node, option){
			let {content, triggertype = 'hover'} = option;
			return new Promise((resolve, reject) => {
				if(!content && node.title){
					content = node.title;
					node.title = '';
				}
				if(!content){
					reject('content required');
					return;
				}
				Tip.bindNode(content, node, {triggerType:triggertype});
				resolve();
			});
		}
	}

	const DOMAIN_DEFAULT = 'default';
	const trans = (text, domain = DOMAIN_DEFAULT) => {
		return text;
	};

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
	const copyFormatted = (html, silent = false) => {
		let container = createDomByHtml(`
		<div style="position:fixed; pointer-events:none; opacity:0;">${html}</div>
	`, document.body);
		let activeSheets = Array.prototype.slice.call(document.styleSheets)
			.filter(function(sheet){
				return !sheet.disabled;
			});
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

	class ACCopy {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				if(!param.content){
					throw "复制内容为空";
				}
				param.type === 'html' ? copyFormatted(param.content) : copy(param.content);
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

	const BASE64_KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
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
	const convertBlobToBase64 = async (blob) => {
		return await blobToBase64(blob);
	};
	const blobToBase64 = blob => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});

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
	const getBase64BySrc = (src)=>{
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.responseType = 'blob';
			xhr.onload = function(){
				if(this.status === 200){
					let blob = this.response;
					convertBlobToBase64(blob).then(base64 => {
						resolve(base64);
					}).catch(error => {
						reject(error);
					});
				}
			};
			xhr.onerror = function() {
				reject('Error:'+this.statusText);
			};
			xhr.onabort = function(){
				reject('Request abort');
			};
			xhr.send();
		});
	};
	const getBase64ByImg = (img) => {
		if(!img.src){
			return null;
		}
		if(img.src.indexOf('data:') === 0){
			return img.src;
		}
		let canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		return canvas.toDataURL("image/png")
	};
	const scaleFixCenter$1 = ({
	   contentWidth,
	   contentHeight,
	   containerWidth,
	   containerHeight,
	   spacing = 0,
	   zoomIn = false}) => {
		if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
			return {
				width: contentWidth,
				height: contentHeight,
				left: (containerWidth - contentWidth) / 2,
				top: (containerHeight - contentHeight) / 2
			};
		}
		let ratioX = containerWidth / contentWidth;
		let ratioY = containerHeight / contentHeight;
		let ratio = Math.min(ratioX, ratioY);
		return {
			width: contentWidth * ratio - spacing * 2,
			height: contentHeight * ratio - spacing * 2,
			left: (containerWidth - contentWidth * ratio) / 2 + spacing,
			top: (containerHeight - contentHeight * ratio) / 2 + spacing,
		}
	};
	const getAverageRGB = (imgEl) => {
		let blockSize = 5,
			defaultRGB = {r: 0, g: 0, b: 0},
			canvas = document.createElement('canvas'),
			context = canvas.getContext && canvas.getContext('2d'),
			data, width, height,
			i = -4,
			length,
			rgb = {r: 0, g: 0, b: 0},
			count = 0;
		if(!context){
			return defaultRGB;
		}
		height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
		width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
		context.drawImage(imgEl, 0, 0);
		try{
			data = context.getImageData(0, 0, width, height);
		}catch(e){
			return defaultRGB;
		}
		length = data.data.length;
		while((i += blockSize * 4) < length){
			++count;
			rgb.r += data.data[i];
			rgb.g += data.data[i + 1];
			rgb.b += data.data[i + 2];
		}
		rgb.r = ~~(rgb.r / count);
		rgb.g = ~~(rgb.g / count);
		rgb.b = ~~(rgb.b / count);
		return rgb;
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
		get(key){
			let v = localStorage.getItem(this.namespace+key);
			if(v === null){
				return null;
			}
			return json_decode(v);
		}
		set(key, value){
			handler_callbacks(key, value, this.get(key));
			localStorage.setItem(this.namespace+key, json_encode(value));
		}
		remove(key){
			handler_callbacks(key, null, this.get(key));
			localStorage.removeItem(this.namespace+key);
		}
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
		each(payload){
			this.settingKeys.forEach(k=>{
				payload(k, this.get(k));
			});
		}
		removeAll(){
			this.settingKeys.forEach(k=>{
				this.remove(k);
			});
		}
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
	insertStyleSheet(`
	.${CTX_CLASS_PREFIX} {z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX},
	.${CTX_CLASS_PREFIX} ul {position:absolute; padding: 0.5em 0; list-style:none; backdrop-filter:var(${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER}); box-shadow:var(${Theme.CssVar.PANEL_SHADOW});border-radius:var(${Theme.CssVar.PANEL_RADIUS});background:var(${Theme.CssVar.BACKGROUND_COLOR});min-width:12em; display:none;}
	.${CTX_CLASS_PREFIX} ul {left:100%; top:0;}
	.${CTX_CLASS_PREFIX} li:not([disabled]):hover>ul {display:block;}
	.${CTX_CLASS_PREFIX} li[role=menuitem] {padding:0 1em; line-height:1; position:relative; min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5; cursor:default;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]) {cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX} li[data-has-child]:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:var(${Theme.CssVar.DISABLE_COLOR});}
	.${CTX_CLASS_PREFIX} li[data-has-child]:not([disabled]):hover:after {color:var(${Theme.CssVar.COLOR})}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`);
	const createMenu = (commands, onExecute = null) => {
		let html = `<ul class="${CTX_CLASS_PREFIX}">`;
		let payload_map = {};
		let buildMenuItemHtml = (item) => {
			let html = '';
			if(item === '-'){
				html += '<li class="sep"></li>';
				return html;
			}
			let [title, cmdOrChildren, disabled] = item;
			let has_child = Array.isArray(cmdOrChildren);
			let mnu_item_id = guid();
			let sub_menu_html = '';
			if(has_child){
				sub_menu_html = '<ul>';
				cmdOrChildren.forEach(subItem => {
					sub_menu_html += buildMenuItemHtml(subItem);
				});
				sub_menu_html += '</ul>';
			}else {
				payload_map[mnu_item_id] = cmdOrChildren;
			}
			html += `<li role="menuitem" data-id="${mnu_item_id}" ${has_child ? ' data-has-child ' : ''} ${disabled ? 'disabled="disabled"' : 'tabindex="0"'}>${title}${sub_menu_html}</li>`;
			return html;
		};
		for(let i = 0; i < commands.length; i++){
			let item = commands[i];
			html += buildMenuItemHtml(item);
		}
		html += '</ul>';
		let menu = createDomByHtml(html, document.body);
		let items = menu.querySelectorAll('[role=menuitem]:not([disabled])');
		items.forEach(function(item){
			let id = item.getAttribute('data-id');
			let payload = payload_map[id];
			if(payload){
				item.addEventListener('click', () => {
					payload();
					onExecute && onExecute(item);
				});
			}
		});
		let sub_menus = menu.querySelectorAll('ul');
		sub_menus.forEach(function(sub_menu){
			let parent_item = sub_menu.parentNode;
			parent_item.addEventListener('mouseover', e => {
				let pos = alignSubMenuByNode(sub_menu, parent_item);
				sub_menu.style.left = dimension2Style(pos.left);
				sub_menu.style.top = dimension2Style(pos.top);
			});
		});
		menu.addEventListener('contextmenu', e => {
		});
		return menu;
	};
	let LAST_MENU;
	const hideLastMenu = ()=>{
		LAST_MENU && LAST_MENU.parentNode.removeChild(LAST_MENU);
		LAST_MENU = null;
	};
	const bindTargetContextMenu = (target, commands, option = {}) => {
		option.triggerType = 'contextmenu';
		return bindTargetMenu(target, commands, option);
	};
	const bindTargetDropdownMenu = (target, commands, option = {}) => {
		option.triggerType = 'click';
		return bindTargetMenu(target, commands, option);
	};
	const showContextMenu = (commands,position)=>{
		hideLastMenu();
		let menuEl = createMenu(commands);
		LAST_MENU = menuEl;
		let pos = calcMenuByPosition(menuEl, {left: position.left, top: position.top});
		menuEl.style.left = dimension2Style(pos.left);
		menuEl.style.top = dimension2Style(pos.top);
		menuEl.style.display = 'block';
	};
	const bindTargetMenu = (target, commands, option = null) => {
		let triggerType = option?.triggerType || 'click';
		target.addEventListener(triggerType, e => {
			hideLastMenu();
			let menuEl = createMenu(commands);
			LAST_MENU = menuEl;
			let pos;
			if(triggerType === 'contextmenu'){
				pos = calcMenuByPosition(menuEl, {left: e.clientX, top: e.clientY});
			}else {
				pos = alignMenuByNode(menuEl, target);
			}
			menuEl.style.left = dimension2Style(pos.left);
			menuEl.style.top = dimension2Style(pos.top);
			menuEl.style.display = 'block';
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	};
	const calcMenuByPosition = (menuEl, point) => {
		let menu_dim = getDomDimension(menuEl);
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		let top, left = point.left;
		let right_available = menu_dim.width + point.left <= con_dim.width;
		let bottom_available = menu_dim.height + point.top <= con_dim.height;
		let top_available = point.top - menu_dim.height > 0;
		if(right_available && bottom_available){
			left = point.left;
			top = point.top;
		}else if(right_available && !bottom_available){
			left = point.left;
			top = Math.max(con_dim.height - menu_dim.height, 0);
		}else if(!right_available && bottom_available){
			left = Math.max(con_dim.width - menu_dim.width, 0);
			top = point.top;
		}else if(!right_available && !bottom_available){
			if(top_available){
				left = Math.max(con_dim.width - menu_dim.width, 0);
				top = point.top - menu_dim.height;
			}else {
				left = Math.max(con_dim.width - menu_dim.width, 0);
				top = point.top;
			}
		}
		return {top, left};
	};
	const alignMenuByNode = (menuEl, relateNode) => {
		let top, left;
		let menu_dim = getDomDimension(menuEl);
		let relate_node_offset = relateNode.getBoundingClientRect();
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		if((con_dim.height - relate_node_offset.top) > menu_dim.height && (con_dim.height - relate_node_offset.top - relate_node_offset.height) < menu_dim.height){
			top = relate_node_offset.top - menu_dim.height;
		}else {
			top = relate_node_offset.top + relate_node_offset.height;
		}
		if((relate_node_offset.left + relate_node_offset.width) > menu_dim.width && (con_dim.width - relate_node_offset.left) < menu_dim.width){
			left = relate_node_offset.left + relate_node_offset.width - menu_dim.width;
		}else {
			left = relate_node_offset.left;
		}
		return {top, left};
	};
	const alignSubMenuByNode = (subMenuEl, triggerMenuItem) => {
		let menu_dim = getDomDimension(subMenuEl);
		let relate_node_offset = triggerMenuItem.getBoundingClientRect();
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		let top;
		let left;
		if((relate_node_offset.top + menu_dim.height > con_dim.height) && con_dim.height >= menu_dim.height){
			top = con_dim.height - (relate_node_offset.top + menu_dim.height);
		} else {
			top = 0;
		}
		if(relate_node_offset.left > menu_dim.width && (relate_node_offset.left + relate_node_offset.width + menu_dim.width > con_dim.width)){
			left = 0 - menu_dim.width;
		}else {
			left = relate_node_offset.width;
		}
		return {top, left};
	};
	document.addEventListener('click', e => {
		hideLastMenu();
	});
	document.addEventListener('keyup', e => {
		if(e.keyCode === KEYS.Esc){
			hideLastMenu();
		}
	});

	const COM_ID$2 = Theme.Namespace + 'com-image-viewer';
	const CONTEXT_WINDOW = getContextWindow();
	if(!CONTEXT_WINDOW[COM_ID$2]){
		CONTEXT_WINDOW[COM_ID$2] = {};
	}
	const DOM_CLASS = COM_ID$2;
	const DEFAULT_VIEW_PADDING = 20;
	const MAX_ZOOM_IN_RATIO = 2;
	const MIN_ZOOM_OUT_SIZE = 50;
	const THUMB_WIDTH = 50;
	const ZOOM_IN_RATIO = 0.8;
	const ZOOM_OUT_RATIO = 1.2;
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
	let IMG_SRC_LIST = [];
	let IMG_CURRENT_INDEX = 0;
	const DEFAULT_SETTING = {
		mouse_scroll_type: IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
		allow_move: true,
		show_thumb_list: false,
		show_toolbar: true,
		show_context_menu: true,
	};
	let LocalSetting = new LocalStorageSetting(DEFAULT_SETTING, Theme.Namespace + 'com-image-viewer/');
	const srcSetResolve = srcSet => {
		srcSet = typeof (srcSet) === 'string' ? [srcSet] : srcSet;
		return {
			thumb: srcSet[0],
			normal: srcSet[1] || srcSet[0],
			original: srcSet[2] || srcSet[1] || srcSet[0]
		};
	};
	insertStyleSheet(`
	 @keyframes ${Theme.Namespace}spin{
		100%{transform:rotate(360deg);}
	}
	.${DOM_CLASS}{position:fixed;z-index:${BASE_INDEX};width:100%;height:100%;overflow:hidden;top:0;left:0;}
	.${DOM_CLASS} .civ-closer{position:absolute; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:10px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before{font-family:"${Theme.IconFont}", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover{background-color:#eeeeee75;}
	.${DOM_CLASS} .civ-nav-btn{padding:10px; z-index:${OP_INDEX}; transition:all 0.1s linear; border-radius:3px; opacity:0.8; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled]{color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:not([disabled]):hover{opacity:1;}
	.${DOM_CLASS} .civ-nav-btn:before{font-family:"${Theme.IconFont}"; font-size:20px;}
	.${DOM_CLASS} .civ-prev{left:10px}
	.${DOM_CLASS} .civ-prev:before{content:"\\e6103"}
	.${DOM_CLASS} .civ-next{right:10px}
	.${DOM_CLASS} .civ-next:before{content:"\\e73b";}

	.${DOM_CLASS} .civ-view-option {position:absolute;display:flex;--opt-btn-size:1.5rem;background-color: #6f6f6f26;backdrop-filter:blur(4px);padding:0.25em 0.5em;left:50%;transform:translate(-50%, 0);z-index:${OP_INDEX};gap: 0.5em;border-radius:4px;}
	.${DOM_CLASS} .civ-opt-btn {cursor:pointer;flex:1;user-select:none;width: var(--opt-btn-size);height: var(--o pt-btn-size);overflow: hidden; color: white;padding: 0.2em;border-radius: 4px;transition: all 0.1s linear;opacity: 0.7;}
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
	.${DOM_CLASS} .civ-nav-list-next:before{font-family:"${Theme.IconFont}";font-size:18px;}
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
	.${DOM_CLASS} .civ-loading:before{content:"\\e635"; font-family:"${Theme.IconFont}" !important; animation:${Theme.Namespace}spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size); line-height:var(--loading-size)}
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
		window.addEventListener('resize', onWinResize);
		document.addEventListener('keydown', bindKeyDown);
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
		if(ratioOffset > 1 && width > origin_width && ((width / origin_width) > MAX_ZOOM_IN_RATIO || (height / origin_height) > MAX_ZOOM_IN_RATIO)){
			console.warn('zoom in limited');
			return;
		}
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
	const getCmdViaID = (id) => {
		for(let k in ALL_COMMANDS){
			let [_id] = ALL_COMMANDS[k];
			if(id === _id){
				return ALL_COMMANDS[k];
			}
		}
		return null;
	};
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
	const showImgPreview = CONTEXT_WINDOW[COM_ID$2]['showImgPreview'] || function(imgSrc, option = {}){
		init({mode: IMG_PREVIEW_MODE_SINGLE, srcList: [imgSrc], ...option});
	};
	const showImgListPreview = CONTEXT_WINDOW[COM_ID$2]['showImgListPreview'] || function(imgSrcList, startIndex = 0, option = {}){
		init({mode: IMG_PREVIEW_MODE_MULTIPLE, srcList: imgSrcList, startIndex, ...option});
	};
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
	window[COM_ID$2] = {
		showImgPreview,
		showImgListPreview,
		bindImgPreviewViaSelector,
	};
	let showImgPreviewFn = CONTEXT_WINDOW[COM_ID$2]['showImgPreview'] || showImgPreview;
	let showImgListPreviewFn = CONTEXT_WINDOW[COM_ID$2]['showImgListPreview'] || showImgListPreview;

	const resolveSrc = (node) => {
		let src = node.dataset.src;
		if(node.tagName === 'IMG'){
			if(!src && node.srcset){
				src = getHighestResFromSrcSet(node.srcset);
			}
			src = src || node.src;
		}else if(!src && node.tagName === 'A'){
			src = node.href;
		}
		return src;
	};
	class ACPreview {
		static active(node, param = {}){
			return new Promise((resolve, reject) => {
				let watchSelector = param.watch;
				if(watchSelector){
					eventDelegate(node, watchSelector, 'click', clickNode=>{
						let index = 0, imgSrcList = [];
						node.querySelectorAll(watchSelector).forEach((n, idx) => {
							if(node === clickNode){
								index = idx;
							}
							imgSrcList.push(resolveSrc(clickNode));
						});
						showImgListPreviewFn(imgSrcList, index);
					});
					resolve();
					return;
				}
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

	const COM_ID$1 = Theme.Namespace + 'select';
	const CLASS_PREFIX$1 = COM_ID$1;
	insertStyleSheet(`
	.${CLASS_PREFIX$1}-panel{
		${Theme.CssVarPrefix}sel-panel-max-width:20em;
		${Theme.CssVarPrefix}sel-list-max-height:15em;
		${Theme.CssVarPrefix}sel-item-matched-color:orange;
		${Theme.CssVarPrefix}sel-item-matched-font-weight:bold;
		${Theme.CssVarPrefix}sel-item-hover-bg:#eeeeee;
		${Theme.CssVarPrefix}sel-item-selected-bg:#abc9e140;
		
		max-width:var(${Theme.CssVarPrefix}sel-panel-max-width);
		background-color:var(${Theme.CssVar.BACKGROUND_COLOR});
		border:var(${Theme.CssVar.PANEL_BORDER});
		padding:.2em 0;
		box-sizing:border-box;
		box-shadow:var(${Theme.CssVar.PANEL_SHADOW});
		border-radius:var(${Theme.CssVar.PANEL_RADIUS});
		position:absolute;
		z-index:1;
	}
	
	.${CLASS_PREFIX$1}-panel .${CLASS_PREFIX$1}-search{padding:0.5em;}
	.${CLASS_PREFIX$1}-panel input[type=search]{
		width:100%;
		padding:0.5em;
		border:none;
		border-bottom:1px solid #dddddd;
		outline:none;
		box-shadow:none;
		transition:border 0.1s linear;
	}
	.${CLASS_PREFIX$1}-panel input[type=search]:focus{
		border-color:gray;
	}
	
	.${CLASS_PREFIX$1}-list{
		list-style:none;
		max-height:var(${Theme.CssVarPrefix}sel-list-max-height);
		overflow:auto;
	}
	
	.${CLASS_PREFIX$1}-list .sel-item{
		margin:1px 0;
	}
	
	.${CLASS_PREFIX$1}-list .sel-chk{
		opacity:0;
		width:1em;
		height:1em;
		position:absolute;
		margin:0.05em 0 0 -1.25em;
	}
	
	.${CLASS_PREFIX$1}-list .sel-chk:before{
		content:"\\e624";
		font-family:"${Theme.IconFont}", serif;
	}
	
	.${CLASS_PREFIX$1}-list .matched{
		color:var(${Theme.CssVarPrefix}sel-item-matched-color);
		font-weight:var(${Theme.CssVarPrefix}sel-item-matched-font-weight);
	}
	
	.${CLASS_PREFIX$1}-list input{display:block;position:absolute;z-index:1;left:-2em;top:0;opacity:0;}
	.${CLASS_PREFIX$1}-list .ti-wrap{cursor:pointer;position:relative;display:block;padding:.35em .5em .35em 2em;user-select:none;transition:all 0.1s linear;}
	.${CLASS_PREFIX$1}-list ul .ti-wrap{padding-left:2.25em;display:block; padding-left:3.5em;}
	
	.${CLASS_PREFIX$1}-list label{
		display:block;
		overflow:hidden;
		position:relative;
	}
	.${CLASS_PREFIX$1}-list label:hover .ti-wrap{
		background:var(${Theme.CssVarPrefix}sel-item-hover-bg);
		text-shadow:1px 1px 1px white;
	}
	
	.${CLASS_PREFIX$1}-list li[data-group-title]:before{
		content:attr(data-group-title) " -";
		color:gray;
		display:block;
		padding:0.25em .5em .25em 2em;
	}
	
	/** checked **/
	.${CLASS_PREFIX$1}-list input:checked ~ .ti-wrap{
		background-color:var(${Theme.CssVarPrefix}sel-item-selected-bg);
	}
	
	.${CLASS_PREFIX$1}-list input:checked ~ .ti-wrap .sel-chk{
		opacity:1;
	}
	
	/** disabled **/
	.${CLASS_PREFIX$1}-list input:disabled ~ .ti-wrap{
		opacity:0.5;
		cursor:default;
		background-color:transparent
	}
	.${CLASS_PREFIX$1}-list input:disabled ~ .ti-wrap .sel-chk{
		opacity:.1;
	}
`, COM_ID$1 + '-style');
	const resolveSelectOptions = (sel) => {
		let options = [
		];
		let values = [];
		let selectedIndexes = [];
		sel.childNodes.forEach(node => {
			if(node.nodeType !== 1){
				return;
			}
			if(node.tagName === 'OPTION'){
				options.push(new Option({
					title: node.innerText,
					value: node.value,
					disabled: node.disabled,
					selected: node.selected,
					index: node.index,
				}));
				if(node.selected){
					values.push(node.value);
					selectedIndexes.push(node.index);
				}
			}else if(node.tagName === 'OPTGROUP'){
				let opt_group = new Option({title: node.label});
				node.childNodes.forEach(child => {
					if(child.nodeType !== 1){
						return;
					}
					opt_group.options.push(new Option({
						title: child.innerText,
						value: child.value,
						disabled: child.disabled,
						selected: child.selected,
						index: child.index,
					}));
					if(child.selected){
						values.push(child.value);
						selectedIndexes.push(child.index);
					}
				});
				options.push(opt_group);
			}
		});
		return {options, values, selectedIndexes};
	};
	const resolveListOption = (datalistEl, initValue = null) => {
		let options = [];
		Array.from(datalistEl.options).forEach((option, index) => {
			let title = option.innerText;
			let value = option.hasAttribute('value') ? option.getAttribute('value') : option.innerText;
			let selected = initValue !== null && value === initValue;
			options.push({title, value, disabled: false, selected, index});
		});
		return options;
	};
	const renderItemChecker = (name, multiple, option) => {
		return `<input type="${multiple ? 'checkbox' : 'radio'}" 
		tabindex="-1"
		name="${name}" 
		value="${escapeAttr(option.value)}" 
		${option.selected ? 'checked' : ''} 
		${option.disabled ? 'disabled' : ''}/>
	`
	};
	const createPanel = (config) => {
		let list_html = `<ul class="${CLASS_PREFIX$1}-list">`;
		config.options.forEach(option => {
			if(option.options && option.options.length){
				list_html += `<li data-group-title="${escapeAttr(option.title)}" class="sel-group"><ul>`;
				option.options.forEach(childOption => {
					list_html += `<li class="sel-item" tabindex="0">
									<label title="${escapeAttr(childOption.title)}" tabindex="0">
										${renderItemChecker(config.name, config.multiple, childOption)} 
										<span class="ti-wrap">
											<span class="sel-chk"></span> 
											<span class="ti">${escapeHtml(childOption.title)}</span>
										</span>
									</label>
								</li>`;
				});
				list_html += `</ul></li>`;
			}else {
				list_html += `<li class="sel-item" tabindex="0">
							<label title="${escapeAttr(option.title)}">
								${renderItemChecker(config.name, config.multiple, option)} 
								<span class="ti-wrap">
									<span class="sel-chk"></span> 
									<span class="ti">${escapeHtml(option.title)}</span>
								</span>
							</label>
						</li>`;
			}
		});
		list_html += '</ul>';
		return createDomByHtml(`
		<div class="${CLASS_PREFIX$1}-panel" style="display:none;">
			<div class="${CLASS_PREFIX$1}-search" style="${config.displaySearchInput ? '' : 'display:none'}">
				<input type="search" placeholder="过滤..." aria-label="过滤选项">
			</div>
			${list_html}
		</div>
	`, document.body);
	};
	const tabNav = (liList, dir) => {
		let currentIndex = -1;
		liList.forEach((li, idx) => {
			if(li === document.activeElement){
				currentIndex = idx;
			}
		});
		if(dir > 0){
			currentIndex = currentIndex < (liList.length - 1) ? (currentIndex + 1) : 0;
		}else {
			currentIndex = currentIndex <= 0 ? (liList.length - 1) : (currentIndex - 1);
		}
		liList.forEach((li, idx) => {
			if(idx === currentIndex){
				li.focus();
			}
		});
	};
	class Option {
		constructor(param){
			for(let i in param){
				this[i] = param[i];
			}
		}
		title = '';
		value = '';
		disabled = false;
		selected = false;
		index = 0;
		options = [];
	}
	class Select {
		config = {
			name: "",
			required: false,
			multiple: false,
			placeholder: '',
			displaySearchInput: true,
			hideNoMatchItems: true,
			options: []
		};
		panelEl = null;
		searchEl = null;
		onChange = new BizEvent();
		constructor(config){
			this.config = Object.assign(this.config, config);
			this.config.name = this.config.name || COM_ID$1 + guid();
			this.panelEl = createPanel(this.config);
			this.searchEl = this.panelEl.querySelector('input[type=search]');
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach(chk => {
				chk.addEventListener('change', () => {
					this.onChange.fire();
				});
			});
			this.searchEl.addEventListener('input', () => {
				this.search(this.searchEl.value);
			});
			this.searchEl.addEventListener('keydown', e => {
				if(e.keyCode === KEYS.UpArrow){
					tabNav(liElList, false);
				}else if(e.keyCode === KEYS.DownArrow){
					tabNav(liElList, true);
				}
			});
			let liElList = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list .sel-item`);
			liElList.forEach(li => {
				buttonActiveBind(li, e => {
					if(e.type !== 'click'){
						let chk = li.querySelector('input');
						chk.checked ? chk.removeAttribute('checked') : chk.checked = true;
						this.onChange.fire();
					}
					!this.config.multiple && this.hidePanel();
				});
				li.addEventListener('keydown', e => {
					if(e.keyCode === KEYS.UpArrow){
						tabNav(liElList, false);
					}else if(e.keyCode === KEYS.DownArrow){
						tabNav(liElList, true);
					}
				});
			});
		}
		isShown(){
			return this.panelEl.style.display !== 'none';
		}
		search(kw){
			this.searchEl.value = kw;
			let liEls = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list .sel-item`);
			let firstMatchedItem = null;
			liEls.forEach(li => {
				this.config.hideNoMatchItems && hide(li);
				let title = li.querySelector('label').title;
				li.blur();
				li.querySelector('.ti').innerHTML = highlightText(title, kw);
				if(!kw || title.toLowerCase().indexOf(kw.trim().toLowerCase()) >= 0){
					this.config.hideNoMatchItems && show(li);
					if(!firstMatchedItem){
						firstMatchedItem = li;
					}
				}
			});
			if(firstMatchedItem){
				firstMatchedItem.scrollIntoView({behavior: 'smooth'});
			}
		}
		selectByIndex(selectedIndexList){
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				chk.checked = selectedIndexList.includes(idx);
			});
		}
		selectByValues(values){
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				chk.checked = values.includes(chk.value);
			});
		}
		getValues(){
			let values = [];
			let tmp = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input:checked`);
			tmp.forEach(chk => {
				values.push(chk.value);
			});
			values = arrayDistinct(values);
			return values;
		}
		getSelectedIndexes(){
			let selectedIndexes = [];
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				if(chk.checked){
					selectedIndexes.push(idx);
				}
			});
			return selectedIndexes;
		}
		hidePanel(){
			if(this.panelEl){
				this.panelEl.style.display = 'none';
				this.search("");
			}
		}
		showPanel(pos = {top: 0, left: 0}){
			this.panelEl.style.display = '';
			if(pos){
				this.panelEl.style.top = dimension2Style(pos.top);
				this.panelEl.style.left = dimension2Style(pos.left);
			}
			this.searchEl.focus();
		}
		static bindSelect(selectEl){
			let {options} = resolveSelectOptions(selectEl);
			let sel = new Select({
				name: selectEl.name,
				required: selectEl.required,
				multiple: selectEl.multiple,
				placeholder: selectEl.getAttribute('placeholder'),
				options
			});
			sel.onChange.listen(() => {
				let selectedIndexes = sel.getSelectedIndexes();
				selectEl.querySelectorAll('option').forEach((opt, idx) => {
					opt.selected = selectedIndexes.includes(idx);
				});
				triggerDomEvent(selectEl, 'change');
			});
			sel.panelEl.style.minWidth = dimension2Style(selectEl.offsetWidth);
			let showSelect = () => {
				let offset = getDomOffset(selectEl);
				sel.showPanel({top: offset.top + selectEl.offsetHeight, left: offset.left});
			};
			selectEl.addEventListener('keydown', e => {
				showSelect();
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			selectEl.addEventListener('mousedown', e => {
				sel.isShown() ? sel.hidePanel() : showSelect();
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			selectEl.addEventListener('focus', showSelect);
			selectEl.addEventListener('change', () => {
				let selectedIndexes = [];
				Array.from(selectEl.selectedOptions).forEach(opt => {
					selectedIndexes.push(opt.index);
				});
				sel.selectByIndex(selectedIndexes);
			});
			document.addEventListener('click', e => {
				if(!domContained(sel.panelEl, e.target, true) && !domContained(selectEl, e.target, true)){
					sel.hidePanel();
				}
			});
			document.addEventListener('keyup', e => {
				if(e.keyCode === KEYS.Esc){
					sel.hidePanel();
				}
			});
		}
		static bindTextInput(inputEl, options = null){
			if(!options){
				let listTagId = inputEl.getAttribute('list');
				let datalistEl = document.getElementById(listTagId);
				if(!datalistEl){
					throw "no datalist found: " + inputEl.getAttribute('list');
				}
				options = resolveListOption(datalistEl, inputEl.value);
				inputEl.removeAttribute('list');
				datalistEl.parentNode.removeChild(datalistEl);
			}
			let sel = new Select({
				name: inputEl.name,
				required: inputEl.required,
				multiple: false,
				displaySearchInput: false,
				hideNoMatchItems: false,
				placeholder: inputEl.getAttribute('placeholder'),
				options
			});
			sel.onChange.listen(() => {
				inputEl.value = sel.getValues()[0];
				triggerDomEvent(inputEl, 'change');
			});
			sel.panelEl.style.minWidth = dimension2Style(inputEl.offsetWidth);
			let sh = () => {
				let offset = getDomOffset(inputEl);
				sel.showPanel({top: offset.top + inputEl.offsetHeight, left: offset.left});
			};
			inputEl.addEventListener('focus', sh);
			inputEl.addEventListener('click', sh);
			inputEl.addEventListener('input', () => {
				sel.search(inputEl.value.trim());
			});
			document.addEventListener('click', e => {
				if(!domContained(sel.panelEl, e.target, true) && !domContained(inputEl, e.target, true)){
					sel.hidePanel();
				}
			});
			document.addEventListener('keyup', e => {
				if(e.keyCode === KEYS.Esc){
					sel.hidePanel();
				}
			});
		}
	}

	class ACSelect {
		static init(node){
			return new Promise((resolve, reject) => {
				if(node.tagName === 'SELECT'){
					Select.bindSelect(node);
					resolve();
					return;
				}
				if(node.tagName === 'INPUT' && node.list){
					Select.bindTextInput(node);
					resolve();
					return;
				}
				reject('node type no support');
			});
		}
	}

	class ACHighlight {
		static cssClass = 'highlight';
		static init(node, param = {}){
			return new Promise((resolve, reject) => {
				let kw = (param.keyword || param.kw || '').trim();
				if(kw){
					nodeHighlight(node, kw, ACHighlight.cssClass);
				}
				resolve();
			});
		}
	}

	const DEFAULT_ATTR_COM_FLAG = 'data-component';
	const COMPONENT_BIND_FLAG_KEY = 'component-init-bind';
	let AC_COMPONENT_MAP = {
		async: ACAsync,
		dialog: ACDialog,
		confirm: ACConfirm,
		preview: ACPreview,
		copy: ACCopy,
		select: ACSelect,
		tip: ACTip,
		toast: ACToast,
		hl: ACHighlight,
		highlight: ACHighlight,
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
			let cs = parseComponents(node.getAttribute(attr_flag));
			let activeStacks = [];
			let init_count = 0;
			cs.forEach(com => {
				let C = AC_COMPONENT_MAP[com];
				if(!C){
					console.warn('component no found', com);
					return false;
				}
				init_count++;
				let data = resolveDataParam(node, com);
				console.info('com detected:', com);
				if(C.init){
					C.init(node, data);
				}
				if(C.active){
					activeStacks.push((event)=>{
						return C.active(node, resolveDataParam(node, com), event);
					});
				}
				return true;
			});
			if(init_count !== 0){
				node.setAttribute(COMPONENT_BIND_FLAG_KEY, "1");
			}
			if(activeStacks.length){
				bindActiveChain(node, activeStacks);
			}
		});
	};
	const TEXT_TYPES = ['text', 'number', 'password', 'search', 'address', 'date', 'datetime', 'time', 'checkbox', 'radio'];
	const isInputAble = (node) => {
		if(node.disabled || node.readonly){
			return false;
		}
		return node.tagName === 'TEXTAREA' ||
			(node.tagName === 'INPUT' && (!node.type || TEXT_TYPES.includes(node.type.toLowerCase())));
	};
	const bindActiveChain = (node, activeStacks) => {
		let eventName;
		if(isInputAble(node)){
			eventName = 'keyup';
		}else if(node.tagName === 'FORM'){
			eventName = 'submit';
		}else {
			eventName = 'click';
		}
		node.addEventListener(eventName, event => {
			let func = activeStacks[0];
			let pro = func(event);
			for(let i = 1; i < activeStacks.length; i++){
				pro = pro.then(() => {
					return activeStacks[i](event);
				}, () => {
				});
			}
			event.preventDefault();
			return false;
		});
	};
	const ACComponent = {
		watch: (container = document, attr_flag = DEFAULT_ATTR_COM_FLAG) => {
			let m_tm = null;
			let observer = new MutationObserver(mutations => {
				clearTimeout(m_tm);
				m_tm = setTimeout(function(){
					bindNode(container, attr_flag);
				}, 0);
			});
			observer.observe(container, {childList: true, subtree: true});
			bindNode(container, attr_flag);
		},
		register: (componentName, define) => {
			AC_COMPONENT_MAP[componentName] = define;
		},
		unRegister: (componentName) => {
			delete (AC_COMPONENT_MAP[componentName]);
		}
	};

	const safeAdd = (x, y) => {
		let lsw = (x & 0xffff) + (y & 0xffff);
		let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff)
	};
	const bitRotateLeft = (num, cnt) => {
		return (num << cnt) | (num >>> (32 - cnt))
	};
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
	const binlMD5 = (x, len) => {
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
	const binl2rstr = (input) => {
		let i;
		let output = '';
		let length32 = input.length * 32;
		for(i = 0; i < length32; i += 8){
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
		}
		return output
	};
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
	const rstrMD5 = (s) => {
		return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
	};
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
	const str2rstrUTF8 = (input) => {
		return unescape(encodeURIComponent(input))
	};
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
	const pushState = (param, title = '') => {
		let url = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(param);
		window.history.pushState(param, title, url);
		exePayloads(param);
	};
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
	function frequencyControl(payload, interval, executeOnFistTime = false){
		if(payload._frq_tm){
			clearTimeout(payload._frq_tm);
		}
		payload._frq_tm = setTimeout(() => {
			frequencyControl(payload, interval, executeOnFistTime);
		}, interval);
	}
	const getMonthLastDay = (year, month) => {
		const date1 = new Date(year, month, 0);
		return date1.getDate()
	};
	const getLastMonth = (year, month) => {
		return month === 1 ? [year - 1, 12] : [year, month - 1];
	};
	const getNextMonth = (year, month) => {
		return month === 12 ? [year + 1, 1] : [year, month + 1];
	};
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
		txt += (txt || h) ? `${delimiter}${h}小时` : '';
		txt += (txt || m) ? `${delimiter}${m}分` : '';
		txt += (txt || s) ? `${delimiter}${s}秒` : '';
		return txt.trim();
	};
	const monthsOffsetCalc = (monthNum, start_date = new Date())=>{
		let year = start_date.getFullYear();
		let month = start_date.getMonth()+1;
		month = month + monthNum;
		if(month > 12){
			let yearNum = Math.floor((month - 1) / 12);
			month = month % 12 === 0 ? 12 : month % 12;
			year += yearNum;
		}else if(month <= 0){
			month = Math.abs(month);
			let yearNum = Math.floor((month + 12) / 12);
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

	const COM_ID = Theme.Namespace + 'novice-guide';
	const CLASS_PREFIX = COM_ID;
	const PADDING_SIZE = '5px';
	insertStyleSheet(`
	.${CLASS_PREFIX}-highlight {
		position:absolute; 
		z-index:10000;
		--novice-guide-highlight-padding:${PADDING_SIZE}; 
		box-shadow:0 0 10px 2000px #00000057; 
		border-radius:var(${Theme.CssVar.PANEL_RADIUS}); 
		padding:var(--novice-guide-highlight-padding); 
		margin:calc(var(--novice-guide-highlight-padding) * -1) 0 0 calc(var(--novice-guide-highlight-padding) * -1); 
	}
	.${CLASS_PREFIX}-btn {user-select:none; cursor:pointer;}
	.${CLASS_PREFIX}-masker {width:100%; height:100%; position:absolute; left:0; top:0; z-index:10000}
	.${CLASS_PREFIX}-counter {float:left; color:${Theme.CssVar.COLOR}; opacity:0.7} 
	.${CLASS_PREFIX}-next-wrap {text-align:right; margin-top:10px;}
`, COM_ID);
	let highlightHelperEl,
		maskerEl;
	const show_highlight_zone = (highlightNode) => {
		hide_highlight_zone();
		if(!highlightHelperEl){
			highlightHelperEl = createDomByHtml(`<div class="${CLASS_PREFIX}-highlight"></div>`, document.body);
			maskerEl = createDomByHtml(`<div class="${CLASS_PREFIX}-masker"></div>`, document.body);
		}
		show(maskerEl);
		show(highlightHelperEl);
		if(highlightNode){
			let hlnOffset = getDomOffset(highlightNode);
			highlightHelperEl.style.left = dimension2Style(hlnOffset.left);
			highlightHelperEl.style.top = dimension2Style(hlnOffset.top);
			highlightHelperEl.style.width = dimension2Style(highlightNode.offsetWidth);
			highlightHelperEl.style.height = dimension2Style(highlightNode.offsetHeight);
			return;
		}
		highlightHelperEl.style.left = dimension2Style(document.body.offsetWidth/2);
		highlightHelperEl.style.top = dimension2Style(300);
		highlightHelperEl.style.width = dimension2Style(1);
		highlightHelperEl.style.height = dimension2Style(1);
		return highlightHelperEl;
	};
	const hide_highlight_zone = () => {
		maskerEl && hide(maskerEl);
		highlightHelperEl && hide(highlightHelperEl);
	};
	const showNoviceGuide = (steps, config = {}) => {
		config = Object.assign({
			next_button_text: '下一步',
			prev_button_text: '上一步',
			finish_button_text: '完成',
			top_close: false,
			cover_included: false,
			show_counter: false,
			on_finish: function(){
			}
		}, config);
		let step_size = steps.length;
		let show_one = function(){
			if(!steps.length){
				hide_highlight_zone();
				config.on_finish();
				return;
			}
			let step = steps[0];
			steps.shift();
			let showing_cover = config.cover_included && step_size === (steps.length + 1);
			let highlightHelperEl;
			if(showing_cover){
				highlightHelperEl = show_highlight_zone(null, {
					left: document.body.offsetWidth / 2,
					top: 300,
					width: 1,
					height: 1
				});
			}else {
				highlightHelperEl = show_highlight_zone(step.relateNode);
			}
			let next_html = `<div class="${CLASS_PREFIX}-next-wrap">`;
			if((steps.length + 2) <= step_size.length){
				next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-prev-btn ">${config.prev_button_text}</span> `;
			}
			if(steps.length && config.next_button_text){
				next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-next-btn">${config.next_button_text}</span>`;
			}
			if(!steps.length && config.finish_button_text){
				next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-finish-btn">${config.finish_button_text}</span>`;
			}
			if(config.show_counter){
				next_html += `<span class="${CLASS_PREFIX}-counter">${step_size.length - steps.length}/${step_size.length}</span>`;
			}
			next_html += `</div>`;
			let tp = new Tip(`<div class="${CLASS_PREFIX}-content">${step.content}</div>${next_html}`, showing_cover ? highlightHelperEl : step.relateNode, {
				showCloseButton: config.top_close,
				dir: showing_cover ? 6 : 'auto'
			});
			tp.onHide.listen(function(){
				tp.destroy();
				hide_highlight_zone();
				config.on_finish();
			});
			tp.onShow.listen(function(){
				tp.dom.style.zIndex = "10001";
				tp.dom.querySelector(`.${CLASS_PREFIX}-next-btn,.${CLASS_PREFIX}-finish-btn`).addEventListener('click', function(){
					tp.destroy();
					show_one();
				});
				let prevBtn = tp.dom.querySelector(`.${CLASS_PREFIX}-prev-btn`);
				if(prevBtn){
					prevBtn.addEventListener('click', function(){
						tp.destroy();
						let len = steps.length;
						steps.unshift(step_size[step_size.length - len - 1]);
						steps.unshift(step_size[step_size.length - len - 2]);
						show_one();
					});
				}
			});
			tp.show();
		};
		show_one();
	};

	exports.ACAsync = ACAsync;
	exports.ACComponent = ACComponent;
	exports.ACConfirm = ACConfirm;
	exports.ACCopy = ACCopy;
	exports.ACDialog = ACDialog;
	exports.ACPreview = ACPreview;
	exports.ACSelect = ACSelect;
	exports.ACTip = ACTip;
	exports.ACToast = ACToast;
	exports.BLOCK_TAGS = BLOCK_TAGS;
	exports.Base64Encode = Base64Encode;
	exports.BizEvent = BizEvent;
	exports.Dialog = DialogClass;
	exports.DialogManager = DialogManagerClass;
	exports.GOLDEN_RATIO = GOLDEN_RATIO;
	exports.HTTP_METHOD = HTTP_METHOD;
	exports.IMG_PREVIEW_MODE_MULTIPLE = IMG_PREVIEW_MODE_MULTIPLE;
	exports.IMG_PREVIEW_MODE_SINGLE = IMG_PREVIEW_MODE_SINGLE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NAV = IMG_PREVIEW_MS_SCROLL_TYPE_NAV;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NONE = IMG_PREVIEW_MS_SCROLL_TYPE_NONE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = IMG_PREVIEW_MS_SCROLL_TYPE_SCALE;
	exports.KEYS = KEYS;
	exports.LocalStorageSetting = LocalStorageSetting;
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
	exports.PROMISE_STATE_FULFILLED = PROMISE_STATE_FULFILLED;
	exports.PROMISE_STATE_PENDING = PROMISE_STATE_PENDING;
	exports.PROMISE_STATE_REJECTED = PROMISE_STATE_REJECTED;
	exports.ParallelPromise = ParallelPromise;
	exports.QueryString = QueryString;
	exports.REMOVABLE_TAGS = REMOVABLE_TAGS;
	exports.REQUEST_FORMAT = REQUEST_FORMAT;
	exports.RESPONSE_FORMAT = RESPONSE_FORMAT;
	exports.Select = Select;
	exports.TRIM_BOTH = TRIM_BOTH;
	exports.TRIM_LEFT = TRIM_LEFT;
	exports.TRIM_RIGHT = TRIM_RIGHT;
	exports.Theme = Theme;
	exports.Tip = Tip;
	exports.Toast = ToastClass;
	exports.arrayColumn = arrayColumn;
	exports.arrayDistinct = arrayDistinct;
	exports.arrayFilterTree = arrayFilterTree;
	exports.arrayGroup = arrayGroup;
	exports.arrayIndex = arrayIndex;
	exports.base64Decode = base64Decode;
	exports.base64UrlSafeEncode = base64UrlSafeEncode;
	exports.between = between;
	exports.bindFormUnSavedUnloadAlert = bindFormUnSavedUnloadAlert;
	exports.bindImgPreviewViaSelector = bindImgPreviewViaSelector;
	exports.bindTargetContextMenu = bindTargetContextMenu;
	exports.bindTargetDropdownMenu = bindTargetDropdownMenu;
	exports.buildHtmlHidden = buildHtmlHidden;
	exports.buttonActiveBind = buttonActiveBind;
	exports.calcBetterPos = calcBetterPos;
	exports.capitalize = capitalize;
	exports.chunk = chunk;
	exports.convertBlobToBase64 = convertBlobToBase64;
	exports.convertFormDataToObject = convertFormDataToObject;
	exports.convertObjectToFormData = convertObjectToFormData;
	exports.copy = copy;
	exports.copyFormatted = copyFormatted;
	exports.createDomByHtml = createDomByHtml;
	exports.createMenu = createMenu;
	exports.cssSelectorEscape = cssSelectorEscape;
	exports.cutString = cutString;
	exports.debounce = debounce;
	exports.decodeHTMLEntities = decodeHTMLEntities;
	exports.deleteCookie = deleteCookie;
	exports.dimension2Style = dimension2Style;
	exports.doOnce = doOnce;
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
	exports.formSerializeString = formSerializeString;
	exports.formSync = formSync;
	exports.formValidate = formValidate;
	exports.formatSize = formatSize;
	exports.frequencyControl = frequencyControl;
	exports.getAvailableElements = getAvailableElements;
	exports.getAverageRGB = getAverageRGB;
	exports.getBase64ByImg = getBase64ByImg;
	exports.getBase64BySrc = getBase64BySrc;
	exports.getContextDocument = getContextDocument;
	exports.getContextWindow = getContextWindow;
	exports.getCookie = getCookie;
	exports.getCurrentFrameDialog = getCurrentFrameDialog;
	exports.getCurrentScript = getCurrentScript;
	exports.getDomDimension = getDomDimension;
	exports.getDomOffset = getDomOffset;
	exports.getElementValue = getElementValue;
	exports.getFormDataAvailable = getFormDataAvailable;
	exports.getHash = getHash;
	exports.getHighestResFromSrcSet = getHighestResFromSrcSet;
	exports.getLastMonth = getLastMonth;
	exports.getLibEntryScript = getLibEntryScript;
	exports.getLibModule = getLibModule;
	exports.getLibModuleTop = getLibModuleTop;
	exports.getMonthLastDay = getMonthLastDay;
	exports.getNextMonth = getNextMonth;
	exports.getPromiseState = getPromiseState;
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
	exports.isJSON = isJSON;
	exports.isNum = isNum;
	exports.isObject = isObject;
	exports.isPromise = isPromise;
	exports.isValidUrl = isValidUrl;
	exports.keepDomInContainer = keepDomInContainer;
	exports.keepRectCenter = keepRectCenter;
	exports.keepRectInContainer = keepRectInContainer;
	exports.loadCss = loadCss;
	exports.loadImgBySrc = loadImgBySrc;
	exports.loadScript = loadScript;
	exports.matchParent = matchParent;
	exports.mergeDeep = mergeDeep;
	exports.mergerUriParam = mergerUriParam;
	exports.monthsOffsetCalc = monthsOffsetCalc;
	exports.nodeHighlight = nodeHighlight;
	exports.objectGetByPath = objectGetByPath;
	exports.objectPushByPath = objectPushByPath;
	exports.onDocReady = onDocReady;
	exports.onHover = onHover;
	exports.onReportApi = onReportApi;
	exports.onStateChange = onStateChange;
	exports.openLinkWithoutReferer = openLinkWithoutReferer;
	exports.prettyTime = prettyTime;
	exports.pushState = pushState;
	exports.randomString = randomString;
	exports.readFileInLine = readFileInLine;
	exports.rectAssoc = rectAssoc;
	exports.rectInLayout = rectInLayout;
	exports.regQuote = regQuote;
	exports.repaint = repaint;
	exports.requestJSON = requestJSON;
	exports.resetFormChangedState = resetFormChangedState;
	exports.resolveFileExtension = resolveFileExtension;
	exports.resolveFileName = resolveFileName;
	exports.round = round;
	exports.scaleFixCenter = scaleFixCenter$1;
	exports.serializePhpFormToJSON = serializePhpFormToJSON;
	exports.setContextWindow = setContextWindow;
	exports.setCookie = setCookie;
	exports.setHash = setHash;
	exports.setStyle = setStyle;
	exports.show = show;
	exports.showContextMenu = showContextMenu;
	exports.showImgListPreview = showImgListPreviewFn;
	exports.showImgPreview = showImgPreviewFn;
	exports.showNoviceGuide = showNoviceGuide;
	exports.sortByKey = sortByKey;
	exports.strToPascalCase = strToPascalCase;
	exports.stringToEntity = stringToEntity;
	exports.stripSlashes = stripSlashes;
	exports.tabConnect = tabConnect;
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

	return exports;

})({});
