import {getRegion, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {Img} from "../Lang/Img.js";

const DOM_CLASS = Theme.Namespace+'com-image-viewer';
const PADDING = '20px';

const BASE_INDEX = Theme.FullScreenModeIndex;
const OP_INDEX = BASE_INDEX+1;

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
	.${DOM_CLASS} .civ-ctn {text-align:center; height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-loading, .${DOM_CLASS} .civ-error {margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; font-size:60px; color:#ffffff6e; display:block; animation: ${Theme.Namespace}spin 3s infinite linear;}
	.${DOM_CLASS} .civ-img {height: calc(100% - ${PADDING}*2); padding:0 ${PADDING}; margin-top:${PADDING}; display: flex; justify-content: center; align-items: center;}
	.${DOM_CLASS} .civ-img img {box-shadow: 1px 1px 20px #898989; transition: all 0.1s linear}
`, Theme.Namespace+'img-preview-style');

/**
 * load image singleton
 * @param {String} src
 * @return {Promise<Element>}
 */
const loadImgSingleton = (() => {
	let img_cache = {};
	return (src) => {
		return new Promise((resolve, reject) => {
			if(img_cache[src]){
				return resolve(img_cache[src].cloneNode());
			}
			Img.loadImgBySrc(src).then(img => {
				img_cache[src] = img;
				resolve(img.cloneNode());
			}, reject)
		});
	}
})();

const fixImgView = (img, container = document) => {
	loadImgSingleton(img.src).then(tmpImg =>{
		let {width, height, top, left} = Img.scaleFixCenter({
			contentWidth: tmpImg.width,
			contentHeight: tmpImg.height,
			containerWidth: container.offsetWidth,
			containerHeight: container.offsetHeight
		});
		img.style.left = left + 'px';
		img.style.top = top + 'px';
		img.style.width = width + 'px';
		img.style.height = height + 'px';
	})
}

/**
 *
 * @param {ImgPreview} ip
 */
const updateNavState = (ip) => {
	if(ip.mode === ImgPreview.MODE_SINGLE){
		return;
	}
	let prev = ip.previewDom.querySelector('.civ-prev');
	let next = ip.previewDom.querySelector('.civ-next');
	show(prev);
	show(next);
	let total = ip.imgSrcList.length;
	if(ip.currentIndex === 0){
		prev.setAttribute('disabled', 'disabled');
	}else{
		prev.removeAttribute('disabled');
	}
	if(ip.currentIndex === (total - 1)){
		next.setAttribute('disabled', 'disabled');
	}else{
		next.removeAttribute('disabled');
	}
}


/**
 * @param {ImgPreview} ip
 * @param imgSrc
 */
const showImgSrc = (ip, imgSrc)=>{
	show(ip.previewDom);
	let loading = ip.previewDom.querySelector('.civ-loading');
	let err = ip.previewDom.querySelector('.civ-error');
	let img_ctn = ip.previewDom.querySelector('.civ-img');
	img_ctn.innerHTML = '';
	show(loading);
	hide(err);
	loadImgSingleton(imgSrc).then(img=>{
		hide(loading);
		fixImgView(img, img_ctn);
		img_ctn.innerHTML = '';
		img_ctn.appendChild(img);
	}, error=>{
		console.warn(error);
		hide(loading);
		err.innerHTML = `图片加载失败，<a href="${imgSrc}" target="_blank">查看详情(${error})</a>`;
		show(err);
	});
}


export class ImgPreview {
	previewDom = null;
	imgSrcList = [];
	currentIndex = 0;
	mode = ImgPreview.MODE_SINGLE;

	static MODE_SINGLE = 1;
	static MODE_MULTIPLE = 2;

	constructor({mode = ImgPreview.MODE_SINGLE} = {}){
		this.previewDom = document.querySelector('.com-image-viewer');
		this.mode = mode;

		if(!this.previewDom){
			//init container
			this.previewDom = document.createElement('div')
			this.previewDom.style.display = 'none';
			this.previewDom.className = DOM_CLASS;
			this.previewDom.innerHTML =
				`<span class="civ-closer" title="ESC to close">close</span>
				<span class="civ-nav-btn civ-prev" style="display:none;"></span>
				<span class="civ-nav-btn civ-next" style="display:none;"></span>
				<span class="civ-view-option">
					span.
				</span>
				<div class="civ-ctn">
					<span class="civ-loading"></span>
					<span class="civ-error"></span>
					<span class="civ-img"></span>
				</div>`;

			//bind close click & space click
			this.previewDom.querySelector('.civ-closer').addEventListener('click', ()=>{this.close();})
			this.previewDom.querySelector('.civ-ctn').addEventListener('click', e=>{
				if(e.target.tagName !== 'IMG'){
					this.close();
				}
			});

			//bind navigate
			this.previewDom.querySelector('.civ-prev').addEventListener('click', ()=>{this.switchTo(true);});
			this.previewDom.querySelector('.civ-next').addEventListener('click', ()=>{this.switchTo(false);});

			//bind resize
			let resize_tm = null;
			window.addEventListener('resize', ()=>{
				resize_tm && clearTimeout(resize_tm);
				resize_tm = setTimeout(()=>{
					this.resetView();
				}, 50);
			});

			//bind key
			document.body.addEventListener('keydown', e=>{
				if(!this.previewDom){
					return;
				}
				console.log(e);
				if(e.key === 'Escape'){
					this.close();
				}
				if(e.key === 'ArrowLeft'){
					this.switchTo(true);
				}
				if(e.key === 'ArrowRight'){
					this.switchTo(false);
				}
			});
			document.body.appendChild(this.previewDom);
		}
	}

	/**
	 * show image or image list
	 * @param {String} imgSrc
	 */
	static showImg(imgSrc){
		let ip = new ImgPreview({mode: ImgPreview.MODE_SINGLE});
		showImgSrc(ip, imgSrc);
	}

	/**
	 * 显示图片列表
	 * @param {String[]} imgSrcList
	 * @param {number} currentIndex
	 */
	static showImgList(imgSrcList, currentIndex = 0){
		let ip = new ImgPreview({mode:ImgPreview.MODE_MULTIPLE});
		ip.imgSrcList = imgSrcList;
		ip.currentIndex = currentIndex;
		updateNavState(ip);
		showImgSrc(ip, imgSrcList[currentIndex]);
	}

	/**
	 * 通过选择器绑定图片查看器
	 * @param {String} imgSelector
	 * @param {String} triggerEvent 触发事件类型，可为 click、dblclick之类的
	 */
	static bindImageViaSelector(imgSelector='img', triggerEvent='click'){
		let images = document.querySelectorAll(imgSelector);
		let imgSrcList = [];
		if(!images.length){
			return;
		}
		Array.from(images).forEach((img,idx)=>{
			imgSrcList.push(img.getAttribute('src'));
			img.addEventListener(triggerEvent, e=>{
				ImgPreview.showImgList(imgSrcList, idx);
			})
		});
	}

	switchTo(toPrev = false){
		if(this.mode !== ImgPreview.MODE_MULTIPLE){
			return false;
		}
		let total = this.imgSrcList.length;
		if((toPrev && this.currentIndex === 0) || (!toPrev && this.currentIndex === (total - 1))){
			return false;
		}
		toPrev ? this.currentIndex-- : this.currentIndex++;
		showImgSrc(this, this.imgSrcList[this.currentIndex]);
		updateNavState(this);
	}

	resetView(){
		let img = this.previewDom.querySelector('img');
		let container = this.previewDom.querySelector('.civ-img');
		if(!img){
			return;
		}
		fixImgView(img, container);
	}

	close(){
		if(!this.previewDom){
			return;
		}
		this.previewDom.parentNode.removeChild(this.previewDom);
		this.previewDom = null;
	}
}