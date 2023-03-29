const nav = {
	'index.html': 'Index',
	'dialog.html': 'Dialog',
	'imgpreview.html' : 'Image Preview',
	'toast.html' : 'Toast',
	'tip.html' : 'Tip',
	'html_cut.html' : 'Html Cut',
	'menu.html':'Menu'
}
let html = `
<link rel="stylesheet" href="test.css">
<ul class="nav">`;
for(let i in nav){
	html += `<li><a href="${i}">${nav[i]}</a></li>`;
}
html += `</ul>`;
document.write(html);