import {Theme} from "./Theme.js";
import {escapeAttr} from "../Lang/Html.js";
import {insertStyleSheet, tabConnect} from "../Lang/Dom.js";
import {Tip} from "./Tip.js";

const SUPPORT_LIST = {
	//face
	"😀": [
		"😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","🫠","😉","😊","😇",
		"🥰","😍","🤩","😘","😗","☺","😚","😙","🥲",
		"😋","😛","😜","🤪","😝","🤑",
		"🤗","🤭","🫢","🫣","🤫","🤔","🫡",
	],
	"🙍": [
		"🙍","🙍","♂","️","🙍","♀","️","🙎","🙎","♂","️","🙎","♀","️","🙅","🙅","♂",
	],
};

const PANEL_CLS = Theme.Namespace + 'Emoji';
const SUB_PANEL_CLS = PANEL_CLS+'-ctn';

insertStyleSheet(`
	.${PANEL_CLS} {--size:30px;}
	.${PANEL_CLS}-ctn {display:none; overflow:hidden; max-width:26em;}
	.${PANEL_CLS}-ctn.active {display:block;}
	.${PANEL_CLS}-ctn > span {display:block; float:left; width:var(--size); height:var(--size); font-size:calc(var(--size) * 0.6); text-align:center; cursor:pointer;}
	.${PANEL_CLS}-ctn > span:hover {background-color:#eee;}
	.${PANEL_CLS}-nav {border-top:1px solid #ddd; margin-top:0.5em; padding-top:0.5em;}
	.${PANEL_CLS}-nav > span {display:inline-block; padding:0.25em 1em; cursor:pointer;}
	.${PANEL_CLS}-nav > span.active {background-color:#ccc; border-radius:var(${Theme.CssVar.PANEL_RADIUS})}
`, PANEL_CLS);

export const getEmojiPanelHtml = (config)=>{
	let html = ``;
	let sub_html = '';
	let cat_html = ``;
	let first = true;

	for(let cat in SUPPORT_LIST){
		sub_html += `<div class="${PANEL_CLS}-ctn ${first?'active':''}" data-cat="${escapeAttr(cat)}">`;
		SUPPORT_LIST[cat].forEach(char=>{
			sub_html += `<span style="--code=${char}" data-code="${escapeAttr(char)}">${char}</span>`;
		});
		sub_html += '</div>';
		cat_html += `<span class="${first?'active':''}" data-cat="${escapeAttr(cat)}">${cat}</span>`;
		first = false;
	}
	html = `<div class="${PANEL_CLS}">
				<div class="${PANEL_CLS}-container">${sub_html}</div>
				<div class="${PANEL_CLS}-nav">${cat_html}</div>
			</div>`;
	return html;
}

export const bindEmojiTrigger = (triggerNode, option)=>{
	let html = getEmojiPanelHtml();
	let tip = Tip.bindNode(html, triggerNode, {triggerType:'click'});
	tabConnect(tip.dom.querySelectorAll(`.${PANEL_CLS}-nav span`), tip.dom.querySelectorAll(`.${PANEL_CLS}-ctn`), 'active');
	tip.dom.querySelectorAll(`.${PANEL_CLS}-ctn span`).forEach(emojiNode=>{
		emojiNode.addEventListener('click', e=>{
			option.onSelect(e.target.getAttribute('data-code'));
			tip.hide();
		});
	});
}

export const emojiCharToImg = (char)=>{

}