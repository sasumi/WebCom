import {createDomByHtml, hide, loadCss, setStyle, show} from "../Lang/Dom.js";
import {loadImgBySrc} from "../Lang/Img.js";
import {Theme} from "./Theme.js";
import {dimension2Style} from "../Lang/String.js";
import {eventDelegate, KEYS} from "../Lang/Event.js";
import {Masker} from "./Masker.js";
import {downloadFile} from "../Lang/Net.js";
import {Dialog} from "./Dialog.js";
import {Toast} from "./Toast.js";
import {LocalStorageSetting} from "./LocalStorageSetting.js";
import {convertFormDataToObject, convertObjectToFormData, formSync} from "../Lang/Form.js";
import {bindTargetContextMenu} from "./ContextMenu.js";

const DOM_CLASS = Theme.Namespace + 'com-image-viewer';

const DEFAULT_VIEW_PADDING = 20;
const MAX_ZOOM_IN_RATIO = 2; //最大显示比率
const MIN_ZOOM_OUT_SIZE = 50; //最小显示像素

const THUMB_WIDTH = 50;
const THUMB_HEIGHT = 50;

const ZOOM_IN_RATIO = 0.8; //缩小比率
const ZOOM_OUT_RATIO = 1.2; //放大比率

const ATTR_W_BIND_KEY = 'data-original-width';
const ATTR_H_BIND_KEY = 'data-original-height';

const DISABLED_ATTR_KEY = 'data-disabled';

const GRID_IMG_BG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTZGMjU3QTNFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTZGMjU3QTJFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg2ugmUAAAAGUExURe7u7v///yjTqpoAAAAoSURBVHjaYmDAARhxAIZRDaMaRjWMaqCxhtHQGNUwqmFUwyDTABBgALZcBIFabzQ0AAAAAElFTkSuQmCC';

const BASE_INDEX = Theme.FullScreenModeIndex;
const OP_INDEX = BASE_INDEX + 1;
const OPTION_DLG_INDEX = BASE_INDEX+2;
const OPTION_MENU_INDEX = BASE_INDEX+3;

export const IMG_PREVIEW_MODE_SINGLE = 1;
export const IMG_PREVIEW_MODE_MULTIPLE = 2;

export const IMG_PREVIEW_MS_SCROLL_TYPE_NONE = 0;
export const IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = 1;
export const IMG_PREVIEW_MS_SCROLL_TYPE_NAV = 2;

let PREVIEW_DOM = null;
let CURRENT_MODE = 0;

//srcset支持格式请使用 srcSetResolve 进行解析使用，规则如下
// ① src或[src]: 只有一种图源模式；
// ② [src1,src2]，1为缩略图，2为大图、原图；
// ③ [src1,src2,src3] 1为缩略图，2为大图，3为原图
let IMG_SRC_LIST = [/** srcset1, srcset2 **/];
let IMG_CURRENT_INDEX = 0;

const DEFAULT_SETTING = {
	show_thumb_list: false,
	show_toolbar: true,
	mouse_scroll_type: IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
	allow_move: true,
};
let LocalSetting = new LocalStorageSetting(DEFAULT_SETTING, Theme.Namespace+'com-image-viewer/');

/**
 * 解析图片src集合
 * @param {Array|String} item
 * @return {{normal: string, original: string, thumb: string}}
 */
const srcSetResolve = item => {
	item = typeof (item) === 'string' ? [item] : item;
	return {
		thumb: item[0],
		normal: item[1] || item[0],
		original: item[2] || item[1] || item[0]
	};
}

loadCss('./ip.css');

/**
insertStyleSheet(`
	@keyframes ${Theme.Namespace}spin{100%{transform:rotate(360deg);}}
	.${DOM_CLASS} {position: fixed; z-index:${BASE_INDEX}; background-color: #00000057; width: 100%; height: 100%; overflow:hidden;top: 0;left: 0;}
	.${DOM_CLASS} .civ-closer {position:absolute; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:10px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before {font-family: "${Theme.IconFont}", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover {background-color:#eeeeee75;}
	.${DOM_CLASS} .civ-nav-btn {padding:10px; z-index:${OP_INDEX}; transition:all 0.1s linear; border-radius:3px; opacity:0.8; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled] {color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:not([disabled]):hover {opacity:1;}
	.${DOM_CLASS} .civ-nav-btn:before {font-family:"${Theme.IconFont}"; font-size:20px;}
	.${DOM_CLASS} .civ-prev {left:10px}
	.${DOM_CLASS} .civ-prev:before {content:"\\e6103"}
	.${DOM_CLASS} .civ-next {right:10px}
	.${DOM_CLASS} .civ-next:before {content:"\\e73b";}

	.${DOM_CLASS} .civ-nav-list-wrap {position:absolute; background-color:#fff3; padding-left:20px; padding-right:20px; bottom:10px; left:50%; transform: translate(-50%, 0); overflow:hidden; z-index:${OP_INDEX}; max-width:300px; min-width:300px; border:1px solid green;}
	.${DOM_CLASS} .civ-nav-list-prev:before,
	.${DOM_CLASS} .civ-nav-list-next:before {font-family:"${Theme.IconFont}"; font-size:18px; position:absolute; top:30%; left:0; width:20px; height:100%;}
	.${DOM_CLASS} .civ-nav-list-prev:before {content:"\\e6103"}
	.${DOM_CLASS} .civ-nav-list-next:before {content:"\\e73b"; left:auto; right:0;}
	.${DOM_CLASS} .civ-nav-list {height:${THUMB_HEIGHT}px}
	.${DOM_CLASS} .civ-nav-thumb {width:${THUMB_WIDTH}px; height:${THUMB_HEIGHT}px; overflow:hidden; display:inline-block; box-sizing:border-box; padding:0 5px;}
	.${DOM_CLASS} .civ-nav-thumb img {width:100%; height:100%; object-fit:cover;}

	.${DOM_CLASS} .civ-ctn {height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-error {margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading {--loading-size:50px; position:absolute; left:50%; top:50%; margin:calc(var(--loading-size) / 2) 0 0 calc(var(--loading-size) / 2)}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; animation: ${Theme.Namespace}spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size);}
	.${DOM_CLASS} .civ-img {height:100%; display:block; box-sizing:border-box; position:relative;}
	.${DOM_CLASS} .civ-img img {position:absolute; left:50%; top:50%; transition:width 0.1s, height 0.1s; transform: translate(-50%, -50%); box-shadow: 1px 1px 20px #898989; background:url('${GRID_IMG_BG}')}

	.${DOM_CLASS}[data-ip-mode="${IMG_PREVIEW_MODE_SINGLE}"] .civ-nav-btn,
	.${DOM_CLASS}[data-ip-mode="${IMG_PREVIEW_MODE_SINGLE}"] .civ-nav-list-wrap {display:none;}
`, Theme.Namespace + 'img-preview-style'); **/

/**
 * 销毁组件
 */
const destroy = () => {
	if(!PREVIEW_DOM){
		return;
	}
	PREVIEW_DOM.parentNode.removeChild(PREVIEW_DOM);
	PREVIEW_DOM = null;
	Masker.hide();
	window.removeEventListener('resize', onWinResize);
	document.removeEventListener('keyup', bindKeyUp);
	document.removeEventListener('keydown', bindKeyDown);
};

/**
 * 更新导航按钮状态
 */
const updateNavState = () => {
	let prev = PREVIEW_DOM.querySelector('.civ-prev');
	let next = PREVIEW_DOM.querySelector('.civ-next');
	let total = IMG_SRC_LIST.length;
	if(IMG_CURRENT_INDEX === 0){
		prev.setAttribute(DISABLED_ATTR_KEY, '1');
	}else{
		prev.removeAttribute(DISABLED_ATTR_KEY);
	}
	if(IMG_CURRENT_INDEX === (total - 1)){
		next.setAttribute(DISABLED_ATTR_KEY, '1');
	}else{
		next.removeAttribute(DISABLED_ATTR_KEY);
	}

	updateThumbNavState();
}

const updateThumbNavState = ()=>{
	PREVIEW_DOM.querySelectorAll(`.civ-nav-list .civ-nav-thumb`).forEach(item=>item.classList.remove('active'));
	PREVIEW_DOM.querySelector(`.civ-nav-list .civ-nav-thumb[data-index="${IMG_CURRENT_INDEX}"]`).classList.add('active');
}

const listenSelector = (parentNode, selector, event, handler)=>{
	parentNode.querySelectorAll(selector).forEach(target=>{
		target.addEventListener(event, handler);
	});
}

const activeSelector = (parentNode, selector, handler)=>{
	listenSelector(parentNode, selector, 'click', handler);
	listenSelector(parentNode, selector, 'keyup', e=>{
		if(e.keyCode === KEYS.Enter){
			handler(e);
		}
	});
}

const scaleFixCenter = ({contentWidth, contentHeight, containerWidth, containerHeight, spacing = 0, zoomIn = false}) => {
	if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
		return {
			width: contentWidth,
			height: contentHeight
		};
	}
	let ratioX = containerWidth / contentWidth;
	let ratioY = containerHeight / contentHeight;

	let ratio = Math.min(ratioX, ratioY);
	return {
		width: contentWidth * ratio - spacing * 2,
		height: contentHeight * ratio - spacing * 2
	};
}

/**
 * 绑定图片移动
 * @param img
 */
const bindImgMove = (img) => {
	let moving = false;
	let lastOffset = {};
	img.addEventListener('mousedown', e => {
		moving = true;
		lastOffset = {
			clientX: e.clientX,
			clientY: e.clientY,
			marginLeft: parseInt(img.style.marginLeft || 0, 10),
			marginTop: parseInt(img.style.marginTop || 0, 10)
		};
		e.preventDefault();
	});
	let context_commands = [];
	TOOLBAR_OPTIONS.forEach(item => {
		context_commands.push([COMMANDS[item][0], COMMANDS[item][1]]);
	});
	bindTargetContextMenu(img, context_commands);

	['mouseup', 'mouseout'].forEach(ev => {
		img.addEventListener(ev, e => {
			moving = false;
		})
	});
	img.addEventListener('mousemove', e => {
		if(moving && LocalSetting.get('allow_move')){
			img.style.marginLeft = dimension2Style(lastOffset.marginLeft + (e.clientX - lastOffset.clientX));
			img.style.marginTop = dimension2Style(lastOffset.marginTop + (e.clientY - lastOffset.clientY));
		}
	});
}

/**
 * 显示图片
 * @param {Number} img_index
 */
const showImgSrc = (img_index = 0) => {
	return new Promise((resolve, reject) => {
		let imgItem = srcSetResolve(IMG_SRC_LIST[img_index]);
		let loading = PREVIEW_DOM.querySelector('.civ-loading');
		let err = PREVIEW_DOM.querySelector('.civ-error');
		let img_ctn = PREVIEW_DOM.querySelector('.civ-img');
		img_ctn.innerHTML = '';
		Masker.show();
		show(loading);
		hide(err);
		loadImgBySrc(imgItem.normal).then(img => {
			setStyle(img, scaleFixCenter({
				contentWidth: img.width,
				contentHeight: img.height,
				containerWidth: img_ctn.offsetWidth,
				containerHeight: img_ctn.offsetHeight,
				spacing: DEFAULT_VIEW_PADDING
			}));
			hide(loading);
			img_ctn.innerHTML = '';
			img.setAttribute(ATTR_W_BIND_KEY, img.width);
			img.setAttribute(ATTR_H_BIND_KEY, img.height);
			bindImgMove(img);
			img_ctn.appendChild(img);
			resolve(img);
		}, error => {
			hide(loading);
			err.innerHTML = `图片加载失败，<a href="${imgItem.normal}" target="_blank">查看详情(${error})</a>`;
			show(err);
			reject(err);
		});
	});
}

const constructDom = () => {
	let nav_thumb_list_html = '';
	if(CURRENT_MODE === IMG_PREVIEW_MODE_MULTIPLE){
		nav_thumb_list_html = `
		<div class="civ-nav-wrap">
			<span class="civ-nav-list-prev" data-cmd="thumb-scroll-prev"></span>
			<div class="civ-nav-list-wrap">
				<div class="civ-nav-list" style="width:${THUMB_WIDTH * IMG_SRC_LIST.length}px">
				${IMG_SRC_LIST.reduce((preStr, item, idx)=>{
					return preStr + `<span class="civ-nav-thumb" data-cmd="switchTo" data-index="${idx}"><img src="${srcSetResolve(item).thumb}"/></span>`;
				},"")}
				</div>
			</div>
			<span class="civ-nav-list-next" data-cmd="thumb-scroll-next"></span>
		</div>`;
	}

	let option_html = `
	<span class="civ-view-option">
		${TOOLBAR_OPTIONS.reduce((lastVal,CMD,idx)=>{
			return lastVal + `<span class="civ-opt-btn" data-cmd="${CMD}" title="${COMMANDS[CMD][0]}"></span>`;
		},"")}
	</span>`;

	PREVIEW_DOM = createDomByHtml(`
		<div class="${DOM_CLASS}" data-ip-mode="${CURRENT_MODE}">
			<span class="civ-closer" data-cmd="close" title="ESC to close">close</span>
			<span class="civ-nav-btn civ-prev" data-cmd="navTo" data-dir="0"></span>
			<span class="civ-nav-btn civ-next" data-cmd="navTo" data-dir="1"></span>
			${option_html}
			${nav_thumb_list_html}
			<div class="civ-ctn">
				<span class="civ-loading"></span>
				<span class="civ-error"></span>
				<span class="civ-img"></span>
			</div>
		</div>
	`, document.body);

	LocalSetting.each((k, v)=>{PREVIEW_DOM.setAttribute(k, JSON.stringify(v));});
	LocalSetting.onUpdated((k, v)=>{PREVIEW_DOM && PREVIEW_DOM.setAttribute(k, JSON.stringify(v));});

	//bind close click & space click
	eventDelegate(PREVIEW_DOM, '[data-cmd]', 'click', target=>{
		let cmd = target.getAttribute('data-cmd');
		if(target.getAttribute(DISABLED_ATTR_KEY)){
			return false;
		}
		if(COMMANDS[cmd]){
			return COMMANDS[cmd][1](target);
		}
		throw "no command found.";
	});

	PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('click', e => {
		if(e.target.tagName !== 'IMG'){
			destroy();
		}
	});

	//bind scroll zoom
	listenSelector(PREVIEW_DOM, '.civ-ctn', 'mousewheel', e=>{
		switch(LocalSetting.get('mouse_scroll_type')){
			case IMG_PREVIEW_MS_SCROLL_TYPE_SCALE:
				zoom(e.wheelDelta > 0 ? ZOOM_OUT_RATIO : ZOOM_IN_RATIO);
				break;
			case IMG_PREVIEW_MS_SCROLL_TYPE_NAV:
				navTo(e.wheelDelta > 0);
				break;
			default:
				break;
		}
		e.preventDefault();
		return false;
	})

	//bind resize
	window.addEventListener('resize', onWinResize);

	document.addEventListener('keydown', bindKeyDown);
	console.log('[IP] start bind key up');
	document.addEventListener('keyup', bindKeyUp);
};

const bindKeyUp = (e)=>{
	if(e.keyCode === KEYS.Esc){
		destroy();
	}
}

const bindKeyDown = (e) => {
	if(e.keyCode === KEYS.LeftArrow){
		navTo(true);
	}
	if(e.keyCode === KEYS.RightArrow){
		navTo(false);
	}
}

let resize_tm = null;
const onWinResize = () => {
	resize_tm && clearTimeout(resize_tm);
	resize_tm = setTimeout(() => {
		resetView();
	}, 50);
};

/**
 * 重置视图
 */
const resetView = () => {
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	if(!img){
		return;
	}
	let container = PREVIEW_DOM.querySelector('.civ-img');
	setStyle(img, scaleFixCenter({
		contentWidth: img.getAttribute(ATTR_W_BIND_KEY),
		contentHeight: img.getAttribute(ATTR_H_BIND_KEY),
		containerWidth: container.offsetWidth,
		containerHeight: container.offsetHeight,
		spacing: DEFAULT_VIEW_PADDING
	}));
	setStyle(img, {marginLeft: 0, marginTop: 0})
}

/**
 * 图片切换
 * @param {Boolean} toPrev 是否切换到上一张
 * @return {boolean}
 */
const navTo = (toPrev = false) => {
	let total = IMG_SRC_LIST.length;
	if((toPrev && IMG_CURRENT_INDEX === 0) || (!toPrev && IMG_CURRENT_INDEX === (total - 1))){
		return false;
	}
	toPrev ? IMG_CURRENT_INDEX-- : IMG_CURRENT_INDEX++;
	showImgSrc(IMG_CURRENT_INDEX);
	updateNavState();
}

const switchTo = (index)=>{
	IMG_CURRENT_INDEX = index;
	showImgSrc(IMG_CURRENT_INDEX);
	updateNavState();
}

const thumbScroll = (toPrev)=>{
	let $thumb_list = PREVIEW_DOM.querySelector('.civ-nav-list');

}

/**
 * 缩放
 * @param {Number} ratioOffset 缩放比率(原尺寸百分比）
 */
const zoom = (ratioOffset) => {
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	let origin_width = img.getAttribute(ATTR_W_BIND_KEY);
	let origin_height = img.getAttribute(ATTR_H_BIND_KEY);

	if(ratioOffset === null){
		ratioOffset = 1;
		img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
		img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
		img.style.width = dimension2Style(parseInt(origin_width, 10) * ratioOffset);
		img.style.height = dimension2Style(parseInt(origin_height, 10) * ratioOffset);
		return;
	}

	let width = parseInt(img.style.width, 10) * ratioOffset;
	let height = parseInt(img.style.height, 10) * ratioOffset;

	//zoom in ratio limited
	if(ratioOffset > 1 && width > origin_width && ((width / origin_width) > MAX_ZOOM_IN_RATIO || (height / origin_height) > MAX_ZOOM_IN_RATIO)){
		console.warn('zoom in limited');
		return;
	}

	//限制任何一边小于最小值
	if(ratioOffset < 1 && width < origin_width && (width < MIN_ZOOM_OUT_SIZE || height < MIN_ZOOM_OUT_SIZE)){
		console.warn('zoom out limited');
		return;
	}

	img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
	img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
	img.style.width = dimension2Style(parseInt(img.style.width, 10) * ratioOffset);
	img.style.height = dimension2Style(parseInt(img.style.height, 10) * ratioOffset);
}

const rotate = (degreeOffset)=>{
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	let rotate = parseInt(img.getAttribute('data-rotate') || 0, 10);
	let newRotate = rotate + degreeOffset;
	img.setAttribute('data-rotate', newRotate);
	img.style.transform = `translate(-50%, -50%) rotate(${newRotate}deg)`;
}

const viewOriginal = ()=>{
	window.open(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original);
};


let tools_menu;
const hideOptionContextMenu = ()=>{
	tools_menu && hide(tools_menu);
}

const showOptionDialog = ()=>{
	let html = `
<ul class="${DOM_CLASS}-option-list">
	<li>
		<label>界面：</label>
		<label>
			<input type="checkbox" name="show_thumb_list" value="1">多图模式下显示图片缩略图列表
		</label>
		<label>
			<input type="checkbox" name="show_toolbar" value="1">显示图片操作工具栏
		</label>
	</li>	
	<li>
		<label>鼠标滚轮：</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NAV}">切换前一张、后一张图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_SCALE}">缩放图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NONE}">无动作</label>
	</li>
	<li>
		<label>移动：</label>
		<label><input type="checkbox" name="allow_move" value="1">允许移动图片</label>
	</li>
</ul>
	`
	let dlg = Dialog.show('设置', html, {
		showMasker:false,
		modal:false
	});
	dlg.dom.style.zIndex = OPTION_DLG_INDEX+"";

	let lsSetterTip = null;
	formSync(dlg.dom, (name) => {
		return new Promise((resolve, reject) => {
			let tmp = convertObjectToFormData({[name]:LocalSetting.get(name)});
			resolve(tmp[name]);
		});
	}, (name, value) => {
		return new Promise((resolve, reject) => {
			let obj = convertFormDataToObject({[name]: value}, DEFAULT_SETTING);
			LocalSetting.set(name, obj[name]);
			lsSetterTip && lsSetterTip.hide();
			lsSetterTip = Toast.showSuccess('设置已保存');
			resolve();
		});
	});
}

const COMMANDS = {
	'close':['关闭',destroy],
	'navTo':['关闭', (target)=>{navTo(target.getAttribute('data-dir') !== '1');}],
	'switchTo': ['关闭',(target)=>{switchTo(target.getAttribute('data-index'));}],
	'thumb-scroll-prev': ['关闭', ()=>{thumbScroll(-1)}],
	'thumb-scroll-next': ['关闭', ()=>{thumbScroll(1)}],
	'zoomOut':['放大',()=>{zoom(ZOOM_OUT_RATIO); return false}],
	'zoomIn': ['缩小', ()=>{zoom(ZOOM_IN_RATIO); return false}],
	'zoomOrg':['原始比例',()=>{zoom(null); return false}],
	'rotateLeft': ['左旋90°', ()=>{rotate(-90); return false}],
	'rotateRight':['右旋90°',()=>{rotate(90); return false}],
	'viewOrg':['查看原图', viewOriginal],
	'download': ['下载图片',()=>{downloadFile(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original)}],
	'option': ['选项',showOptionDialog],
};

const TOOLBAR_OPTIONS = ['zoomOut', 'zoomIn', 'zoomOrg', 'rotateLeft', 'rotateRight', 'viewOrg', 'download', 'option'];

/**
 * 初始化
 * @param {Object} option
 * @param {Number} option.mode 显示模式：IMG_PREVIEW_MODE_SINGLE 单图模式，IMG_PREVIEW_MODE_MULTIPLE 多图模式
 * @param {String[]} option.srcList 图片列表，单图或者多图模式都需要以数组方式传参
 * @param {Boolean} option.showToolbar 是否显示选项条（缺省使用默认配置）
 * @param {Boolean} option.showThumbList [多图模式]是否显示缩略图列表（缺省使用默认配置）
 * @param {Number|0} option.mouse_scroll_type 鼠标滚动控制类型：IMG_PREVIEW_MS_SCROLL_TYPE_NONE，IMG_PREVIEW_MS_SCROLL_TYPE_SCALE，IMG_PREVIEW_MS_SCROLL_TYPE_NAV（缺省使用默认配置）
 * @param {Number|0} option.startIndex [多图模式]开始图片索引
 * @param {Boolean} option.preloadSrcList [多图模式]是否预加载列表
 */
const init = ({
	mode,
	srcList,
	showToolbar = null,
	mouse_scroll_type = IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
	startIndex = 0,
	showThumbList = null,
	preloadSrcList = null,
}) => {
	destroy();
	CURRENT_MODE = mode;
	IMG_SRC_LIST = srcList;
	IMG_CURRENT_INDEX = startIndex;

	mouse_scroll_type !== null && LocalSetting.set('mouse_scroll_type', mouse_scroll_type);
	showThumbList !== null && LocalSetting.set('show_thumb_list', showThumbList);
	showToolbar !== null && LocalSetting.set('show_toolbar', showToolbar);

	constructDom();
	showImgSrc(IMG_CURRENT_INDEX).finally(()=>{
		if(preloadSrcList){
			srcList.forEach(src=>{new Image().src = src});
		}
	});
	if(mode === IMG_PREVIEW_MODE_MULTIPLE){
		updateNavState();
	}
}

/**
 * 显示单张图片预览
 * @param {String} imgSrc
 * @param {Object} option
 */
export const showImgPreview = (imgSrc, option = {}) => {
	init({mode:IMG_PREVIEW_MODE_SINGLE, srcList:[imgSrc], ...option});
}

/**
 * 显示多图预览
 * @param {String[]} imgSrcList
 * @param {Number} startIndex
 * @param {Object} option
 */
export const showImgListPreview = (imgSrcList, startIndex = 0, option = {}) => {
	init({mode:IMG_PREVIEW_MODE_MULTIPLE, srcList:imgSrcList, startIndex, ...option});
}

export const bindImgPreviewViaSelector1 = (nodeSelector, thumbFetcher = 'src', srcFetcher = 'src', triggerEvent = 'click') => {
	eventDelegate(document.body, nodeSelector, 'click', target=>{

	});
}

/**
 * 通过绑定节点显示图片预览
 * @param {String} nodeSelector 触发绑定的节点选择器，可以是img本身节点，也可以是其他代理节点
 * @param {String} triggerEvent
 * @param {String|Function} srcFetcher 获取大图src的选择器，或者函数，如果是函数传入第一个参数为触发节点
 */
export const bindImgPreviewViaSelector = (nodeSelector = 'img', triggerEvent = 'click', srcFetcher = 'src', option = {}) => {
	let nodes = document.querySelectorAll(nodeSelector);
	let imgSrcList = [];
	if(!nodes.length){
		console.warn('no images found');
		return;
	}
	Array.from(nodes).forEach((node, idx) => {
		switch(typeof(srcFetcher)){
			case 'function':
				imgSrcList.push(srcFetcher(node));
				break;
			case 'string':
				imgSrcList.push(node.getAttribute(srcFetcher));
				break;
			default:
				throw "No support srcFetcher types:"+typeof(srcFetcher);
		}
		node.addEventListener(triggerEvent, e => {
			if(nodes.length > 1){
				showImgListPreview(imgSrcList, idx, option);
			}else{
				showImgPreview(imgSrcList[0], option);
			}
		})
	});
}
