import {createDomByHtml, getDomOffset, getRegion, hide, insertStyleSheet, rectInLayout, show} from "../Lang/Dom.js";
import {guid} from "../Lang/Util.js";
import {BizEvent, KEYS} from "../Lang/Event.js";
import {Theme} from "./Theme.js";
import {dimension2Style} from "../Lang/String.js";

let TIP_COLLECTION = {};
let GUID_BIND_KEY = Theme.Namespace+'-tip-guid';
let NS = Theme.Namespace + 'tip';
let TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

insertStyleSheet(`
	.${NS}-container-wrap {position:absolute; z-index:11;}
	.${NS}-content {border:1px solid #cacaca; border-radius:4px; background-color:#fff; padding:10px; box-shadow:0 0 10px rgba(105, 105, 105, 0.4); max-width:500px; word-break:break-all}
	.${NS}-arrow {display:block; width:0; height:0; border:7px solid transparent; position:absolute; z-index:1}
	.${NS}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; color:gray;}
	.${NS}-close:hover {color:black;}
	
	/** top **/
	.${NS}-0, .${NS}-1, .${NS}-11 {padding-top:7px;}
	.${NS}-11 .${NS}-arrow,
	.${NS}-0 .${NS}-arrow,
	.${NS}-1 .${NS}-arrow {top:-5px; margin-left:-7px; border-bottom-color:white}
	.${NS}-0 .${NS}-arrow-pt,
	.${NS}-11 .${NS}-arrow-pt,
	.${NS}-1 .${NS}-arrow-pt {top:-6px; border-bottom-color:#dcdcdc;}
	.${NS}-11 .${NS}-arrow {left:25%;}
	.${NS}-0 .${NS}-arrow {left:50%;}
	.${NS}-1 .${NS}-arrow {left:75%;}
	
	/** right **/
	.${NS}-8, .${NS}-9, .${NS}-10 {padding-left:7px;}
	.${NS}-8 .${NS}-close,
	.${NS}-9 .${NS}-close,
	.${NS}-10 .${NS}-close {top:3px;}
	.${NS}-8 .${NS}-arrow,
	.${NS}-9 .${NS}-arrow,
	.${NS}-10 .${NS}-arrow {left:-6px; margin-top:-7px; border-right-color:white}
	.${NS}-8 .${NS}-arrow-pt,
	.${NS}-9 .${NS}-arrow-pt,
	.${NS}-10 .${NS}-arrow-pt {left:-7px; border-right-color:#dcdcdc;}
	.${NS}-8 .${NS}-arrow {top:75%}
	.${NS}-9 .${NS}-arrow {top:50%}
	.${NS}-10 .${NS}-arrow {top:25%}
	
	/** bottom **/
	.${NS}-5, .${NS}-6, .${NS}-7 {padding-bottom:7px;}
	.${NS}-5 .${NS}-close,
	.${NS}-6 .${NS}-close,
	.${NS}-7 .${NS}-close {top:3px;}
	.${NS}-5 .${NS}-arrow,
	.${NS}-6 .${NS}-arrow,
	.${NS}-7 .${NS}-arrow {left:50%; bottom:-6px; margin-left:-7px; border-top-color:white}
	.${NS}-5 .${NS}-arrow-pt,
	.${NS}-6 .${NS}-arrow-pt,
	.${NS}-7 .${NS}-arrow-pt {bottom:-7px; border-top-color:#dcdcdc;}
	.${NS}-7 .${NS}-arrow {left:30px}
	.${NS}-5 .${NS}-arrow {left:75%}
	
	/** left **/
	.${NS}-2, .${NS}-3, .${NS}-4 {padding-right:7px;}
	.${NS}-2 .${NS}-close,
	.${NS}-3 .${NS}-close,
	.${NS}-4 .${NS}-close {right:13px; top:3px;}
	.${NS}-2 .${NS}-arrow,
	.${NS}-3 .${NS}-arrow,
	.${NS}-4 .${NS}-arrow {right:-6px; margin-top:-7px; border-left-color:white}
	.${NS}-2 .${NS}-arrow-pt,
	.${NS}-3 .${NS}-arrow-pt,
	.${NS}-4 .${NS}-arrow-pt {right:-7px; border-left-color:#dcdcdc;}
	.${NS}-2 .${NS}-arrow {top:25%}
	.${NS}-3 .${NS}-arrow {top:50%}
	.${NS}-4 .${NS}-arrow {top:75%}
`, Theme.Namespace + 'tip-style');

/**
 * 绑定事件
 */
let bindEvent = function(){
	if(this.option.showCloseButton){
		let btn = this.dom.querySelector(`.${NS}-close`);
		btn.addEventListener('click', () => {
			this.hide();
		}, false);
		document.body.addEventListener('keyup', (e) => {
			if(e.keyCode === KEYS.Esc){
				this.hide();
			}
		}, false);
	}
};

/**
 * 自动计算方位
 * @returns {number}
 */
let calDir = function(){
	let body = document.body;
	let width = this.dom.offsetWidth;
	let height = this.dom.offsetHeight;
	let px = this.relNode.offsetLeft;
	let py = this.relNode.offsetTop;
	let rh = this.relNode.offsetHeight;
	let rw = this.relNode.offsetWidth;

	let scroll_left = body.scrollLeft;
	let scroll_top = body.scrollTop;

	let viewRegion = getRegion();

	for(let i = 0; i < TRY_DIR_MAP.length; i++){
		let dir_offset = getDirOffset(TRY_DIR_MAP[i], width, height, rh, rw);
		let rect = {
			left: px + dir_offset[0],
			top: py + dir_offset[1],
			width: width,
			height: height
		};
		let layout_rect = {
			left: scroll_left,
			top: scroll_top,
			width: viewRegion.visibleWidth,
			height: viewRegion.visibleHeight
		};
		if(rectInLayout(rect, layout_rect)){
			return TRY_DIR_MAP[i];
		}
	}
	return 11;
};

/**
 * 方位偏移
 * @param {Number} dir
 * @param {Number} width
 * @param {Number} height
 * @param {Number} rh
 * @param {Number} rw
 * @returns {*}
 */
let getDirOffset = function(dir, width, height, rh, rw){
	let offset = {
		11: [-width * 0.25 + rw / 2, rh],
		0: [-width * 0.5 + rw / 2, rh],
		1: [-width * 0.75 + rw / 2, rh],
		2: [-width, -height * 0.25 + rh / 2],
		3: [-width, -height * 0.5 + rh / 2],
		4: [-width, -height * 0.75 + rh / 2],
		5: [-width * 0.75 + rw / 2, -height],
		6: [-width * 0.5 + rw / 2, -height],
		7: [-width * 0.25 + rw / 2, -height],
		8: [rw, -height * 0.75 + rh / 2],
		9: [rw, -height * 0.5 + rh / 2],
		10: [rw, -height * 0.25 + rh / 2]
	};
	return offset[dir];
};

/**
 * 更新位置信息
 */
const updatePosition = function(){
	let direction = this.option.direction;
	let width = this.dom.offsetWidth;
	let height = this.dom.offsetHeight;
	let pos = getDomOffset(this.relNode);
	let px = pos.left;
	let py = pos.top;
	let rh = this.relNode.offsetHeight;
	let rw = this.relNode.offsetWidth;
	if(direction === 'auto'){
		direction = calDir.call(this);
	}
	this.dom.setAttribute('class', `${NS}-container-wrap ${NS}-${direction}`);
	let offset = getDirOffset(direction, width, height, rh, rw);
	this.dom.style.left = dimension2Style(px + offset[0]);
	this.dom.style.top = dimension2Style(py + offset[1]);
};

export class Tip {
	guid = null;
	relNode = null;

	/** @var {HtmlElement} dom **/
	dom = null;
	option = {
		showCloseButton: false,
		width: 'auto',
		direction: 'auto',
	};

	_hideTm = null;

	onShow = new BizEvent(true);
	onHide = new BizEvent(true);
	onDestroy = new BizEvent(true);

	constructor(content, relNode, opt = {}){
		this.guid = guid();
		this.relNode = relNode;
		this.option = {...this.option, ...opt};

		let close_button_html = this.option.showCloseButton ? `<span class="${NS}-close">&#10005;</span>` : ``;
		this.dom = createDomByHtml(
			`<div class="${NS}-container-wrap" style="display:none;">
				<s class="${NS}-arrow ${NS}-arrow-pt"></s>
				<s class="${NS}-arrow ${NS}-arrow-bg"></s>
				${close_button_html}
				<div class="${NS}-content">${content}</div>
			</div>`, document.body);

		this.dom.style.width = dimension2Style(this.option.width);
		bindEvent.call(this);
		TIP_COLLECTION[this.guid] = this;
	}

	/**
	 * 设置提示内容
	 * @param {String} html
	 */
	setContent(html){
		this.dom.querySelector(`.${NS}-content`).innerHTML = html;
		updatePosition.call(this);
	}

	/**
	 * 去重判断，避免onShow时间多次触发
	 */
	show(){
		show(this.dom);
		updatePosition.call(this);
		this.onShow.fire(this);
	}

	hide(){
		console.log('hide call');
		hide(this.dom);
		this.onHide.fire(this);
	}

	destroy(){
		this.dom.parentNode.removeChild(this.dom);
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
	 * @param {HTMLElement} relNode
	 * @param option
	 * @returns {Tip}
	 */
	static show(content, relNode, option = {}){
		let tip = new Tip(content, relNode, option);
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
	 * @param {HTMLElement} relNode
	 * @param {Object} option
	 * @return {Tip}
	 */
	static bindNode(content, relNode, option = {}){
		let guid = relNode.getAttribute(GUID_BIND_KEY);
		let tipObj = TIP_COLLECTION[guid];
		if(!tipObj){
			tipObj = new Tip(content, relNode, option);
			relNode.setAttribute(GUID_BIND_KEY, tipObj.guid);
			relNode.addEventListener('mouseover', ()=>{
				tipObj.show();
			});
			let tm = null;
			let hide = ()=>{
				tm && clearTimeout(tm);
				tm = setTimeout(()=>{
					tipObj.hide();
				}, 100);
			};
			let show = ()=>{
				tm && clearTimeout(tm);
				tipObj.show();
			}
			relNode.addEventListener('mouseout', hide);
			tipObj.dom.addEventListener('mouseout', hide);
			tipObj.dom.addEventListener('mouseover', show);
		}
		return tipObj;
	}

	/**
	 * 通过异步获取数据方式绑定显示Tip
	 * @param {HTMLElement} relNode
	 * @param {Function} dataFetcher 返回 Promise 对象
	 * @param {Object} option
	 */
	static bindAsync(relNode, dataFetcher, option = {}){
		let guid = relNode.getAttribute(`data-${GUID_BIND_KEY}`);
		let obj = TIP_COLLECTION[guid];
		if(!obj){
			let loading = false;
			obj = Tip.bindNode('loading...', relNode, option);
			obj.onShow.listen(() => {
				if(loading){
					return;
				}
				loading = true;
				dataFetcher().then(rspHtml => {
					loading = false;
					obj.setContent(rspHtml);
				}, error => {
					loading = false;
					obj.setContent(error);
				});
			});
		}
	};
}