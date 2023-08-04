const nav = [
	'ac.html',
	'dialog.html',
	'fullscreen.html',
	'html_cut.html',
	'imgpreview.html',
	'menu.html',
	'net.html',
	'novice_guide.html',
	'select.html',
	'theme.html',
	'tip.html',
	'toast.html',
	'form.html',
	'toc.html'
]
let html = `
<link rel="stylesheet" href="assets/style.css">
<ul class="nav">`;
nav.forEach(file=>{
	html += `<li><a href="${file}">${file.replace(/\.html$/i, '')}</a></li>`;
})
html += `</ul>`;
document.write(html);