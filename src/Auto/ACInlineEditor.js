import {bindNodeActive, BizEvent, KEYBOARD_KEY_MAP} from "../Lang/Event.js";
import {createDomByHtml, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {escapeAttr, escapeHtml} from "../Lang/Html.js";
import {Theme} from "../Widget/Theme.js";

const NS = Theme.Namespace + 'ac-ie-';

let _patch_flag = false;
const patchCss = ()=>{
	if(_patch_flag){
		return;
	}
	_patch_flag = true;

	insertStyleSheet(`
		.${NS}editor {cursor:pointer}
		.${NS}editor:hover:after {opacity:1; color:var(--color-link)}
		.${NS}editor:after {content:"\\e7a0";font-family:${Theme.IconFont};transform: scale(1.2);display: inline-block;margin-left: 0.25em;opacity: 0.5;}
		
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
		
		.${NS}save-btn[disabled],
		.${NS}cancel-btn[disabled] {opacity:0.4; pointer-events:none;}
		.${NS}save-btn:before {content:"\\e624"; font-family:${Theme.IconFont}}
		.${NS}cancel-btn:before {content:"\\e61a"; font-family:${Theme.IconFont}}
	`, NS+'style')
}

/**
 * 对话框组件
 * 参数：
 * node[data-dialog-url] iframe对话框页面地址
 * node[data-content] 对话框内容
 * a[title] | node[text] 对话框标题
 */
export class ACInlineEditor {
	/** @var {Function} **/
	static transmitter;

	/** @var BizEvent onUpdate fire(name, new_text, node) **/
	static onUpdate = new BizEvent();

	static init(node, params){
		if(!ACInlineEditor.transmitter){
			throw "ACInlineEditor.transmitter 未配置";
		}
		patchCss();
		node.tabIndex = 0;
		let name = params.name;
		let multiple = params.multiple === '1';
		let text = node.innerText.trim();
		let required = !!params.required;
		let action = params.action;
		let method = params.method ? params.method.toLocaleUpperCase() : 'get';

		//从上级表单中读取action和method
		if(!action){
			let form = node.closest('form');
			if(!form){
				throw "QKEditor required action or in form context";
			}
			action = form.action;
			method = method || form.method.toLocaleUpperCase();
		}

		node.classList.add(NS+'editor');
		let input_wrap;
		let input_el;

		let switchState = (edit) => {
			if(edit){
				if(!input_wrap){
					input_wrap = createDomByHtml(`
						<span class="${NS}editor-wrap">
							${multiple ? `<textarea name="${escapeAttr(name)}" ${required ? 'required' : ''}>${escapeHtml(text)}</textarea>` :
						`<input type="text" name="${escapeAttr(name)}}" value="${escapeAttr(text)}" ${required ? 'required' : ''}/>`}
							<span disabled class="${NS}save-btn" tabindex="0"></span>
							<span class="${NS}cancel-btn" tabindex="0"></span>
						</span>
					`);
					node.parentNode.insertBefore(input_wrap, node);
					let save_btn = input_wrap.querySelector(`.${NS}save-btn`);
					let cancel_btn = input_wrap.querySelector(`.${NS}cancel-btn`);
					input_el = input_wrap.querySelector('input,textarea');

					const doSave = ()=>{
						let new_text = input_el.value;
						let data = {};
						data[name] = new_text;
						ACInlineEditor.transmitter(action, data, method).then(()=>{
							node.innerText = new_text;
							text = new_text;
							switchState(false);
							ACInlineEditor.onUpdate.fire(name, new_text, node);
						});
					}

					input_el.addEventListener('input', ()=>{
						let disabled = input_el.value.trim() === text;
						if(disabled){
							save_btn.setAttribute('disabled', 'disabled');
						} else {
							save_btn.removeAttribute('disabled');
						}
					});
					input_el.addEventListener('keydown', e=>{
						if(!multiple && e.key === KEYBOARD_KEY_MAP.Enter){
							if(input_el.value.trim() !== text){
								doSave();
							} else {
								switchState(false);
							}
							e.preventDefault();
							return false;
						}
						if(e.key === KEYBOARD_KEY_MAP.Escape){
							if(input_el.value.trim() === text){
								switchState(false);
								e.preventDefault();
								return false;
							}
						}
					});

					bindNodeActive(cancel_btn, () => {switchState(false);});
					bindNodeActive(save_btn,doSave);
					input_el.focus();
				}
				input_el.focus();
				input_el.value = text;
			}
			edit ? show(input_wrap) : hide(input_wrap);
			edit ? hide(node) : show(node);
		}

		node.addEventListener('click', () => {
			switchState(true);
		});
		node.addEventListener('keyup', e => {
			if(e.key === KEYBOARD_KEY_MAP.Enter){
				switchState(true);
			}
		})
	}
}
