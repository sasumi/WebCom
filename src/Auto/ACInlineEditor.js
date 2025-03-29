import {bindHotKeys, bindKeyContinuous, bindNodeActive, bindNodeEvents, BizEvent} from "../Lang/Event.js";
import {createDomByHtml, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {escapeAttr, escapeHtml, unescapeHtml} from "../Lang/Html.js";
import {Theme} from "../Widget/Theme.js";
import {guid} from "../Lang/Util.js";
import {Toast} from "../Widget/Toast.js";
import {inputTypeAble} from "../Lang/Form.js";

const NS = Theme.Namespace + 'ac-inline-editor-';
const patchStyle = () => {
	insertStyleSheet(`
		.${NS}view-wrap {cursor:pointer}
		.${NS}view-wrap:hover:after {opacity:1; color:var(--color-link)}
		.${NS}view-wrap:after {content:"\\e7a0";font-family:${Theme.IconFont};transform: scale(1.2);display: inline-block;margin-left: 0.25em;opacity: 0.3;}
		
		.${NS}editor-wrap {
		    display:inline-flex;
		    align-items:center;
		    gap:0.25em;
		}
		.${NS}save-btn,
		.${NS}cancel-btn {
		    display: inline-flex;
		    border: 1px solid gray;
		    align-items: center;
		    height: var(--element-height);
		    width: var(--element-height);
		    justify-content: center;
		    border-radius: var(--panel-radius);
		    line-height: 90%;
		    box-sizing: border-box;
		    zoom: 0.92;
		    cursor: pointer;
		}
		.${NS}save-btn:before {content:"\\e624"; font-family:${Theme.IconFont}}
		.${NS}cancel-btn:before {content:"\\e61a"; font-family:${Theme.IconFont}}
	`, NS + 'style')
}

const SELECT_PLACEHOLDER_VALUE = NS + guid();

/**
 * 渲染视图
 * @param {Node} container 
 * @param {String} type 
 * @param {String} value 当值不在选项列表中时，直接渲染值
 * @param {Array} options 
 * @returns {void}
 */
const renderView = (container, type, value, options = []) => {
	let html = '';
	let title = '';
	switch (type) {
		case ACInlineEditor.TYPE_TEXT:
		case ACInlineEditor.TYPE_NUMBER:
		case ACInlineEditor.TYPE_DATE:
		case ACInlineEditor.TYPE_TIME:
		case ACInlineEditor.TYPE_DATETIME:
			html = escapeHtml(value);
			title = value;
			break;

		case ACInlineEditor.TYPE_MULTILINE_TEXT:
			title = value;
			html = escapeHtml(value).replace(/\n/g, '<br>');
			break;

		case ACInlineEditor.TYPE_OPTION_SELECT:
		case ACInlineEditor.TYPE_OPTION_RADIO:
			let opt = options.find(opt => opt.value === value);
			title = opt ? (opt?.text || '') : value;
			html = escapeHtml(opt ? (opt?.text || '') : value);
			break;

		case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
		case ACInlineEditor.TYPE_OPTION_CHECKBOX:
			let text_list = [];
			options.forEach(opt => {
				if (opt.value === value) {
					text_list.push(opt.text);
				}
			})
			title = text_list.length ? text_list.join(',') : value;
			html = escapeHtml(title);
			break;

		default:
			throw `未知的编辑器类型：${type}`;
	}
	container.title = title;
	container.innerHTML = html;
	show(container);
}

/**
 * 渲染编辑器元素
 * @param {Node} container 
 * @param {String} type 
 * @param {String} name 
 * @param {String} value 
 * @param {Array} options 
 * @param {Boolean} required 
 * @returns {Function} 返回一个函数，用于获取编辑器的值
 */
const renderElement = (container, type, name, value, options = [], required = false) => {
	//类型为<input>输入框类型映射
	const INPUT_TYPE_MAP = {
		[ACInlineEditor.TYPE_TEXT]: 'text',
		[ACInlineEditor.TYPE_NUMBER]: 'number',
		[ACInlineEditor.TYPE_DATE]: 'date',
		[ACInlineEditor.TYPE_TIME]: 'time',
		[ACInlineEditor.TYPE_DATETIME]: 'datetime-local',
	}

	//必填项提示
	const REQUIRED_MESSAGES = {
		[ACInlineEditor.TYPE_TEXT]: '此项为必填项',
		[ACInlineEditor.TYPE_NUMBER]: '此项为必填项',
		[ACInlineEditor.TYPE_DATE]: '此项为必填项',
		[ACInlineEditor.TYPE_TIME]: '此项为必填项',
		[ACInlineEditor.TYPE_DATETIME]: '此项为必填项',
		[ACInlineEditor.TYPE_MULTILINE_TEXT]: '此项为必填项',
		[ACInlineEditor.TYPE_OPTION_SELECT]: '请选择一项',
		[ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT]: '请选择一项',
		[ACInlineEditor.TYPE_OPTION_RADIO]: '请选择一项',
		[ACInlineEditor.TYPE_OPTION_CHECKBOX]: '请选择一项',
	}

	let html = '';
	switch (type) {
		case INPUT_TYPE_MAP[type]:
			html = `<input type="${INPUT_TYPE_MAP[type]}" name="${escapeAttr(name)}" value="${escapeAttr(value)}" ${required ? 'required' : ''}/>`;
			break;

		case ACInlineEditor.TYPE_MULTILINE_TEXT:
			let v = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			html = `<textarea name="${escapeAttr(name)}" ${required ? 'required' : ''}>${v}</textarea>`;
			break;

		case ACInlineEditor.TYPE_OPTION_SELECT:
			let option_html = '';
			if (!required) {
				option_html = `<option value="${SELECT_PLACEHOLDER_VALUE}">请选择</option>`;
			}
			option_html = options.map(option => `<option value="${escapeAttr(option.value)}" ${option.value == value ? 'selected' : ''}>
					${escapeHtml(option.text)}
				</option>`).join('');
			html = `<select name="${escapeAttr(name)}" ${required ? 'required' : ''}>${option_html}</select>`;
			break;

		case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
			html = `<select name="${escapeAttr(name)}" multiple ${required ? 'required' : ''}>${value.map(option => `<option value="${escapeAttr(option.value)}">${escapeHtml(option.text)}</option>`).join('')}</select>`;
			break;

		case ACInlineEditor.TYPE_OPTION_RADIO:
			html = options.map(option => `<label><input type="radio" name="${escapeAttr(name)}" value="${escapeAttr(option.value)}" ${option.value == value ? 'checked' : ''}>${escapeHtml(option.text)}</label>`).join('');
			break;

		case ACInlineEditor.TYPE_OPTION_CHECKBOX:
			html = options.map(option => `<label><input type="checkbox" name="${escapeAttr(name)}" value="${escapeAttr(option.value)}" ${value.includes(option.value) ? 'checked' : ''}>${escapeHtml(option.text)}</label>`).join('');
			break;

		default:
			throw `内联编辑器暂不支持该类型：${type}`;
	}

	const getVal = () => {
		let error = null;
		let value = null;
		let elements = container.querySelectorAll('input,textarea,select');
		switch (type) {
			case INPUT_TYPE_MAP[type]:
			case ACInlineEditor.TYPE_MULTILINE_TEXT:
			case ACInlineEditor.TYPE_OPTION_SELECT:
				value = elements[0].value;
				if (required && (!value || value === SELECT_PLACEHOLDER_VALUE)) {
					error = REQUIRED_MESSAGES[type];
					break;
				}
				break;

			case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
				if (required && !elements[0].selectedOptions.length) {
					error = REQUIRED_MESSAGES[type];
					break;
				}
				value = Array.from(elements[0].selectedOptions).map(option => option.value);
				break;

			case ACInlineEditor.TYPE_OPTION_RADIO:
				if (required && !Array.from(elements).some(el => el.checked)) {
					error = REQUIRED_MESSAGES[type];
					break;
				}
				value = Array.from(elements).find(el => el.checked).value;
				break;

			case ACInlineEditor.TYPE_OPTION_CHECKBOX:
				if (required && !Array.from(elements).some(el => el.checked)) {
					error = REQUIRED_MESSAGES[type];
					break;
				}
				value = Array.from(elements).filter(el => el.checked).map(el => el.value);
				break;

			default:
				throw `未知的编辑器类型：${type}`;
		}
		return [value, error];
	}

	createDomByHtml(html, container);
	const doms = container.querySelectorAll('input,textarea,select');
	return [getVal, doms];
}

/**
 * 对话框组件
 * 参数：
 * container[data-dialog-url] iframe对话框页面地址
 * container[data-content] 对话框内容
 * a[title] | container[text] 对话框标题
 */
export class ACInlineEditor {
	static TYPE_TEXT = 'text'; //单行文本
	static TYPE_NUMBER = 'number'; //数字
	static TYPE_DATE = 'date'; //日期
	static TYPE_TIME = 'time'; //时间
	static TYPE_DATETIME = 'datetime'; //日期时间
	static TYPE_MULTILINE_TEXT = 'multiline_text'; //多行文本
	static TYPE_OPTION_SELECT = 'select'; //select单选
	static TYPE_MULTIPLE_OPTION_SELECT = 'multiple_option'; //select多选
	static TYPE_OPTION_RADIO = 'radio'; //radio单选
	static TYPE_OPTION_CHECKBOX = 'checkbox'; //checkbox多选

	/** @var {Function} **/
	static transmitter;

	/** @var BizEvent onUpdate fire(name, value) **/
	static onUpdate = new BizEvent();

	static init(container, param) {
		const ACTION = param.action; //提交地址（可以为空，由transmitter处理）
		const METHOD = param.method; //提交方式（可以为空，由transmitter处理）
		const REQUIRED = !!param.required; //是否必填
		const NAME = param.name; //字段名
		const TYPE = param.type ? String(param.type) : this.TYPE_TEXT;

		//当前值
		let value = param.value;

		if (value == null && [
			ACInlineEditor.TYPE_TEXT,
			ACInlineEditor.TYPE_NUMBER,
			ACInlineEditor.TYPE_DATE,
			ACInlineEditor.TYPE_TIME,
			ACInlineEditor.TYPE_DATETIME
		].includes(TYPE)) {
			value = container.innerText.trim();
		}
		if (value == null && ACInlineEditor.TYPE_MULTILINE_TEXT === TYPE) {
			value = unescapeHtml(container.innerHTML.trim());
		}

		//字段选项
		let options = param.options || [
			// { value: '1', text: '选项1' },
			// { value: '2', text: '选项2' },
		];

		//初始化样式
		patchStyle();

		//创建编辑器和视图容器
		container.innerHTML = `
			<span class="${NS}editor-wrap" style="display:none" tabindex="0"></span>
			<span class="${NS}view-wrap"></span>`;

		//编辑器和视图容器
		let view_wrap = container.querySelector(`.${NS}view-wrap`);
		let editor_wrap = container.querySelector(`.${NS}editor-wrap`);

		const showView = () =>{
			hide(editor_wrap);
			renderView(view_wrap, TYPE, value, options);
		}

		/**
		 * @returns 初始化编辑器
		 */
		const showEditor = () => {
			hide(view_wrap);
			show(editor_wrap);

			if (!this.transmitter) {
				throw "ACInlineEditor.transmitter 未配置";
			}
			editor_wrap.innerHTML = '';
			createDomByHtml(`
						<span class="${NS}editor-text"></span>
						<span class="${NS}save-btn" tabindex="0"></span>
						<span class="${NS}cancel-btn" tabindex="0"></span>
					`, editor_wrap);
			const save_btn = editor_wrap.querySelector(`.${NS}save-btn`);
			const cancel_btn = editor_wrap.querySelector(`.${NS}cancel-btn`);
			const [getVal, inputList] = renderElement(editor_wrap.querySelector(`.${NS}editor-text`), TYPE, NAME, value, options, REQUIRED);
			const doSave = () => {
				let [val, error] = getVal();
				if (error) {
					Toast.error(error);
					return;
				}
				value = val;
				this.transmitter(ACTION, { [NAME]: value }, METHOD).then(() => {
					this.onUpdate.fire(NAME, value);
					showView();
				});
			}

			let firstInput = inputList[0];
			setTimeout(() => {
				firstInput.focus();
				inputTypeAble(firstInput) && firstInput.select();
			});
			if(inputTypeAble(firstInput)){
				if(firstInput.tagName !== 'TEXTAREA'){
					bindNodeEvents(inputList, 'keydown', (e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							doSave();
						}
					});
				} else {
					bindHotKeys(firstInput, 'ctrl+enter', e=>{
						e.preventDefault();
						doSave();
					});
				}
				bindKeyContinuous(firstInput, 'Escape', showView);
			}
			bindNodeActive(cancel_btn, showView);
			bindNodeActive(save_btn, doSave);
		}

		bindNodeActive(view_wrap, showEditor);
		showView();
	}
}
