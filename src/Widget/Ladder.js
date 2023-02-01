let last_active_ladder = null;
let ladder_scrolling = false;

export const Ladder = (ladder, opt)=>{
	opt = Object.assign({
		onAfterScrollTo: function($ladder_node, aim){},
		onBeforeScrollTo: function(aim){},
		ladderActiveClass: 'ladder-active',
		dataTag: 'href',
		animateTime: 400,
		addHistory: true,
		bindScroll: true,
		scrollContainer: 'body',
		preventDefaultEvent: true
	}, opt || {});

	let $selector = $(ladder).find('['+opt.dataTag+']');

	/**
	 * scroll to aim
	 * @param aim
	 * @param {Node} ladder_node
	 */
	let scroll_to = function(aim, ladder_node){
		let $n = (!$(aim).size() && aim === '#top') ? $('body') : $(aim);
		if(!$n.size() || false === opt.onBeforeScrollTo(aim)){
			return;
		}
		let pos = $n.offset().top;
		if(opt.ladderActiveClass){
			if(last_active_ladder){
				last_active_ladder.removeClass(opt.ladderActiveClass);
			}
			ladder_node.addClass(opt.ladderActiveClass);
			last_active_ladder = ladder_node;
		}
		ladder_scrolling = true;

		$(opt.scrollContainer).animate({scrollTop: pos}, opt.animateTime, function(){
			//fix JQuery animate complete but trigger window scroll event once still(no reason found yet)
			setTimeout(function(){
				if(opt.addHistory){
					if(window.history && window.history.pushState){
						history.pushState(null, null, aim);
					} else {
						location.hash = aim;
					}
				}
				ladder_scrolling = false;
				opt.onAfterScrollTo(ladder_node, aim);
			}, 50);
		});
	};

	//bind ladder node click
	$selector.click(function(){
		let $node = $(this);
		let aim = $node.attr(opt.dataTag);
		if(aim !== '#top' && !$(aim).size()){
			return;
		}

		if(!/^#\w+$/i.test(aim)){
			console.error('ladder pattern check fail: '+aim);
			return;
		}
		scroll_to(aim, $node);
		if(opt.preventDefaultEvent){
			return false;
		}
	});

	//init state from location hash information
	if(opt.addHistory){
		$(function(){
			$selector.each(function(){
				let aim = $(this).attr(opt.dataTag);
				let m = location.href.match(new RegExp(aim+'(&|#|$|=)'));
				if(m){
					//match anchor link node
					if($(aim).size() && $(aim)[0].tagName == 'A'){
						console.debug('ladder hit a:'+aim);
						return;
					}
					scroll_to(aim, $(this));
					return false;
				}
			});
		});
	}

	//bind scroll event
	if(opt.bindScroll){
		$(opt.scrollContainer === 'body' ? window : opt.scrollContainer).scroll(function(){
			let t = $(window).scrollTop();
			if(!ladder_scrolling){
				let $hit_node = null;
				let $hit_ladder_node = null;
				let hit_aim = '';
				$selector.each(function(){
					let $ladder_node = $(this);
					let aim = $ladder_node.attr(opt.dataTag);
					let $aim = $(aim);
					if($aim.size()){
						if(t >= $aim.offset().top){
							$hit_node = $aim;
							$hit_ladder_node = $ladder_node;
							hit_aim = aim;
						}
					}
				});

				if($hit_node){
					//make class
					if(opt.ladderActiveClass){
						if(last_active_ladder){
							last_active_ladder.removeClass(opt.ladderActiveClass);
						}
						$hit_ladder_node.addClass(opt.ladderActiveClass);
						last_active_ladder = $hit_ladder_node;
					}
					//trigger after scroll to
					opt.onAfterScrollTo($hit_ladder_node, hit_aim);
				}
			}
		}).trigger('scroll');
	}
};