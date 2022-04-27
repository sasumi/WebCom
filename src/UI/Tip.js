import {getRegion, rectInLayout} from "../Lang/Dom.js";
import {KEYS} from "../Lang/Util.js";
import {Net} from "../Lang/Net.js";

let OBJ_COLLECTION = {};
let PRIVATE_VARS = {};
let GUID_BIND_KEY = 'ywj-com-tip-guid';
let TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * 绑定事件
 */
let bindEvent = function(){
	if(PRIVATE_VARS[this.guid].opt.closeBtn){
		let btn = this.getDom().querySelector('.ywj-tip-close');
		let _this = this;
		btn.addEventListener('click', ()=>{
			this.hide();
		}, false);
		document.body.addEventListener('keyup', function(e){
			if(e.keyCode === KEYS.Esc){
				_this.hide();
			}
		}, false);
	}
};

/**
 * 自动计算方位
 * @returns {number}
 */
let calDir = function(){
	let $body = $('body');
	let $container = this.getDom();
	let width = $container.outerWidth();
	let height = $container.outerHeight();
	let px = this.rel_tag.offset().left;
	let py = this.rel_tag.offset().top;
	let rh = this.rel_tag.outerHeight();
	let rw = this.rel_tag.outerWidth();

	let scroll_left = $body.scrollLeft();
	let scroll_top = $body.scrollTop();

	let viewRegion = getRegion();

	for(let i=0; i<TRY_DIR_MAP.length; i++){
		let dir_offset = getDirOffset(TRY_DIR_MAP[i], width, height, rh, rw);
		let rect = {
			left:px+dir_offset[0],
			top:py+dir_offset[1],
			width: width,
			height: height
		};
		let layout_rect = {
			left:scroll_left,
			top:scroll_top,
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
 * @param dir
 * @param width
 * @param height
 * @param rh
 * @param rw
 * @returns {*}
 */
let getDirOffset = function(dir, width, height, rh, rw){
	let offset = {
		11: [-width*0.25+rw/2, rh],
		0: [-width*0.5+rw/2, rh],
		1: [-width*0.75+rw/2, rh],
		2: [-width, -height*0.25+rh/2],
		3: [-width, -height*0.5+rh/2],
		4: [-width, -height*0.75+rh/2],
		5: [-width*0.75+rw/2, -height],
		6: [-width*0.5+rw/2, -height],
		7: [-width*0.25+rw/2, -height],
		8: [rw, -height*0.75 + rh/2],
		9: [rw, -height*0.5 + rh/2],
		10: [rw, -height*0.25 + rh/2]
	};
	return offset[dir];
};

/**
 * 更新位置信息
 */
const updatePosition = function(){
	let vars = PRIVATE_VARS[this.guid];
	let dir = vars.opt.dir;
	let $container = this.getDom();
	let width = $container.outerWidth();
	let height = $container.outerHeight();
	let px = this.rel_tag.offset().left;
	let py = this.rel_tag.offset().top;
	let rh = this.rel_tag.outerHeight();
	let rw = this.rel_tag.outerWidth();

	if(dir === 'auto'){
		dir = calDir.call(this);
	}
	$container.attr('class', 'ywj-tip-container-wrap ywj-tip-'+dir);
	let offset = getDirOffset(dir, width, height, rh, rw);
	let x = px + offset[0];
	let y = py + offset[1];

	$container.css({
		left: parseInt(x,10),
		top: parseInt(y,10)
	});
};

/**
 * TIP组件
 * @param content
 * @param rel_tag
 * @param opt
 * @constructor
 */
let Tip = function(content, rel_tag, opt){
	this.guid = guid();
	this.rel_tag = $(rel_tag);
	this.onShow = Hooker(true);
	this.onHide = Hooker(true);
	this.onDestory = Hooker(true);
	PRIVATE_VARS[this.guid] = {};

	opt = Object.assign({
		closeBtn: false, //是否显示关闭按钮
		timeout: 0,
		width: 'auto',
		dir: 'auto'
	}, opt || {});

	let close_html = opt.closeBtn ? `<span class="ywj-tip-close">&#10005;</span>` : ``;
	let html =
		`<div class="ywj-tip-container-wrap" style="display:none;">
			<s class="ywj-tip-arrow ywj-tip-arrow-pt"></s>
			<s class="ywj-tip-arrow ywj-tip-arrow-bg"></s>
			${close_html}
			<div class="ywj-tip-content">${content}</div>
		</div>`;

	PRIVATE_VARS[this.guid].opt = opt;
	let $container = $(html).appendTo($('body'));
	$container.css('width', opt.width);
	PRIVATE_VARS[this.guid].container = $container;
	OBJ_COLLECTION[this.guid] = this;
	bindEvent.call(this);
};

/**
 * @returns {Element|null}
 */
Tip.prototype.getDom = function(){
	let vars = PRIVATE_VARS[this.guid];
	return vars.container;
};

/**
 * update content
 * @param html
 */
Tip.prototype.updateContent = function(html){
	this.getDom().find('.ywj-tip-content').html(html);
	updatePosition.call(this);
};

Tip.prototype.show = function(){
	//去重判断，避免onShow时间多次触发
	if(this.isShow()){
		return;
	}
	let vars = PRIVATE_VARS[this.guid];
	let _this = this;
	this.getDom().show().stop().animate({opacity:1}, 'fast');
	updatePosition.call(this);
	this.onShow.fire(this);
	if(vars.opt.timeout){
		setTimeout(function(){
			_this.hide();
		}, vars.opt.timeout);
	}
};

Tip.prototype.isShow = function(){
	return this.getDom().is(':visible');
};

Tip.prototype.hide = function(){
	let _this = this;
	this.getDom().stop().animate({opacity:0}, 'fast', function(){_this.getDom().hide()});
	this.onHide.fire(this);
};

Tip.prototype.destroy = function(){
	this.getDom().remove();
	this.onDestory.fire(this);
};

Tip.hideAll = function(){
	for(let i in OBJ_COLLECTION){
		OBJ_COLLECTION[i].hide();
	}
};

Tip.show = function(content, rel_tag, opt){
	let tip = new Tip(content, rel_tag, opt);
	tip.show();
	return tip;
};

/**
 * 简单节点绑定
 * @param content
 * @param rel_tag
 * @param opt
 * @returns {*}
 */
Tip.bind = function(content, rel_tag, opt){
	let guid = $(rel_tag).data(GUID_BIND_KEY);
	let obj = OBJ_COLLECTION[guid];
	if(!obj){
		let tm;
		let hide = function(){
			tm = setTimeout(function(){
				obj && obj.hide();
			}, 10);
		};

		let show = function(){
			clearTimeout(tm);
			obj.show();
		};

		obj = new Tip(content, rel_tag, opt);
		$(rel_tag).data(GUID_BIND_KEY, obj.guid);

		obj.getDom().hover(show, hide);
		$(rel_tag).hover(show, hide);
	}
	return obj;
};

/***
 * 绑定异步处理函数
 * @param rel_tag
 * @param opt
 * @param loader
 */
Tip.bindAsync = function(rel_tag, loader, opt){
	let guid = $(rel_tag).data(GUID_BIND_KEY);
	let obj = OBJ_COLLECTION[guid];
	if(!obj){
		let loading = false;
		obj = Tip.bind('loading...', rel_tag, opt);
		obj.onShow(function(){
			if(loading){
				return;
			}
			loading = true;
			loader(function(html){
				loading = false;
				obj.updateContent(html);
			}, function(error){
				loading = false;
				obj.updateContent(error);
			});
		}, opt.refresh);
	}
};

/**
 * @param $node
 * @param {Object} param {url, content, refresh}
 */
Tip.nodeInit = function($node, param){
	let url = param.url;
	let content = param.content;
	if(url){
		Tip.bindAsync($node, function(on_success, on_error){
			Net.get(url,param).then(function(rsp){
				if(rsp && !rsp.code){
					on_success(rsp.data);
				} else {
					on_error(rsp.message);
				}
			});
		});
	} else {
		Tip.bind(content, $node, param);
	}
};

export {Tip};