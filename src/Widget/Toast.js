import {
	insertStyleSheet
} from "./../Lang/Dom.js"
import {Theme} from "./Theme.js";

let toastWrap = null;

const TOAST_CLS_MAIN = Theme.Namespace+'toast';
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

export class Toast {
	static TYPE_INFO = 'info';
	static TYPE_SUCCESS = 'success';
	static TYPE_WARNING = 'warning';
	static TYPE_ERROR = 'error';
	static TYPE_LOADING = 'loading';

	static DEFAULT_TIME_MAP = {
		[this.TYPE_INFO]: 1500,
		[this.TYPE_SUCCESS]: 1500,
		[this.TYPE_WARNING]: 2000,
		[this.TYPE_ERROR]: 2500,
		[this.TYPE_LOADING]: 10000,
	}

	static showInfo = (msg) => {
		this.showToast(msg, this.TYPE_INFO, this.DEFAULT_TIME_MAP[this.TYPE_INFO]);
	};
	static showSuccess = (msg) => {
		this.showToast(msg, this.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[this.TYPE_SUCCESS]);
	};
	static showWarning = (msg) => {
		this.showToast(msg, this.TYPE_WARNING, this.DEFAULT_TIME_MAP[this.TYPE_WARNING]);
	};
	static showError = (msg) => {
		this.showToast(msg, this.TYPE_ERROR, this.DEFAULT_TIME_MAP[this.TYPE_ERROR]);
	};
	static showLoading = (msg) => {
		this.showToast(msg, this.TYPE_LOADING, this.DEFAULT_TIME_MAP[this.TYPE_LOADING]);
	};

	static showToast = (msg, type = 'success', timeout = 1500) => {
		if(!toastWrap){
			toastWrap = document.createElement('div');
			document.body.appendChild(toastWrap);
			toastWrap.className = TOAST_CLS_MAIN+'-wrap';
		}
		toastWrap.style.display = 'block';
		let toast = document.createElement('span');
		toastWrap.appendChild(toast);
		toast.className = `${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-` + type;
		toast.innerHTML = `<span class="ctn">${msg}</span><span class="close"></span><div></div>`;
		toast.querySelector('.close').addEventListener('click', e => {
			this.hideToast(toast);
		});
		setTimeout(() => {
			this.hideToast(toast);
		}, timeout);
	};

	static hideToast = (toast) => {
		toast.parentNode.removeChild(toast);
		if(toastWrap.childNodes.length === 0){
			toastWrap.style.display = 'none';
		}
	};
}