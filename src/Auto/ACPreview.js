import {getHighestResFromSrcSet} from "../Lang/Img.js";
import {showImgListPreview, showImgPreview} from "../Widget/ImgPreview.js";
import {eventDelegate} from "../Lang/Event.js";
import {findAll} from "../Lang/Dom.js";

/**
 * 图片预览
 * 调用方式① 父容器模式：[data-preview-watch="img"]
 * 调用方式② 图片节点模式：img[src][data-preview-selector=".all-img"]
 */
export class ACPreview {
	/**
	 * 父容器绑定模式
	 * @param node
	 * @param {Object} param
	 * @param {String} param.watch 监听子节点点击事件选择器
	 * @return {Promise<null>}
	 */
	static init(node, param = {}){
		let watchSelector = param.watch;
		if(watchSelector){
			eventDelegate(node, watchSelector, 'click', (e, clickNode) => {
				let currentIndex = 0,
					currentSrc = resolveSrc(clickNode),
					imgSrcList = [];
				node.querySelectorAll(watchSelector).forEach((n, idx) => {
					let src = resolveSrc(n);
					if(src === currentSrc){
						currentIndex = idx;
					}
					imgSrcList.push(src);
				});
				showImgListPreview(imgSrcList, currentIndex);
			});
		}
	}

	static active(node, param, event){
		return new Promise((resolve, reject) => {
			if(param.watch){
				resolve();
				return;
			}

			let src = param.src || resolveSrc(node);
			let selector = param.selector;
			if(!src){
				console.warn('image preview src empty', node);
				return;
			}
			event.preventDefault();
			if(selector){
				let index = 0, imgSrcList = [];
				findAll(selector).forEach((n, idx) => {
					if(node === n){
						index = idx;
					}
					imgSrcList.push(resolveSrc(n));
				});
				showImgListPreview(imgSrcList, index);
			}else{
				showImgPreview(src);
			}
			resolve();
		});
	}
}

/**
 * 提取节点图片源
 * @param node
 * @returns {string}
 */
const resolveSrc = (node) => {
	let src = node.dataset.src;
	//src获取优先级：param.src > img[data-src] > img[srcset] > img[src]
	if(node.tagName === 'IMG'){
		if(!src && node.srcset){
			src = getHighestResFromSrcSet(node.srcset);
		}
		src = src || node.src || node.dataset.src;
	}else if(!src && node.tagName === 'A'){
		src = node.href;
	}
	return src;
}
