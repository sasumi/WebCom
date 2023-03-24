import {between} from "./Math.js";
import {KEYS} from "./Event.js";
import {dimension2Style, strToPascalCase, cssSelectorEscape} from "./String.js";

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

export const getDomOffset = (target)=> {
	let top = 0, left = 0
	while(target.offsetParent) {
		top += target.offsetTop
		left += target.offsetLeft
		target = target.offsetParent
	}
	return {
		top: top,
		left: left,
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
export const isButton = (el)=>{
	return el.tagName === 'BUTTON' ||
		(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
}

/**
 * closest
 * @param {Node} dom
 * @param {String} selector
 * @return {(() => (Node | null))|ParentNode|ActiveX.IXMLDOMNode|null}
 */
export const matchParent = (dom, selector)=>{
	let p = dom.parentNode;
	while(p){
		if(p.matches(selector)){
			return p;
		}
		p = p.parentNode;
	}
	return null;
}

/**
 * 检测元素是否可以输入（包含checkbox、radio类）
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export const inputAble = el=>{
	if(el.disabled ||
		el.readOnly ||
		el.tagName === 'BUTTON'||
		(el.tagName === 'INPUT' && ['hidden', 'button', 'reset'].includes(el.type))
	){
		return false;
	}
	return true;
}

/**
 * 检测child节点是否在container节点列表里面
 * @param {HTMLElement|HTMLElement[]|String} contains
 * @param {Node} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
export const domContained = (contains, child, includeEqual = false) => {
	if(typeof contains === 'string'){
		contains = document.querySelectorAll(contains);
	}else if(Array.isArray(contains)){
	} else if(typeof contains === 'object'){
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
	_c[file] = new Promise((resolve, reject)=>{
		let link = document.createElement('link');
		link.rel = "stylesheet";
		link.href = file;
		link.onload = ()=>{resolve()};
		link.onerror = ()=>{reject()};
		document.head.append(link);
	});
	return _c[file];
};

export const loadScript = (file, forceReload = false)=>{
	if(!forceReload && _c[file]){
		return _c[file];
	}
	_c[file] = new Promise((resolve, reject)=>{
		let script = document.createElement('script');
		script.src = file;
		script.onload = ()=>{resolve()};
		script.onerror = ()=>{reject()};
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
export const insertStyleSheet = (styleSheetStr, id='')=>{
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
export const setStyle = (dom, style = {})=>{
	for(let key in style){
		key = strToPascalCase(key);
		dom.style[key] = dimension2Style(style[key]);
	}
}

/**
 * 创建HTML节点
 * @param {String} html
 * @param {Node|null} parentNode 父级节点
 * @returns {HTMLElement|HTMLElement[]}
 */
export const createDomByHtml = (html, parentNode = null) => {
	let tpl = document.createElement('template');
	html = html.trim();
	tpl.innerHTML = html;
	let nodes = [];
	if(parentNode){
		tpl.content.childNodes.forEach(node=>{
			nodes.push(parentNode.appendChild(node));
		})
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
export const enterFullScreen = (element)=>{
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
export const exitFullScreen = ()=>{
	return document.exitFullscreen();
}

/**
 * 切换全屏
 * @param element
 * @returns {Promise<unknown>}
 */
export const toggleFullScreen = (element)=>{
	return new Promise((resolve, reject) => {
		if(!isInFullScreen()){
			enterFullScreen(element).then(resolve).catch(reject);
		} else {
			exitFullScreen().then(resolve).catch(reject);
		}
	})
}

/**
 * 检测是否正在全屏
 * @returns {boolean}
 */
export const isInFullScreen = ()=>{
	return !!document.fullscreenElement;
}

/**
 * 获取form元素值。
 * 该函数过滤元素disabled情况，但不判断name是否存在
 * 针对多重选择，提取数据格式为数组
 * @param {HTMLFormElement} el
 * @returns {String|Array|null} 元素值，发生错误时返回null
 */
export const getElementValue = (el) => {
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
 * 表单元素同步变更
 * 该方法会检测元素数据合法性（表单校验）
 * @param {HTMLElement} dom
 * @param {Function} getter 函数执行返回 Promise，返回null时，不填充input
 * @param {Function} setter 函数执行返回 Promise，checkbox、radio类型元素未选择时，返回null，设置失败元素将还原初始值
 */
export const formSync = (dom, getter, setter)=>{
	let els = getAvaliableElements(dom);
	els.forEach(function(el){
		let name = el.name;
		let current_val = getElementValue(el);
		el.disabled = true;
		getter(name).then(v=>{
			el.disabled = false;
			if(el.type === 'radio' || el.type === 'checkbox'){
				el.checked = el.value == v;
				current_val = v;
			} else if(v !== null){
				el.value = v;
				current_val = v;
			}
		});
		el.addEventListener('change', e=>{
			el.disabled = true;
			if(!el.checkValidity()){
				el.reportValidity();
				return;
			}
			let val = el.value;
			if((el.type === 'radio' || el.type === 'checkbox') && !el.checked){
				val = null;
			}
			setter(el.name, val).then(()=>{
				el.disabled = false;
			}, ()=>{
				if(el.type === 'radio' || el.type === 'checkbox'){
					el.checked = el.value == current_val;
				} else if(current_val !== null){
					el.value = current_val;
				}
			});
		});
	});
}


/**
 * 获取指定容器下所有可用表单元素
 * @param {HTMLElement} dom
 * @param {Boolean} ignore_empty_name 是否忽略没有name属性的元素，缺省为必须校验
 * @return {HTMLInputElement|HTMLSelectElement,HTMLTextAreaElement}
 */
export const getAvaliableElements = (dom, ignore_empty_name = false)=>{
	let els = dom.querySelectorAll('input,textarea,select');
	els = Array.from(els).filter(el => {
		return !isButton(el) && !el.disabled && (!ignore_empty_name && el.name);
	});
	return els;
}

/**
 * 表单元素校验
 * @param {HTMLElement} dom
 * @param {Boolean} name_validate 是否校验名称必填
 * @return boolean 是否校验通过
 */
export const formValidate = (dom, name_validate = false)=>{
	let els = getAvaliableElements(dom, !name_validate);
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
}

/**
 * 获取指定DOM节点下表单元素包含的表单数据，并以JSON方式组装。
 * 该函数过滤表单元素处于 disabled、缺少name等不合理情况
 * @param {HTMLElement} dom
 * @param {Boolean} validate
 * @returns {Object|null} 如果校验失败，则返回null
 */
export const formSerializeJSON = (dom, validate = true) => {
	if(!formValidate(dom)){
		return null;
	}
	let els = getAvaliableElements(dom);
	let data = {};
	let err = Array.from(els).every(el => {
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
