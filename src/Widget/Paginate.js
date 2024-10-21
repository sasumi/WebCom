import {createDomByHtml} from "../Lang/Dom.js";
import {eventDelegate} from "../Lang/Event.js";

/**
 * 渲染分页器
 * @param {Object} paginate
 * @param {Number} paginate.item_total
 * @param {Number} paginate.page_size
 * @param {Number} paginate.current_page
 * @param {Function} onChange
 * @return {ChildNode | NodeListOf<ChildNode>}
 */
export const renderPaginate = (paginate, onChange) => {
	const NUM_OFFSET = 4;

	let item_total = paginate.item_total;
	let page_size = paginate.page_size;
	let page = paginate.current_page;
	let page_total = Math.ceil(item_total / page_size);

	const PAGINATE_DOM = createDomByHtml(`<div class="paginate paginate-total-${page_total}"></div>`);
	const render = (page) => {
		let html = ``, i;
		if(page > 1){
			html += `<span class="paginate-prev link" title="上一页" data-page="${page - 1}"></span>`;
		}else{
			html += `<span class="paginate-prev" title="上一页"></span>`;
		}

		//前置部分
		if(page - NUM_OFFSET > 1){
			html += `<span class="paginate-dot"></span>`;
		}
		for(i = Math.min(NUM_OFFSET, page - 1); i > 0; i--){
			html += `<span class="paginate-num link" title="第${page - i}页" data-page="${page - i}">${page - i}</span>`;
		}
		html += `<span class="paginate-num paginate-current">${page}</span>`;

		//后置部分
		for(i = page + 1; i <= Math.min(page_total, page + NUM_OFFSET); i++){
			html += `<span class="paginate-num link" title="第${i}页" data-page="${i}">${i}</span>`;
		}
		if(page + NUM_OFFSET < page_total){
			html += `<span class="paginate-dot"></span>`;
		}

		if(page < page_total){
			html += `<span class="paginate-next link" title="下一页" data-page="${page + 1}"></span>`;
		}else{
			html += `<span class="paginate-next"></span>`;
		}

		html += `<span class="paginate-total-info">共 ${page_total} 页</span>`;
		html += `<span class="paginate-size-changer">每页 ${page_size} 条</span>`;
		PAGINATE_DOM.innerHTML = html;
	}
	eventDelegate(PAGINATE_DOM, '[data-page]', 'click', e => {
		render(parseInt(e.target.dataset.page));
		onChange(parseInt(e.target.dataset.page));
	});
	render(page);
	return PAGINATE_DOM;
}
