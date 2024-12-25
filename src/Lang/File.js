/**
 * 解析文件扩展名（不包含点，格式如：jpg）
 * @param {string} fileName
 * @return {string}
 */
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
 * 检测文件mime是否匹配定义的accept字符串
 * @param {String} fileMime 文件类型（格式如：image/png）
 * @param {String} acceptStr accept字符串，支持逗号分隔，如 image/*,image/png
 * @return {Boolean}
 */
export const fileAcceptMath = (fileMime, acceptStr)=>{
	return !!(acceptStr.replace(/\s/g, '').split(',').filter(ac=>{
		return new RegExp(ac.replace('*', '.*')).test(fileMime);
	}).length);
};

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
 * 图片对象转换成文件对象
 * @param {Image} img
 * @param {Object} fileAttr 额外文件属性
 * @return {Promise<File>}
 */
export const imgToFile = (img, fileAttr = {}) => {
	const name = fileAttr.name || img.alt || 'image';
	return new Promise(resolve => {
		fetch(img.src).then(res => res.blob()).then(blob => {
			resolve(blobToFile(blob, {name, lastModified: fileAttr.lastModified}));
		})
	})
}

/**
 * 文件对象转换成Image对象
 * @param {File} file
 * @return {Promise<Image>}
 */
export const fileToImg = (file) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			if(file.name){
				img.alt = file.name;
			}
			resolve(img);
			URL.revokeObjectURL(file);
		}
	});
}

/**
 * 转换blob为文件对象
 * @param {Blob} blob
 * @param {Object} fileAttr 文件属性信息(如name,lastModified)
 * @return {File}
 */
export const blobToFile = (blob, fileAttr = {}) => {
	fileAttr = Object.assign({
		name: 'file',
		lastModified: Date.now()
	}, fileAttr)
	return new File([blob], fileAttr.name, {
		lastModified: fileAttr.lastModified,
		type: fileAttr.type || blob.type
	});
}