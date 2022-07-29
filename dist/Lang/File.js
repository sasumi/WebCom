/**
 * 解析文件扩展名
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
