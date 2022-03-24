const NS = 'WebCom';

export default {
	input: "./src/index.js",
	output: [
		{
			format: "umd",
			name: NS,
			file: "./dist/main.umd.js"
		},
		{
			format: "cjs",
			name: NS,
			file: "./dist/main.cjs.js"
		},
		{
			format: "amd",
			name: NS,
			file: "./dist/main.amd.js"
		},
		{
			format: "es",
			name: NS,
			file: "./dist/main.es.js"
		},
		{
			format: "iife",
			name: NS,
			file: "./dist/main.browser.js"
		}
	]
}