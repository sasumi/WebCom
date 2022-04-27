import {ACMultiSelect} from "./ACMultiSelect.js";
import {ACConfirm} from "./ACConfirm.js";
import {ACMultiOperate} from "./ACMultiOperate.js";
import {ACAsync} from "./ACAsync.js";
import {ACThumb} from "./ACThumb.js";

export const COM_ATTR_KEY = 'data-com';
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
export const ACEventChainBind = (dom, event, payload)=>{
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
}

export const ACGetComponents = (node) => {
	let ComList = node.getAttribute(COM_ATTR_KEY).split(',');
	return validateComponents(ComList);
};

export const ACBindComponent = (dom, withModifiedEvent = false) => {
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
		})
	});

	if(withModifiedEvent){
		dom.addEventListener('DOMSubtreeModified', e=>{
			ACBindComponent(dom, false);
		});
	}
}