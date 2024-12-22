/**
 * 解析文件扩展名（不包含点，格式如：jpg）
 * @param {string} fileName
 * @return {string}
 */
import {findOne} from "./Dom.js";

export const resolveFileExtension = fileName => {
	if(fileName.indexOf('.') < 0){
		return '';
	}
	let segList = fileName.split('.');
	return segList[segList.length - 1];
}

/**
 * 获取文件名
 * @param {string} fileName
 * @return {string}
 */
export const resolveFileName = (fileName) => {
	fileName = fileName.replace(/.*?[/|\\]/ig, '');
	return fileName.replace(/\.[^.]*$/g, "");
};

/**
 * 检测文件类型是否匹配指定 accept
 * @param {String} fileType 文件类型（格式如：image/png）
 * @param {String} accept accept字符串，支持逗号分隔，如 image/*,image/png
 * @return {Boolean}
 */
const fileAcceptMath = (fileType, accept)=>{
	return !!(accept.replace(/\s/g, '').split(',').filter(ac=>{
		return new RegExp(ac.replace('*', '.*')).test(fileType);
	}).length);
}

/**
 * 逐行读取文件
 * @param {File} file
 * @param {Function} linePayload 参数(string) 逐行处理函数，返回 false 表示中断读取
 * @param {Function} onFinish 完成回调函数
 * @param {Function} onError 错误回调函数
 */
export const readFileInLine = (file, linePayload, onFinish = null, onError = null) => {
	const CHUNK_SIZE = 1024;
	const reader = new FileReader();

	let offset = 0;
	let line_buff = '';
	const seek = () => {
		if(offset < file.size){
			let slice = file.slice(offset, offset + CHUNK_SIZE);
			reader.readAsArrayBuffer(slice);
			offset += CHUNK_SIZE;
		}else{
			onFinish();
		}
	}
	reader.onload = evt => {
		line_buff += new TextDecoder().decode(new Uint8Array(reader.result))
		if(line_buff.indexOf("\n") >= 0){
			let break_down = false;
			let lines = line_buff.split("\n");
			line_buff = lines.pop();
			lines.find(line => {
				if(linePayload(line) === false){
					break_down = true;
					return true;
				}
			});
			if(break_down){
				return;
			}
		}
		seek();
	}
	reader.onerror = (err) => {
		console.error(err);
		onError(err);
	}
	seek();
}

/**
 * 绑定文件拖放区域
 * @param {String|Node} container 容器
 * @param {Function} fileHandler 文件处理函数，参数为：[File, path]
 * @param {String} dragOverClass 文件拖入时，容器添加class
 * @param {String} accept 指定文件过滤协议
 */
export const bindFileDrop = (container, fileHandler, dragOverClass = 'drag-over', accept = '') => {
	container = findOne(container);
	['dragenter', 'dragover'].forEach(ev => {
		container.addEventListener(ev, e => {
			dragOverClass && container.classList.add(dragOverClass);
			e.preventDefault();
			return false;
		}, false);
	});
	['dragleave', 'drop'].forEach(ev => {
		container.addEventListener(ev, e => {
			dragOverClass && container.classList.remove(dragOverClass);
			e.preventDefault();
			return false;
		}, false);
	})
	container.addEventListener('drop', async e => {
		transferItemsToFiles(e.dataTransfer.items, (file, path) => {
			if(!accept || fileAcceptMath(file.type, accept)){
				fileHandler(file, path);
			}else{
				console.debug(`文件类型：${file.type} 不符合 ${accept}，已被忽略`);
			}
		});
	}, false);
}

/**
 * 提取 e.dataTransfer.items 中的文件（忽略目录）
 * @param dataTransferItemList
 * @param fileHandler
 */
export const transferItemsToFiles = (dataTransferItemList, fileHandler) => {
	for(let i = 0; i < dataTransferItemList.length; i++){
		let entry = dataTransferItemList[i].webkitGetAsEntry();
		if(entry){
			traverseFileEntry(entry, fileHandler);
		}
	}
}

/**
 * 遍历文件入口
 * @param entry
 * @param {Function} fileHandler
 * @param {String} path relative path
 */
const traverseFileEntry = (entry, fileHandler, path = '/') => {
	if(entry.isFile){
		entry.file(file => {
			fileHandler(file, path);
		});
		return;
	}
	if(entry.isDirectory){
		path += (path === '/' ? '' : '/') + entry.name;
		entry.createReader().readEntries((entries) => {
			for(let entry of entries){
				traverseFileEntry(entry, fileHandler, path);
			}
		}, err => {
			console.error('directory read fail', err);
		});
	}
}