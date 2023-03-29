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
	.${CTX_CLASS_PREFIX}>[role=menuitem] {padding:0 1em 0 1em;  min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5;}
	.${CTX_CLASS_PREFIX}>[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX}>[role=menuitem]:not([disabled]){cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX}>[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX}>.sep {margin:0.25em 0.5em;border-bottom:1px solid #ddd;}
	.${CTX_CLASS_PREFIX}>.caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX}>.caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX}>li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX}>li i:before {font-size:var(--size)}
`);

/**
 * @param {array} commands [{title, payload, disabled=false}, '-',...]
 * @param {Node} container
 */
export const showMenu = (commands, container = null) => {
	context_commands = commands;
	if(!context_menu_el){
		context_menu_el = createDomByHtml(`<ul class="${CTX_CLASS_PREFIX}"></ul>`, container || document.body);
		document.body.addEventListener('click', e => {
			if(!domContained(context_menu_el, e.target, true)){
				hide(context_menu_el);
			}
		});
		context_menu_el.addEventListener('contextmenu', e=>{
			e.preventDefault();
			return false;
		})
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
			let [title, cmd, disabled] = context_commands[idx];
			if(disabled){
				return;
			}
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
			inner_html += `<li role="menuitem" ${item[2] ? 'disabled="disabled"' : ''}>${item[0]}</li>`
		}
	});
	context_menu_el.innerHTML = inner_html;
	show(context_menu_el);
	return context_menu_el;
}

/**
 * 绑定对象显示定制右键菜单
 * @param {HTMLElement} target
 * @param {Array} commands
 */
export const bindTargetContextMenu = (target, commands) => {
	target.addEventListener('contextmenu', e => {
		let context_menu_el = showMenu(commands, document.body);
		let menu_dim = getDomDimension(context_menu_el);
		let dim = keepRectInContainer({
			left: e.clientX,
			top: e.clientY,
			width: menu_dim.width,
			height: menu_dim.height
		});
		context_menu_el.style.left = dimension2Style(dim.left);
		context_menu_el.style.top = dimension2Style(dim.top);
		e.preventDefault();
		return false;
	})
}
