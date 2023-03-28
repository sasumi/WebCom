import {Theme} from "./Theme.js";
import {createDomByHtml, domContained, getDomDimension, hide, insertStyleSheet, keepRectInContainer, show} from "../Lang/Dom.js";
import {eventDelegate, KEYS} from "../Lang/Event.js";
import {arrayIndex} from "../Lang/Array.js";
import {dimension2Style} from "../Lang/String.js";

let CTX_CLASS_PREFIX = Theme.Namespace + 'context-menu';
let CTX_Z_INDEX = Theme.ContextIndex;
let context_menu_el;
let context_commands = [];

insertStyleSheet(`
	.${CTX_CLASS_PREFIX} {padding: 0.5em 0;box-shadow:1px 1px 10px 0px #44444457;border-radius:4px;background:#fff;min-width:180px;z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX}>[role=menuitem] {padding:0 1em 0 1em; min-height:2em; display:flex; align-items:center; background: transparent;transition: all 0.1s linear;user-select:none;opacity: 0.9;}
	.${CTX_CLASS_PREFIX}>[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX}>[role=menuitem]:not(.disabled){cursor:pointer;}
	.${CTX_CLASS_PREFIX}>[role=menuitem]:not(.disabled):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX}>.sep {margin: 2px 0.5em;border-bottom:1px solid #ddd;}
	.${CTX_CLASS_PREFIX}>.caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX}>.caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX}>li>a,
	.${CTX_CLASS_PREFIX}>li>span {display:block;}
`);

/**
 * @param {array} commands [{title, payload}, '-',...]
 * @param {Object} position
 * @param {Number} position.left
 * @param {Number} position.top
 */
export const showContextMenu = (commands, position) => {
	context_commands = commands;
	if(!context_menu_el){
		context_menu_el = createDomByHtml(`<ul class="${CTX_CLASS_PREFIX}"></ul>`, document.body);
		document.body.addEventListener('click', e => {
			if(!domContained(context_menu_el, e.target, true)){
				hide(context_menu_el);
			}
		});
		console.log('[context] start bind key up');
		document.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Esc){
				hide(context_menu_el);
				e.stopImmediatePropagation();
				e.preventDefault();
				return false;
			}
		});
		eventDelegate(context_menu_el, '[role=menuitem]', 'click', target => {
			let idx = arrayIndex(context_menu_el.querySelectorAll('li'), target);
			let [title, cmd] = context_commands[idx];
			if(!cmd || cmd() !== false){ //cmd 可以通过返回false阻止菜单关闭
				hide(context_menu_el);
			}
		});
	}
	let inner_html = '';
	commands.forEach(item => {
		if(item === '-'){
			inner_html += '<li class="sep"></li>';
		}else{
			inner_html += `<li role="menuitem"><span>${item[0]}</span></li>`
		}
	});
	context_menu_el.innerHTML = inner_html;
	let menu_dim = getDomDimension(context_menu_el);
	let dim = keepRectInContainer({
		left: position.left,
		top: position.top,
		width: menu_dim.width,
		height: menu_dim.height
	});
	context_menu_el.style.left = dimension2Style(dim.left);
	context_menu_el.style.top = dimension2Style(dim.top);
	show(context_menu_el);
}

/**
 * 绑定对象显示定制右键菜单
 * @param {HTMLElement} target
 * @param {Array} commands
 */
export const bindTargetContextMenu = (target, commands) => {
	target.addEventListener('contextmenu', e => {
		showContextMenu(commands, {left: e.clientX, top: e.clientY});
		e.preventDefault();
		return false;
	})
}
