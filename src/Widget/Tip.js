import {
	createDomByHtml,
	domContained,
	getDomOffset,
	getRegion,
	hide,
	insertStyleSheet,
	rectInLayout,
	remove,
	show
} from "../Lang/Dom.js";
import {guid} from "../Lang/Util.js";
import {BizEvent, KEYBOARD_KEY_MAP} from "../Lang/Event.js";
import {Theme} from "./Theme.js";
import {dimension2Style} from "../Lang/Html.js";

const GUID_BIND_KEY = Theme.Namespace+'-tip-guid';
const NS = Theme.Namespace + 'tip';
const DEFAULT_DIR = 11;
const TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let TIP_COLLECTION = {};

const STYLE_STR = `
	.${NS}-container-wrap {position:absolute; filter:drop-shadow(var(${Theme.CssVar.PANEL_SHADOW})); --tip-arrow-size:10px; --tip-gap:calc(var(--tip-arrow-size) * 0.7071067811865476); --tip-mgr:calc(var(--tip-gap) - var(--tip-arrow-size) / 2); color:var(${Theme.CssVar.COLOR}); z-index:${Theme.TipIndex};}
	.${NS}-arrow {display:block; background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); clip-path:polygon(0% 0%, 100% 100%, 0% 100%); width:var(--tip-arrow-size); height:var(--tip-arrow-size); position:absolute; z-index:1}
	.${NS}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; opacity:.5}
	.${NS}-close:hover {opacity:1}
	.${NS}-content {border-radius:var(${Theme.CssVar.PANEL_RADIUS}); background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); padding:1em;  max-width:30em; word-break:break-all}
	
	/** top **/
	.${NS}-container-wrap[data-tip-dir="11"],
	.${NS}-container-wrap[data-tip-dir="0"],
	.${NS}-container-wrap[data-tip-dir="1"]{padding-top:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow{top:var(--tip-mgr); transform:rotate(135deg);}
	.${NS}-container-wrap[data-tip-dir="11"] .${NS}-arrow{left:calc(25% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="0"] .${NS}-arrow{left:calc(50% - var(--tip-gap));background:orange;}
	.${NS}-container-wrap[data-tip-dir="1"] .${NS}-arrow{left:calc(75% - var(--tip-gap));}
	
	/** left **/
	.${NS}-container-wrap[data-tip-dir="8"],
	.${NS}-container-wrap[data-tip-dir="9"],
	.${NS}-container-wrap[data-tip-dir="10"]{padding-left:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-close{top:3px;}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow{left:var(--tip-mgr); transform:rotate(45deg);}
	.${NS}-container-wrap[data-tip-dir="8"] .${NS}-arrow{top:calc(75% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="9"] .${NS}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="10"] .${NS}-arrow{top:calc(25% - var(--tip-gap));}
	
	/** bottom **/
	.${NS}-container-wrap[data-tip-dir="5"],
	.${NS}-container-wrap[data-tip-dir="6"],
	.${NS}-container-wrap[data-tip-dir="7"]{padding-bottom:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-close{top:3px;}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow{bottom:var(--tip-mgr); transform:rotate(-45deg);}
	.${NS}-container-wrap[data-tip-dir="5"] .${NS}-arrow{right: calc(25% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="6"] .${NS}-arrow{right: calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="7"] .${NS}-arrow{right: calc(75% - var(--tip-gap));}
	
	/** right **/
	.${NS}-container-wrap[data-tip-dir="2"],
	.${NS}-container-wrap[data-tip-dir="3"],
	.${NS}-container-wrap[data-tip-dir="4"]{padding-right:var(--tip-gap)}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-close,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-close{right:13px;top:3px;}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow,
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow{right:var(--tip-mgr);transform: rotate(-135deg);}
	.${NS}-container-wrap[data-tip-dir="2"] .${NS}-arrow{top:calc(25% - var(--tip-gap))}
	.${NS}-container-wrap[data-tip-dir="3"] .${NS}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS}-container-wrap[data-tip-dir="4"] .${NS}-arrow{top:calc(75% - var(--tip-gap))}
`;

/**
 * 绑定事件
 * @param {Tip} tip
 */
let bindEvent = (tip)=>{
	if(tip.option.showCloseButton){
		let close_btn = tip.dom.querySelector(`.${NS}-close`);
		close_btn.addEventListener('click', () => {tip.hide();}, false);
		document.addEventListener('keyup', (e) => {
			if(e.key === KEYBOARD_KEY_MAP.Escape){
				tip.hide();
			}
		}, false);
	}
};

/**
 * 自动计算方位
 * @param {Tip} tipObj
 * @returns {number}
 */
let calDir = (tipObj)=>{
	let tipWidth = tipObj.dom.offsetWidth;
	let tipHeight = tipObj.dom.offsetHeight;
	let relateNodeHeight = tipObj.relateNode.offsetHeight;
	let relateNodeWidth = tipObj.relateNode.offsetWidth;
	let relateNodeOffset = getDomOffset(tipObj.relateNode);

	let viewRegion = getRegion();

	for(let i = 0; i < TRY_DIR_MAP.length; i++){
		let [offsetLeft, offsetTop] = calcTipPositionByDir(TRY_DIR_MAP[i], tipWidth, tipHeight, relateNodeHeight, relateNodeWidth);
		let rect = {
			left: relateNodeOffset.left + offsetLeft,
			top: relateNodeOffset.top + offsetTop,
			width: tipWidth,
			height: tipHeight
		};
		let layout_rect = {
			left: document.body.scrollLeft,
			top: document.body.scrollTop,
			width: viewRegion.visibleWidth,
			height: viewRegion.visibleHeight
		};
		if(rectInLayout(rect, layout_rect)){
			return TRY_DIR_MAP[i];
		}
	}
	return DEFAULT_DIR;
};

/**
 * 根据给定方位，计算出 tip 面板相对于关联节点的左上角的偏移信息
 * @param {Number} dir
 * @param {Number} tipWidth
 * @param {Number} tipHeight
 * @param {Number} relateNodeHeight
 * @param {Number} relateNodeWidth
 * @returns {[Number, Number]} offsetLeft offsetTop
 */
let calcTipPositionByDir = function(dir, tipWidth, tipHeight, relateNodeHeight, relateNodeWidth){
	let offset = {
		11: [-tipWidth * 0.25 + relateNodeWidth / 2, relateNodeHeight],
		0: [-tipWidth * 0.5 + relateNodeWidth / 2, relateNodeHeight],
		1: [-tipWidth * 0.75 + relateNodeWidth / 2, relateNodeHeight],
		2: [-tipWidth, -tipHeight * 0.25 + relateNodeHeight / 2],
		3: [-tipWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
		4: [-tipWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
		5: [-tipWidth * 0.75 + relateNodeWidth / 2, -tipHeight],
		6: [-tipWidth * 0.5 + relateNodeWidth / 2, -tipHeight],
		7: [-tipWidth * 0.25 + relateNodeWidth / 2, -tipHeight],
		8: [relateNodeWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
		9: [relateNodeWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
		10: [relateNodeWidth, -tipHeight * 0.25 + relateNodeHeight / 2]
	};
	return offset[dir];
};

/**
 * @param {Tip} tipObj
 * 更新位置信息
 */
const updatePosition = (tipObj)=>{
	let direction = tipObj.option.direction;
	let tipWidth = tipObj.dom.offsetWidth;
	let tipHeight = tipObj.dom.offsetHeight;
	let relateNodePos = getDomOffset(tipObj.relateNode);
	let rh = tipObj.relateNode.offsetHeight;
	let rw = tipObj.relateNode.offsetWidth;
	if(direction === 'auto'){
		direction = calDir(tipObj);
	}
	tipObj.dom.setAttribute('data-tip-dir',direction);
	let [offsetLeft, offsetTop] = calcTipPositionByDir(direction, tipWidth, tipHeight, rh, rw);
	tipObj.dom.style.left = dimension2Style(relateNodePos.left + offsetLeft);
	tipObj.dom.style.top = dimension2Style(relateNodePos.top + offsetTop);
};

export class Tip {
	id = null;
	relateNode = null;

	/** @var {HTMLElement} dom **/
	dom = null;
	option = {
		showCloseButton: true,
		width: 'auto',
		direction: 'auto',
	};

	onShow = new BizEvent(true);
	onHide = new BizEvent(true);
	onDestroy = new BizEvent(true);

	constructor(content, relateNode, opt = {}){
		insertStyleSheet(STYLE_STR, Theme.Namespace + 'tip-style');
		this.id = guid();
		this.relateNode = relateNode;
		this.option = Object.assign(this.option, opt);
		this.dom = createDomByHtml(
			`<div class="${NS}-container-wrap" style="display:none; ${this.option.width ? 'width:'+dimension2Style(this.option.width) : ''}">
				<s class="${NS}-arrow"></s>
				${this.option.showCloseButton ? `<span class="${NS}-close">&#10005;</span>` : ''}
				<div class="${NS}-content">${content}</div>
			</div>`);
		bindEvent(this);
		TIP_COLLECTION[this.id] = this;
	}

	/**
	 * 设置提示内容
	 * @param {String} html
	 */
	setContent(html){
		this.dom.querySelector(`.${NS}-content`).innerHTML = html;
		updatePosition(this);
	}

	/**
	 * 去重判断，避免onShow时间多次触发
	 */
	show(){
		if(!document.contains(this.dom)){
			document.body.appendChild(this.dom);
		}
		show(this.dom);
		updatePosition(this);
		this.onShow.fire(this);
	}

	hide(){
		hide(this.dom);
		this.onHide.fire(this);
	}

	destroy(){
		remove(this.dom);
		this.onDestroy.fire();
		for(let i in TIP_COLLECTION){
			if(TIP_COLLECTION[i] === this){
				delete(TIP_COLLECTION[i]);
			}
		}
	}

	/**
	 * 快速显示Tip
	 * @param {String} content
	 * @param {HTMLElement} relateNode
	 * @param option
	 * @returns {Tip}
	 */
	static show(content, relateNode, option = {}){
		let tip = new Tip(content, relateNode, option);
		tip.show();
		return tip;
	}

	/**
	 * 隐藏所有Tip
	 */
	static hideAll(){
		for(let i in TIP_COLLECTION){
			TIP_COLLECTION[i].hide();
		}
	}

	/**
	 * 绑定节点
	 * @param {String} content
	 * @param {HTMLElement} relateNode
	 * @param {Object} option
	 * @return {Tip}
	 */
	static bindNode(content, relateNode, option = {triggerType:'hover'}){
		let guid = relateNode.getAttribute(GUID_BIND_KEY);
		let tipObj = TIP_COLLECTION[guid];
		if(!tipObj){
			tipObj = new Tip(content, relateNode, option);
			relateNode.setAttribute(GUID_BIND_KEY, tipObj.id);

			let tm = null;
			let hide = ()=>{
				tm && clearTimeout(tm);
				tm = setTimeout(()=>{
					tipObj.hide();
				}, 10);
			};
			let show = ()=>{
				tm && clearTimeout(tm);
				tipObj.show();
			}
			switch(option.triggerType){
				case 'hover':
					relateNode.addEventListener('mouseover', show);
					relateNode.addEventListener('mouseout', hide);
					tipObj.dom.addEventListener('mouseout', hide);
					tipObj.dom.addEventListener('mouseover', show);
					break;

				case 'click':
					relateNode.addEventListener('click', ()=>{
						let isShow = tipObj.dom.style.display !== 'none';
						!isShow ? show() : hide();
					});
					document.addEventListener('click', e=>{
						if(!domContained(relateNode, e.target, true) && !domContained(tipObj.dom, e.target, true)){
							hide();
						}
					});
					break;
				default:
					throw "option.triggerType no supported:" + option.triggerType;
			}
		}
		return tipObj;
	}

	/**
	 * 通过异步获取数据方式绑定显示Tip
	 * @param {HTMLElement} relateNode
	 * @param {Function} dataFetcher Promise 对象，resolve返回 html 字符串
	 * @param {Object} option
	 */
	static bindAsync(relateNode, dataFetcher, option = {}){
		let guid = relateNode.getAttribute(`data-${GUID_BIND_KEY}`);
		let tipObj = TIP_COLLECTION[guid];
		if(!tipObj){
			let loading = false;
			tipObj = Tip.bindNode('loading...', relateNode, option);
			tipObj.onShow.listen(() => {
				if(loading){
					return;
				}
				loading = true;
				dataFetcher().then(rspHtml => {
					tipObj.setContent(rspHtml);
				}, error => {
					tipObj.setContent(error);
				}).finally(()=>{
					loading = false;
				});
			});
		}
	};
}