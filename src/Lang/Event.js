import {findOne, fitNodes} from "./Dom.js";
import {inputAble} from "./Form.js";

/**
 * KeyboardEvent.key 映射
 * @var Object{*}
 */
let KEY_MAP = {
	0: 'Digit0', 1: 'Digit1', 2: 'Digit2', 3: 'Digit3', 4: 'Digit4', 5: 'Digit5', 6: 'Digit6', 7: 'Digit7', 8: 'Digit8', 9: 'Digit9',
	A: 'KeyA', B: 'KeyB', C: 'KeyC', D: 'KeyD', E: 'KeyE', F: 'KeyF', G: 'KeyG', H: 'KeyH', I: 'KeyI', J: 'KeyJ', K: 'KeyK', L: 'KeyL', M: 'KeyM', N: 'KeyN', O: 'KeyO', P: 'KeyP', Q: 'KeyQ', R: 'KeyR', S: 'KeyS', T: 'KeyT', U: 'KeyU', V: 'KeyV', W: 'KeyW', X: 'KeyX', Y: 'KeyY', Z: 'KeyZ',
	Space: ' ', Enter: 'Enter', Tab: 'Tab',
	Shift: 'Shift', Control: 'Control', Alt:'Alt',
	F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12', F13: 'F13', F14: 'F14', F15: 'F15', F16: 'F16', F17: 'F17', F19: 'F19', F20: 'F20',
	ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
	Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
	Escape: 'Escape', Backspace: 'Backspace', Delete: 'Delete', Insert: 'Insert', Clear: 'Clear', Copy: 'Copy', Paste: 'Paste', Redo: 'Redo', Undo: 'Undo',
	Meta: 'Meta',  Symbol:'Symbol',
	CapsLock:'CapsLock', NumLock: 'NumLock', ScrollLock: 'ScrollLock', SymbolLock: 'SymbolLock', FnLock: 'FnLock',
	ContextMenu: 'ContextMenu',
};

const SYMBOLS = '~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./'.split('');

//添加符号
SYMBOLS.forEach(sym=>{
	KEY_MAP[sym] = sym;
});

//字母
KEY_MAP.Alpla = [KEY_MAP.A, KEY_MAP.B, KEY_MAP.C, KEY_MAP.D, KEY_MAP.E, KEY_MAP.F, KEY_MAP.G, KEY_MAP.H, KEY_MAP.I, KEY_MAP.J, KEY_MAP.K, KEY_MAP.L, KEY_MAP.M, KEY_MAP.N, KEY_MAP.O, KEY_MAP.P, KEY_MAP.Q, KEY_MAP.R, KEY_MAP.S, KEY_MAP.T, KEY_MAP.U, KEY_MAP.V, KEY_MAP.W, KEY_MAP.X, KEY_MAP.Y, KEY_MAP.Z];
//数字
KEY_MAP.Number = [KEY_MAP[0], KEY_MAP[1], KEY_MAP[2], KEY_MAP[3], KEY_MAP[4], KEY_MAP[5], KEY_MAP[6], KEY_MAP[7], KEY_MAP[8], KEY_MAP[9]];
//符号
KEY_MAP.Symbol = SYMBOLS;
//空白键
KEY_MAP.Whitespace = [KEY_MAP.Space, KEY_MAP.Enter, KEY_MAP.Tab];
//内容按键
KEY_MAP.Content = [...KEY_MAP.Alpla, ...KEY_MAP.Whitespace, ...KEY_MAP.Number, ];
//功能键
KEY_MAP.Fn = [KEY_MAP.F1, KEY_MAP.F2, KEY_MAP.F3, KEY_MAP.F4, KEY_MAP.F5, KEY_MAP.F6, KEY_MAP.F7, KEY_MAP.F8, KEY_MAP.F9, KEY_MAP.F10, KEY_MAP.F11, KEY_MAP.F12, KEY_MAP.F13, KEY_MAP.F14, KEY_MAP.F15, KEY_MAP.F16, KEY_MAP.F17, KEY_MAP.F19, KEY_MAP.F20];
//方向键
KEY_MAP.Arrow = [KEY_MAP.ArrowUp, KEY_MAP.ArrowDown, KEY_MAP.ArrowLeft, KEY_MAP.ArrowRight];
//导航
KEY_MAP.Navigation = [...KEY_MAP.Arrow, KEY_MAP.Home, KEY_MAP.End, KEY_MAP.PageUp, KEY_MAP.PageDown];

export const KEYBOARD_KEY_MAP = KEY_MAP;

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
 * hover 事件，兼容移动端
 * @param {Node|Node[]|String|String[]} nodes
 * @param {Function|Null} hoverIn
 * @param {Function|Null} hoverOut
 * @param {String} hoverClass 额外添加hover类名
 */
export const onHover = (nodes, hoverIn = null, hoverOut = null, hoverClass = '') => {
	const _in = (e, node) => {
		hoverClass && node.classList.add(hoverClass);
		return hoverIn ? hoverIn(e) : null;
	}
	const _out = (e, node) => {
		hoverClass && node.classList.remove(hoverClass);
		return hoverOut ? hoverOut(e) : null;
	}
	fitNodes(nodes).forEach(node => {
		node.addEventListener('touchstart', e => {return _in(e, node);});
		node.addEventListener('touchend', e => {return _out(e, node);});
		node.addEventListener('mouseover', e => {return _in(e, node);});
		node.addEventListener('mouseout', e => {return _out(e, node);});
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
				node.click(); //keyup同时触发一个 PointerEvent事件，这里做修正
				e.preventDefault();
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
 * 绑定组合键
 * @param {String} keyStr
 * @param {Function} payload
 * @param {Object} option
 * @param {String} option.event 事件类型，默认为keydown
 * @param {String|Node} option.scope 事件绑定范围，默认为document
 * @param {Boolean} option.preventDefault 是否阻止默认事件，默认为阻止
 */
export const bindHotKeys = (keyStr, payload, option = {}) => {
	let keys = keyStr.replace(/\s/ig, '').toLowerCase().split('+');
	let {scope, event, preventDefault} = option;
	preventDefault = preventDefault === undefined ? true : !!preventDefault;
	event = event || 'keydown';
	scope = findOne(scope || document);
	scope.addEventListener(event, e => {
		if((keys.includes('shift') ^ e.shiftKey) ||
			(keys.includes('ctrl') ^ e.ctrlKey) ||
			(keys.includes('alt') ^ e.altKey)
		){
			return true;
		}

		//需要考虑避开可输入区域
		if(e.target !== scope && //如果对象非绑定指定对象，
			KEYBOARD_KEY_MAP.Content.includes(e.key) && (!e.altKey && !e.ctrlKey) && //输入内容
			inputAble(e.target) //可输入对象（这里不需要考虑 [contenteditable]，由调用方自己负责
		){
			return true;
		}

		//移除组合键
		let singleKeys = keys.filter(k => {
			return !['shift', 'ctrl', 'alt', 'meta'].includes(k);
		});
		if(singleKeys.length > 1){
			console.error('bindHotKeys no support pattern:', keyStr);
			return;
		}

		//去除单纯按快捷键方式
		let pressKeyCode = [KEYBOARD_KEY_MAP.Shift, KEYBOARD_KEY_MAP.Control, KEYBOARD_KEY_MAP.Alt].includes(e.key) ? null : e.keyCode;

		if((!singleKeys.length && !pressKeyCode) || (singleKeys[0] === e.key)){
			payload.call(e.target, e);
			if(preventDefault){
				e.preventDefault();
				return false;
			}
		}
		return true;
	})
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

/**
 * KeyboardEvent.keyCode 映射
 * @deprecated 废弃
 * **/
export const KEYS = {
	A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57,
	BackSpace: 8, Esc: 27, RightArrow: 39, Tab: 9, Space: 32, DownArrow: 40, Clear: 12, PageUp: 33, Insert: 45, Enter: 13, PageDown: 34, Delete: 46, Shift: 16, End: 35, NumLock: 144, Control: 17, Home: 36, Alt: 18, LeftArrow: 37, CapsLock: 20, UpArrow: 38,
	F1: 112,F2: 113,F3: 114,F4: 115,F5: 116,F6: 117,F7: 118,F8: 119,F9: 120,F10: 121,F11: 122,F12: 123,
	NumPad0: 96, NumPad1: 97, NumPad2: 98, NumPad3: 99, NumPad4: 100, NumPad5: 101, NumPad6: 102, NumPad7: 103, NumPad8: 104, NumPad9: 105, NumPadMultiple: 106, NumPadPlus: 107, NumPadDash: 109, NumPadDot: 110, NumPadSlash: 111, NumPadEnter: 108
};