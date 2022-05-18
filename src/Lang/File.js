export const resolveFileExtension = fileName => {
	fileName = fileName.replace(/.*?[/|\\]/ig, '');
	return fileName.replace(/\.[^.]*$/g, "");
}

export const resolveFileName = (src)=>{
	let f = /\/([^/]+)$/ig.exec(src);
	if(f){
		let t = /([\w]+)/.exec(f[1]);
		if(t){
			return t[1];
		}
	}
	return null;
};
