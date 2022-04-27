import {hide, show} from "../Lang/Dom.js";

export const Thumb = {
	globalConfig: {},

	setThumbGlobalConfig({loadingClass, errorClass}){
		this.globalConfig.loadingClass = loadingClass;
		this.globalConfig.errorClass = errorClass;
	},

	bindThumbImgNode(imgNode, param){
		if(!param.src){
			console.error('Image src required');
			return;
		}
		let loadingClass = param.loadingClass || this.globalConfig.loadingClass;
		let errorClass = param.loadingClass || this.globalConfig.errorClass;
		let pNode = imgNode.parentNode;
		pNode.classList.add(loadingClass);
		pNode.classList.remove(errorClass);

		imgNode.addEventListener('error', () => {
			pNode.classList.add(errorClass);
			pNode.classList.remove(loadingClass);
			hide(imgNode);
		});
		imgNode.addEventListener('load', ()=>{
			pNode.classList.remove(loadingClass);
			pNode.classList.remove(errorClass);
			show(imgNode);
		});
		imgNode.setAttribute('src', param.src);
	}
};