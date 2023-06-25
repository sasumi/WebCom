import {ACAsync} from "./ACAsync.js";
import {ACDialog} from "./ACDialog.js";
import {ACConfirm} from "./ACConfirm.js";
import {ACTip} from "./ACTip.js";
import {ACCopy} from "./ACCopy.js";
import {ACToast} from "./ACToast.js";

const COMPONENT_ATTR_KEY = 'data-component'; //data-com="com1,com2"
const COMPONENT_BIND_FLAG_KEY = 'component-init-bind';

const AC_COMPONENT_MAP = {
	'async': ACAsync,
	'popup': ACDialog,
	'confirm': ACConfirm,
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
 * 检测节点是否拥有组件
 * @param {HTMLElement} node
 * @param component_name
 * @returns {*}
 */
export const nodeHasComponent = function(node, component_name){
	let cs = parseComponents(node.getAttribute(COMPONENT_ATTR_KEY));
	return cs.includes(component_name);
}

/**
 * 从节点中解析出使用 data-key- 为前缀的属性
 * @param node
 * @param key
 * @return {{}}
 */
const resolveDataParam = (node, key) => {
	let ret = {};
	//todo
	for(let k in node.dataset){
		if(k.indexOf(key) === 0 && (k.length <= key.length || /A-Z/.test(k[key.length + 1]))){
			let objKey = k.substring(key.length);
			ret[objKey] = node.dataset[k];
		}
	}
	return ret;
}

const bindNode = function(container = document){
	container.querySelectorAll(`:not([${COMPONENT_BIND_FLAG_KEY}])[${COMPONENT_ATTR_KEY}]`).forEach(node => {
		node.setAttribute(COMPONENT_BIND_FLAG_KEY, "1");
		let cs = parseComponents(node.getAttribute(COMPONENT_ATTR_KEY));
		let activeStacks = [];
		cs.forEach(com => {
			let C = AC_COMPONENT_MAP[com];
			if(!C){
				console.warn('component no found', com);
				return false;
			}
			let data = resolveDataParam(node, com);
			if(C.init){
				C.init(node, data);
			}
			if(C.active){
				activeStacks.push([C.active, data]);
			}
			return true;
		})

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

}

const bindActiveChain = (node, activeStacks) => {
	let event = 'click';
	if(isInputAble(node)){
		event = 'keyup';
	}else if(node.tagName === 'FORM'){
		event = 'submit';
	}else{
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
}

const ACRun = {
	watch: (container = document.body) => {
		let m_tm = null;
		container.addEventListener('DOMSubtreeModified propertychange', function(){
			clearTimeout(m_tm);
			m_tm = setTimeout(function(){
				bindNode();
			}, 0);
		});
		bindNode(container);
	}
};

export {ACRun};