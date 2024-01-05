/**
 * 解析文件扩展名（不包含点，格式如：jpg）
 * @param {string} fileName
 * @return {string}
 */
export const resolveFileExtension = fileName => {
	if(fileName.indexOf('.')<0){
		return '';
	}
	let segList = fileName.split('.');
	return segList[segList.length-1];
}

/**
 * 获取文件名
 * @param {string} fileName
 * @return {string}
 */
export const resolveFileName = (fileName)=>{
	fileName = fileName.replace(/.*?[/|\\]/ig, '');
	return fileName.replace(/\.[^.]*$/g, "");
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
		} else {
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