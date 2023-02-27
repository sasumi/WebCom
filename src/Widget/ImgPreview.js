import {createDomByHtml, hide, insertStyleSheet, setStyle, show} from "../Lang/Dom.js";
import {loadImgBySrc} from "../Lang/Img.js";
import {Theme} from "./Theme.js";
import {dimension2Style} from "../Lang/String.js";

const DOM_CLASS = Theme.Namespace + 'com-image-viewer';
const DEFAULT_VIEW_PADDING = 20;
const MAX_ZOOM_IN_RATIO = 2; //最大显示比率
const MIN_ZOOM_OUT_SIZE = 50; //最小显示像素

const THUMB_WIDTH = 50;
const THUMB_HEIGHT = 50;

const ATTR_W_BIND_KEY = 'data-original-width';
const ATTR_H_BIND_KEY = 'data-original-height';

const BASE_INDEX = Theme.FullScreenModeIndex;
const OP_INDEX = BASE_INDEX + 1;

const MODE_SINGLE = 1;
const MODE_MULTIPLE = 2;

let PREVIEW_DOM = null;
let CURRENT_MODE = 0;
let IMG_SRC_LIST = [];
let IMG_CURRENT_INDEX = 0;

insertStyleSheet(`
	@keyframes ${Theme.Namespace}spin{100%{transform:rotate(360deg);}}
	.${DOM_CLASS} {position: fixed; z-index:${BASE_INDEX}; background-color: #00000057; width: 100%; height: 100%; overflow:hidden;top: 0;left: 0;}
	.${DOM_CLASS} .civ-closer {position:absolute; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:10px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before {font-family: "${Theme.IconFont}", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover {background-color:#eeeeee75;}
	.${DOM_CLASS} .civ-nav-btn {padding:10px; z-index:${OP_INDEX}; border-radius:3px; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled] {color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:hover {background-color:none !important;}
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
	.${DOM_CLASS} .civ-nav-thumb img {width:100%; height:100%; }
	
	.${DOM_CLASS} .civ-ctn {height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-error {margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading {--loading-size:50px; position:absolute; left:50%; top:50%; margin:calc(var(--loading-size) / 2) 0 0 calc(var(--loading-size) / 2)}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; animation: ${Theme.Namespace}spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size);}
	.${DOM_CLASS} .civ-img {height:100%; display:block; box-sizing:border-box; position:relative;}
	.${DOM_CLASS} .civ-img img {position:absolute; left:50%; top:50%; transition:width 0.1s, height 0.1s; transform: translate(-50%, -50%); box-shadow: 1px 1px 20px #898989; background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTZGMjU3QTNFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTZGMjU3QTJFRDJGMTFFQzk0QjQ4MDI4QUU0MDgyMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNTEwM0I4MzJFRURFQzExQThBOEY4MkExMjQ2MDZGOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg2ugmUAAAAGUExURe7u7v///yjTqpoAAAAoSURBVHjaYmDAARhxAIZRDaMaRjWMaqCxhtHQGNUwqmFUwyDTABBgALZcBIFabzQ0AAAAAElFTkSuQmCC')}
	
	.${DOM_CLASS}[data-ip-mode="${MODE_SINGLE}"] .civ-nav-btn,
	.${DOM_CLASS} .civ-nav-list-wrap {display:none;} /** todo **/
`, Theme.Namespace + 'img-preview-style');

/**
 * 更新导航按钮状态
 */
const updateNavState = () => {
	let prev = PREVIEW_DOM.querySelector('.civ-prev');
	let next = PREVIEW_DOM.querySelector('.civ-next');
	let total = IMG_SRC_LIST.length;
	if(IMG_CURRENT_INDEX === 0){
		prev.setAttribute('disabled', 'disabled');
	}else{
		prev.removeAttribute('disabled');
	}
	if(IMG_CURRENT_INDEX === (total - 1)){
		next.setAttribute('disabled', 'disabled');
	}else{
		next.removeAttribute('disabled');
	}
}

const scaleFixCenter = ({
	                        contentWidth,
	                        contentHeight,
	                        containerWidth,
	                        containerHeight,
	                        spacing = 0,
	                        zoomIn = false
                        }) => {
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
	['mouseup', 'mouseout'].forEach(ev => {
		img.addEventListener(ev, e => {
			moving = false;
		})
	});
	img.addEventListener('mousemove', e => {
		if(moving){
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
	let imgSrc = IMG_SRC_LIST[img_index];
	let loading = PREVIEW_DOM.querySelector('.civ-loading');
	let err = PREVIEW_DOM.querySelector('.civ-error');
	let img_ctn = PREVIEW_DOM.querySelector('.civ-img');
	img_ctn.innerHTML = '';
	show(loading);
	hide(err);
	loadImgBySrc(imgSrc).then(img => {
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
	}, error => {
		console.warn(error);
		hide(loading);
		err.innerHTML = `图片加载失败，<a href="${imgSrc}" target="_blank">查看详情(${error})</a>`;
		show(err);
	});
}

const constructDom = () => {
	let nav_thumb_list_html = ``;
	if(false && CURRENT_MODE === MODE_MULTIPLE){
		nav_thumb_list_html += `<div class="civ-nav-list" style="width:${THUMB_WIDTH * IMG_SRC_LIST.length}px">`;
		IMG_SRC_LIST.forEach(src => {
			nav_thumb_list_html += `<span class="civ-nav-thumb"><img src="${src}"/></span>`;
		});
		nav_thumb_list_html += `</div>`;
	}

	PREVIEW_DOM = createDomByHtml(`
		<div class="${DOM_CLASS}" data-ip-mode="${CURRENT_MODE}">
			<span class="civ-closer" title="ESC to close">close</span>
			<span class="civ-nav-btn civ-prev"></span>
			<span class="civ-nav-btn civ-next"></span>
			<span class="civ-view-option"></span>
			<div class="civ-nav-list-wrap">
				<span class="civ-nav-list-prev"></span>
				<span class="civ-nav-list-next"></span>
				${nav_thumb_list_html}
			</div>
			<div class="civ-ctn">
				<span class="civ-loading"></span>
				<span class="civ-error"></span>
				<span class="civ-img"></span>
			</div>
		</div>
	`, document.body);

	//bind close click & space click
	PREVIEW_DOM.querySelector('.civ-closer').addEventListener('click', destroy)
	PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('click', e => {
		if(e.target.tagName !== 'IMG'){
			destroy();
		}
	});

	//bind navigate
	if(CURRENT_MODE === MODE_MULTIPLE){
		PREVIEW_DOM.querySelector('.civ-prev').addEventListener('click', () => {
			switchTo(true);
		});
		PREVIEW_DOM.querySelector('.civ-next').addEventListener('click', () => {
			switchTo(false);
		});
	}

	//bind scroll zoom
	PREVIEW_DOM.querySelector('.civ-ctn').addEventListener('mousewheel', e => {
		zoom(e.wheelDelta > 0 ? 1.2 : 0.8);
		e.preventDefault();
		return false;
	})

	//bind resize
	window.addEventListener('resize', onWinResize);

	//bind key
	document.body.addEventListener('keydown', onKeyDown);
};

const onKeyDown = (e) => {
	if(e.key === 'Escape'){
		destroy();
	}
	if(e.key === 'ArrowLeft'){
		switchTo(true);
	}
	if(e.key === 'ArrowRight'){
		switchTo(false);
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
 * 销毁组件
 */
const destroy = () => {
	if(!PREVIEW_DOM){
		return;
	}
	PREVIEW_DOM.parentNode.removeChild(PREVIEW_DOM);
	PREVIEW_DOM = null;
	window.removeEventListener('resize', onWinResize);
	document.body.removeEventListener('keydown', onKeyDown);
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
const switchTo = (toPrev = false) => {
	let total = IMG_SRC_LIST.length;
	if((toPrev && IMG_CURRENT_INDEX === 0) || (!toPrev && IMG_CURRENT_INDEX === (total - 1))){
		return false;
	}
	toPrev ? IMG_CURRENT_INDEX-- : IMG_CURRENT_INDEX++;
	showImgSrc(IMG_CURRENT_INDEX);
	updateNavState();
}

/**
 * 缩放
 * @param {Number} ratioOffset 缩放比率(原尺寸百分比）
 */
const zoom = (ratioOffset) => {
	let img = PREVIEW_DOM.querySelector('.civ-img img');
	let origin_width = img.getAttribute(ATTR_W_BIND_KEY);
	let origin_height = img.getAttribute(ATTR_H_BIND_KEY);

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

/**
 * 初始化
 * @param {Number} mode
 * @param {String[]} imgSrcList
 * @param {Number} startIndex
 */
const init = (mode, imgSrcList, startIndex = 0) => {
	destroy();
	CURRENT_MODE = mode;
	IMG_SRC_LIST = imgSrcList;
	IMG_CURRENT_INDEX = startIndex;
	constructDom();
	showImgSrc(IMG_CURRENT_INDEX);
	mode === MODE_MULTIPLE && updateNavState();
}

/**
 * 显示单张图片预览
 * @param imgSrc
 */
export const showImgPreview = (imgSrc) => {
	init(MODE_SINGLE, [imgSrc]);
}

/**
 * 显示多图预览
 * @param {String[]} imgSrcList
 * @param {Number} startIndex
 */
export const showImgListPreview = (imgSrcList, startIndex = 0) => {
	init(MODE_MULTIPLE, imgSrcList, startIndex);
}

/**
 * 通过绑定图片节点显示图片预览
 * @param {String} imgSelector
 * @param {String} triggerEvent
 */
export const bindImgPreviewViaSelector = (imgSelector = 'img', triggerEvent = 'click') => {
	let images = document.querySelectorAll(imgSelector);
	let imgSrcList = [];
	if(!images.length){
		console.warn('no images found');
		return;
	}
	Array.from(images).forEach((img, idx) => {
		imgSrcList.push(img.getAttribute('src'));
		img.addEventListener(triggerEvent, e => {
			if(images.length > 1){
				showImgListPreview(imgSrcList, idx);
			}else{
				showImgPreview(imgSrcList[0]);
			}
		})
	});
}
