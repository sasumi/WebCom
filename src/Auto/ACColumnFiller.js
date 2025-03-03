import {findAll, findOne, nodeIndex} from "../Lang/Dom.js";
import {getAvailableElements} from "../Lang/Form.js";
import {ACBatchFiller} from "./ACBatchFiller.js";

const findParentTBody = (node) => {
	let tbody = node.closest('tbody') || findOne('tbody', node.closest('table')) || node.closest('table');
	if(!tbody){
		throw "no table body found";
	}
	return tbody;
}

/**
 * 计算当前节点所在的列序号
 * @param node
 * @return {number}
 */
const nodeInColumnIndex = (node) => {
	let column_index = 0;
	if(node.closest('th')){
		column_index = nodeIndex(node.closest('th'));
	}else if(node.closest('td')){
		column_index = nodeIndex(node.closest('td'));
	}else{
		throw "column index no detected";
	}
	return column_index;
}

/**
 * 批量填充功能
 */
export class ACColumnFiller {
	static active(node, param, event){
		const tbody = findParentTBody(node);
		let column_idx = nodeInColumnIndex(node);
		let relative_elements = [];
		findAll('tr>td, tr>th', tbody).forEach(cell => {
			if(nodeIndex(cell) === column_idx){
				relative_elements.push(getAvailableElements(cell, true)[0]);
			}
		});
		param.relative_elements = relative_elements;
		return ACBatchFiller.active(node, param);
	}
}
