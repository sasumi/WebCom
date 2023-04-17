import {getHash, QueryString} from "./Net.js";

let payloads = [];
let popstate_bind = false;

/**
 * 压栈状态
 * @param {Object} param
 * @param {String} title
 */
export const pushState = (param, title = '') => {
	let url = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(param);
	window.history.pushState(param, title, url);
	exePayloads(param);
}

/**
 * 监听 window onpopstate 事件
 * @param {Function} payload
 */
export const onStateChange = (payload) => {
	if(!popstate_bind){
		popstate_bind = true;
		window.addEventListener('popstate', e=>{
			let state = e.state ?? {};
			let hashObj = QueryString.parse(getHash());
			exePayloads({...state, ...hashObj});
		})
	}
	payloads.push(payload);
}

const exePayloads = (param) => {
	payloads.forEach(payload => {
		payload(param);
	});
}