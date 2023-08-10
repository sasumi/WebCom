import cleanupPlugin from "rollup-plugin-cleanup";
import gzipPlugin from "rollup-plugin-gzip";

const NS = 'WebCom';

export default {
	input: "./src/index.js",
	output: [
		{
			format: "umd",
			name: NS,
			file: "./dist/webcom.umd.js"
		},
		{
			format: "cjs",
			name: NS,
			file: "./dist/webcom.cjs.js"
		},
		{
			format: "amd",
			name: NS,
			file: "./dist/webcom.amd.js"
		},
		{
			format: "es",
			file: "./dist/webcom.es.js"
		},
		{
			format: "iife",
			name: NS,
			file: "./dist/webcom.browser.js"
		}
	],
	plugins: [
		cleanupPlugin({comments: "none", sourcemap:true, extensions: ["js", "ts"]})
	]
}