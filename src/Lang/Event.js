import {fitNodes} from "./Dom.js";

export class BizEvent {
	events = [];
	breakOnFalseReturn = false;

	/**
	 * 是否在返回false时中断事件继续执行
	 * @param {boolean} breakOnFalseReturn
	 */
	constructor(breakOnFalseReturn = false){
		this.breakOnFalseReturn = breakOnFalseReturn;
	}

	/**
	 * 监听事件
	 * @param {Function} payload
	 */
	listen(payload){
		this.events.push(payload);
	}

	/**
	 * 移除监听
	 * @param {Function} payload
	 */
	remove(payload){
		this.events = this.events.filter(ev => ev !== payload);
	}

	/**
	 * 清除所有监听
	 */
	clean(){
		this.events = [];
	}

	/**
	 * 触发时间
	 * @param {*} args 触发传参
	 * @returns {boolean}
	 */
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

const EVENT_ACTIVE = 'active';

/**
 * hover event
 * @param {Node|Node[]|String|String[]} nodes
 * @param {Function} hoverIn
 * @param {Function} hoverOut
 */
export const onHover = (nodes, hoverIn, hoverOut)=>{
	fitNodes(nodes).forEach(node=>{
		node.addEventListener('mouseover', hoverIn);
		node.addEventListener('mouseout', hoverOut);
	});
}

/**
 * 主动触发事件
 * @param {Node|Node[]|String|String[]} nodes
 * @param event
 */
export const fireEvent = (nodes, event) => {
	fitNodes(nodes).forEach(node=>{
		if("createEvent" in document){
			let evo = document.createEvent("HTMLEvents");
			evo.initEvent(event, false, true);
			node.dispatchEvent(evo);
		}else{
			node.fireEvent("on" + event);
		}
	});
}

/**
 * 绑定节点交互触发时间（包括鼠标点击、键盘回车、键盘空格）
 * @param {Node|Node[]|String|String[]} nodes
 * @param {CallableFunction} payload
 * @param {Boolean} cancelBubble
 * @param {Boolean} triggerAtOnce 是否立即触发一次（针对初始化场景）
 */
export const bindNodeActive = (nodes, payload, cancelBubble = false, triggerAtOnce = false) => {
	fitNodes(nodes).forEach(node=>{
		node.addEventListener('click', payload, cancelBubble);
		node.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Space || e.keyCode === KEYS.Enter){
				payload.call(node, e);
			}
		}, cancelBubble);
		if(triggerAtOnce){
			payload.call(node, null);
		}
	});
}

/**
 * on document ready
 * @param {Function} callback
 */
export const onDocReady = (callback)=>{
	if (document.readyState === 'complete') {
		callback();
	} else {
		document.addEventListener("DOMContentLoaded", callback);
	}
}

/**
 * 触发HTML节点事件
 * @param {HTMLElement} node
 * @param {String} event
 */
export const triggerDomEvent = (node, event) => {
	if("createEvent" in document){
		let evt = document.createEvent("HTMLEvents");
		evt.initEvent(event.toLowerCase(), false, true);
		node.dispatchEvent(evt);
	}else{
		node.fireEvent("on"+event.toLowerCase());
	}
};

/**
 * 批量绑定事件，支持active自定义事件
 * @param {Node|Node[]|String|String[]} nodes
 * @param {String|String[]} event 事件名称或事件名称列表
 * @param {Function} payload
 * @param {*} option
 * @param {Boolean} triggerAtOnce 是否立即触发一次（针对初始化场景）
 */
export const bindNodeEvents = (nodes, event, payload, option = null, triggerAtOnce = false) => {
	fitNodes(nodes).forEach(node=>{
		let evs = Array.isArray(event) ? event : [event];
		evs.forEach(ev => {
			if(ev === EVENT_ACTIVE){
				bindNodeActive(node, payload, option);
			}else{
				node.addEventListener(ev, payload, option);
			}
		});
		if(triggerAtOnce){
			payload.call(node, null);
		}
	});
}

/**
 * 事件代理
 * @param {HTMLElement} container
 * @param {String} selector
 * @param {String} eventName
 * @param {Function} payload(event, matchedTarget) 回调，第二个参数为匹配的对象节点
 */
export const eventDelegate = (container, selector, eventName, payload)=>{
	container.addEventListener(eventName, ev=>{
		let target = ev.target;
		while(target){
			if(target.matches(selector)){
				payload.call(target, ev, target);
				return;
			}
			if(target === container){
				return;
			}
			target = target.parentNode;
		}
	});
}

export const KEYS = {
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