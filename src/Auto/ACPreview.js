import {getHighestResFromSrcSet} from "../Lang/Img.js";
import {showImgListPreview, showImgPreview} from "../Widget/ImgPreview.js";

const resolveSrc = (node) => {
	let src = node.dataset.src;
	//src获取优先级：param.src > img[data-src] > img[srcset] > img[src]
	if(node.tagName === 'IMG'){
		if(!src && node.srcset){
			src = getHighestResFromSrcSet(node.srcset) || node.src;
		}
	}else if(!src && node.tagName === 'A'){
		src = node.href;
	}
	return src;
}

/**
 * 图片预览
 */
export class ACPreview {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let src = param.src || resolveSrc(node);
			let selector = param.selector;
			if(!src){
				console.warn('image preview src empty', node);
				return;
			}
			if(selector){
				let index = 0, imgSrcList = [];
				document.querySelectorAll(selector).forEach((n, idx) => {
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
