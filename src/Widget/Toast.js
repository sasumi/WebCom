import {createDomByHtml, getContextWindow, hide, insertStyleSheet, remove, show} from "./../Lang/Dom.js"
import {Theme} from "./Theme.js";

const COM_ID = Theme.Namespace + 'toast';

const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
const rotate_animate = Theme.Namespace + '-toast-rotate';
const fadeIn_animate = Theme.Namespace + '-toast-fadein';
const fadeOut_animate = Theme.Namespace + '-toast-fadeout';
const FADEIN_TIME = 200;
const FADEOUT_TIME = 500;

insertStyleSheet(`
	@keyframes ${rotate_animate} {
	    0% {transform:scale(1.4) rotate(0deg);}
	    100% {transform:scale(1.4) rotate(360deg);}
	}
	@keyframes ${fadeIn_animate} {
		0% { opacity: 0; }
		100% { opacity: 1; } 
	}
	@keyframes ${fadeOut_animate} {
		0% { opacity:1;}
		100% { opacity: 0} 
	}
	.${TOAST_CLS_MAIN}-wrap{position:absolute; margin:0; padding:0; top:5px; pointer-events:none; background-color:transparent; width:100%; border:none; text-align:center; z-index:${Theme.ToastIndex};}
	.${TOAST_CLS_MAIN} {pointer-events:auto}
	.${TOAST_CLS_MAIN}>span {margin-bottom:0.5rem;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:.5rem 1rem .5rem 2.8rem; text-align:left; line-height:1.5rem; background-color:var(${Theme.CssVar.BACKGROUND_COLOR});color:var(${Theme.CssVar.COLOR});box-shadow:var(${Theme.CssVar.PANEL_SHADOW}); animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";font-family:${Theme.IconFont}; position:absolute; font-size:1.4rem; margin-left:-1.8rem;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;} 
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform:scale(1.4);will-change: transform}
`, COM_ID + '-style');

let toastWrap = null;

const getWrapper = () => {
	if(!toastWrap){
		toastWrap = createDomByHtml(`<div class="${TOAST_CLS_MAIN}-wrap" popover="manual"></div>`, document.body);
	}
	return toastWrap;
}

class Toast{
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
	 * 延期显示 loading（推荐使用）
	 * 在一些业务后台能够快速响应场景，不显示loading过程能够提升用户体验
	 * @param {String} message
	 * @param {Number} delayMicroseconds 延迟显示
	 * @param {Function} timeoutCallback
	 * @return {Toast}
	 */
	static showLoadingLater = (message, delayMicroseconds = 200, timeoutCallback = null) => {
		let time = Toast.DEFAULT_TIME_MAP[Toast.TYPE_LOADING];
		let toast = new Toast(message, Toast.TYPE_LOADING, time);
		toast.show(timeoutCallback);
		hide(toast.dom);
		setTimeout(() => {
			toast.dom && show(toast.dom);
		}, delayMicroseconds);
		return toast;
	}

	/**
	 * 显示提示
	 * @param {Function} onTimeoutClose 超时关闭回调
	 */
	show(onTimeoutClose = null){
		let wrapper = getWrapper();
		wrapper.showPopover();
		this.dom = createDomByHtml(
			`<span class="${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-${this.type}">
				<span class="ctn">${this.message}</span><div></div>
			</span>`, wrapper);
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
		//稍微容错下，避免setTimeout后没有父节点
		if(!this.dom || !document.body.contains(this.dom)){
			return;
		}
		if(fadeOut){
			this.dom.classList.add(TOAST_CLS_MAIN + '-hide');
			setTimeout(() => {
				this.hide(false);
			}, FADEOUT_TIME);
			return;
		}
		remove(this.dom);
		this.dom = null;
		let wrapper = getWrapper();
		if(!wrapper.childNodes.length){
			wrapper.hidePopover();
		}
	}
}

window[COM_ID] = Toast;
let CONTEXT_WINDOW = getContextWindow();
let ToastClass = CONTEXT_WINDOW[COM_ID] || Toast;

export {ToastClass as Toast};