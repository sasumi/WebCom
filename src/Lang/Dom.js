import {between} from "./Math.js";
import {KEYS} from "./Event.js";
import {dimension2Style, strToPascalCase} from "./String.js";

export const getViewWidth = () => {
	return window.innerWidth;
};

export const getViewHeight = () => {
	return window.innerHeight;
};

/**
 * @param {HTMLElement} dom
 */
export const hide = (dom) => {
	dom.style.display = 'none';
}

/**
 * @param {HTMLElement} dom
 * @param dom
 */
export const show = (dom) => {
	dom.style.display = '';
}

/**
 * @param {HTMLElement} dom
 * @param toShow
 */
export const toggle = (dom, toShow) => {
	toShow ? show(dom) : hide(dom);
}

/**
 * 获取节点相对于文档顶部定位
 * @param target
 * @return {{top: number, left: number}}
 */
export const getDomOffset = (target) => {
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
}

/**
 * 主动触发事件
 * @param {HTMLElement} el
 * @param event
 */
export const fireEvent = (el, event) => {
	if("createEvent" in document){
		let evo = document.createEvent("HTMLEvents");
		evo.initEvent(event, false, true);
		el.dispatchEvent(evo);
	}else{
		el.fireEvent("on" + event);
	}
}

/**
 * 判断元素是否为按钮
 * @param {HTMLElement} el
 */
export const isButton = (el) => {
	return el.tagName === 'BUTTON' ||
		(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
}

/**
 * 获取最近上级节点
 * @param {HTMLElement} dom
 * @param {String} selector 匹配上级节点选择器
 * @return {(() => (HTMLElement | null))|ParentNode|ActiveX.IXMLDOMNode|null}
 */
export const matchParent = (dom, selector) => {
	let p = dom.parentNode;
	while(p && p !== document){
		if(p.matches(selector)){
			return p;
		}
		p = p.parentNode;
	}
	return null;
}

/**
 * 检测child节点是否在container节点列表里面
 * @param {HTMLElement|HTMLElement[]|String} contains
 * @param {HTMLElement} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
export const domContained = (contains, child, includeEqual = false) => {
	if(typeof contains === 'string'){
		contains = document.querySelectorAll(contains);
	}else if(Array.isArray(contains)){
	}else if(typeof contains === 'object'){
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
export const buttonActiveBind = (button, payload, cancelBubble = false) => {
	button.addEventListener('click', payload, cancelBubble);
	button.addEventListener('keyup', e => {
		if(e.keyCode === KEYS.Space || e.keyCode === KEYS.Enter){
			payload.call(button, e);
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
export const keepRectCenter = (width, height, containerDimension = {
	left: 0,
	top: 0,
	width: window.innerWidth,
	height: window.innerHeight
}) => {
	return [
		Math.max((containerDimension.width - width) / 2 + containerDimension.left, 0),
		Math.max((containerDimension.height - height) / 2 + containerDimension.top, 0)
	];
}

/**
 *
 * @param target
 * @param container
 */
export const keepDomInContainer = (target, container = document.body) => {
	let ret = keepRectInContainer({
		left: target.left,
		top: target.top,
		width: target.clientWidth,
		height: target.clientHeight,
	}, {}, posAbs = true);
}

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
export const keepRectInContainer = (objDim, ctnDim = {
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
}

/**
 * 获取对象宽、高
 * 通过设置 visibility 方式进行获取
 * @param {HTMLElement} dom
 * @return {{width: number, height: number}}
 */
export const getDomDimension = (dom) => {
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
}

/**
 * 矩形相交（包括边重叠情况）
 * @param {Object} rect1
 * @param {Object} rect2
 * @returns {boolean}
 */
export const rectAssoc = (rect1, rect2) => {
	if(rect1.left <= rect2.left){
		return (rect1.left + rect1.width) >= rect2.left && (
			between(rect2.top, rect1.top, rect1.top + rect1.height) ||
			between(rect2.top + rect2.height, rect1.top, rect1.top + rect1.height) ||
			rect2.top >= rect1.top && rect2.height >= rect1.height
		);
	}else{
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
export const isElement = (obj) => {
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
export const loadCss = (file, forceReload = false) => {
	if(!forceReload && _c[file]){
		return _c[file];
	}
	_c[file] = new Promise((resolve, reject) => {
		let link = document.createElement('link');
		link.rel = "stylesheet";
		link.href = file;
		link.onload = () => {
			resolve()
		};
		link.onerror = () => {
			reject()
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
export const loadScript = (src, forceReload = false) => {
	if(!forceReload && _c[src]){
		return _c[src];
	}
	_c[src] = new Promise((resolve, reject) => {
		let script = document.createElement('script');
		script.src = src;
		script.onload = () => {
			resolve()
		};
		script.onerror = () => {
			reject()
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
export const insertStyleSheet = (styleSheetStr, id = '', doc = document) => {
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
export const getRegion = (win = window) => {
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
	}else{
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
export const rectInLayout = (rect, layout) => {
	return between(rect.top, layout.top, layout.top + layout.height) && between(rect.left, layout.left, layout.left + layout.width) //左上角
		&& between(rect.top + rect.height, layout.top, layout.top + layout.height) && between(rect.left + rect.width, layout.left, layout.left + layout.width); //右下角
};

/**
 * 设置dom样式
 * @param {HTMLElement} dom
 * @param {Object} style 样式对象
 */
export const setStyle = (dom, style = {}) => {
	for(let key in style){
		key = strToPascalCase(key);
		dom.style[key] = dimension2Style(style[key]);
	}
}

/**
 * 创建HTML节点
 * @param {String} html
 * @param {HTMLElement|null} parentNode 父级节点
 * @returns {HTMLElement|HTMLElement[]}
 */
export const createDomByHtml = (html, parentNode = null) => {
	let tpl = document.createElement('template');
	html = html.trim();
	tpl.innerHTML = html;
	let nodes = [];
	if(parentNode){
		tpl.content.childNodes.forEach(node => {
			nodes.push(parentNode.appendChild(node));
		})
	}else{
		nodes = tpl.content.childNodes;
	}
	return nodes.length === 1 ? nodes[0] : nodes;
};

/**
 * 强制重绘元素
 * @param {HTMLElement} element
 * @param {Number} delay
 */
export function repaint(element, delay = 0){
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
export const enterFullScreen = (element) => {
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
}

/**
 * 退出全屏
 * @returns {Promise<void>}
 */
export const exitFullScreen = () => {
	return document.exitFullscreen();
}

/**
 * 切换全屏
 * @param element
 * @returns {Promise<unknown>}
 */
export const toggleFullScreen = (element) => {
	return new Promise((resolve, reject) => {
		if(!isInFullScreen()){
			enterFullScreen(element).then(resolve).catch(reject);
		}else{
			exitFullScreen().then(resolve).catch(reject);
		}
	})
}

/**
 * 检测是否正在全屏
 * @returns {boolean}
 */
export const isInFullScreen = () => {
	return !!document.fullscreenElement;
}

let CURRENT_WINDOW;

/**
 * @param win
 */
export const setContextWindow = (win) => {
	CURRENT_WINDOW = win;
}

/**
 * 获取当前上下文 文档，缺省为获取top
 * @return {Document}
 */
export const getContextDocument = () => {
	let win = getContextWindow();
	return win.document;
};

/**
 * 获取上下文窗口
 * @return {Window}
 */
export const getContextWindow = () => {
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
}