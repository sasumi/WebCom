import {Theme} from "./Theme.js";
import {createDomByHtml, getDomOffset, hide, insertStyleSheet, show} from "../Lang/Dom.js";
import {Tip} from "./Tip.js";
import {dimension2Style} from "../Lang/Html.js";

const COM_ID = Theme.Namespace + 'novice-guide';
const CLASS_PREFIX = COM_ID;
const PADDING_SIZE = '5px';

insertStyleSheet(`
	.${CLASS_PREFIX}-highlight {
		position:absolute; 
		z-index:10000;
		--novice-guide-highlight-padding:${PADDING_SIZE}; 
		box-shadow:0 0 10px 2000px #00000057; 
		border-radius:var(${Theme.CssVar.PANEL_RADIUS}); 
		padding:var(--novice-guide-highlight-padding); 
		margin:calc(var(--novice-guide-highlight-padding) * -1) 0 0 calc(var(--novice-guide-highlight-padding) * -1); 
	}
	.${CLASS_PREFIX}-btn {user-select:none; cursor:pointer;}
	.${CLASS_PREFIX}-masker {width:100%; height:100%; position:absolute; left:0; top:0; z-index:10000}
	.${CLASS_PREFIX}-counter {float:left; color:${Theme.CssVar.COLOR}; opacity:0.7} 
	.${CLASS_PREFIX}-next-wrap {text-align:right; margin-top:10px;}
`, COM_ID);

let highlightHelperEl, //开窗效果
	maskerEl; //阻隔层，防止点击到下部页面
const show_highlight_zone = (highlightNode) => {
	hide_highlight_zone();
	if(!highlightHelperEl){
		highlightHelperEl = createDomByHtml(`<div class="${CLASS_PREFIX}-highlight"></div>`, document.body);
		maskerEl = createDomByHtml(`<div class="${CLASS_PREFIX}-masker"></div>`, document.body)
	}
	show(maskerEl);
	show(highlightHelperEl);
	if(highlightNode){
		let hlnOffset = getDomOffset(highlightNode);
		highlightHelperEl.style.left = dimension2Style(hlnOffset.left);
		highlightHelperEl.style.top = dimension2Style(hlnOffset.top);
		highlightHelperEl.style.width = dimension2Style(highlightNode.offsetWidth);
		highlightHelperEl.style.height = dimension2Style(highlightNode.offsetHeight);
		return;
	}
	highlightHelperEl.style.left = dimension2Style(document.body.offsetWidth/2);
	highlightHelperEl.style.top = dimension2Style(300);
	highlightHelperEl.style.width = dimension2Style(1);
	highlightHelperEl.style.height = dimension2Style(1);
	return highlightHelperEl;
};

const hide_highlight_zone = () => {
	maskerEl && hide(maskerEl);
	highlightHelperEl && hide(highlightHelperEl);
};

/**
 * @param {Object[]} steps 步骤内容
 * @param {String} steps.content 步骤内容
 * @param {HTMLElement} steps.relateNode 步骤内容
 * @param config
 */
const showNoviceGuide = (steps, config = {}) => {
	config = Object.assign({
		next_button_text: '下一步',
		prev_button_text: '上一步',
		finish_button_text: '完成',
		top_close: false,  //是否显示顶部关闭按钮
		cover_included: false, //提供的步骤里面是否包含封面步骤
		show_counter: false, //是否显示计数器
		on_finish: function(){
		} //完成显示后的回调(包含顶部关闭操作)
	}, config);

	let step_size = steps.length;
	let show_one = function(){
		if(!steps.length){
			hide_highlight_zone();
			config.on_finish();
			return;
		}

		let step = steps[0];
		steps.shift();

		let showing_cover = config.cover_included && step_size === (steps.length + 1);
		let highlightHelperEl;

		//masker
		if(showing_cover){
			highlightHelperEl = show_highlight_zone(null, {
				left: document.body.offsetWidth / 2,
				top: 300,
				width: 1,
				height: 1
			})
		}else{
			highlightHelperEl = show_highlight_zone(step.relateNode);
		}

		let next_html = `<div class="${CLASS_PREFIX}-next-wrap">`;

		if((steps.length + 2) <= step_size.length){
			next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-prev-btn ">${config.prev_button_text}</span> `;
		}
		if(steps.length && config.next_button_text){
			next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-next-btn">${config.next_button_text}</span>`;
		}
		if(!steps.length && config.finish_button_text){
			next_html += `<span class="${CLASS_PREFIX}-btn ${CLASS_PREFIX}-finish-btn">${config.finish_button_text}</span>`;
		}
		if(config.show_counter){
			next_html += `<span class="${CLASS_PREFIX}-counter">${step_size.length - steps.length}/${step_size.length}</span>`;
		}
		next_html += `</div>`;

		let tp = new Tip(`<div class="${CLASS_PREFIX}-content">${step.content}</div>${next_html}`, showing_cover ? highlightHelperEl : step.relateNode, {
			showCloseButton: config.top_close,
			dir: showing_cover ? 6 : 'auto'
		});
		tp.onHide.listen(function(){
			tp.destroy();
			hide_highlight_zone();
			config.on_finish();
		});
		tp.onShow.listen(function(){
			tp.dom.style.zIndex = "10001";
			tp.dom.querySelector(`.${CLASS_PREFIX}-next-btn,.${CLASS_PREFIX}-finish-btn`).addEventListener('click', function(){
				tp.destroy();
				show_one();
			});
			let prevBtn = tp.dom.querySelector(`.${CLASS_PREFIX}-prev-btn`);
			if(prevBtn){
				prevBtn.addEventListener('click', function(){
					tp.destroy();
					let len = steps.length;
					steps.unshift(step_size[step_size.length - len - 1]);
					steps.unshift(step_size[step_size.length - len - 2]);
					show_one();
				});
			}
		});
		tp.show();
	};
	show_one();
}
export {showNoviceGuide};