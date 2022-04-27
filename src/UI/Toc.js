import {guid} from "../Lang/Util.js";
import {createDomByHtml} from "../Lang/Dom.js";

let CLS = 'com-toc';
let CLS_ACTIVE = 'active';

let resolve_level = function($h){
	return parseInt($h[0].tagName.replace(/\D/, ''), 10);
};

let scroll_top = function(){
	return $(window).scrollTop() || $('body').scrollTop();
}

let scroll_to = function($node){
	// $('html').stop().animate({scrollTop: $node.offset().top - 10});
};

class Toc {
	constructor({parentNode}){
	}

	static resolveDom($dom){
		let tree = [
			//{id, title, parentId, relateNode}
			//{id, title, parentId, relateNode}
			//{id, title, parentId, relateNode}
		];

		

	}
}

export const toc = ($content)=>{
	let html = '<ul class="' + CLS + '">';
	let hs = 'h1,h2,h3,h4,h5';

	//top
	let top_id = 'toc' + guid();
	html += '<a href="#' + top_id + '" class="com-toc-top">本页目录</a>';
	createDomByHtml(`<a name="${top_id}"></a>`, document.body);

	let max_level = 5;
	let last_lvl = 0;
	let start_lvl = 0;
	$content.find(hs).each(function(){
		let $h = $(this);
		let id = 'toc' + guid();
		$('<a name="' + id + '"></a>').insertBefore($h);
		let lv = resolve_level($h);
		if(!start_lvl){
			start_lvl = lv;
		}
		if(!last_lvl){
			html += '<li><a href="#' + id + '">' + $h.text() + '</a>';
		}else if(lv === last_lvl){
			html += '</li><li><a href="#' + id + '">' + $h.text() + '</a>';
		}else if(lv > last_lvl){
			html += '<ul><li><a href="#' + id + '">' + $h.text() + '</a>';
		}else if(lv < last_lvl){
			html += '</li></ul></li>';
			html += '<li><a href="#' + id + '">' + $h.text() + '</a>';
		}
		last_lvl = lv;
	});
	for(let i = 0; i <= (last_lvl - start_lvl); i++){
		html += '</li></ul>';
	}

	let $toc = $(html).appendTo('body');
	$toc.find('a').click(function(){
		let $a = $(this);
		let id = $a.attr('href').replace('#', '');
		let $anchor = $('a[name=' + id + ']');
		scroll_to($anchor);
		location.hash = '#' + id;
		return false;
	});

	//init
	let hash = location.hash.replace('#', '');
	if(hash){
		let $anchor = $('body').find('a[name=' + hash + ']');
		if($anchor.size()){
			scroll_to($anchor);
		}
	}

	let upd = function(){
		let top = Math.max($content.offset().top, scroll_top());
		$toc.css({
			left: $content.offset().left + $content.outerWidth(),
			top: top
		});
		$toc.find('li').removeClass(CLS_ACTIVE);
		$toc.find('a').each(function(){
			let $a = $(this);
			let id = $a.attr('href').replace('#', '');
			let $anchor = $('a[name=' + id + ']');
			if($anchor.offset().top > scroll_top()){
				$a.parents('li').addClass(CLS_ACTIVE);
				return false;
			}
		})
	};
	$(window).resize(upd).scroll(upd);
	upd();
};