const FS = require('fs');
const PROCESS = require('process');
const Path = require('path');
const CWD = __dirname;
const DIST_PATH = FS.realpathSync(CWD+'/../dist');
const SRC_PATH = FS.realpathSync(CWD+'/../src');
const DIST_INDEX_FILE = DIST_PATH+'/webcom.umd.min.js';

console.log(CWD);

//copy source
console.log('Start copying files');
let files = getFilesFromDirectory(SRC_PATH);
files.forEach(file=>{
	let newFile = DIST_PATH + file.replace(SRC_PATH, '');
	copyFile(file, newFile);
});

//build index
console.log('Start build distribute entry file:'+DIST_INDEX_FILE);
let str = '';
files.forEach(file=>{
	let s = file.replace(SRC_PATH, '').replace(/\\/g, '/').replace(/^\//, '');
	let NS = s.replace(/^([^/]+)\/.*$/, '$1');
	str += `export * as ${NS} from \"./${s}\";\n`;
});
FS.writeFileSync(DIST_INDEX_FILE, str, {flag:'w+'})

/**
 * 获取文件列表
 * @param {String} dir
 * @returns {[]}
 */
function getFilesFromDirectory(dir){
	dir = FS.realpathSync(dir);
	let filesInDirectory = FS.readdirSync(dir);
	let files = [];
	filesInDirectory.forEach(file=>{
		let filePath = Path.join(dir, file);
		let stats = FS.statSync(filePath);
		if(stats.isDirectory()){
			files = files.concat(getFilesFromDirectory(filePath));
		} else {
			files.push(filePath);
		}
	});
	return files;
}

function copyFile(src, dst) {
	console.log('file copy:', src, dst);
	let readable = FS.createReadStream(src);
	let dir = dst.replace(/\\/g, '/').replace(/\/[^\/]+$/g, '');

	if(!FS.existsSync(dir)){
		FS.mkdirSync(dir);
	}
	let writable = FS.createWriteStream(dst);
	readable.pipe(writable);
}
