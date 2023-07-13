const nav = {
	'index.html': 'Index',
	'ac.html': 'AC',
	'dialog.html': 'Dialog',
	'imgpreview.html' : 'Image Preview',
	'toast.html' : 'Toast',
	'tip.html' : 'Tip',
	'fullscreen.html': 'fullscreen',
	'html_cut.html' : 'Html Cut',
	'menu.html':'Menu',
	'novice_guide.html':'Novice Guide',
	'select.html':'select'
}
let html = `
<link rel="stylesheet" href="assets/style.css">
<ul class="nav">`;
for(let i in nav){
	html += `<li><a href="${i}">${nav[i]}</a></li>`;
}
html += `</ul>`;
document.write(html);