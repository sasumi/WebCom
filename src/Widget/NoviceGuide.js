import {Theme} from "./Theme.js";
import {createDomByHtml, getDomOffset, insertStyleSheet, show} from "../Lang/Dom.js";
import {Tip} from "./Tip.js";
import {dimension2Style} from "../Lang/String.js";

const COM_ID = Theme.Namespace + 'select';
const CLASS_PREFIX = COM_ID;

insertStyleSheet(`
	.novice-guide-counter {float:left; color:gray;} 
	.novice-guide-next-wrap {text-align:right; margin-top:10px;}
`, COM_ID);

let maskerEl, stopperEl;
const show_highlight_zone = (highlightNode) => {
	hide_highlight_zone();
	if(!maskerEl){
		maskerEl = createDomByHtml(`
			<div style="position:absolute; outline:2px solid #ffffff8a; height:40px; width:40px; box-shadow:0px 0px 0px 2000px rgba(0, 0, 0, 0.6); z-index:10000"></div>
		`, document.body);
		stopperEl = createDomByHtml(`
			<div style="width:100%; height:100%; position:absolute; left:0; top:0; z-index:10000"></div>
		`, document.body)
	}
	show(stopperEl);
	show(maskerEl);
	if(highlightNode){
		let hlnOffset = getDomOffset(highlightNode);
		maskerEl.style.left = dimension2Style(hlnOffset.left);
		maskerEl.style.top = dimension2Style(hlnOffset.top);
		maskerEl.style.width = dimension2Style(highlightNode.offsetWidth);
		maskerEl.style.height = dimension2Style(highlightNode.offsetHeight);
		return;
	}
	maskerEl.style.left = dimension2Style(document.body.offsetWidth/2);
	maskerEl.style.top = dimension2Style(300);
	maskerEl.style.width = dimension2Style(1);
	maskerEl.style.height = dimension2Style(1);
	return maskerEl;
};

const hide_highlight_zone = () => {
	stopperEl && stopperEl.hide();
	maskerEl && maskerEl.hide();
};

/**
 * @param {Object[]} steps 步骤内容
 * @param {String} steps.content 步骤内容
 * @param {HTMLElement} steps.relateNode 步骤内容
 * @param config
 */
const showNoviceGuide = (steps, config) => {
	config = Object.assign({
		next_button_text: '下一步',
		prev_button_text: '上一步',
		finish_button_text: '完成',
		top_close: true,  //是否显示顶部关闭按钮
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
		let $masker;

		//masker
		if(showing_cover){
			$masker = show_highlight_zone(null, {
				left: $('body').width() / 2,
				top: 300,
				width: 1,
				height: 1
			})
		}else{
			$masker = show_highlight_zone(step.relateNode);
		}

		let next_html = '<div class="novice-guide-next-wrap">';

		if((steps.length + 2) <= step_size.length){
			next_html += '<span class="novice-guide-prev-btn btn btn-weak btn-small">' + config.prev_button_text + '</span> ';
		}
		if(steps.length && config.next_button_text){
			next_html += '<span class="novice-guide-next-btn btn btn-small">' + config.next_button_text + '</span>';
		}
		if(!steps.length && config.finish_button_text){
			next_html += '<span class="novice-guide-finish-btn btn btn-small">' + config.finish_button_text + '</span>';
		}
		if(config.show_counter){
			next_html += '<span class="novice-guide-counter">' + (step_size.length - steps.length) + '/' + step_size.length + '</span>';
		}
		next_html += '</div>';

		let tp = new Tip(`<div class="novice-guide-content">${step.content}</div>${next_html}`, showing_cover ? $masker : step.relateNode, {
			closeBtn: config.top_close,
			dir: showing_cover ? 6 : 'auto'
		});
		tp.onHide.listen(function(){
			tp.destroy();
			hide_highlight_zone();
			config.on_finish();
		});
		tp.onShow.listen(function(){
			tp.dom.style.zIndex = "10001";
			tp.dom.querySelector('.novice-guide-next-btn,.novice-guide-finish-btn').addEventListener('click', function(){
				tp.destroy();
				show_one();
			});
			tp.dom.querySelector('.novice-guide-prev-btn').addEventListener('click', function(){
				tp.destroy();
				let len = steps.length;
				steps.unshift(step_size[step_size.length - len - 1]);
				steps.unshift(step_size[step_size.length - len - 2]);
				show_one();
			});
		});
		tp.show();
	};
	show_one();
}

export {showNoviceGuide};