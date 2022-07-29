import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {guid} from "../Lang/Util.js";

/**
 * 类型定义
 */
const TYPE_INFO = 'info';
const TYPE_SUCCESS = 'success';
const TYPE_WARING = 'warning';
const TYPE_ERROR = 'error';
const TYPE_LOADING = 'loading';

let TOAST_COLLECTION = [];
let CLASS_TOAST_WRAP = 'toast-wrap';

insertStyleSheet(`
	.${CLASS_TOAST_WRAP} {position:absolute; z-index:${Theme.ToastIndex}; left:50%; top:0; transform:translateX(-50%); display:inline-block;}
	.toast {padding:10px 35px 10px 15px; position:relative; display:block; float:left; clear:both; margin-top:10px; min-width:100px; border-radius:3px; box-shadow:5px 4px 12px #0003;}
	.toast-close {position:absolute; opacity:0.6; display:inline-block; padding:4px 8px; top:5px; right:0; cursor:pointer;}
	.toast-close:before {content:"×"; font-size:18px; line-height:1;}
	.toast-close:hover {opacity:1}
	.toast-${TYPE_INFO} {background-color:#fffffff0;}
	.toast-${TYPE_SUCCESS} {background-color:#1a70e1b8; color:white;}
	.toast-${TYPE_WARING} {background-color:#ff88008c; color:white;}
	.toast-${TYPE_ERROR} {background:radial-gradient(#ff5b5b, #f143438f); color:white;}
	.toast-${TYPE_LOADING} {background-color:#fffffff0; text-shadow:1px 1px 1px #eee;}
`, Theme.Namespace + 'toast-style');

let TOAST_WRAP;
const getToastWrap = () => {
	if(!TOAST_WRAP){
		TOAST_WRAP = createDomByHtml(`<div class="${CLASS_TOAST_WRAP}" style="display:none;"></div>`, document.body);
	}
	return TOAST_WRAP;
};

/**
 * 默认隐藏时间
 */
const DEFAULT_ELAPSED_TIME = {
	[TYPE_INFO]: 2000,
	[TYPE_SUCCESS]: 1500,
	[TYPE_WARING]: 3000,
	[TYPE_ERROR]: 3500,
	[TYPE_LOADING]: 10000,
};

export class Toast {
	id = null;
	dom = null;
	option = {
		timeout: DEFAULT_ELAPSED_TIME[TYPE_INFO],
		show: true,
		closeAble: true,
		class: TYPE_INFO
	};
	_closeTm = null;

	constructor(text, option = {}){
		this.option = {...this.option, ...option};
		let close_html = this.option.closeAble ? '<span class="toast-close"></span>' : '';
		this.id = this.option.id || guid('Toast');
		this.dom = createDomByHtml(`
			<div id="${this.id}" class="toast toast-${this.option.class}" style="display:none">
			${close_html} ${text}
			</div>
		`, getToastWrap());
		if(this.option.closeAble){
			this.dom.querySelector('.toast-close').addEventListener('click', () => {
				this.close();
			});
		}
		TOAST_COLLECTION.push(this);

		if(this.option.show){
			this.show();
			if(this.option.timeout){
				this._closeTm = setTimeout(() => {
					this.close();
				}, this.option.timeout);
			}
		}
	}

	setContent(html){
		this.dom.innerHTML = html;
	}

	show(){
		this.dom.style.display = '';
		let toastWrap = getToastWrap();
		toastWrap.style.display = '';
	}

	close(){
		this.dom.parentNode.removeChild(this.dom);
		let toastWrap = getToastWrap();
		if(toastWrap && !toastWrap.childNodes.length){
			toastWrap.parentNode.removeChild(toastWrap);
			TOAST_WRAP = null;
		}
		delete (TOAST_COLLECTION[TOAST_COLLECTION.indexOf(this)]);
		clearTimeout(this._closeTm);
	}

	static closeAll(){
		TOAST_COLLECTION.forEach(t => {
			t.close()
		});
	}

	static showSuccess(text, option = {}){
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_SUCCESS],
			show: true,
			...option,
			class: TYPE_SUCCESS
		});
	}

	static showInfo(text, option = {}){
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_INFO],
			show: true,
			...option,
			class: TYPE_INFO
		});
	}

	static showWarning(text, option = {}){
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_WARING],
			show: true,
			...option,
			class: TYPE_WARING
		});
	}

	static showError(text, option = {}){
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_ERROR],
			show: true,
			...option,
			class: TYPE_ERROR
		});
	}

	/**
	 * Show loading toast
	 * @param text
	 * @param option
	 * @returns {Toast}
	 */
	static showLoading(text = '加载中···', option = {}){
		return new Toast(text, {
			timeout: 0,
			show: true,
			class: 'loading',
			...option
		});
	};
}
