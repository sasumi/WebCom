import {between} from "./Math.js";
import {strToPascalCase} from "./String.js";
import {dimension2Style} from "./Html.js";
import {guid} from "./Util.js";

export const getViewWidth = () => {
	return window.innerWidth;
}

export const getViewHeight = () => {
	return window.innerHeight;
}

/**
 * 隐藏节点（通过设置display:none方式）
 * @param {Node|String} dom
 */
export const hide = (dom) => {
	findOne(dom).style.display = 'none';
}

/**
 * 删除节点
 * @param {Node} dom
 * @return {boolean}
 */
export const remove = (dom) => {
	if(dom && dom.parentNode){
		dom.parentNode.removeChild(dom);
		return true;
	}
	return false;
}

/**
 * 显示节点（通过设置display为空方式）
 * @param {HTMLElement} dom
 * @param dom
 */
export const show = (dom) => {
	findOne(dom).style.display = '';
}

/**
 * 切换显示、隐藏元素
 * @param {Node} dom
 * @param toShow
 */
export const toggle = (dom, toShow) => {
	toShow ? show(dom) : hide(dom);
}

const _el_disabled_class_ = '__element-lock__';

/**
 * 禁用元素（禁止交互，设置disabled）
 * @param {String|Node} el
 * @param {String} disabledClass
 */
export const disabled = (el, disabledClass = '')=>{
	return toggleDisabled(el, disabledClass, false);
}

/**
 * 启用元素（允许交互，移除disabled）
 * @param {String|Node} el
 * @param {String} disabledClass
 */
export const enabled = (el, disabledClass = '')=>{
	return toggleDisabled(el, disabledClass, true);
}

/**
 * 禁用启用元素切换
 * @param {String|Node} el
 * @param {String} disabledClass
 * @param {Boolean|Null} forceEnabled 强制启用、禁用，为空表示自动切换
 */
export const toggleDisabled = (el, disabledClass = '', forceEnabled = null) => {
	let toDisabled = forceEnabled === null ? !el.classList.has(_el_disabled_class_) : !forceEnabled;
	if(toDisabled){
		insertStyleSheet(`.${_el_disabled_class_} {pointer-event:none !important;}`, '__element_lock_style__');
	}
	el = findOne(el);
	el.classList.toggle(_el_disabled_class_, !toDisabled);
	el[toDisabled ? 'setAttribute' : 'removeAttribute']('disabled', 'disabled');
	el[toDisabled ? 'setAttribute' : 'removeAttribute']('data-disabled', 'disabled');
	if(disabledClass){
		el.classList.toggle(disabledClass, !toDisabled);
	}
}

/**
 * 绑定元素，禁止交互
 * @param {Node} el
 * @param {Function} payload 处理函数，参数为 reset
 */
export const lockElementInteraction = (el, payload) => {
	disabled(el);
	let reset = () => {
		enabled(el);
	};
	payload(reset);
}

/**
 * 获取当前节点在父结点中的索引号
 * @param node
 * @return {number}
 */
export const nodeIndex = (node) => {
	return Array.prototype.indexOf.call(node.parentNode.children, node);
}

/**
 * @param {String|Object} selector 选择器，如果是Object，则直接返回Object
 * @param {Node} parent
 * @return {Node}
 */
export const findOne = (selector, parent = document) => {
	return typeof (selector) === 'string' ? parent.querySelector(selector) : selector;
}

/**
 * 选择器等待
 * @param {String} selector
 * @param {Object} option
 * @param {Number} option.timeout 超时时间，默认为10秒（不能为0）
 * @param {Node|null} option.parent 父级节点，默认为document
 * @param {Number} option.checkInterval 检查间隔，默认为10毫秒
 * @return {Promise<Node[]>}
 */
export const waitForSelector = (selector, option = {}) => {
	return new Promise((resolve, reject) => {
		waitForSelectors(selector, option).then(ns => {
			resolve(ns[0]);
		}, reject);
	})
}

/**
 * 批量选择器等待
 * @param {String} selector
 * @param {Object} option
 * @param {Number} option.timeout 超时时间，默认为10秒（不能为0）
 * @param {Node|null} option.parent 父级节点，默认为document
 * @param {Number} option.checkInterval 检查间隔，默认为10毫秒
 * @return {Promise<Node[]>}
 */
export const waitForSelectors = (selector, option = {}) => {
	let {timeout, parent, checkInterval} = option;
	checkInterval = checkInterval || 10;
	timeout = timeout || 10000;
	parent = parent || document;
	const st = Date.now();
	return new Promise((resolve, reject) => {
		let chk = () => {
			if(timeout && (Date.now() - st > timeout)){
				reject(`waitForSelectors timeout, ${selector} ${timeout}ms`);
				return;
			}
			let ns = parent.querySelectorAll(selector);
			if(ns.length){
				resolve(ns);
				return;
			}
			setTimeout(chk, checkInterval);
		};
		chk();
	})
}

/**
 * 通过选择器查找子节点（强制添加 :scope来约束必须是子节点）
 * @param {String} selector
 * @param {Node} parent
 * @return {Node[]}
 */
export const findAll = (selector, parent = document) => {
	if(typeof selector === 'string'){
		selector = selector.trim();
		if(selector.indexOf(':scope') !== 0){
			selector = ':scope ' + selector;
		}
		return Array.from(parent.querySelectorAll(selector));
	}else if(Array.isArray(selector)){
		let ns = [];
		selector.forEach(sel => {
			ns.push(...findAll(sel));
		});
		return ns;
	}else{
		return [selector];
	}
}

export const findAllOrFail = (selector, parent = document) => {
	let ls = findAll(selector, parent);
	if(!ls.length){
		throw "no nodes found:" + selector;
	}
	return ls;
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
 * 判断元素是否为按钮
 * @param {HTMLElement} el
 */
export const isButton = (el) => {
	return el.tagName === 'BUTTON' ||
		(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
}

/**
 * 绑定 textarea 自动增长
 * @param {HTMLTextAreaElement} textarea
 * @param init
 */
export const bindTextAutoResize = (textarea, init = true) => {
	textarea.style.height = 'auto';
	textarea.addEventListener('input', () => {
		textarea.style.height = textarea.scrollHeight + 'px';
	});
	if(init){
		textarea.style.height = textarea.scrollHeight + 'px';
	}
}

/**
 * 使用插入临时节点方式计算节点占用高度
 * 优点：避免过多子节点margin等布局影响计算复杂度
 * @param node
 */
let __divs = {};
const NODE_HEIGHT_TMP_ATTR_KEY = 'data-NODE-HEIGHT-TMP-ATTR-KEY';
const getNodeHeightWithMargin = (node) => {
	let tmp_div_id = node.getAttribute(NODE_HEIGHT_TMP_ATTR_KEY);
	if(tmp_div_id && __divs[tmp_div_id] && __divs[tmp_div_id].parentNode){
		return __divs[tmp_div_id].offsetTop;
	}
	tmp_div_id = guid('tmp_div_id');
	node.setAttribute(NODE_HEIGHT_TMP_ATTR_KEY, tmp_div_id);
	let tmp_div = document.createElement('div');
	tmp_div.style.cssText = 'height:0; width:100%; clear:both;';
	node.appendChild(tmp_div);
	__divs[tmp_div_id] = tmp_div;
	return tmp_div.offsetTop;
}

const resizeIframe = (iframe) => {
	let bdy = iframe.contentWindow.document.body;
	if(!bdy){
		return;
	}
	let h = getNodeHeightWithMargin(bdy);
	iframe.style.height = dimension2Style(h);
}

/**
 * iframe根据内容自动调整高度
 * iframe页面host必须和父级页面host同域，或者声明同域名
 * @param iframe
 */
export const bindIframeAutoResize = (iframe) => {
	let obs;
	try{
		//成功加载后，只监听节点变化才调整高度，避免性能消耗
		iframe.addEventListener('load', () => {
			resizeIframe(iframe);
			mutationEffective(iframe.contentWindow.document.body, {
				attributes: true,
				subtree: true,
				childList: true
			}, () => {
				resizeIframe(iframe);
			});
		});
	}catch(err){
		try{
			obs && obs.disconnect();
		}catch(err){
			console.error('observer disconnect fail', err)
		}
		console.warn('iframe content upd', err);
	}
}

/**
 * textarea 支持 tab 输入
 * @param {HTMLTextAreaElement} textarea
 * @param {String} tabChar
 */
export const bindTextSupportTab = (textarea, tabChar = "\t") => {
	textarea.addEventListener('keydown', function(e){
		if(e.key !== 'Tab'){
			return;
		}
		e.preventDefault();
		document.execCommand('insertText', false, tabChar); //支持undo
	});
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
 * @param {Node|Node[]|String|String[]} nodes
 * @param {HTMLElement} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
export const domContained = (nodes, child, includeEqual = false) => {
	let contains = findAll(nodes);
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
export const getFocusableElements = (dom = document) => {
	let els = findAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)', dom);
	return els.filter(el => {
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
 * get node xpath
 * @param el
 * @return {String}
 */
export const getNodeXPath = (el) => {
	let allNodes = document.getElementsByTagName('*');
	let seg_list = [];
	for(seg_list = []; el && el.nodeType === 1; el = el.parentNode){
		if(el.hasAttribute('id')){
			let uniqueIdCount = 0;
			for(let n = 0; n < allNodes.length; n++){
				if(allNodes[n].hasAttribute('id') && allNodes[n].id === el.id) uniqueIdCount++;
				if(uniqueIdCount > 1) break;
			}
			if(uniqueIdCount === 1){
				seg_list.unshift('id("' + el.getAttribute('id') + '")');
				return seg_list.join('/');
			}else{
				seg_list.unshift(el.localName.toLowerCase() + '[@id="' + el.getAttribute('id') + '"]');
			}
		}else if(el.hasAttribute('class')){
			seg_list.unshift(el.localName.toLowerCase() + '[@class="' + el.getAttribute('class') + '"]');
		}else{
			let i, sib;
			for(i = 1, sib = el.previousSibling; sib; sib = sib.previousSibling){
				if(sib.localName === el.localName){
					i++;
				}
			}
			seg_list.unshift(el.localName.toLowerCase() + '[' + i + ']');
		}
	}
	return seg_list.length ? '/' + seg_list.join('/') : null;
}

/**
 * 监听节点树变更
 * @param {Node} dom
 * @param {Function} callback
 * @param {Boolean} includeElementChanged 是否包含表单元素的值变更
 */
export const onDomTreeChange = (dom, callback, includeElementChanged = true) => {
	const PRO_KEY = 'ON_DOM_TREE_CHANGE_BIND_' + guid();
	let watchEl = () => {
		findAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`, dom).forEach(el => {
			el.setAttribute(PRO_KEY, '1');
			el.addEventListener('change', callback);
		});
	}
	mutationEffective(dom, {attributes: true, subtree: true, childList: true}, () => {
		includeElementChanged && watchEl();
		callback();
	}, 10);
	includeElementChanged && watchEl();
}

/**
 * 更低占用执行mutation监听，支持指定最小间隔时间执行回调
 * @param {Node} dom
 * @param {Object} option
 * @param {Boolean} option.attributes
 * @param {Boolean} option.subtree
 * @param {Boolean} option.childList
 * @param {Function} payload
 * @param {Number} minInterval 执行回调最小间隔时间（毫秒）
 */
export const mutationEffective = (dom, option, payload, minInterval = 10) => {
	let last_queue_time = 0;
	let callback_queueing = false;
	let obs = new MutationObserver(() => {
		if(callback_queueing){
			return;
		}
		let r = minInterval - (new Date().getTime() - last_queue_time);
		if(r > 0){
			callback_queueing = true;
			setTimeout(() => {
				callback_queueing = false;
				last_queue_time = new Date().getTime();
				payload(obs);
			}, r);
		}else{
			last_queue_time = new Date().getTime();
			payload(obs);
		}
	});
	obs.observe(dom, option);
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
 * 在头部插入样式
 * @param {String} styleSheetStr 样式代码
 * @param {String} id 样式ID，如果提供ID，将会检测是否已经插入，可以避免重复插入
 * @param {Document} doc 文档上下文
 * @return {HTMLStyleElement}
 */
export const insertStyleSheet = (styleSheetStr, id = '', doc = document) => {
	if(id && doc.querySelector(`#${id}`)){
		return doc.querySelector(`#${id}`);
	}
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
 * 检测元素是否设置为sticky，且已经产生了吸顶效果
 * @param {Node} node
 * @param {String} className
 * @see https://stackoverflow.com/questions/16302483/event-to-detect-when-positionsticky-is-triggered
 */
export const toggleStickyClass = (node, className) => {
	const observer = new IntersectionObserver(([e]) => {
		e.target.classList.toggle(className, e.intersectionRatio < 1);
	}, {
		rootMargin: '-1px 0px 0px 0px',
		threshold: [1],
	});
	observer.observe(node);
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
