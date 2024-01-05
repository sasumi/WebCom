import {getHighestResFromSrcSet} from "../Lang/Img.js";
import {showImgListPreview, showImgPreview} from "../Widget/ImgPreview.js";
import {eventDelegate} from "../Lang/Event.js";
import {findAll} from "../Lang/Dom.js";

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
		src = src || node.src;
	}else if(!src && node.tagName === 'A'){
		src = node.href;
	}
	return src;
}

/**
 * 图片预览
 * 调用方式① 父容器模式：[data-preview-watch="img"]
 * 调用方式② 图片节点模式：img[src][data-preview-selector=".all-img"]
 */
export class ACPreview {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let watchSelector = param.watch;
			if(watchSelector){
				eventDelegate(node, watchSelector, 'click', clickNode=>{
					let index = 0, imgSrcList = [];
					node.querySelectorAll(watchSelector).forEach((n, idx) => {
						if(node === clickNode){
							index = idx;
						}
						imgSrcList.push(resolveSrc(clickNode));
					});
					showImgListPreview(imgSrcList, index);
				});
				resolve();
				return;
			}

			let src = param.src || resolveSrc(node);
			let selector = param.selector;
			if(!src){
				console.warn('image preview src empty', node);
				return;
			}
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
