import {between} from "./Math.js";
import {strToPascalCase} from "./String.js";
import {dimension2Style} from "./Html.js";
import {guid} from "./Util.js";

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
 * 删除节点
 * @param {Node} dom
 * @return {boolean}
 */
export const remove = (dom)=>{
	if(dom && dom.parentNode){
		dom.parentNode.removeChild(dom);
		return true;
	}
	return false;
}

/**
 * @param {HTMLElement} dom
 * @param dom
 */
export const show = (dom) => {
	dom.style.display = '';
}

/**
 * @param {Node} dom
 * @param toShow
 */
export const toggle = (dom, toShow) => {
	toShow ? show(dom) : hide(dom);
}

/**
 * 获取当前节点在父结点中的索引号
 * @param node
 * @return {number}
 */
export const nodeIndex = (node)=>{
	return Array.prototype.indexOf.call(node.parentNode.children, node);
}

/**
 * @param {String} selector
 * @param {Node} parent
 * @return {Node}
 */
export const findOne = (selector, parent = document) => {
	return parent.querySelector(selector);
}

/**
 * 通过选择器查找子节点（强制添加 :scope来约束必须是子节点）
 * @param {String} selector
 * @param {Node} parent
 * @return {Node[]}
 */
export const findAll = (selector, parent = document) => {
	selector = selector.trim();
	if(selector.indexOf(':scope') !== 0){
		selector = ':scope ' + selector;
	}
	return Array.from(parent.querySelectorAll(selector));
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
 * @deprecated 请使用原生closest方法
 * @param {HTMLElement} dom
 * @param {String} selector 匹配上级节点选择器
 * @return {(() => (HTMLElement | null))|ParentNode|ActiveX.IXMLDOMNode|null}
 */
export const matchParent = (dom, selector) => {
	return dom.closest(selector);
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
		contains = findAll(contains);
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
 * 获取指定容器下可聚焦元素列表
 * @param {Node} dom
 * @return {Node[]}
 */
export const getFocusableElements = (dom = document)=>{
	let els = findAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)', dom);
	return els.filter(el=>{
		return !isNodeHidden(el);
	});
}

/**
 * 检测节点是否被隐藏了（无法聚焦），可视区域外部的节点是可以聚焦的
 * @param {Node} node
 * @return {boolean}
 */
export const isNodeHidden = (node) => {
	return node.offsetParent === null;
}


/**
 * 监听节点树变更
 * @param {Node} dom
 * @param {Function} callback
 * @param {Boolean} includeElementChanged 是否包含表单元素的值变更
 */
export const onDomTreeChange = (dom, callback, includeElementChanged = true) => {
	let tm = null;
	const PRO_KEY = 'ON_DOM_TREE_CHANGE_BIND_' + guid();
	const payload = () => {
		tm && clearTimeout(tm);
		tm = setTimeout(callback, 0);
	}
	const watchEls = (els) => {
		if(!els || !els.length){
			return;
		}
		els.forEach(el => {
			el.setAttribute(PRO_KEY, '1');
			el.addEventListener('change', payload);
		});
	}
	let obs = new MutationObserver(() => {
		if(includeElementChanged){
			let els = dom.querySelectorAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`);
			watchEls(els);
		}
		payload();
	});
	obs.observe(dom, {attributes: true, subtree: true, childList: true});
	includeElementChanged && watchEls(dom.querySelectorAll('input,textarea,select'));
}

/**
 * 监听指定节点，如果匹配的选择器结果有发生变更，则通知外部
 * @example 用该函数来做状态联动，如指定容器内是否包含 checkbox，来联动按钮是否能够点击
 * domChangedWatch(ListDom, 'input:checked', exists=>button.disabled = !exists);
 * @param {Node} container 指定容器
 * @param {String} matchedSelector 匹配子节点的选择器
 * @param {Function} notification(collection) 通知函数，产生于为 []，表示是否包含选择器子节点数组
 * @param {Boolean} executionFirst 是否在一开始先执行一次通知函数
 */
export const domChangedWatch = (container, matchedSelector, notification, executionFirst = true) => {
	onDomTreeChange(container, () => {
		notification(findAll(matchedSelector, container));
	});
	if(executionFirst){
		notification(findAll(matchedSelector, container));
	}
}

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
 * @param target
 * @param container
 */
export const keepDomInContainer = (target, container = document.body) => {
	keepRectInContainer({
		left: target.left,
		top: target.top,
		width: target.clientWidth,
		height: target.clientHeight,
	});
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
	dom.style.display = 'block';
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
 * 高亮节点关键字
 * @param {HTMLElement} node
 * @param {RegExp|String} pattern
 * @param {String} hlClass
 * @return {number}
 */
export const nodeHighlight = (node, pattern, hlClass) => {
	let skip = 0;
	if(node.nodeType === 3){
		pattern = new RegExp(pattern, 'i');
		let pos = node.data.search(pattern);
		if(pos >= 0 && node.data.length > 0){ // .* matching "" causes infinite loop
			let match = node.data.match(pattern); // get the match(es), but we would only handle the 1st one, hence /g is not recommended
			let spanNode = document.createElement('span');
			spanNode.className = hlClass; // set css
			let middleBit = node.splitText(pos); // split to 2 nodes, node contains the pre-pos text, middleBit has the post-pos
			let endBit = middleBit.splitText(match[0].length); // similarly split middleBit to 2 nodes
			let middleClone = middleBit.cloneNode(true);
			spanNode.appendChild(middleClone);
			// parentNode ie. node, now has 3 nodes by 2 splitText()s, replace the middle with the highlighted spanNode:
			middleBit.parentNode.replaceChild(spanNode, middleBit);
			skip = 1; // skip this middleBit, but still need to check endBit
		}
	}else if(node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)){
		for(let i = 0; i < node.childNodes.length; ++i){
			i += nodeHighlight(node.childNodes[i], pattern, hlClass);
		}
	}
	return skip;
}

/**
 * tab 连接
 * @param {Element[]|String} tabs tab节点列表
 * @param {Element[]|String} contents 内容节点列表
 * @param {Object} option 选项
 * @param {string} option.contentActiveClass 内容区激活类名
 * @param {string} option.tabActiveClass tab区激活类名
 * @param {string} option.triggerEvent tab激活事件类型
 */
export const tabConnect = (tabs, contents, option = {}) => {
	let {contentActiveClass = 'active', tabActiveClass = 'active', triggerEvent = 'click'} = option;
	if(typeof (tabs) === 'string'){
		tabs = findAll(tabs);
	}
	if(typeof (contents) === 'string'){
		contents = findAll(contents);
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
		while(win !== win.parent){
			win = win.parent;
		}
	}catch(err){
		console.warn('context window assign fail:', err);
	}
	return win || window;
}

/**
 * 设置cookie
 * @param {String} name
 * @param {String} value
 * @param {Number} days
 * @param {String} path
 */
export const setCookie = (name, value, days, path = '/') => {
	var expires = "";
	if(days){
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=" + path;
}

/**
 * 获取cookie
 * @param {String} name
 * @returns {string|null}
 */
export const getCookie = (name) => {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++){
		var c = ca[i];
		while(c.charAt(0) == ' ') c = c.substring(1, c.length);
		if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

/**
 * 删除cookie
 * @param name
 */
export const deleteCookie = (name) => {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}