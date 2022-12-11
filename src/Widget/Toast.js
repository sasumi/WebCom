import {
	insertStyleSheet
} from "./../Lang/Dom.js"
let toastWrap = null;

insertStyleSheet(`
	.toast-wrap{position:fixed; top:5px; width:100%; height:0; text-align:center;}
	.toast>div {margin-bottom:0.5em;}
	.toast .ctn{display:inline-block; border-radius:3px; padding:0.5em 3em 0.5em 2em; background-color:#ffffffa8; box-shadow:1px 1px 4px #cccccc;}
	.toast .close{color:gray;}
	.toast .close:before{content:"×"; font-size:25px; cursor:pointer; position:absolute; margin:0 0 0 -30px; transition:all 0.1s linear;}
	.toast .close:hover{color:black;}
	.toast-success {background-color:#008000f5; color:white;}
	.toast-success .close{color:#eeeeee}
	.toast-success .close:hover{color:white;}

	.toast-info .ctn{background-color:#fff; color:var(--color);}
	.toast-info .close{color:#666}
	.toast-info .close:hover{color:var(--color);}

	.toast-success .ctn{background-color:#206098F5; color:white;}
	.toast-success .close{color:#eeeeee}
	.toast-success .close:hover{color:white;}
`)


export class Toast {
	static TYPE_INFO = 'info';
	static TYPE_SUCCESS = 'success';
	static TYPE_WARNING = 'warning';
	static TYPE_ERROR = 'error';
	static TYPE_LOADING = 'loading';

	static showInfo = (msg) => {
		this.showToast(msg, this.TYPE_INFO);
	};
	static showSuccess = (msg) => {
		this.showToast(msg, this.TYPE_SUCCESS);
	};
	static showWarning = (msg) => {
		this.showToast(msg, this.TYPE_WARNING);
	};
	static showError = (msg) => {
		this.showToast(msg, this.TYPE_ERROR);
	};
	static showLoading = (msg) => {
		this.showToast(msg, this.TYPE_LOADING);
	};

	static showToast = (msg, type = 'success', timeout = 1500) => {
		if (!toastWrap) {
			toastWrap = document.createElement('div');
			document.body.appendChild(toastWrap);
			toastWrap.className = 'toast-wrap';
		}
		toastWrap.style.display = 'block';
		let toast = document.createElement('span');
		toastWrap.appendChild(toast);
		toast.className = 'toast toast-' + type;
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
		if (toastWrap.childNodes.length === 0) {
			toastWrap.style.display = 'none';
		}
	};
}