import {Theme} from "./Theme.js";
import {
	createDomByHtml, getDomDimension, getDomOffset, getViewWidth, hide, insertStyleSheet, keepRectInContainer, show
} from "../Lang/Dom.js";
import {eventDelegate, KEYS} from "../Lang/Event.js";
import {dimension2Style} from "../Lang/Html.js";
import {guid} from "../Lang/Util.js";

let CTX_CLASS_PREFIX = Theme.Namespace + 'context-menu';
let CTX_Z_INDEX = Theme.ContextIndex;

insertStyleSheet(`
	.${CTX_CLASS_PREFIX} {z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX},
	.${CTX_CLASS_PREFIX} ul {position:absolute; padding: 0.5em 0; list-style:none; backdrop-filter:var(${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER}); box-shadow:var(${Theme.CssVar.PANEL_SHADOW});border-radius:var(${Theme.CssVar.PANEL_RADIUS});background:var(${Theme.CssVar.BACKGROUND_COLOR});min-width:12em; display:none;}
	.${CTX_CLASS_PREFIX} ul {left:100%; top:0;}
	.${CTX_CLASS_PREFIX} li:not([disabled]):hover>ul {display:block;}
	.${CTX_CLASS_PREFIX} li[role=menuitem] {padding:0 1em; line-height:1; position:relative; min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5; cursor:default;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]) {cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX} .has-child:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:var(${Theme.CssVar.DISABLE_COLOR});}
	.${CTX_CLASS_PREFIX} .has-child:not([disabled]):hover:after {color:var(${Theme.CssVar.COLOR})}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`);

const buildMenuItem = (item) => {
	if(item === '-'){
		return '<li class="sep"></li>';
	}
	return `<li role="menuitem" class="${Array.isArray(item[1]) ? 'has-child' : ''}" ${item[2] ? 'disabled="disabled"' : 'tabindex="0"'}>${item[0]}` + (Array.isArray(item[1]) ? '<ul>' + item[1].reduce((retVal, subItem, idx) => {
		return retVal + buildMenuItem(subItem);
	}, '') + '</ul>' : '') + `</li>`;
}

/**
 * 创建菜单
 * @param {Array} commands [{title, payload, disabled=false}, {title, [submenus], disabled], '-',...]
 * @param {Function|Null} onExecute 菜单执行回调函数
 * @return {HTMLElement}
 */
export const createMenu = (commands, onExecute = null) => {
	let menu = createDomByHtml(`
		<ul class="${CTX_CLASS_PREFIX}">
			${commands.reduce((lastVal, item, idx) => {
		return lastVal + buildMenuItem(item);
	}, '')}
		</ul>`, document.body);
	//菜单命令绑定
	eventDelegate(menu, '[role=menuitem]', 'click', (target, event) => {
		let idx = Array.from(menu.childNodes).filter(node => {
			return node.tagName === 'LI';
		}).indexOf(target);
		let [title, cmd, disabled] = commands[idx];
		event.preventDefault();
		if(disabled){
			return false;
		}
		if(cmd){
			cmd();
			onExecute && onExecute();
		}
		return false;
	});
	//阻止菜单上右键交互
	menu.addEventListener('contextmenu', e => {
		e.preventDefault();
		e.stopPropagation();
		return false;
	});
	return menu;
}

let DROPDOWN_MENU_COLL = {};
let DROPDOWN_MENU_SHOWING = false;

/**
 * 绑定全局隐藏下拉菜单逻辑
 */
document.addEventListener('click', e => {
	if(DROPDOWN_MENU_SHOWING){
		return;
	}
	Object.values(DROPDOWN_MENU_COLL).map(hide);
});
document.addEventListener('keyup', e => {
	if(!DROPDOWN_MENU_SHOWING && e.keyCode === KEYS.Esc){
		let ms = Object.values(DROPDOWN_MENU_COLL);
		ms.map(hide);
		if(ms.length){
			e.stopImmediatePropagation();
			e.preventDefault();
			return false;
		}
	}
});

export const bindTargetContextMenu = (target, commands, option = {}) => {
	option.triggerType = 'contextmenu';
	return bindTargetMenu(target, commands, option);
}

export const bindTargetDropdownMenu = (target, commands, option = {}) => {
	option.triggerType = 'click';
	return bindTargetMenu(target, commands, option);
}

/**
 * @param {HTMLElement} target
 * @param {Array} commands
 * @param {Object} option 触发事件类型，如 click, contextmenu等。如果是contextmenu，菜单位置按照鼠标点击位置计算
 */
const bindTargetMenu = (target, commands, option = null) => {
	let triggerType = option?.triggerType || 'click';
	target.addEventListener(triggerType, e => {
		DROPDOWN_MENU_SHOWING = true;
		debugger;
		let bind_key = 'dropdown-menu-id';
		let dd_id = target.getAttribute(bind_key);
		let menuEl;
		if(!dd_id){
			target.setAttribute(bind_key, guid('dd-menu-'));
			menuEl = createMenu(commands);
			DROPDOWN_MENU_COLL[dd_id] = menuEl;
		}else{
			menuEl = DROPDOWN_MENU_COLL[dd_id];
		}
		let pos;
		if(triggerType === 'contextmenu'){
			pos = calcMenuByPosition(menuEl, {left: e.clientX, top: e.clientY});
		}else{
			pos = calcMenuByNode(menuEl, target);
		}
		menuEl.style.left = dimension2Style(pos.left);
		menuEl.style.top = dimension2Style(pos.top);
		menuEl.style.display = 'block';
		e.preventDefault();
		setTimeout(() => {
			DROPDOWN_MENU_SHOWING = false
		}, 0);
		return false;
	})
}

/**
 * 菜单关联一个坐标方式摆放
 * @param {HTMLElement} menuEl
 * @param {Object} point
 * @returns {{top: number, left: number}}
 **/
const calcMenuByPosition = (menuEl, point) => {
	debugger;
	let menu_dim = getDomDimension(menuEl);
	let con_dim = {width: window.innerWidth, height: window.innerHeight};
	let top, left;
	top = point.top;
	left = point.left;

	return {top, left};
}

/**
 * 菜单关联一个节点方式摆放，按照1、2、3、4种情况依次优先考虑
 * 摆放方式 1：
 * [-按钮-]
 * [ -- 菜单 -- ]
 * 摆放方式 2：
 *       [-按钮-]
 * [ -- 菜单 -- ]
 * 摆放方式 3：
 * [ -- 菜单 -- ]
 * [-按钮-]
 * 摆放方式 4：
 * [ -- 菜单 -- ]
 *       [-按钮-]
 * @param {HTMLElement} menuEl
 * @param {HTMLElement} relateNode
 * @returns {{top: number, left: number}}
 */
const calcMenuByNode = (menuEl, relateNode) => {
	let top, left;
	let menu_dim = getDomDimension(menuEl);
	let relate_node_offset = relateNode.getBoundingClientRect();
	let con_dim = {width: window.innerWidth, height: window.innerHeight};

	//上面放得下，且下面放不下情况，才放上面
	if((con_dim.height - relate_node_offset.top) > menu_dim.height && (con_dim.height - relate_node_offset.top - relate_node_offset.height) < menu_dim.height){
		top = relate_node_offset.top - menu_dim.height;
	}else{
		top = relate_node_offset.top + relate_node_offset.height;
	}

	//左边放得下，且右边放不下情况，才放左边
	if((relate_node_offset.left + relate_node_offset.width) > menu_dim.width && (con_dim.width - relate_node_offset.left) < menu_dim.width){
		left = relate_node_offset.left + relate_node_offset.width - menu_dim.width;
	}else{
		left = relate_node_offset.left;
	}
	return {top, left};
}
