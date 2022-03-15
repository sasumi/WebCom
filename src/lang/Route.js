import {buildParam, getHashObject} from "./Net.js";

let payloads = [];

export const pushState = (param, title = '') => {
	let url = location.href.replace(/#.*$/g, '') + '#' + buildParam(param);
	window.history.pushState(param, title, url);
	exePayloads(param);
}

const exePayloads = (param) => {
	payloads.forEach(payload => {
		payload(param);
	});
}

window.onpopstate = function(e){
	let state = e.state ?? {};
	let hashObj = getHashObject();
	exePayloads({...state, ...hashObj});
};

export const onStateChange = (payload) => {
	payloads.push(payload);
}