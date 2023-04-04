import {Theme} from "./Theme.js";
import {createDomByHtml, domContained, getDomDimension, insertStyleSheet, keepRectInContainer} from "../Lang/Dom.js";
import {eventDelegate, KEYS} from "../Lang/Event.js";
import {arrayIndex} from "../Lang/Array.js";
import {dimension2Style} from "../Lang/String.js";

let CTX_CLASS_PREFIX = Theme.Namespace + 'context-menu';
let CTX_Z_INDEX = Theme.ContextIndex;
let LAST_MENU_EL = null;

insertStyleSheet(`
	.${CTX_CLASS_PREFIX} {z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX},
	.${CTX_CLASS_PREFIX} ul {position:absolute; padding: 0.5em 0; list-style:none; backdrop-filter:blur(5px); box-shadow:1px 1px 10px 0px #44444457;border-radius:4px;background:#ffffffd9;min-width:12em; display:none;}
	.${CTX_CLASS_PREFIX} ul {left:100%; top:0;}
	.${CTX_CLASS_PREFIX} li:not([disabled]):hover>ul {display:block;}
	.${CTX_CLASS_PREFIX} li[role=menuitem] {padding:0 1em; line-height:1; position:relative; min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5; cursor:default;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]) {cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX} .has-child:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:gray;}
	.${CTX_CLASS_PREFIX} .has-child:not([disabled]):hover:after {color:black}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`);

const buildItem = (item) => {
	if(item === '-'){
		return '<li class="sep"></li>';
	}
	return `<li role="menuitem" class="${Array.isArray(item[1]) ? 'has-child':''}" ${item[2] ? 'disabled="disabled"' : ''}>${item[0]}` +
		(Array.isArray(item[1]) ? '<ul>' + item[1].reduce((retVal, subItem, idx) => {
			return retVal + buildItem(subItem);
		}, '') + '</ul>' : '')
		+ `</li>`;
}

/**
 * 显示菜单
 * @param {Array} commands [{title, payload, disabled=false}, {title, [submenus], disabled], '-',...]
 * @param {HTMLElement} container
 */
export const showMenu = (commands, container = null) => {
	hideLastMenu();
	let menu = createDomByHtml(`
		<ul class="${CTX_CLASS_PREFIX}">
			${commands.reduce((lastVal, item, idx) => {
				return lastVal + buildItem(item);
			}, '')}
		</ul>`, container || document.body);
	eventDelegate(menu, '[role=menuitem]', 'click', target => {
		let idx = arrayIndex(menu.querySelectorAll('li'), target);
		let [title, cmd, disabled] = commands[idx];
		if(disabled){
			return;
		}
		if(!cmd || cmd() !== false){ //cmd 可以通过返回false阻止菜单关闭
			hideLastMenu();
		}
	});

	menu.addEventListener('contextmenu', e => {
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	//简单避开全局 click 隐藏当前菜单
	setTimeout(() => {
		LAST_MENU_EL = menu;
	}, 0);
	menu.style.display = 'block';
	return menu;
}

/**
 * 隐藏最后一个菜单
 */
const hideLastMenu = () => {
	if(LAST_MENU_EL){
		LAST_MENU_EL.parentNode.removeChild(LAST_MENU_EL);
		LAST_MENU_EL = null;
	}
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
		context_menu_el.addEventListener('contextmenu', e => {
			e.preventDefault();
			return false;
		})
		context_menu_el.style.left = dimension2Style(dim.left);
		context_menu_el.style.top = dimension2Style(dim.top);
		e.preventDefault();
		return false;
	})
}

document.addEventListener('click', e => {
	if(LAST_MENU_EL && !domContained(LAST_MENU_EL, e.target, true)){
		hideLastMenu();
	}
});
document.addEventListener('keyup', e => {
	if(LAST_MENU_EL && e.keyCode === KEYS.Esc){
		e.stopImmediatePropagation();
		e.preventDefault();
		hideLastMenu();
		return false;
	}
});