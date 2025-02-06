const resolveFN = (f) => {
	let name = f.replace(/.+\/([^\/]+)$/, '$1').replace(/\.html$/i, '');
	let ns= name.split('_');
	let name_str = '';
	ns.forEach(n=>{
		name_str += n[0].toUpperCase() + n.slice(1) + ' ';
	});
	return name_str;
}

const nav = [
	'index.html',
	'auto_component.html',
	'copy.html',
	'daterange.html',
	'inlineeditor.html',
	'confirm.html',
	'hotkey.html',
	'console.html',
	'dialog.html',
	'fullscreen.html',
	'html_cut.html',
	'img_preview.html',
	'menu.html',
	'multiselect.html',
	'net.html',
	'novice_guide.html',
	'select.html',
	'select_all.html',
	'sortable.html',
	'theme.html',
	'tip.html',
	'text_count.html',
	'toast.html',
	'emoji.html',
	'form.html',
	'toc.html',
	'upload.html',
	'batchfiller.html'
]
let html = `
<link rel="stylesheet" href="assets/origincss-default.css">
<link rel="stylesheet" href="assets/style.css">
<script type="module">
    import {ACComponent} from "../src/index.js";
    ACComponent.watch();
</script>
<h1 class="title">${resolveFN(location.href)}</h1>
<ul class="nav">`;

nav.sort().forEach(file => {
	html += `<li><a href="${file}">${resolveFN(file)}</a></li>`;
})
html += `</ul>`;
document.write(html);