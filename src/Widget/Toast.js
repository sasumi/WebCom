import {hide, insertStyleSheet, show} from "./../Lang/Dom.js"
import {Theme} from "./Theme.js";

const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
const rotate_id = 'rotate111';

insertStyleSheet(`
	@keyframes ${rotate_id} {
		0% {
			transform: translate3d(-50%, -50%, 0) rotate(0deg);
		}
		100% {
		transform: translate3d(-50%, -50%, 0) rotate(360deg);
		}
	}
	.${TOAST_CLS_MAIN}-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center; line-height:1.5; z-index:${Theme.ToastIndex}}
	.${TOAST_CLS_MAIN}>div {margin-bottom:0.5em;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block; border-radius:3px; padding:.75em 3em .75em 2em; background-color:#fff; color:var(--color); border:1px solid #ccc}
	.${TOAST_CLS_MAIN} .close{color:gray; line-height:1}
	.${TOAST_CLS_MAIN} .close:before{content:"×"; font-size:25px; cursor:pointer; position:absolute; margin:6px 0 0 -30px; transition:all 0.1s linear;}
	.${TOAST_CLS_MAIN} .close:hover{color:var(--color);}

	.${TOAST_CLS_MAIN}-success .ctn {color:#26b524;}

	.${TOAST_CLS_MAIN}-error .ctn{color:red; position:relative;}
	.${TOAST_CLS_MAIN}-loading .ctn {padding-left:3.5em;}
	.${TOAST_CLS_MAIN}-loading .ctn:before {
		animation: 1.5s linear infinite ${rotate_id};
        animation-play-state: inherit;
        border: solid 3px #cfd0d1;
        border-bottom-color: #1c87c9;
        border-radius: 50%;
        content: "";
        height: 1.2em;
        width: 1.2em;
		margin:10px 0 0 -20px;
        position: absolute;
        transform: translate3d(-50%, -50%, 0);
        will-change: transform;
	}
`);

let toastWrap = null;

const getWrapper = () => {
	if(!toastWrap){
		toastWrap = document.createElement('div');
		document.body.appendChild(toastWrap);
		toastWrap.className = TOAST_CLS_MAIN + '-wrap';
	}
	return toastWrap;
}

export class Toast {
	static TYPE_INFO = 'info';
	static TYPE_SUCCESS = 'success';
	static TYPE_WARNING = 'warning';
	static TYPE_ERROR = 'error';
	static TYPE_LOADING = 'loading';

	static DEFAULT_TIME_MAP = {
		[Toast.TYPE_INFO]: 1500,
		[Toast.TYPE_SUCCESS]: 1500,
		[Toast.TYPE_WARNING]: 2000,
		[Toast.TYPE_ERROR]: 2500,
		[Toast.TYPE_LOADING]: 10000,
	}

	message = '';
	type = Toast.TYPE_INFO;
	timeout = Toast.DEFAULT_TIME_MAP[this.type];

	dom = null;

	/**
	 * @param {String} message
	 * @param {String} type
	 * @param {Number} timeout 超时时间，0表示不关闭
	 */
	constructor(message, type = null, timeout = null){
		this.message = message;
		this.type = type || Toast.TYPE_SUCCESS;
		this.timeout = timeout === null ? Toast.DEFAULT_TIME_MAP[this.type] : timeout;
	}

	/**
	 * 显示提示
	 * @param {String} message
	 * @param {String} type
	 * @param {Number} timeout 超时时间，0表示不关闭
	 * @returns
	 */
	static showToast = (message, type = null, timeout = null) => {
		let toast = new Toast(message, type, timeout);
		toast.show();
		return toast;
	}

	static showInfo = (message) => {
		return this.showToast(message, Toast.TYPE_INFO, this.DEFAULT_TIME_MAP[Toast.TYPE_INFO]);
	}

	static showSuccess = (message) => {
		return this.showToast(message, Toast.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS]);
	}

	static showWarning = (message) => {
		return this.showToast(message, Toast.TYPE_WARNING, this.DEFAULT_TIME_MAP[Toast.TYPE_WARNING]);
	}

	static showError = (message) => {
		return this.showToast(message, Toast.TYPE_ERROR, this.DEFAULT_TIME_MAP[Toast.TYPE_ERROR]);
	}

	static showLoading = (message) => {
		return this.showToast(message, Toast.TYPE_LOADING, this.DEFAULT_TIME_MAP[Toast.TYPE_LOADING]);
	}

	show(){
		let wrapper = getWrapper();
		show(wrapper);
		this.dom = document.createElement('span');
		wrapper.appendChild(this.dom);
		this.dom.className = `${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-` + this.type;
		this.dom.innerHTML = `<span class="ctn">${this.message}</span><span class="close"></span><div></div>`;

		let hide_tm = null;
		if(this.timeout){
			hide_tm = setTimeout(() => {
				this.hide();
			}, this.timeout);
		}

		this.dom.querySelector('.close').addEventListener('click', ()=> {
			hide_tm && clearTimeout(hide_tm);
			this.hide();
		});
	}

	hide(){
		this.dom.parentNode.removeChild(this.dom);
		let wrapper = getWrapper();
		if(!wrapper.childNodes.length){
			hide(wrapper);
		}
	}
}