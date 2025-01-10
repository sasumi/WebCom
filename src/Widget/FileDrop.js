import {fileAcceptMath} from "../Lang/File.js";
import {findOne} from "../Lang/Dom.js";
import {Toast} from "./Toast.js";

/**
 * 绑定指定容器，使其支持文件（目录拖放）
 * @param {String|Node} container 容器内如果有 input[type=file]，其onChange事件同时绑定，同时读取 input[type=file]{accept} 属性对文件列表进行过滤
 * @param {Object} Option
 * @param {Function} Option.onInput 用户出发输入，包括文件拖入、文件选择完成
 * @param {Function} Option.onFile 单个文件处理回调（参数为文件，返回Boolean），返回false将过略掉该文件
 * @param {Function} Option.onFinish 所有文件处理回调（如果是拖动目录，需要等待目录所有文件读取完毕）参数为文件列表，此处文件包含fullPath目录信息
 * @param {Function} Option.onError 错误信息回调（多个文件可能会触发多次错误），缺省为显示到Toast上
 * @param {String} Option.dragOverClass 拖入时类名
 * @param {String} Option.accept 额外限制文件类型
 */
export const bindFileDrop = (container, Option = {}) => {
	Option = Object.assign({
		onInput: () => {
		},
		onFile: (file) => {
			return true;
		},
		onFinish: (files) => {
		},
		onError: (err, file = null) => {
			Toast.showError(err);
		},
		dragOverClass: 'drag-over',
		accept: ''
	}, Option);

	container = findOne(container);
	const fileInput = findOne('input[type=file]', container);

	//获取accept设置
	let accept = Option.accept;
	if(fileInput && fileInput.accept){
		accept += (accept ? ',' : '') + fileInput.accept;
	}

	const processFile = file => {
		if(accept && !fileAcceptMath(file.type, accept)){
			console.warn('request accept:', accept, file);
			Option.onError(`文件 <b>${file.name}</b> 不符合，已被忽略。`, file);
			return false;
		}
		return !!Option.onFile(file);
	}
	if(fileInput){
		fileInput.addEventListener('change', e => {
			Option.onInput();
			let fs = [];
			Array.from(e.target.files).forEach(file => {
				file.fullPath = '/' + file.name;
				processFile(file) && fs.push(file);
			});
			fileInput.value = '';
			Option.onFinish(fs);
		});
	}
	['dragenter', 'dragover'].forEach(ev => {
		container.addEventListener(ev, e => {
			Option.dragOverClass && container.classList.add(Option.dragOverClass);
			e.preventDefault();
			return false;
		}, false);
	});
	['dragleave', 'drop'].forEach(ev => {
		container.addEventListener(ev, e => {
			Option.dragOverClass && container.classList.remove(Option.dragOverClass);
			e.preventDefault();
			return false;
		}, false);
	});
	container.addEventListener('drop', event => {
		event.preventDefault();
		Option.onInput();
		let items = event.dataTransfer.items;
		let total_item_length = items.length; //预先读取，后面items长度会变为空
		let files = [];
		let find_cnt = 0;
		for(let i = 0; i < items.length; i++){
			let item = items[i].webkitGetAsEntry();
			if(item){
				traverseFileTree(item, file => {
					processFile(file) && files.push(file);
				}, () => {
					find_cnt++;
					if(find_cnt === total_item_length){
						Option.onFinish(files);
					}
				});
			}
		}
	}, false);
};

/**
 * 文件遍历（注意，totalCallback是通过文件计数法实现的）
 * @param item
 * @param {Function} itemCallback
 * @param {Function} totalCallback
 * @param {String} path
 */
const traverseFileTree = (item, itemCallback, totalCallback, path = '/') => {
	if(item.isFile){
		item.file(function(file){
			file.fullPath = path + file.name;
			itemCallback(file);
			totalCallback();
		});
	}else if(item.isDirectory){
		let dirReader = item.createReader();
		dirReader.readEntries(function(entries){
			let fin_count = 0;
			let entry_count = entries.length;
			if(!entry_count){
				totalCallback();
				return;
			}
			for(let i = 0; i < entry_count; i++){
				traverseFileTree(entries[i], itemCallback, () => {
					fin_count++;
					if(fin_count === entry_count){
						totalCallback();
					}
				}, path + item.name + "/");
			}
		});
	}else{
		console.warn('err', item);
		totalCallback();
	}
}