import {hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";

const DOM_CLASS = Theme.Namespace+'com-image-viewer';
const PADDING = '20px';

const BASE_INDEX = Theme.FullScreenModeIndex;
const OP_INDEX = BASE_INDEX+1;

insertStyleSheet(`
	@keyframes ${Theme.Namespace}spin{100%{transform:rotate(360deg);}}
	.${DOM_CLASS} {position: absolute; z-index:${BASE_INDEX}; background-color: #00000057; width: 100%; height: 100%; overflow:hidden;top: 0;left: 0;}
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
	.${DOM_CLASS} .civ-loading, .${DOM_CLASS} .civ-error {position:absolute; top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading:before {content:"\\e635"; font-family:"${Theme.IconFont}" !important; font-size:60px; color:#ffffff6e; display:block; animation: ${Theme.Namespace}spin 3s infinite linear;}
	.${DOM_CLASS} .civ-img {height: calc(100% - ${PADDING}*2); padding:0 ${PADDING}; margin-top:${PADDING}; display: flex; justify-content: center; align-items: center;}
	.${DOM_CLASS} .civ-img img {max-height:100%; max-width:100%; box-shadow: 1px 1px 20px #898989;}
`);

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
			this.previewDom = document.createElement('div')
			this.previewDom.style.display = 'none';
			this.previewDom.className = DOM_CLASS;
			this.previewDom.innerHTML =
				`<span class="civ-closer" title="ESC to close">close</span>
				<span class="civ-nav-btn civ-prev" style="display:none;"></span>
				<span class="civ-nav-btn civ-next" style="display:none;"></span>
				<div class="civ-ctn">
					<span class="civ-loading"></span>
					<span class="civ-error"></span>
					<span class="civ-img"></span>
				</div>`;
			this.previewDom.querySelector('.civ-closer').addEventListener('click', ()=>{this.close();})
			this.previewDom.querySelector('.civ-ctn').addEventListener('click', e=>{
				if(e.target.tagName !== 'IMG'){
					this.close();
				}
			});
			let prev = this.previewDom.querySelector('.civ-prev');
			let next = this.previewDom.querySelector('.civ-next');

			let nav = (toPrev = false)=>{
				let total = this.imgSrcList.length;
				if((toPrev && this.currentIndex === 0) || (!toPrev && this.currentIndex === (total-1))){
					return false;
				}
				toPrev ? this.currentIndex-- : this.currentIndex++;
				this.show(this.imgSrcList[this.currentIndex]);
				this.updateNavState();
			};

			prev.addEventListener('click', e=>{nav(true);});
			next.addEventListener('click', e=>{nav(false);});

			document.body.addEventListener('keyup', e=>{
				if(!this.previewDom){
					return;
				}
				console.log(e);
				if(e.key === 'Escape'){
					this.close();
				}
				if(e.key === 'ArrowLeft'){
					nav(true);
				}
				if(e.key === 'ArrowRight'){
					nav(false);
				}
			});
			document.body.appendChild(this.previewDom);
		}
	}

	/**
	 * show image or image list
	 * @param {String|String[]} imgSrc
	 * @param currentIndex
	 */
	static showImg(imgSrc, currentIndex = 0){
		let mode = typeof(imgSrc) === 'object' ? ImgPreview.MODE_MULTIPLE : ImgPreview.MODE_SINGLE;
		let ip = new ImgPreview({mode});

		if(mode === ImgPreview.MODE_SINGLE){
			let ip = new ImgPreview();
			ip.show(imgSrc);
		} else {
			ip.imgSrcList = imgSrc;
			ip.currentIndex = currentIndex;
			ip.updateNavState();
			ip.show(imgSrc[currentIndex]);
		}
	}

	updateNavState(){
		if(this.mode === ImgPreview.MODE_SINGLE){
			return;
		}

		let prev = this.previewDom.querySelector('.civ-prev');
		let next = this.previewDom.querySelector('.civ-next');
		show(prev);
		show(next);
		let total = this.imgSrcList.length;
		if(this.currentIndex === 0){
			prev.setAttribute('disabled', 'disabled');
		} else {
			prev.removeAttribute('disabled');
		}
		if(this.currentIndex === (total-1)){
			next.setAttribute('disabled', 'disabled');
		}
		else {
			next.removeAttribute('disabled');
		}
	}

	show(imgSrc){
		show(this.previewDom);
		let loading = this.previewDom.querySelector('.civ-loading');
		let err = this.previewDom.querySelector('.civ-error');
		let img_ctn = this.previewDom.querySelector('.civ-img');
		img_ctn.innerHTML = '';
		show(loading);
		hide(err);
		let img = new Image();
		img.onload = ()=>{
			hide(loading);
			img_ctn.innerHTML = '';
			img_ctn.appendChild(img);
		};
		img.onerror = ()=>{
			err.innerHTML = `图片加载失败，<a href="${imgSrc}" target="_blank">查看详情</a>`;
			show(err);
		}
		img.src = imgSrc;
	}

	close(){
		if(!this.previewDom){
			return;
		}
		this.previewDom.parentNode.removeChild(this.previewDom);
		this.previewDom = null;
	}
}