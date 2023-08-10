/**
 * array_column
 * @param arr
 * @param col_name
 * @returns {Array}
 */
export const arrayColumn = (arr, col_name) => {
	let data = [];
	for(let i in arr){
		data.push(arr[i][col_name]);
	}
	return data;
};

/**
 * @param arr
 * @param val
 * @return {string|null}
 */
export const arrayIndex = (arr, val) => {
	for(let i in arr){
		if(arr[i] === val){
			return i;
		}
	}
	return null;
};

/**
 * @param obj1
 * @param obj2
 * @return {false|this is string[]}
 */
export const isEquals = (obj1, obj2) => {
	let keys1 = Object.keys(obj1);
	let keys2 = Object.keys(obj2);
	//return true when the two json has same length and all the properties has same value key by key
	return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] === obj2[key]);
}

/**
 * 数组去重
 * @param {Array} arr
 * @returns {*}
 */
export const arrayDistinct = (arr) => {
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
export const arrayGroup = (arr, by_key, limit) => {
	if(!arr || !arr.length){
		return arr;
	}
	let tmp_rst = {};
	arr.forEach(item => {
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

/**
 * 按照对象 KEY 排序
 * @param {Object} obj
 * @return {{}}
 */
export const sortByKey = (obj) => {
	return Object.keys(obj).sort().reduce(function(result, key){
		result[key] = obj[key];
		return result;
	}, {});
}

/**
 * 数组分块
 * @param {Array} list 数据
 * @param {Number} size 每块大小
 * @return {Array[]}
 */
export const chunk = (list, size) => {
	let len = list.length;
	if(size < 1 || !len){
		return [];
	}
	if(size > len){
		return [list];
	}
	let res = [];
	let integer = Math.floor(len / size);
	let rest = len % size;
	for(let i = 1; i <= integer; i++){
		res.push(list.splice(0, size));
	}
	if(rest){
		res.push(list.splice(0, rest));
	}
	return res;
}

/**
 * @param path
 * @param value
 * @param srcObj
 * @param glue
 * @return {*}
 */
export const objectPushByPath = (path, value, srcObj = {}, glue = '.') => {
	let segments = path.split(glue),
		cursor = srcObj,
		segment,
		i;

	for(i = 0; i < segments.length - 1; ++i){
		segment = segments[i];
		cursor = cursor[segment] = cursor[segment] || {};
	}

	return cursor[segments[i]] = value;
}

/**
 * @param obj
 * @param path
 * @param glue
 * @returns {*}
 */
export const objectGetByPath = (obj, path, glue = '.') => {
	let ps = path.split(glue);
	for(let i = 0, len = ps.length; i < len; i++){
		if(obj[ps[i]] === undefined){
			return null;
		}
		obj = obj[ps[i]];
	}
	return obj;
}

/**
 * 过滤子节点，以目录树方式返回
 * @param parent_id
 * @param all_list
 * @param option
 * @param level
 * @param group_by_parents
 * @return {*[]}
 */
export const arrayFilterTree = (parent_id, all_list, option = {}, level = 0, group_by_parents = []) => {
	option = Object.assign({
		return_as_tree: false,             //以目录树返回，还是以平铺数组形式返回
		level_key: 'tree_level',      //返回数据中是否追加等级信息,如果选项为空, 则不追加等级信息
		id_key: 'id',              //主键键名
		parent_id_key: 'parent_id',       //父级键名
		children_key: 'children'         //返回子集key(如果是平铺方式返回,该选项无效
	}, option);

	let pn_k = option.parent_id_key;
	let lv_k = option.level_key;
	let id_k = option.id_key;
	let as_tree = option.return_as_tree;
	let c_k = option.children_key;

	let result = [];
	group_by_parents = group_by_parents.length ?  group_by_parents : arrayGroup(all_list, pn_k);

	all_list.forEach(item=>{
		if(item[pn_k] === parent_id){
			item[lv_k] = level;  //set level
			if(!option.return_as_tree){
				result.push(item);
			}
			if(item[id_k] !== undefined && group_by_parents[item[id_k]] !== undefined && group_by_parents[item[id_k]]){
				let subTrees = arrayFilterTree(item[id_k], all_list, option, level + 1, group_by_parents);
				if(subTrees){
					if(as_tree){
						item[c_k] = subTrees;
					}else{
						result = result.concat(...subTrees);
					}
				}
			}
			if(as_tree){
				result.push(item);
			}
		}
	})
	return result;
}