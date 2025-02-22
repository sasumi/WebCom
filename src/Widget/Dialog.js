import {
	bindIframeAutoResize,
	createDomByHtml,
	findOne,
	getContextWindow,
	insertStyleSheet,
	remove
} from "../Lang/Dom.js";
import {bindNodeActive, BizEvent, KEYBOARD_KEY_MAP} from "../Lang/Event.js";
import {Theme} from "./Theme.js";
import {guid} from "../Lang/Util.js";
import {dimension2Style, escapeAttr} from "../Lang/Html.js";

const COM_ID = Theme.Namespace + 'dialog';
const DLG_CLS_PREF = COM_ID;
const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
const DLG_CLS_OP = DLG_CLS_PREF + '-op';
const DLG_CLS_TOP_BUTTON_ZONE = DLG_CLS_PREF + '-top-button-zone';
const DLG_CLS_TOP_BUTTON = DLG_CLS_PREF + '-top-btn';
const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close-btn';
const DLG_CLS_TOP_SCREEN_TOGGLE = DLG_CLS_PREF + '-screen-toggle-btn';

const ARIA_LABEL_CONFIRM = 'Confirm';
const ARIA_LABEL_CLOSE = 'Close';

export const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
export const DLG_CLS_WEAK_BTN = DLG_CLS_PREF + '-weak-btn';

const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';

const STATE_ACTIVE = 'active'; //激活状态。如果是存在模态对话框，只允许唯一一个激活，如果没有模态对话框情况，允许多个同时激活
const STATE_DISABLED = 'disabled'; //禁用状态。存在模态框情况下，全局只允许唯一一个激活，其余均为禁用状态
const STATE_HIDDEN = 'hidden'; //隐藏状态。通过主动调用hide方法使得对话框隐藏

const DIALOG_TYPE_ATTR_KEY = 'data-dialog-type';
const TYPE_NORMAL = 'normal';
const TYPE_PROMPT = 'prompt';
const TYPE_CONFIRM = 'confirm'; //提示对话框（包含【告警】【确认】）

/**
 * Content Type
 * @type {string}
 */
const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF + '-ctn-iframe';
const DLG_CTN_TYPE_HTML = DLG_CLS_PREF + '-ctn-html';

const STYLE_STR = `
	.${DLG_CLS_PREF} {border:none; margin:auto !important; padding:0 !important; /** 原生浏览器有1em内边距 **/ border-radius:var(${Theme.CssVar.PANEL_RADIUS}); overflow:auto; min-width:1em; box-sizing:border-box; background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); color:var(${Theme.CssVar.COLOR});}
	.${DLG_CLS_PREF} {position:fixed;inset-block-start: 0px;inset-block-end: 0px;}
	.${DLG_CLS_PREF}:focus {outline:none}
	.${DLG_CLS_PREF}[data-transparent] {background-color:transparent !important; box-shadow:none !important}
	.${DLG_CLS_PREF} .${DLG_CLS_TI} {box-sizing:border-box; line-height:1; padding:0.75em 2.5em 0.75em 0.75em; font-weight:normal;color:var(${Theme.CssVar.CSS_LIGHTEN})}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON_ZONE} {position:absolute; right:0; top:0; display:flex; gap:0.5em; }
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON} {display:flex; align-items:center; justify-content: center; line-height:1; width:2.25em; height:2.5em; overflow:hidden; opacity:0.6; cursor:pointer; box-sizing:border-box}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON}:after {content:""; font-size:0.9em; font-family:${Theme.IconFont}; line-height:1; display:block;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON}:hover {opacity:1;}
	
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"\\e61a"}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_SCREEN_TOGGLE}:after {content:"\\e629"; font-size:1.4em;}
	 
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto; max-height:calc(100vh - 5em)}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}:focus {outline:none !important;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:.75em; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} [role="button"]:first-child {margin-left:0;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} [role="button"] {margin-left:0.5em;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 100px); overflow-y:auto}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] {box-shadow:1px 1px 60px 1px #44444457}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] .${DLG_CLS_TI} {color:#333}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"]:before {content:""; left:0; top:0; position:absolute; width:100%; height:100%;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"] * {opacity:0.85 !important; user-select:none;}
	
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_CTN} {padding:1.5em 1.5em 1em 1.5em; min-height:40px; word-wrap:break-word}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_PREF}-confirm-ti {font-size:1.2em; margin-bottom:.75em;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} {padding:2em 2em 1em 2em}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} label {font-size:1.1em; margin-bottom:.75em; display:block;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} input[type=text] {width:100%; box-sizing:border-box;}
	
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe {padding:0 !important; max-height:inherit}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe iframe {width:100%; display:block; border:none; min-height:30px; max-height:calc(100vh - 5em)}
	.${DLG_CLS_PREF}::backdrop {backdrop-filter:brightness(0.65)}
`;

let _bind_esc_ = false
/**
 * 绑定ESC按键事件关闭最上一层可关闭的对话框
 * 该事件仅绑定一次
 */
const bindGlobalEsc = () => {
	if(_bind_esc_){
		return;
	}
	_bind_esc_ = true;
	document.addEventListener('keydown', e => {
		if(e.key === KEYBOARD_KEY_MAP.Escape){
			let current = DialogManager.getFrontDialog();
			if(current && current.config.showTopCloseButton){
				DialogManager.close(current);
				e.stopImmediatePropagation();
			}
		}
	});
}

/** @var Dialog[] **/
let DIALOG_COLLECTION = [];

/**
 * 对话框层级比较函数（层级高的排上面）
 * @param {Dialog} dialog1
 * @param {Dialog} dialog2
 * @return {number}
 */
const sortZIndex = (dialog1, dialog2) => {
	return dialog1.zIndex - dialog2.zIndex;
}

/**
 * 获取非隐藏的模态对话框列表
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {Dialog[]}
 */
const getModalDialogs = (excludedDialog = null) => {
	let list = DIALOG_COLLECTION.filter(d => {
		return d.state !== STATE_HIDDEN && d.config.modal && (!excludedDialog || d !== excludedDialog);
	});
	return list.sort(sortZIndex);
};

/**
 * 获取非隐藏的普通对话框列表
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {Dialog[]}
 */
const getNoModalDialogs = (excludedDialog = null) => {
	let list = DIALOG_COLLECTION.filter(d => {
		return d.state !== STATE_HIDDEN && !d.config.modal && (!excludedDialog || d !== excludedDialog);
	});
	return list.sort(sortZIndex);
};

/**
 * 获取所有非隐藏对话框
 * 顺序由底到上排列
 * @param {Dialog|null} excludedDialog 排除在外的对话框
 * @return {*[]}
 */
const getAllAvailableDialogs = (excludedDialog = null) => {
	let modalDialogs = getModalDialogs(excludedDialog);
	let noModalDialogs = getNoModalDialogs(excludedDialog);
	return noModalDialogs.concat(modalDialogs);
}

/**
 * 设置对话框状态
 * @param {Dialog} dlg
 * @param {String} toState
 */
const setState = (dlg, toState) => {
	dlg.state = toState;
	dlg.dom.setAttribute('data-dialog-state', toState);
	dlg.dom[toState === STATE_HIDDEN ? 'hide' : (dlg.config.modal ? 'showModal' : 'show')]();
}

/**
 * 设置对话框zIndex
 * @param {Dialog} dlg
 * @param {Number|String} zIndex
 */
const setZIndex = (dlg, zIndex) => {
	dlg.zIndex = dlg.dom.style.zIndex = String(zIndex);
}

const setType = (dlg, type) => {
	dlg.dom.setAttribute('data-dialog-type', type);
}

const resolveContentType = (content) => {
	if(typeof (content) === 'object' && content.src){
		return DLG_CTN_TYPE_IFRAME;
	}
	return DLG_CTN_TYPE_HTML;
}

/**
 * 构造DOM结构
 * @param {Dialog} dlg
 */
const domConstruct = (dlg) => {
	let html = `
		<dialog 
			class="${DLG_CLS_PREF} ${dlg.config.cssClass || ''}" 
			id="${dlg.id}" 
			data-dialog-type="${TYPE_NORMAL}"
			${dlg.config.transparent ? 'data-transparent' : ''}
			${dlg.state === STATE_HIDDEN ? '' : 'open'} 
			style="${dlg.config.width ? 'width:' + dimension2Style(dlg.config.width) : ''}">
		${dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : ''}
	`;
	html += `<div class="${DLG_CLS_CTN} ${resolveContentType(dlg.config.content)}" 
			style="min-height: ${dimension2Style(Dialog.CONTENT_MIN_HEIGHT)}; ${dlg.config.height ? 'height:' + dimension2Style(dlg.config.height) + ';' : ''}" 
			tabindex="0">${renderContent(dlg)}</div>`;
	if(dlg.config.buttons.length){
		html += `<div class="${DLG_CLS_OP}">`;
		dlg.config.buttons.forEach(button => { //autofocus 在部分浏览器场景可能会失效，这里采用js主动切换
			if(!button.callback && !button.ariaLabel){
				button.ariaLabel = 'Close';
			}
			html += `<input type="button" class="${button.className || ''}" 
				${button.default ? 'autofocus' : ''} 
				tabindex="0" 
				role="button"
				${button.ariaLabel ? 'aria-label="' + button.ariaLabel + '"' : ''}
				value="${escapeAttr(button.title)}">`;
		});
		html += '</div>';
	}
	html += `<div class="${DLG_CLS_TOP_BUTTON_ZONE}">` +
		(dlg.config.showTopFullscreenToggleButton ? `<span class="${DLG_CLS_TOP_BUTTON} ${DLG_CLS_TOP_SCREEN_TOGGLE}" title="切换全屏" tabindex="0"></span>` : '') +
		(dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_BUTTON} ${DLG_CLS_TOP_CLOSE}" title="关闭" tabindex="0"></span>` : '') +
		'</div>';

	html += `</dialog>`;
	dlg.dom = createDomByHtml(html, document.body);

	//bind iframe content
	if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
		let iframe = dlg.dom.querySelector('iframe');
		//如果设定高度，iframe调整为100%
		if(dlg.config.height){
			iframe.style.height = '100%';
		}else{
			bindIframeAutoResize(iframe);
		}

		//bind window.unload event
		dlg.onClose.listen(() => {
			//避免跨域，try
			try{
				let win = iframe.contentWindow;
				if(win.getWindowUnloadAlertList){
					let alert_list = win.getWindowUnloadAlertList(iframe);
					if(alert_list.length){
						let unload_alert = alert_list.join("\n");
						//兼容使用原生弹窗效果
						if(!window.confirm(unload_alert)){
							return false;
						}
						win.setWindowUnloadMessage('', iframe);
						return true;
					}
				}
			}catch(err){
				console.warn(err);
			}
		})
	}
};

/**
 * 事件绑定
 * @param {Dialog} dlg
 */
const eventBind = (dlg) => {
	//bind dialog active
	dlg.dom.addEventListener('mousedown', () => {
		dlg.state === STATE_ACTIVE && DialogManager.trySetFront(dlg);
	});

	//阻止原生modal对话框，ESC关闭对话框
	dlg.dom.addEventListener('cancel', e => {
		e.preventDefault();
	});

	//bind buttons event
	for(let i in dlg.config.buttons){
		let cb = dlg.config.buttons[i].callback || dlg.close;
		let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} [role="button"]`)[i];
		btn.addEventListener('click', cb.bind(dlg), false);
	}

	//bind top close button event
	if(dlg.config.showTopCloseButton){
		let close_btn = dlg.dom.querySelector(`.${DLG_CLS_TOP_CLOSE}`);
		bindNodeActive(close_btn, dlg.close.bind(dlg));
		bindGlobalEsc();
	}
}

/**
 * 渲染内容区域
 * @param {Dialog} dlg
 * @returns {string}
 */
const renderContent = (dlg) => {
	switch(resolveContentType(dlg.config.content)){
		case DLG_CTN_TYPE_IFRAME:
			return `<iframe src="${dlg.config.content.src}" ${IFRAME_ID_ATTR_FLAG}="${dlg.id}"></iframe>`;

		case DLG_CTN_TYPE_HTML:
			return dlg.config.content;

		default:
			console.error('Content type error', dlg.config.content);
			throw 'Content type error';
	}
};

/**
 * 获取当前页面（iframe）所在的对话框
 * @returns {Promise}
 */
export const getCurrentFrameDialog = () => {
	return new Promise((resolve, reject) => {
		if(!window.parent || !window.frameElement){
			reject('no in iframe');
			return;
		}
		if(!parent[COM_ID].DialogManager){
			reject('No dialog manager found.');
			return;
		}
		let id = window.frameElement.getAttribute(IFRAME_ID_ATTR_FLAG);
		if(!id){
			reject("ID no found in iframe element");
		}
		let dlg = parent[COM_ID].DialogManager.findById(id);
		if(dlg){
			resolve(dlg);
		}else{
			reject('no dlg find:' + id);
		}
	});
}

/**
 * 对话框管理器
 */
const DialogManager = {
	register(dlg){
		DIALOG_COLLECTION.push(dlg)
	},

	/**
	 * 激活并显示对话框
	 * @param {Dialog} dlg
	 */
	show(dlg){
		dlg.state = STATE_DISABLED; //避免 getModal* 获取不到当前对话框

		let modalDialogs = getModalDialogs(dlg);
		let noModalDialogs = getNoModalDialogs(dlg);
		if(dlg.config.modal){
			noModalDialogs.forEach(d => {
				setState(d, STATE_DISABLED);
			});
			modalDialogs.forEach(d => {
				setState(d, STATE_DISABLED);
			});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + modalDialogs.length);
			setState(dlg, STATE_ACTIVE);
		}else{
			modalDialogs.forEach((d, idx) => {
				setZIndex(d, dlg.zIndex + idx + 1);
			});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length);
			setState(dlg, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
		}
		dlg.onShow.fire();
	},

	/**
	 * 关闭对话框
	 * @param {Dialog} dlg
	 * @param {Boolean} destroy 是否摧毁
	 */
	close: (dlg, destroy = true) => {
		if(dlg.onClose.fire() === false){
			console.warn('dialog close cancel by onClose events');
			return false;
		}
		let modalDialogs = getModalDialogs(dlg);
		let noModalDialogs = getNoModalDialogs(dlg);
		modalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + idx);
		});
		//active last modal dialog
		if(modalDialogs.length){
			setState(modalDialogs[modalDialogs.length - 1], STATE_ACTIVE);
		}
		noModalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
			setState(d, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
		});
		if(destroy){
			DIALOG_COLLECTION = DIALOG_COLLECTION.filter(d => d !== dlg);
			remove(dlg.dom);
		}else{
			setState(dlg, STATE_HIDDEN);
		}
		getAllAvailableDialogs().length || dlg.dom.classList.remove(`${DLG_CLS_PREF}-masker`);
	},

	/**
	 * 隐藏对话框
	 * @param dlg
	 * @returns {boolean}
	 */
	hide(dlg){
		return this.close(dlg, false);
	},

	/**
	 * 获取当前激活的对话框
	 * @returns {Dialog|null}
	 */
	getFrontDialog(){
		let dialogs = getAllAvailableDialogs();
		return dialogs[dialogs.length - 1];
	},

	/**
	 * 尝试设置指定窗口前置
	 * @param {Dialog} dlg
	 * @return {boolean}
	 */
	trySetFront(dlg){
		let modalDialogs = getModalDialogs();
		let currentFrontDialog = this.getFrontDialog();

		if(currentFrontDialog === dlg){
			return true;
		}

		//模态模式下，不允许通过该方法切换对话框，
		//只有在对话框 show、hide的情况下自动调整层级
		if(modalDialogs.length){
			return false;
		}

		let otherNoModalDialogs = getNoModalDialogs(dlg);
		otherNoModalDialogs.forEach((d, idx) => {
			setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
		});
		setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + otherNoModalDialogs.length);
	},

	/**
	 * 关闭全部对话框
	 */
	closeAll(){
		DIALOG_COLLECTION.forEach(dlg => {
			remove(dlg.dom);
		});
		DIALOG_COLLECTION = [];
	},

	/**
	 * 根据ID查找对话框
	 * @param id
	 * @returns {Dialog}
	 */
	findById(id){
		return DIALOG_COLLECTION.find(dlg => {
			return dlg.id === id
		});
	}
};

const CUSTOM_EVENT_BUCKS = {
	/** id: {event: []} **/
};

class Dialog {
	static CONTENT_MIN_HEIGHT = 30; //最小高度
	static DEFAULT_WIDTH = 500; //默认宽度
	static DIALOG_INIT_Z_INDEX = Theme.DialogIndex;

	//对话框ID，缺省为自动生成
	id = null;

	/** @var {HTMLElement} dom **/
	dom = null;

	state = STATE_HIDDEN;
	zIndex = Theme.DialogIndex;

	onClose = new BizEvent(true);
	onShow = new BizEvent(true);

	config = {
		title: '', //对话框标题，为 null 或者空字符串时不显示标题行
		content: '',
		cssClass: '', //额外css类名
		modal: true, //是否为模态窗口
		transparent: false, //是否透明
		width: Dialog.DEFAULT_WIDTH,
		height: null, //高度，缺省为自动高度
		buttons: [/** {title:'', default:true, callback, ariaLabel }**/], //对话框配置按钮列表
		showTopCloseButton: true, //是否显示顶部关闭窗口
		showTopFullscreenToggleButton: false, //是否显示顶部切换全屏按钮
	};

	/**
	 * @param {Object} config
	 * @param {String|Null} config.id 为对话框指定ID
	 * @param {String} config.title 对话框标题
	 * @param {String} config.content 对话框内容，允许提交 {src:"http://"} 格式，渲染为iframe
	 * @param {String} config.cssClass 对话框额外添加样式类名
	 * @param {Boolean} config.modal 是否为模态对话框
	 * @param {Boolean} config.transparent 是否透明
	 * @param {Number} config.width 宽度
	 * @param {Number} config.height 高度（指内容区高度，不包含标题栏）
	 * @param {Array} config.buttons 按钮列表
	 * @param {Boolean} config.buttons.default 单个按钮对象中是否作为默认按钮（默认聚焦）
	 * @param {String} config.buttons.title 按钮标题
	 * @param {String} config.buttons.ariaLabel 按钮无障碍标题，确认按钮：ARIA_LABEL_CONFIRM, 关闭按钮：ARIA_LABEL_CLOSE
	 * @param {Function} config.buttons.callback 按钮点击后回调，缺省为关闭对话框
	 * @param {Boolean} config.showTopCloseButton 是否显示对话框右上角关闭按钮，如果显示按钮则支持ESC关闭对话框
	 */
	constructor(config = {}){
		insertStyleSheet(STYLE_STR, COM_ID + '-style');
		this.config = Object.assign(this.config, config);
		this.id = this.id || 'dialog-' + Math.random();
		domConstruct(this);
		eventBind(this);
		DialogManager.register(this);
	}

	setWidth(width){
		this.config.width = width;
		this.dom.style.width = dimension2Style(width);
	}

	setTitle(title){
		this.config.title = title;
		findOne('.' + DLG_CLS_TI, this.dom).innerText = title;
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
	 * 触发自定义事件
	 * @param {String} event
	 * @param {*} args
	 * @return {boolean} 是否存在自定义事件
	 */
	fireCustomEvent(event, ...args){
		if(CUSTOM_EVENT_BUCKS[this.id] && CUSTOM_EVENT_BUCKS[this.id][event]){
			CUSTOM_EVENT_BUCKS[this.id][event].fire(...args);
			return true;
		}
		return false;
	}

	/**
	 * 监听自定义事件
	 * @param {String} event
	 * @param {Function} callback
	 */
	listenCustomEvent(event, callback){
		if(CUSTOM_EVENT_BUCKS[this.id] === undefined){
			CUSTOM_EVENT_BUCKS[this.id] = {};
		}
		if(CUSTOM_EVENT_BUCKS[this.id][event] === undefined){
			CUSTOM_EVENT_BUCKS[this.id][event] = new BizEvent();
		}
		CUSTOM_EVENT_BUCKS[this.id][event].listen(callback);
	}

	/**
	 * 显示对话框
	 * @param {String} title
	 * @param {Object|String} content
	 * @param {Object} config
	 * @param {String|Null} config.id
	 * @param {Boolean} config.modal
	 * @param {Boolean} config.transparent
	 * @param {Number} config.width
	 * @param {Number} config.height
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
	static confirm(title, content, opt = {}){
		return new Promise((resolve, reject) => {
			let p = new Dialog({
				content: `<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
				buttons: [
					{
						title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
							p.close();
							resolve();
						}
					},
					{
						title: '取消', ariaLabel: ARIA_LABEL_CLOSE, callback: () => {
							p.close();
							reject && reject()
						}
					}
				],
				width: 420,
				modal: true,
				showTopCloseButton: false,
				...opt
			});
			setType(p, TYPE_CONFIRM);
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
	static alert(title, content, opt = {}){
		return new Promise(resolve => {
			let p = new Dialog({
				content: `<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
				buttons: [{
					title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
						p.close();
						resolve();
					}
				},],
				width: 420,
				modal: true,
				showTopCloseButton: false,
				...opt
			});
			setType(p, TYPE_CONFIRM);
			p.show();
		});
	}

	/**
	 * 显示 iframe 类型对话框
	 * @param title
	 * @param iframeSrc
	 * @param opt
	 * @returns {Dialog}
	 */
	static iframe(title = null, iframeSrc, opt = {}){
		return Dialog.show(title, {src: iframeSrc}, opt);
	}

	/**
	 * 输入提示框
	 * @param {String} title
	 * @param {Object} option
	 * @param {String} option.initValue
	 * @returns {Promise<unknown>}
	 */
	static prompt(title, option = {initValue: ""}){
		return new Promise((resolve, reject) => {
			let input_id = guid(Theme.Namespace + '-prompt-input');
			let input = null;
			let p = new Dialog({
				content: `<label for="${input_id}">${title}</label><input type="text" id="${input_id}" value="${escapeAttr(option.initValue || '')}"/>`,
				buttons: [
					{
						title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
							if(resolve(input.value) === false){
								return false;
							}
							p.close();
						}
					},
					{title: '取消', ariaLabel: ARIA_LABEL_CLOSE}
				],
				width: 400,
				modal: true,
				showTopCloseButton: true,
				...option
			});
			input = p.dom.querySelector('input[type=text]');
			setType(p, TYPE_PROMPT);
			p.onClose.listen(reject);
			p.onShow.listen(() => {
				input.focus();
				input.addEventListener('keydown', e => {
					if(e.key === KEYBOARD_KEY_MAP.Enter){
						if(resolve(input.value) === false){
							return false;
						}
						p.close();
					}
				});
			})
			p.show();
		});
	}
}

/**
 * 类方法透穿到顶部窗口，避免出现窗口中窗口交互形式
 */
if(!window[COM_ID]){
	window[COM_ID] = {};
}

window[COM_ID].Dialog = Dialog;
window[COM_ID].DialogManager = DialogManager;

let CONTEXT_WINDOW = getContextWindow();
let DialogClass = CONTEXT_WINDOW[COM_ID].Dialog || Dialog;
let DialogManagerClass = CONTEXT_WINDOW[COM_ID].DialogManager || DialogManager;

export {DialogClass as Dialog, DialogManagerClass as DialogManager};