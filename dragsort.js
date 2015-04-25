/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-25 15:27:46
 * @version $Id$
 */

(function($, $doc){
	$.fn.dragsort = function (options){
		if (options == 'destroy') {
			$(this.selector).children().trigger("destroy");

			if (options && options.onDestroy && $.isFunction(options.onDestroy)){
				options.onDestroy();
			}
			return this;
		}
		var opts = $.extend({}, $.fn.dragsort.defaults, options);
		var ctx = this.children(opts.container);
		var selector = this.selector;
		var dragList = [];
		ctx.each(function (index, cont){
			var Drag = {
				movedItem : null,
				draggedItem : null,
				placeholder : null,
				itemSelector : null,
				container: cont,
				init : function (){
					if (!this.movedItem){
						this.movedItem = $(cont);
					}

					if (!this.draggedItem){
						this.draggedItem = $(cont).find(opts.draggedItemClass);
					}
					Drag.draggedIndex = index;
					
					var cb = $.Callbacks();

					var fn = function (){
						$(Drag.container).on('mousedown', Drag.start).on('destroy', Drag.destroy);
						//log('Start binding');
					};

					opts.onPrepare && cb.add(opts.onPrepare);
					cb.add(fn);
					cb.fire();
				},
				destroy : function (){
					if (dragList.length) {
						var list = dragList[$(this).index()];
						$(list.container).off('mousedown').off('destroy');
					}
				},
				start : function (ev){
					if (ev.which != 1)return;
					ev.preventDefault();
					var di = Drag.draggedItem;
					var mi = Drag.movedItem;
					var disX = ev.pageX - di.offset().left;
					var disY = ev.pageY - di.offset().top;
					di.data('disX', disX);
					di.data('disY', disY);
					mi.data('ori-w', Drag.movedItem.width());
					mi.data('ori-h', Drag.movedItem.height());
					Drag.draggedIndex = index;
					var oPlaceholder = $('<div>').css({
						'border' : '2px dashed #000',
						'margin-bottom' : '2px',
						width : mi.data('ori-w') - 4 + 'px',
						height : mi.data('ori-h') - 4 + 'px',
						'background-color' : '#BAFF00'
					}).insertBefore(mi);

					mi.css({
						position : 'absolute',
						left : 0, top:0,
						'z-index' : 9999
					}).hide();
					Drag.placeholder = oPlaceholder;

					$(document).on('mousemove', Drag.drag);
					$(document).on('mouseup', Drag.end);
					return false;
				},
				drag : function (ev){
					var di = Drag.draggedItem;
					var mi = Drag.movedItem;
					var pl = Drag.placeholder;
					var nx = ev.pageX - di.data('disX');
					var ny = ev.pageY - di.data('disY');
					if (!mi.is('visible')){
						mi.show();
					}				
					mi.css({
						width : mi.data('ori-w') + 'px',
						height : mi.data('ori-h') + 'px',
						left : nx + 'px',
						top : ny + 'px'
					});

					var x = ev.pageX,
						y = ev.pageY,
						p = -1,
						l = ctx.length,
						flag = true;

					for (var j=0; j<l; j++) {
						if (j == Drag.draggedIndex) {
							continue;
						} else {
							try{
								var current = ctx.eq(j);
								if (current && current.offset()){
									t = current.offset().top,
									l = current.offset().left,
									w = current.width(),
									h = current.height();
									if (x > l && x < l + w) {
										if (y > t && y < t + h/2) {
											p = j;break;
										} else if (y >= t+h/2 && y < t + h) {
											flag = false;
											p = j;break;
										}
									}
								}
								
							}catch(e){log(e)}
						}
					}
					if (p != -1) {
						if (flag) {
							pl.insertBefore(ctx.eq(p));
						} else {
							pl.insertAfter(ctx.eq(p));
						}
					}
					//log(mi.offset().left, mi.offset().top);
				},
				end : function (){
					var di = Drag.draggedItem;
					var mi = Drag.movedItem;
					$(document).off('mousemove');
					$(document).off('mouseup');
					
					mi.attr("style", "");
					mi.removeData('ori-w').removeData('ori-h');
					di.removeData('disX').removeData('disY');
					Drag.placeholder.replaceWith(mi);

					if (opts.dragEnd && $.isFunction(opts.dragEnd)) {
						opts.dragEnd();
					}
				}
			};

			Drag.init();
			dragList.push(Drag);
		});
		log(dragList.length);
		return this;
	};

	$.fn.dragsort.defaults = {
		container : '.containerClass',
		draggedItemClass : '.handlerClass',
		onPrepare : function (){
			log('Preparing');
		},
		onDrag : function (ev){
			log(ev.pageX, ev.pageY);
		},
		onDragEnd : function (){
			log('Ending callback');
		}
	};
})(jQuery, document);
