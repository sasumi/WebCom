import {escapeAttr, px2Str} from "../lang/String.js";
import {buttonActiveBind, domContained, keepRectCenter} from "../lang/Dom.js";
import {Masker} from "./Masker.js";
import {KEYS} from "../lang/Util.js";

const DLG_CLS_PREF = 'dialog';
const DLG_CLS_ACTIVE = DLG_CLS_PREF + '-active';
const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
const DLG_CLS_OP = DLG_CLS_PREF + '-op';
const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
const DLG_CLS_IFRAME = DLG_CLS_PREF + '-iframe';

let CSS_INSERTED_FLAG = false;

const DialogManager = (() => {
	/** @var Dialog[] **/
	let dialogs = [];

	return {
		register: dlg => {
			dialogs.push(dlg)
		},

		/**
		 * 激活并显示对话框
		 * @param {Dialog} dlg
		 */
		show: dlg => {
			Masker.show();
			let zIndex = Dialog.DIALOG_INIT_Z_INDEX;
			dialogs = dialogs.filter(d => {
				if(d !== dlg){
					d.active = false;
					d.dom.classList.remove(DLG_CLS_ACTIVE);
					d.dom.style.zIndex = zIndex+++'';
					return true;
				}
				return false;
			});
			dlg.active = true;
			dlg.visible = true;
			dlg.dom.style.display = '';
			dlg.dom.style.zIndex = zIndex++ + '';
			dlg.dom.classList.add(DLG_CLS_ACTIVE);
			dialogs.push(dlg);
		},

		close: (dlg, destroy = true) => {
			dialogs = dialogs.filter(d => dlg !== d);
			let nextShow = dialogs.find(d=> d.active);
			if(!nextShow){
				nextShow = dialogs.find(d => d.visible);
			}
			if(nextShow){
				DialogManager.show(nextShow);
			}else{
				Masker.hide();
			}
			if(destroy){
				dlg.dom.parentNode.removeChild(dlg.dom);
			} else {
				dlg.active = false;
				dlg.visible = false;
				dlg.dom.style.display = 'none';
			}
		},

		hide: dlg =>{
			return this.close(dlg, false);
		},

		/**
		 * 获取当前激活的对话框
		 * @returns {Dialog|null}
		 */
		getCurrentActive(){
			for(let i=dialogs.length-1; i>=0; i--){
				if(dialogs[i].active){
					return dialogs[i];
				}
			}
			return null;
		},

		closeAll: () => {
			dialogs.forEach(dlg => DialogManager.close(dlg));
			Masker.hide();
		}
	};
})();


/**
 * 构造DOM结构
 */
const domConstruct = (dlg) => {
	if(!CSS_INSERTED_FLAG){
		let stylesheet = document.createElement('style');
		stylesheet.innerHTML = `
.dialog {display:block;border:1px solid #ddd; padding:0; box-sizing:border-box;width:calc(100% - 2 * 30px); background-color:white; color:#333; z-index:10000;position:fixed;}
.dialog .dialog-ti {font-size :16px; user-select:none; padding:10px 10px 0 15px; font-weight:normal;color:#666}
.dialog .dialog-ctn {padding:15px;}
.dialog .dialog-close {--size:36px; position:absolute; overflow:hidden; cursor:pointer; right:0; top:0; width:var(--size); height:var(--size); box-sizing:border-box; line-height:var(--size); text-align:center;}
.dialog .dialog-close:after {content:"×"; font-size:24px;}
.dialog .dialog-close:hover {background-color:#eee;}
.dialog .dialog-ctn {max-height:calc(100vh - 160px); overflow-y:auto;}
.dialog .dialog-op {padding:15px; text-align:center}
.dialog .dialog-btn {margin-right:0.5em;}
.dialog .dialog-iframe {border:none; width:100%;}
.dialog.full-dialog .dialog-ctn {max-height:calc(100vh - 150px); overflow-y:auto}
.dialog.dialog-active {box-shadow:1px 1px 25px 0px #44444457; border-color:#aaa;}
.dialog.dialog-active .dialog-ti {color:#333}
`;
		document.head.appendChild(stylesheet);
		CSS_INSERTED_FLAG = true;
	}

	dlg.dom = document.createElement('div');
	dlg.dom.className = DLG_CLS_PREF;
	dlg.dom.id = dlg.config.id;
	if(dlg.config.width){
		dlg.dom.style.width = dlg.config.width + 'px';
	}

	let html = '';
	html += dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : '';
	html += dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" tabindex="0"></span>` : '';
	let style = [];
	if(dlg.config.minContentHeight !== null){
		style.push('min-height:' + dlg.config.minContentHeight + 'px');
	}
	html += `<div class="${DLG_CLS_CTN}" style="${style.join(';')}">${renderContent(dlg)}</div>`;
	if(dlg.config.buttons.length){
		html += `<div class="${DLG_CLS_OP}">`;
		dlg.config.buttons.forEach(button => {
			html += `<input type="button" class="${DLG_CLS_BTN}" ${button.default ? 'autofocus' : ''} tabindex="0" value="${escapeAttr(button.title)}">`;
		});
		html += '</div>';
	}
	dlg.dom.innerHTML = html;

	document.body.appendChild(dlg.dom);

	//update content height
	if(dlg.config.height){
		adjustHeight(dlg, dlg.config.height, dlg.config.maxHeight);
	}

	updatePosition(dlg);

	//bind iframe content
	if(!dlg.config.height && typeof (dlg.config.content) === 'object' && dlg.config.content.src){
		let iframe = dlg.dom.querySelector(`.${DLG_CLS_IFRAME}`);
		iframe.addEventListener('load', () => {
			try{
				let html = iframe.contentWindow.document.body.parentNode;
				let h = html.scrollHeight || html.clientHeight || html.offsetHeight;
				h = h + 40;
				adjustHeight(dlg, h, dlg.config.maxHeight);
			}catch(e){
				console.error('iframe load error', e);
			}
		});
	}
	dlg.dom.style.display = 'none';
};

/**
 * 事件绑定
 * @param {Dialog} dlg
 */
let _bind_esc = false;
const eventBind = (dlg) => {
	//bind buttons event
	for(let i in dlg.config.buttons){
		let cb = dlg.config.buttons[i].callback || dlg.close;
		let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} .${DLG_CLS_BTN}`)[i];
		btn.addEventListener('click', cb.bind(dlg), false);
	}

	//bind active
	dlg.dom.addEventListener('mousedown', e => {
		DialogManager.show(dlg);
	})

	//bind move
	if(dlg.config.moveAble){
		let start_move = false;
		let last_click_offset = null;
		dlg.dom.querySelector('.' + DLG_CLS_TI).addEventListener('mousedown', (e) => {
			if(e.currentTarget && domContained(dlg.dom, e.currentTarget, true)){
				start_move = true;
				last_click_offset = {x: e.clientX - dlg.dom.offsetLeft, y: e.clientY - dlg.dom.offsetTop};
			}
		});
		document.body.addEventListener('mouseup', () => {
			start_move = false;
			last_click_offset = null;
		});
		document.body.addEventListener('mousemove', (e) => {
			if(start_move && last_click_offset){
				dlg.dom.style.left = Math.max(e.clientX - last_click_offset.x, 0) + 'px';
				dlg.dom.style.top = Math.max(e.clientY - last_click_offset.y, 0) + 'px';
			}
		});
	}

	//bind top close button event
	if(dlg.config.showTopCloseButton){
		let close_btn = dlg.dom.querySelector(`.${DLG_CLS_TOP_CLOSE}`);
		buttonActiveBind(close_btn, dlg.close.bind(dlg));
	}

	//bind window resize
	if(!dlg.config.moveAble){
		window.addEventListener('resize', () => {
			updatePosition(dlg);
		});
	}

	//bind esc to close current active dialog
	if(!_bind_esc){
		_bind_esc = true;
		document.addEventListener('keyup', e => {
			if(e.keyCode === KEYS.Esc){
				let current = DialogManager.getCurrentActive();
				if(current && current.config.showTopCloseButton){
					DialogManager.close(current);
					return false;
				}
			}
		});
	}
}

/**
 *
 * @param {Dialog} dlg
 */
const updatePosition = (dlg) => {
	let [ml, mt] = keepRectCenter(dlg.dom.offsetWidth, dlg.dom.offsetHeight);
	dlg.dom.style.top = mt + 'px';
	dlg.dom.style.left = ml + 'px';
	dlg.dom.style.visibility = 'visible';

};

/**
 * 更新
 * @param {Dialog} dlg
 * @param {Number} h
 * @param {Number} max_h
 */
const adjustHeight = (dlg, h, max_h) => {
	h = px2Str(h);
	max_h = px2Str(max_h);
	let ctn = dlg.dom.querySelector(`.${DLG_CLS_CTN}`);
	ctn.style.height = h;
	ctn.style.maxHeight = max_h;

	let iframe = ctn.querySelector(`.${DLG_CLS_IFRAME}`);
	if(iframe){
		iframe.style.height = h;
	}
};

/**
 * 渲染内容区域
 * @param {Dialog} dlg
 * @returns {string}
 */
const renderContent = (dlg) => {
	if(typeof (dlg.config.content) == 'object' && dlg.config.content.src){
		return `<iframe class="${DLG_CLS_IFRAME}" src="${dlg.config.content.src}"></iframe>`;
	}
	if(typeof (dlg.config.content) == 'string'){
		return dlg.config.content;
	}
	console.error('Content type error', dlg.config.content);
	throw 'Content type error';
};

export class Dialog {
	static CONTENT_MIN_HEIGHT = 100; //最小高度
	static DEFAULT_WIDTH = 600; //默认宽度
	static DIALOG_INIT_Z_INDEX = 1000;

	id = null;
	/** @var {Element} dom **/
	dom = null;

	visible = false;
	active = false;

	config = {
		id: '',
		title: '',
		content: '',
		modal: false,
		width: Dialog.DEFAULT_WIDTH,
		height: null,
		maxHeight: `calc(100vh - ${Dialog.CONTENT_MIN_HEIGHT}px)`,
		minContentHeight: Dialog.CONTENT_MIN_HEIGHT,
		moveAble: true,
		buttons: [/** {title:'', default:true, callback }**/],
		showTopCloseButton: true,
	};

	/**
	 *
	 * @param {Object} config
	 * @param {String|Null} config.id
	 * @param {String} config.title
	 * @param {String} config.content
	 * @param {Boolean} config.modal
	 * @param {Number} config.width
	 * @param {Number} config.height
	 * @param {Number} config.maxHeight
	 * @param {Boolean} config.moveAble
	 * @param {Array} config.buttons
	 * @param {Boolean} config.buttons.default
	 * @param {String} config.buttons.title
	 * @param {Function} config.buttons.callback
	 * @param {Boolean} config.showTopCloseButton
	 */
	constructor(config = {}){
		this.config = Object.assign(this.config, config);
		this.id = this.id || 'dialog-' + Math.random();
		domConstruct(this);
		eventBind(this);
		DialogManager.register(this);
	}

	show(){
		DialogManager.show(this);
	}

	hide(){
		DialogManager.hide(this);
	}

	close(){
		DialogManager.close(this);
	}

	/**
	 * 显示对话框
	 * @param {Object} config
	 * @param {String|Null} config.id
	 * @param {String} config.title
	 * @param {String} config.content
	 * @param {Boolean} config.modal
	 * @param {Number} config.width
	 * @param {Number} config.height
	 * @param {Number} config.maxHeight
	 * @param {Boolean} config.moveAble
	 * @param {Array} config.buttons
	 * @param {Boolean} config.buttons.default
	 * @param {String} config.buttons.title
	 * @param {Function} config.buttons.callback
	 * @param {Boolean} config.showTopCloseButton
	 * @returns {Dialog}
	 */
	static show(config){
		let p = new Dialog(config);
		p.show();
		return p;
	}

	static getCurrentActiveDialog(){
		return DialogManager.getCurrentActive();
	}

	static closeAll(){
		DialogManager.closeAll(dialog => dialog.close());
	}
}