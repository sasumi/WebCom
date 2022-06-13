export const resolveFileExtension = fileName => {
	let segList = fileName.split('.');
	return segList[segList.length-1];
}

export const resolveFileName = (fileName)=>{
	fileName = fileName.replace(/.*?[/|\\]/ig, '');
	return fileName.replace(/\.[^.]*$/g, "");
};
