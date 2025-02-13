import {fileAcceptMath} from "../Lang/File.js";
import {findOne} from "../Lang/Dom.js";
import {Toast} from "./Toast.js";

/**
 * 绑定指定容器，使其支持文件（目录拖放），建议使用 label>input:file 结构，同时支持点击选择文件
 * 如果容器内部有 inpu[type=file]，同时支持文件选择。
 * 容器支持直接粘贴文件
 * @param {String|Node} container 容器内如果有 input[type=file]，其onChange事件同时绑定，同时读取 input[type=file]{accept} 属性对文件列表进行过滤
 * @param {Object} Option
 * @param {Function} Option.onTrigger 用户触发输入，包括文件拖入、文件选择完成
 * @param {Function} Option.onFile 单个文件处理回调（参数为文件，返回Boolean），返回false将过略掉该文件
 * @param {Function} Option.onFinish 所有文件处理回调（如果是拖动目录，需要等待目录所有文件读取完毕）参数为文件列表，此处文件包含fullPath目录信息
 * @param {Function} Option.onError 错误信息回调（多个文件可能会触发多次错误），缺省为显示到Toast上
 * @param {String} Option.dragOverClass 拖入时类名
 * @param {String} Option.accept 额外限制文件类型
 */
export const bindFileDrop = (container, Option = {}) => {
	Option = Object.assign({
		onTrigger: () => {
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

	/**
	 * 处理 event.transferData.files
	 * @param files
	 */
	const handleTransferFiles = (files) => {
		let fs = [];
		Array.from(files).forEach(file => {
			file.fullPath = '/' + file.name;
			processFile(file) && fs.push(file);
		});
		Option.onFinish(fs);
	}

	/**
	 * 处理event.transferData.items
	 * @param transferItems
	 */
	const handleTransferItems = (transferItems) => {
		let total_item_length = 0;
		Array.from(transferItems).forEach(item => {
			total_item_length += item.kind === 'file';
		});
		//预先读取，后面items长度会变为空
		let files = [];
		let find_cnt = 0;
		for(let i = 0; i < transferItems.length; i++){
			if(transferItems[i].kind !== 'file'){
				console.warn('item is not file', transferItems[i]);
				continue;
			}
			let item = transferItems[i].webkitGetAsEntry();
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
			//其他应用容器里面的文件对象
			else{
				find_cnt++;
				let file = transferItems[i].getAsFile();
				if(file && processFile(file)){
					file.fullPath = '/' + file.name;
					files.push(file);
				}
				if(find_cnt === total_item_length){
					Option.onFinish(files);
				}
			}
		}
	}

	if(fileInput){
		fileInput.addEventListener('change', e => {
			Option.onTrigger();
			handleTransferFiles(e.target.files);
			fileInput.value = '';
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
	if(!container.getAttribute('tabindex')){
		container.setAttribute('tabindex', 0);
	}
	container.addEventListener('paste', e => {
		let transferItems = Array.from(e.clipboardData.items);
		if(!transferItems.length){
			return;
		}
		handleTransferItems(transferItems);
	})

	container.addEventListener('drop', event => {
		event.preventDefault();
		Option.onTrigger();
		handleTransferItems(event.dataTransfer.items);
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
		return;
	}
	if(item.isDirectory){
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
		return;
	}
	console.warn('err', item);
	totalCallback();
}