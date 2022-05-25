import {convertBlobToBase64} from "./String.js";

/**
 * 通过 src 加载图片
 * @param {String} src
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImgBySrc = (src)=>{
	return new Promise((resolve, reject) => {
		let img = new Image;
		img.onload = ()=>{
			resolve(img);
		};
		img.onabort = ()=>{
			reject('Image loading abort');
		};
		img.onerror = ()=>{
			reject('Image load failure');
		};
		img.src = src;
	});
}

/**
 * 通过ImageSrc获取base64（网络请求模式）
 * @param src
 * @returns {Promise<unknown>}
 */
export const getBase64BySrc = (src)=>{
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.responseType = 'blob';
		xhr.onload = function(){
			if(this.status === 200){
				let blob = this.response;
				convertBlobToBase64(blob).then(base64 => {
					resolve(base64);
				}).catch(error => {
					reject(error);
				});
			}
		};
		xhr.onerror = function() {
			reject('Error:'+this.statusText);
		};
		xhr.onabort = function(){
			reject('Request abort');
		}
		xhr.send();
	});
}

/**
 * 通过 Image 获取base64数据
 * @param img
 * @returns {string|string|*|string|null}
 */
export const getBase64ByImg = (img) => {
	if(!img.src){
		return null;
	}
	if(img.src.indexOf('data:') === 0){
		return img.src;
	}
	let canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	let ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);
	return canvas.toDataURL("image/png")
};

/**
 * 通过缩放+定位将图片放置在指定容器中间
 * @param {Number} contentWidth
 * @param {Number} contentHeight
 * @param {Number} containerWidth
 * @param {Number} containerHeight
 * @param {Number} spacing
 * @param {Boolean} zoomIn 是否在图片小于容器时放大，默认不放大
 * @returns {{top: number, left: number, width: number, height: number}|{top: number, left: number, width, height}}
 */
export const scaleFixCenter = ({
   contentWidth,
   contentHeight,
   containerWidth,
   containerHeight,
   spacing = 0,
   zoomIn = false}) => {
	if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
		return {
			width: contentWidth,
			height: contentHeight,
			left: (containerWidth - contentWidth) / 2,
			top: (containerHeight - contentHeight) / 2
		};
	}
	let ratioX = containerWidth / contentWidth;
	let ratioY = containerHeight / contentHeight;

	let ratio = Math.min(ratioX, ratioY);
	return {
		width: contentWidth * ratio - spacing * 2,
		height: contentHeight * ratio - spacing * 2,
		left: (containerWidth - contentWidth * ratio) / 2 + spacing,
		top: (containerHeight - contentHeight * ratio) / 2 + spacing,
	}
}
