/**
 * array_column
 * @param arr
 * @param col_name
 * @returns {Array}
 */
export const arrayColumn = (arr, col_name)=>{
	let data = [];
	for(let i in arr){
		data.push(arr[i][col_name]);
	}
	return data;
};

export const arrayIndex = (arr, val)=>{
	for(let i in arr){
		if(arr[i] === val){
			return i;
		}
	}
	return null;
};

/**
 * 数组去重
 * @param {Array} arr
 * @returns {*}
 */
export const arrayDistinct = (arr)=>{
	let tmpMap = new Map();
	return arr.filter(item => {
		if(!tmpMap.has(item)){
			tmpMap.set(item, true);
			return true;
		}
	});
}

/**
 * array group
 * @param arr
 * @param by_key
 * @param limit limit one child
 * @returns {*}
 */
export const arrayGroup = (arr, by_key, limit)=>{
	if(!arr || !arr.length){
		return arr;
	}
	let tmp_rst = {};
	arr.forEach(item=>{
		let k = item[by_key];
		if(!tmp_rst[k]){
			tmp_rst[k] = [];
		}
		tmp_rst[k].push(item);
	});
	if(!limit){
		return tmp_rst;
	}
	let rst = [];
	for(let i in tmp_rst){
		rst[i] = tmp_rst[i][0];
	}
	return rst;
};
