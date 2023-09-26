import {Theme} from "./Theme.js";
import {createDomByHtml, getDomDimension, hide, insertStyleSheet} from "../Lang/Dom.js";
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
	.${CTX_CLASS_PREFIX} li[data-has-child]:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:var(${Theme.CssVar.DISABLE_COLOR});}
	.${CTX_CLASS_PREFIX} li[data-has-child]:not([disabled]):hover:after {color:var(${Theme.CssVar.COLOR})}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`);

/**
 * 创建菜单
 * @param {Array} commands [{title, payload, disabled=false}, {title, [submenus], disabled], '-',...]
 * @param {Function|Null} onExecute 菜单执行回调函数
 * @return {HTMLElement}
 */
export const createMenu = (commands, onExecute = null) => {
	let html = `<ul class="${CTX_CLASS_PREFIX}">`;
	let payload_map = {};

	let buildMenuItemHtml = (item) => {
		let html = '';
		if(item === '-'){
			html += '<li class="sep"></li>';
			return html;
		}
		let [title, cmdOrChildren, disabled] = item;
		let has_child = Array.isArray(cmdOrChildren);
		let mnu_item_id = guid();
		let sub_menu_html = '';
		if(has_child){
			sub_menu_html = '<ul>';
			cmdOrChildren.forEach(subItem => {
				sub_menu_html += buildMenuItemHtml(subItem);
			});
			sub_menu_html += '</ul>';
		}else{
			payload_map[mnu_item_id] = cmdOrChildren;
		}
		html += `<li role="menuitem" data-id="${mnu_item_id}" ${has_child ? ' data-has-child ' : ''} ${disabled ? 'disabled="disabled"' : 'tabindex="0"'}>${title}${sub_menu_html}</li>`;
		return html;
	};

	for(let i = 0; i < commands.length; i++){
		let item = commands[i];
		html += buildMenuItemHtml(item);
	}
	html += '</ul>';
	let menu = createDomByHtml(html, document.body);
	let items = menu.querySelectorAll('[role=menuitem]:not([disabled])');
	items.forEach(function(item){
		let id = item.getAttribute('data-id');
		let payload = payload_map[id];
		if(payload){
			item.addEventListener('click', () => {
				payload();
				onExecute && onExecute(item);
			});
		}
	});
	let sub_menus = menu.querySelectorAll('ul');
	sub_menus.forEach(function(sub_menu){
		let parent_item = sub_menu.parentNode;
		parent_item.addEventListener('mouseover', e => {
			let pos = alignSubMenuByNode(sub_menu, parent_item);
			sub_menu.style.left = dimension2Style(pos.left);
			sub_menu.style.top = dimension2Style(pos.top);
		});
	})

	//阻止菜单上右键交互
	menu.addEventListener('contextmenu', e => {
		// e.preventDefault();
		// e.stopPropagation();
		// return false;
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
		let bind_key = 'dropdown-menu-id';
		let dd_id = target.getAttribute(bind_key);
		let menuEl;
		if(!dd_id){
			dd_id = guid('dd-menu-');
			target.setAttribute(bind_key, dd_id);
			menuEl = createMenu(commands);
			DROPDOWN_MENU_COLL[dd_id] = menuEl;
		}else{
			menuEl = DROPDOWN_MENU_COLL[dd_id];
		}
		let pos;
		if(triggerType === 'contextmenu'){
			pos = calcMenuByPosition(menuEl, {left: e.clientX, top: e.clientY});
		}else{
			pos = alignMenuByNode(menuEl, target);
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
 * 菜单关联一个坐标方式摆放，菜单摆放方式主要是光标下方或上方。
 * @param {HTMLElement} menuEl
 * @param {Object} point
 * @returns {{top: number, left: number}}
 **/
const calcMenuByPosition = (menuEl, point) => {
	let menu_dim = getDomDimension(menuEl);
	let con_dim = {width: window.innerWidth, height: window.innerHeight};
	let top, left = point.left;

	let right_available = menu_dim.width + point.left <= con_dim.width;
	let bottom_available = menu_dim.height + point.top <= con_dim.height;
	let top_available = point.top - menu_dim.height > 0;

	if(right_available && bottom_available){
		left = point.left;
		top = point.top;
	}else if(right_available && !bottom_available){
		left = point.left;
		top = Math.max(con_dim.height - menu_dim.height, 0);
	}else if(!right_available && bottom_available){
		left = Math.max(con_dim.width - menu_dim.width, 0);
		top = point.top;
	}else if(!right_available && !bottom_available){
		//上方摆得下
		if(top_available){
			left = Math.max(con_dim.width - menu_dim.width, 0);
			top = point.top - menu_dim.height;
		}else{
			left = Math.max(con_dim.width - menu_dim.width, 0);
			top = point.top;
		}
	}
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
const alignMenuByNode = (menuEl, relateNode) => {
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

/**
 *
 * 子菜单摆放方式计算（子菜单特点：只摆在菜单项两侧）
 * 摆放方式 1：
 * [-按钮-][ -- 菜单 -- ]
 *        [ -- 菜单 -- ]
 *
 * 摆放方式 2：
 *        [ -- 菜单 -- ]
 * [-按钮-][ -- 菜单 -- ]
 *        [ -- 菜单 -- ]
 *
 * 摆放方式 3：
 * [ -- 菜单 -- ][-按钮-]
 * [ -- 菜单 -- ]
 * [ -- 菜单 -- ]
 * 摆放方式 4：
 * [ -- 菜单 -- ]
 * [ -- 菜单 -- ][-按钮-]
 * [ -- 菜单 -- ]
 * @param subMenuEl
 * @param triggerMenuItem
 * @returns {{top: number, left: number}}
 */
const alignSubMenuByNode = (subMenuEl, triggerMenuItem) => {
	let menu_dim = getDomDimension(subMenuEl);
	let relate_node_offset = triggerMenuItem.getBoundingClientRect();
	let con_dim = {width: window.innerWidth, height: window.innerHeight};

	//由于上级菜单采用absolute布局，子菜单仅需根据上级菜单做相对定位
	let top = 0,
		left = relate_node_offset.height;

	//下面放不下，且上面还有空间，否则还是放下面
	if((relate_node_offset.top + menu_dim.height > con_dim.height) && con_dim.height >= menu_dim.height){
		top = con_dim.height - (relate_node_offset.top + menu_dim.height);
	} else {
		top = 0;
	}

	//右边放不下，且左边有空间

	//左边放得下，且右边放不下情况，才放左边
	if(relate_node_offset.left > menu_dim.width && (relate_node_offset.left + relate_node_offset.width + menu_dim.width > con_dim.width)){
		left = relate_node_offset.left - menu_dim.width;
	}else{
		left = relate_node_offset.left + relate_node_offset.width;
	}
	return {top, left};
}
