import {fileAcceptMath} from "../Lang/File.js";
import {findOne} from "../Lang/Dom.js";

/**
 * 绑定指定容器，使其支持文件（目录拖放）
 * @param {String|Node} container 容器内如果有 input[type=file]，其onChange事件同时绑定，同时读取 input[type=file]{accept} 属性对文件列表进行过滤
 * @param {Object} Option
 * @param {Function} Option.onFile 单个文件处理回调（参数为文件）
 * @param {Function} Option.onFinish 所有文件处理回调（如果是拖动目录，需要等待目录所有文件读取完毕）参数为文件列表，此处文件包含fullPath目录信息
 * @param {Function} Option.onInput 开始处理文件
 * @param {String} Option.dragOverClass 拖入时类名
 * @param {String} Option.accept 额外限制文件类型
 */
export const bindFileDrop = (container, Option = {}) => {
	Option = Object.assign({
		onFinish: (files)=>{},
		onInput: ()=>{},
		onFile: (file)=>{},
		dragOverClass: 'drag-over',
		accept: ''
	}, Option);

	let accept = Option.accept;

	container = findOne(container);
	const fileInput = findOne('input[type=file]', container);
	const processFile = file => {
		if(!accept || fileAcceptMath(file.type, accept)){
			Option.onFile(file);
			return true;
		}
		console.debug(`文件 ${file.fullPath} 类型：${file.type} 不符合 ${accept}，已被忽略`);
		return false;
	}
	if(fileInput){
		if(fileInput.accept){
			accept += (accept ? ',' : '') + fileInput.accept;
		}
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
			console.log('entry_count', entries, entry_count);
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