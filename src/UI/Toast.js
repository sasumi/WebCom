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
let CSS = `
	.${CLASS_TOAST_WRAP} {position:absolute; z-index:10; top:5px; left:0; width:100%;display: flex; justify-content: center; flex-direction:column; align-items: center;}
	.toast {padding:10px 35px 10px 15px; position:relative; margin-top:10px; min-width:100px; display:inline-block; border-radius:3px; box-shadow:5px 4px 12px #0003;}
	.toast-close {position:absolute; opacity:0.6; display:inline-block; padding:4px 8px; top:3px; right:0; cursor:pointer;}
	.toast-close:before {content:"×"; font-size:18px; line-height:1;}
	.toast-close:hover {opacity:1}
	.toast-${TYPE_INFO} {background-color:#fffffff0;}
	.toast-${TYPE_SUCCESS} {background-color:#fffffff0;}
	.toast-${TYPE_WARING} {background-color:#ff88008c; color:white;}
	.toast-${TYPE_ERROR} {background-color:#ff00008c; color:white;}
	.toast-${TYPE_LOADING} {background-color:#fffffff0; text-shadow:1px 1px 1px #eee;}
`;

const getToastWrap = () => {
	let toastWrap = document.querySelector(`.${CLASS_TOAST_WRAP}`);
	if (!toastWrap) {
		toastWrap = document.createElement('div');
		toastWrap.className = CLASS_TOAST_WRAP;
		toastWrap.style.display = 'none';
		document.body.appendChild(toastWrap);
	}
	return toastWrap;
};

let stylesheet = document.createElement('style');
stylesheet.innerHTML = CSS;
document.head.appendChild(stylesheet);

let _guid = 0;
const guid = prefix => {
	return prefix + (++_guid);
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
	_closeTm = null;

	constructor(text, opt) {
		let option = Object.assign({
			id: guid('Toast-'),
			timeout: 400000,
			show: true,
			closeAble: true,
			class: ''
		}, opt);
		let close_html = option.closeAble ? '<span class="toast-close"></span>' : '';
		this.id = option.id;
		this.dom = document.createElement(`span`);
		this.dom.setAttribute('id', this.id);
		this.dom.className = `toast toast-${option.class}`;
		this.dom.style.display = 'none';
		this.dom.innerHTML = close_html + ' ' + text;
		let toastWrap = getToastWrap();
		toastWrap.appendChild(this.dom);
		if (option.closeAble) {
			this.dom.querySelector('.toast-close').addEventListener('click', () => {
				this.close();
			});
		}
		TOAST_COLLECTION.push(this);

		if (option.show) {
			this.show();
			if (option.timeout) {
				this._closeTm = setTimeout(() => {
					this.close();
				}, option.timeout);
			}
		}
	}

	setHtml(html) {
		this.dom.innerHTML = html;
	}

	show() {
		this.dom.style.display = '';
		let toastWrap = getToastWrap();
		toastWrap.style.display = 'flex';
	}

	close() {
		this.dom.parentNode.removeChild(this.dom);
		let toastWrap = getToastWrap();
		if (!toastWrap.childNodes.length) {
			toastWrap.parentNode.removeChild(toastWrap);
		}
		delete(TOAST_COLLECTION[TOAST_COLLECTION.indexOf(this)]);
		clearTimeout(this._closeTm);
	}

	static closeAll() {
		TOAST_COLLECTION.forEach(t => {
			t.close()
		});
	}

	static showSuccess(text, opt) {
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_SUCCESS],
			...opt,
			class: TYPE_SUCCESS
		});
	}

	static showInfo(text, opt) {
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_INFO],
			...opt,
			class: TYPE_INFO
		});
	}

	static showWarning(text, opt) {
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_WARING],
			...opt,
			class: TYPE_WARING
		});
	}

	static showError(text, opt = {}) {
		return new Toast(text, {
			timeout: DEFAULT_ELAPSED_TIME[TYPE_ERROR],
			...opt,
			class: TYPE_ERROR
		});
	}

	/**
	 * Show loading toast
	 * @param text
	 * @param opt
	 * @returns {Toast}
	 */
	static showLoading(text = '加载中···', opt = {}) {
		return new Toast(text, Object.assign({
			timeout: 0,
			class: 'loading'
		}, opt));
	};
}