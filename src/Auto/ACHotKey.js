/**
 * 绑定按钮快捷键
 * 参数：
 * node[data-hotkey-keys="ctrl+a"] 快捷键
 */
import {bindHotKeys} from "../Lang/Event.js";
import {createDomByHtml, findAll, findOne, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {guid} from "../Lang/Util.js";
import {Theme} from "../Widget/Theme.js";

const HOTKEY_TIP_CLASS = Theme.Namespace + 'hotkey-tip';
const HOTKEY_TIP_ATTR_ID = 'data-hotkey-tip-id';

let hk_tip_bind = false;
let hk_tip_is_hide = true;

insertStyleSheet(`
.${HOTKEY_TIP_CLASS} {
	position:absolute; 
	background-color:#ffffffd9; 
	border:1px solid gray; 
	user-select:none; 
	border-radius:4px; 
	padding:0.1em 0.25em; 
	box-sizing:border-box; 
	margin-top:-0.2em; 
	box-shadow:1px 1px 5px 0px #5c5c5c7a;
	text-shadow:1px 1px 1px white;
}
`)

export class ACHotKey {
	//是否自动提示快捷键
	static TOGGLE_HOTKEY_TIP = true;

	static init(node, param = {}){
		if(!hk_tip_bind && ACHotKey.TOGGLE_HOTKEY_TIP){
			hk_tip_bind = true;
			bindHotKeys('alt', e => {
				if(hk_tip_is_hide){
					ACHotKey.showAllHotKeyTips();
				}else{
					ACHotKey.hideAllHotKeyTips();
				}
				hk_tip_is_hide = !hk_tip_is_hide;
			});
			document.addEventListener('click', ACHotKey.hideAllHotKeyTips);
		}

		return new Promise((resolve, reject) => {
			if(!param.key){
				reject('param.key required');
				return false;
			}
			bindHotKeys(param.key, e => {
				node.focus();
				node.click();
			});
		});
	}

	static showAllHotKeyTips(){
		findAll('[data-hotkey-key]').forEach(node => {
			ACHotKey.showHotKeyTip(node);
		})
	}

	static hideAllHotKeyTips(){
		findAll(`.${HOTKEY_TIP_CLASS}`).forEach(tip => {
			hide(tip);
		});
	}

	static hideHotKeyTip(node){
		let tip_id = node.getAttribute(HOTKEY_TIP_ATTR_ID);
		if(tip_id){
			hide(findOne('#' + tip_id));
		}
	}

	static showHotKeyTip(node){
		if(node.offsetParent === null){
			//node is invisible
			return;
		}
		let tip_id = node.getAttribute(HOTKEY_TIP_ATTR_ID);
		let tip = null;
		if(tip_id){
			tip = findOne('#' + tip_id);
		}else{
			tip_id = guid('hotkey-tip-');
			node.setAttribute(HOTKEY_TIP_ATTR_ID, tip_id);
		}
		if(!tip){
			let key = node.getAttribute('data-hotkey-key');
			tip = createDomByHtml(`<div class="${HOTKEY_TIP_CLASS}" id="${tip_id}">${key}</div>`, document.body);
		}
		tip.style.visibility = 'hidden';
		show(tip);
		tip.style.top = node.offsetTop - tip.clientHeight + 'px';
		tip.style.left = node.offsetLeft + 'px';
		tip.style.visibility = 'visible';
	}
}
