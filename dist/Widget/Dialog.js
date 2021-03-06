import {escapeAttr, dimension2Style} from "../Lang/String.js";
import {buttonActiveBind, createDomByHtml, domContained, insertStyleSheet, keepRectCenter} from "../Lang/Dom.js";
import {Masker} from "./Masker.js";
import {KEYS} from "../Lang/Event.js";
import {BizEvent} from "../Lang/Event.js";
import {Theme} from "./Theme.js";

const DLG_CLS_PREF = Theme.Namespace+'dialog';
const DLG_CLS_ACTIVE = DLG_CLS_PREF + '-active';
const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
const DLG_CLS_OP = DLG_CLS_PREF + '-op';
const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close';
const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
const DLG_CLS_INPUT = DLG_CLS_PREF + '-input';

const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';

/**
 * Content Type
 * @type {string}
 */
const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF+'-ctn-iframe';
const DLG_CTN_TYPE_HTML = DLG_CLS_PREF+'-ctn-html';

insertStyleSheet(`
	.${DLG_CLS_PREF} {display:block;border:1px solid #ddd; padding:0; box-sizing:border-box;width:calc(100% - 2 * 30px); --head-height:36px; background-color:white; color:#333; z-index:10000;position:fixed;}
	.${DLG_CLS_PREF} .${DLG_CLS_PREF}-ti {font-size :16px; user-select:none; height:var(--head-height); box-sizing:border-box; padding:6px 10px 0 10px; font-weight:normal;color:#666}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE} {position:absolute; overflow:hidden; cursor:pointer; right:0; top:0; width:var(--head-height); height:var(--head-height); box-sizing:border-box; line-height:var(--head-height); text-align:center;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"×"; font-size:24px;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:hover {background-color:#eee;}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto; padding:10px;}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} {padding:0}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} iframe {width:100%; border:none; display:block;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:10px; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_BTN} {margin-right:0.5em;}
	.${DLG_CLS_PREF} .${DLG_CTN_TYPE_IFRAME} iframe {border:none; width:100%;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 50px); overflow-y:auto}
	.${DLG_CLS_PREF}.${DLG_CLS_ACTIVE} {box-shadow:1px 1px 25px 0px #44444457; border-color:#aaa;}
	.${DLG_CLS_PREF}.${DLG_CLS_ACTIVE} .dialog-ti {color:#333}
`, Theme.Namespace+'dialog-style');

/** @var Dialog[] **/
let dialogs = [];

let closeDlg =  (dlg, destroy = true) => {
	if(dlg.onClose.fire() === false){
		console.warn('dialog close cancel by onClose events');
		return false;
	}
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
}

/**
 * 对话框管理器
 */
export const DialogManager = {
	register(dlg){
		dialogs.push(dlg)
	},

	/**
	 * 激活并显示对话框
	 * @param {Dialog} dlg
	 */
	show(dlg){
		Masker.show();
		dlg.visible = true;
		dlg.dom.style.display = '';
		dialogs.push(dlg);
		DialogManager.switchToTop(dlg);
		dlg.onShow.fire();
	},

	/**
	 * 激活对话框
	 * @param {Dialog} dlg
	 */
	switchToTop(dlg){
		let zIndex = Dialog.DIALOG_INIT_Z_INDEX;
		dialogs = dialogs.filter(d => {
			if(d !== dlg){
				d.active = false;
				d.dom.classList.remove(DLG_CLS_ACTIVE);
				d.dom.style.zIndex = zIndex++ + '';
				return true;
			}
			return false;
		});
		dlg.active = true;
		dlg.dom.style.zIndex = zIndex++ + '';
		dlg.dom.classList.add(DLG_CLS_ACTIVE);
	},

	/**
	 * 关闭对话框
	 */
	close: closeDlg,

	/**
	 * 隐藏对话框
	 * @param dlg
	 * @returns {boolean}
	 */
	hide(dlg){
		return closeDlg(dlg, false);
	},

	/**
	 * 获取当前激活的对话框
	 * @returns {Dialog|null}
	 */
	getCurrentActive(){
		for(let i = dialogs.length - 1; i >= 0; i--){
			if(dialogs[i].active){
				return dialogs[i];
			}
		}
		return null;
	},

	/**
	 * 关闭全部对话框
	 */
	closeAll(){
		dialogs.forEach(dlg => DialogManager.close(dlg));
		Masker.hide();
	},

	/**
	 * 根据ID查找对话框
	 * @param id
	 * @returns {Dialog}
	 */
	findById(id){
		return dialogs.find(dlg => {return dlg.id === id});
	}
};

window['DialogManager'] = DialogManager;

const resolveContentType = (content)=>{
	if(typeof (content) === 'object' && content.src){
		return DLG_CTN_TYPE_IFRAME;
	}
	return DLG_CTN_TYPE_HTML;
}

/**
 * 构造DOM结构
 */
const domConstruct = (dlg) => {
	let html = `
		<div class="${DLG_CLS_PREF}" id="${dlg.config.id}" style="${dlg.config.width?'width:'+dlg.config.width+'px':''}">
		${dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : ''}
		${dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_CLOSE}" tabindex="0"></span>` : ''}
	`;

	let style = [];
	if(dlg.config.minContentHeight !== null){
		style.push('min-height:' + dimension2Style(dlg.config.minContentHeight));
	}
	html += `<div class="${DLG_CLS_CTN} ${resolveContentType(dlg.config.content)}" style="${style.join(';')}">${renderContent(dlg)}</div>`;
	if(dlg.config.buttons.length){
		html += `<div class="${DLG_CLS_OP}">`;
		dlg.config.buttons.forEach(button => {
			html += `<input type="button" class="${DLG_CLS_BTN}" ${button.default ? 'autofocus' : ''} tabindex="0" value="${escapeAttr(button.title)}">`;
		});
		html += '</div>';
	}
	html += '</div>';
	dlg.dom = createDomByHtml(html, document.body);

	//update content height
	if(dlg.config.height){
		adjustHeight(dlg, dlg.config.height, dlg.config.maxHeight);
	}

	updatePosition(dlg);

	//bind iframe content
	if(!dlg.config.height && resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
		let iframe = dlg.dom.querySelector('iframe');
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
		DialogManager.switchToTop(dlg);
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
	let ctn = dlg.dom.querySelector(`.${DLG_CLS_CTN}`);
	ctn.style.height = dimension2Style(h);
	ctn.style.maxHeight = dimension2Style(max_h);
	if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
		let iframe = dlg.dom.querySelector('iframe');
		iframe.style.height = dimension2Style(h);
	}
};

/**
 * 渲染内容区域
 * @param {Dialog} dlg
 * @returns {string}
 */
const renderContent = (dlg) => {
	switch(resolveContentType(dlg.config.content)){
		case DLG_CTN_TYPE_IFRAME:
			return `<iframe src="${dlg.config.content.src}" ${IFRAME_ID_ATTR_FLAG}="1"></iframe>`;

		case DLG_CTN_TYPE_HTML:
			return dlg.config.content;

		default:
			console.error('Content type error', dlg.config.content);
			throw 'Content type error';
	}
};

export class Dialog {
	static CONTENT_MIN_HEIGHT = 100; //最小高度
	static DEFAULT_WIDTH = 600; //默认宽度
	static DIALOG_INIT_Z_INDEX = 1000;

	id = null;

	/** @var {HTMLElement} dom **/
	dom = null;

	visible = false;
	active = false;

	onClose = new BizEvent(true);
	onShow = new BizEvent(true);

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
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} config
	 * @param {String|Null} config.id
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
	static show(title, content, config){
		let p = new Dialog({title, content, ...config});
		p.show();
		return p;
	}

	/**
	 * 确认框
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} opt
	 * @returns {Promise<unknown>}
	 */
	static confirm(title, content, opt={}){
		return new Promise((resolve, reject) => {
			let p = new Dialog({
				title,
				content,
				buttons: [
					{title: '确定', default: true, callback:()=>{p.close();resolve();}},
					{title: '取消', callback:()=>{p.close(); reject && reject()}}
				],
				showTopCloseButton: false,
				...opt
			});
			p.show();
		});
	}

	/**
	 * 提示框
	 * @param {String} title
	 * @param {String} content
	 * @param {Object} opt
	 * @returns {Promise<unknown>}
	 */
	static alert(title, content, opt={}){
		return new Promise(((resolve) => {
			let p = new Dialog({
				title,
				content,
				buttons: [
					{title: '确定', default: true, callback:()=>{p.close(); resolve();}},
				],
				showTopCloseButton: false,
				...opt
			});
			p.show();

		}));
	}

	/**
	 * 输入提示框
	 * @param {String} title
	 * @param {Object} option
	 * @returns {Promise<unknown>}
	 */
	static prompt(title, option={}){
		return new Promise((resolve, reject) => {
			let p = new Dialog({
				title:'请输入',
				content:`<div style="padding:0 10px;">
							<p style="padding-bottom:0.5em;">${title}</p>
							<input type="text" style="width:100%" class="${DLG_CLS_INPUT}" value="${escapeAttr(option.initValue || '')}"/>
						</div>`,
				buttons: [
					{
						title: '确定', default: true, callback: () => {
							let input = p.dom.querySelector('input');
							if(resolve(input.value) === false){
								return;
							}
							p.close();
						}
					},
					{title: '取消'}
				],
				showTopCloseButton: true,
				...option
			});
			p.onClose.listen(reject);
			p.onShow.listen(()=>{
				let input = p.dom.querySelector('input');
				input.focus();
				input.addEventListener('keydown', e=>{
					if(e.keyCode === KEYS.Enter){
						if(resolve(input.value) === false){
							return false;
						}
						p.close();
					}
				})
			})
			p.show();
		});
	}

	/**
	 * 获取当前激活的对话框
	 * @returns {Dialog|null}
	 */
	static getCurrentActiveDialog(){
		return DialogManager.getCurrentActive();
	}

	/**
	 * 获取当前页面（iframe）所在的对话框
	 * @returns {Dialog|null}
	 */
	static getCurrentFrameDialog(){
		if(!window.parent || !window.frameElement){
			console.warn('No in iframe');
			return null;
		}

		if(!parent.DialogManager){
			throw "No dialog manager found.";
		}

		let id = window.frameElement.getAttribute(IFRAME_ID_ATTR_FLAG);
		if(!id){
			throw "ID no found in iframe element";
		}
		return parent.DialogManager.findById(id);
	}

	/**
	 * 关闭全部对话框
	 */
	static closeAll(){
		DialogManager.closeAll(dialog => dialog.close());
	}
}
