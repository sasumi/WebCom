import {hide, insertStyleSheet, show} from "./../Lang/Dom.js"
import {Theme} from "./Theme.js";

const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
const rotate_animate = Theme.Namespace + '-toast-rotate';
const fadeIn_animate = Theme.Namespace + '-toast-fadein';
const fadeOut_animate = Theme.Namespace + '-toast-fadeout';
const FADEIN_TIME = 200;
const FADEOUT_TIME = 500;

insertStyleSheet(`
	@keyframes ${rotate_animate} {
	    0% {transform: translate3d(-50%, -50%, 0) rotate(0deg);}
	    100% {transform: translate3d(-50%, -50%, 0) rotate(360deg);}
	}
	@keyframes ${fadeIn_animate} {
		0% { opacity: 0; }
		100% { opacity: 1; } 
	}
	@keyframes ${fadeOut_animate} {
		0% { opacity:1;}
		100% { opacity: 0} 
	}
	.${TOAST_CLS_MAIN}-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center; line-height:1.5; z-index:${Theme.ToastIndex}}
	.${TOAST_CLS_MAIN}>div {margin-bottom:0.5em;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:0.4em 1em 0.4em 2.1em;background-color:#fff;color:var(--color);box-shadow:4px 5px 13px 0px #32323238;position: relative; animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";position:absolute;font-family:${Theme.IconFont}; left:0.5em;top:0.45em;font-size:1.2em;width:1em;height:1em;overflow: hidden;line-height: 1;box-sizing: border-box;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;}
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform: translate3d(-50%, -50%, 0);will-change: transform;margin:0.52em 0 0 0.5em;}
`, Theme.Namespace + 'toast');

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

	/**
	 * 各种类型提示默认隐藏时间
	 */
	static DEFAULT_TIME_MAP = {
		[Toast.TYPE_INFO]: 1500,
		[Toast.TYPE_SUCCESS]: 1500,
		[Toast.TYPE_WARNING]: 2000,
		[Toast.TYPE_ERROR]: 2500,
		[Toast.TYPE_LOADING]: 0,
	};

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
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @returns
	 */
	static showToast = (message, type = null, timeout = null, timeoutCallback = null) => {
		let toast = new Toast(message, type, timeout);
		toast.show(timeoutCallback);
		return toast;
	}

	/**
	 * 显示[提示]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showInfo = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_INFO, this.DEFAULT_TIME_MAP[Toast.TYPE_INFO], timeoutCallback);
	}

	/**
	 * 显示[成功]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showSuccess = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS], timeoutCallback);
	}

	/**
	 * 显示[告警]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showWarning = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_WARNING, this.DEFAULT_TIME_MAP[Toast.TYPE_WARNING], timeoutCallback);
	}

	/**
	 * 显示[错误]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showError = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_ERROR, this.DEFAULT_TIME_MAP[Toast.TYPE_ERROR], timeoutCallback);
	}

	/**
	 * 显示[加载中]
	 * @param {String} message
	 * @param {Function} timeoutCallback 超时关闭回调
	 * @return {Toast}
	 */
	static showLoading = (message, timeoutCallback = null) => {
		return this.showToast(message, Toast.TYPE_LOADING, this.DEFAULT_TIME_MAP[Toast.TYPE_LOADING], timeoutCallback);
	}

	/**
	 * 显示提示
	 * @param {Function} onTimeoutClose 超时关闭回调
	 */
	show(onTimeoutClose = null){
		let wrapper = getWrapper();
		show(wrapper);
		this.dom = document.createElement('span');
		wrapper.appendChild(this.dom);
		this.dom.className = `${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-` + this.type;
		this.dom.innerHTML = `<span class="ctn">${this.message}</span><div></div>`;
		if(this.timeout){
			setTimeout(() => {
				this.hide(true);
				onTimeoutClose && onTimeoutClose();
			}, this.timeout);
		}
	}

	/**
	 * 隐藏提示信息
	 * @param {Boolean} fadeOut 是否使用渐隐式淡出
	 */
	hide(fadeOut = false){
		if(fadeOut){
			this.dom.classList.add(TOAST_CLS_MAIN+'-hide');
			setTimeout(()=>{
				this.hide(false);
			}, FADEOUT_TIME);
			return;
		}
		this.dom.parentNode.removeChild(this.dom);
		let wrapper = getWrapper();
		if(!wrapper.childNodes.length){
			hide(wrapper);
		}
	}
}