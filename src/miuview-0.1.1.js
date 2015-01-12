/*
 * Miuview Gallery
 * admin.js
 * 
 * Creator: Mihkel Oviir
 * 08.2011
 * 
 */

(function($) {
	
	$.fn.MiuView = function(o){
		
		var mv = new MiuViewG(this);
		
		// Defaults
		if( !o ) var o = {};
		if( o.url == undefined ) o.url = 'http://sookoll.ee/galerii-api';
		if( o.request == undefined ) o.request = 'getalbum';
		if( o.title == undefined ) o.title = '';
		if( o.album == undefined ) o.album = '*';
		if( o.item == undefined ) o.item = '*';
		if( o.key == undefined ) o.key = '';
		if( o.thsize == undefined ) o.thsize = 150;
		if( o.size == undefined ) o.size = 1200;
		//if( o.size == undefined ) o.size = mv.getDimension();
		
		Shadowbox.init({
			skipSetup:true,
			continuous:true,
			displayNav:false,
			enableKeys:false,
			overlayOpacity:0.8,
			players:['img','html'],
			viewportPadding:30,
			modal:true,
			fadeDuration:0.2,
			onClose:function(){
				$('.mv-buttons,#mv-infopage').remove();
				$('#mv-info').removeClass('active');
				mv.infoPage = false;
				$("#sb-wrapper").show();
				$('#mv-infopage').remove();
			},
			onFinish:function(i){
				if($('.mv-buttons').length==0){
					var buttons = '<div id="mv-close" class="mv-buttons"></div><div id="mv-save" class="mv-buttons"></div><div id="mv-info" class="mv-buttons"></div>';
					if(Shadowbox.gallery.length>1){
						buttons = '<div id="mv-prev" class="mv-buttons"></div><div id="mv-next" class="mv-buttons"></div>'+buttons;
					}
					$('#sb-container').append(buttons);
					$('.mv-buttons').fadeIn('fast');
				}
				
				if(mv.infoPage==true){
					mv.changeInfo(i.options.id);
				}
			}
		});
		
		$.history.init(mv.historyCall,{unescape:'&'});

		$(this).each(function(){
			
			$('#miuview > ul > li a').live('click',function(e){
				e.preventDefault();
				var hash = $(this).attr('href');
				hash = hash.replace(/^.*#/,'');
				$.history.load(hash);
			});
			
			$('a.back').live('click',function(e){
				e.preventDefault();
				$.history.load('');
			});
			
			$('#sb-body-inner,#mv-next').live('click',function(e){
				var current = Shadowbox.getCurrent();
				$.history.load(current.gallery+'&'+current.options.next);
			});
			
			$('#mv-prev').live('click',function(e){
				var current = Shadowbox.getCurrent();
				$.history.load(current.gallery+'&'+current.options.prev);
			});
			
			$('#mv-close,#sb-overlay').live('click',function(e){
				var current = Shadowbox.getCurrent();
				$.history.load(current.gallery);
			});
			
			$('#mv-save').live('click',function(e){
				var current = Shadowbox.getCurrent();
				window.location.href=o.url+'/?request=download&album='+current.gallery+'&item='+current.options.id;
			});
			
			$('#mv-info').live('click',function(e){
				if(mv.infoPage){
					$(this).removeClass('active');
					mv.infoPage = false;
					$("#sb-wrapper").fadeIn('fast');
					$('#mv-infopage').fadeOut('fast',function(){
						 $(this).remove();
					});
				}else{
					$(this).addClass('active');
					mv.infoPage = true;
					var current = Shadowbox.getCurrent();
					
					var html = '<div id="mv-infopage"><h2>Pildi infokülg</h2><div class="float-left">';
					html+='<div class="img"><img src=""></div>';
					html+='<div class="map"></div></div><div class="float-left">';
					html+='<h3>Pildi kirjeldus</h3><div class="description"></div>';
					html+='<h3>Pildi metadata</h3><div class="metadata"></div>';
					html+='</div><div class="clear"></div></div>';
					
					$("#sb-wrapper").fadeOut('fast');
					$('#sb-container').append(html);
					mv.changeInfo(current.options.id);
					mv.setDimensions();
					$('#mv-infopage').fadeIn('fast');
				}
				
				
				
				
			});
			
			$(window).resize(function (){
				mv.setDimensions();
				//o.size = mv.getDimension();
			});
			
			// navigate with keyboard
			$(window).keydown(function(e) {
				if(Shadowbox.isOpen()){
					var current = Shadowbox.getCurrent();
					var KeyID = (window.event) ? event.keyCode : e.keyCode;
					
					switch(KeyID){
						case 37:// left
							$.history.load(current.gallery+'&'+current.options.prev);
						break;
						case 38:// up
							
						break;
						case 39:// right
							$.history.load(current.gallery+'&'+current.options.next);
						break;
						case 40:// down
							
						break;
						case 27:// esc
							$.history.load(current.gallery);
						break;
					}
					
				}
					
			});
			
		});
		
				
		function MiuViewG(div){
			
			var THIS = this;
			this.div=div;
			this.mvAlbums={};
			this.mvItems={};
			this.currentAlbum='';
			this.infoPage = false;
			this.x_margin = 150;
			this.y_margin = 40;
			this.dimensions = [300,600,800,1000,1200,1500];
			
			this.historyCall=function(hash) {
				
				var count = 0;
				for(var i in THIS.mvAlbums){
					count++;
				}
				
				// gallery page
				if(hash==''){
					
					THIS.mvItems={};
					THIS.currentAlbum='';
					
					// if we need to make albums request
					if(count == 0){
						
						switch(o.request){
							case 'getalbum':
								var data = {request:o.request,album:o.album,thsize:o.thsize};
							break;
							case 'getitem':
								var data = {request:o.request,album:o.album,item:o.item,thsize:o.thsize,size:o.size};
							break;
						}
						THIS.doRequest(data,o.request);
					}
					var content = THIS.galleryContent(o.request);
					THIS.doGalleryView(content,o.request);
					
				}else{
					
					// if we need to make albums request
					if(count == 0){
						var data = {request:o.request,album:o.album,thsize:o.thsize};
						THIS.doRequest(data,o.request);
					}
					
					var parts = hash.split('&');
					var album = parts[0];
					var item = (parts[1] && parts[1]!='')?parts[1]:null;
					
					// album page
					if(THIS.currentAlbum!=album){
						THIS.mvItems={};
						THIS.currentAlbum=album;
						var req = 'getitem';
						var data = {request:req,album:album,item:o.item,thsize:o.thsize,size:o.size};
						THIS.doRequest(data,req);
						var content = THIS.galleryContent(req);
						THIS.doGalleryView(content,req);
					}
					
					// open modal
					if(item!=null){
						//var current = Shadowbox.getCurrent();
						
						//if(Shadowbox.isOpen() && current.gallery == THIS.currentAlbum){
						if(Shadowbox.isOpen()){
							Shadowbox.change(THIS.getNumFromId(item));
						}else{
							/*if(Shadowbox.isOpen()){
								Shadowbox.close();
							}*/
							var n = THIS.getNumFromId(item)+1;
							var obj ={}
							for(var i in Shadowbox.cache){
								if(i==n){
									obj = Shadowbox.cache[i];
								}
							}
							Shadowbox.open(obj);
						}
						
					// close modal
					}else{
						if(Shadowbox.isOpen()){
							Shadowbox.close();
						}
					}
				}
			}
			
			this.getNumFromId = function(id){
				var j = 0;
				for(var i in THIS.mvItems){
					if(i == id){
						return j;
					}
					j++;
				}
			}
			
			this.getCurrentId = function(num){
				var j = 0;
				for(var i in THIS.mvItems){
					if(j == num){
						return i;
					}
					j++;
				}
			}
			
			this.doGalleryView=function(content,req){
				var title = o.title;
				if(req=='getitem' && o.request=='getalbum'){
					var title = THIS.mvAlbums[THIS.currentAlbum].description == null || THIS.mvAlbums[THIS.currentAlbum].description == ''?THIS.currentAlbum:THIS.mvAlbums[THIS.currentAlbum].description;
					title = '<a href="back" class="back" title="Tagasi"></a> '+title;
				}
				
				$(THIS.div).html('<div id="miuview"><h2>'+title+'</h2><ul>'+content+'</ul></div>');
			}
			
			this.doRequest=function(d,t){
				$.ajax({
					url: o.url+'/?callback=?',
					dataType: 'json',
					data: d,
					async: false,
					success: function(r){
						THIS.doData(r,t);
					}
				});
			}
			this.doData=function(data,type){
				switch(type){
					case 'getalbum':
						THIS.mvAlbums={};
						for(var i in data.albums){
							THIS.mvAlbums[data.albums[i].id] = data.albums[i];
						}
					break;
					case 'getitem':
						THIS.mvItems={};
						var cache = {}
						var n=0;
						for(var i in data.items){
							THIS.mvItems[data.items[i].id] = data.items[i];
							//build shadowbox cache
							var prev = n==0?data.items[data.items.length-1].id:data.items[n-1].id;
							var next = n==data.items.length-1?data.items[0].id:data.items[n+1].id;
							
							var link = {
								content:data.items[i].img_url,
								title:data.items[i].description==null || data.items[i].description==''?data.items[i].id:data.items[i].description,
								link:data.items[i].img_url,
								options:{
									prev:prev,
									id:data.items[i].id,
									next:next
								},
								player:'img',
								gallery:data.items[i].album
							};
							n++;
							cache[n]=link;
						}
						Shadowbox.cache = cache;
					break;
				}
				
				
			}
			this.galleryContent=function(type){
				var list='';
				switch(type){
					case 'getalbum':
						for(var i in THIS.mvAlbums){
							var descr = THIS.mvAlbums[i].description==null || THIS.mvAlbums[i].description==''?i:THIS.mvAlbums[i].description;
							if(THIS.mvAlbums[i].thumb==null || THIS.mvAlbums[i].thumb==''){
								var image = '';
								var iclass = ' no-thumb';
							}else{
								var image = '<img src="'+THIS.mvAlbums[i].thumb_url+'" width="'+o.thsize+'" height="'+o.thsize+'">';
								var iclass = '';
							}
							var caption = descr.length > 26?descr.substring(0,23)+'...':descr;
							list+='<li id="'+i+'" class="left"><a href="'+i+'" url="'+i+'" class="openAlbum" title="'+descr+'">';
							list+='<div class="caption"><b>'+caption+'</b><br>pilte '+THIS.mvAlbums[i].items_count+'</div>';
							list+='<div class="album'+iclass+'" style="width:'+o.thsize+'px;height:'+o.thsize+'px;">'+image+'</div>';
							list+='</a></li>';
						}
					break;
					case 'getitem':
						for(var i in THIS.mvItems){
							var descr = (THIS.mvItems[i].description==null || THIS.mvItems[i].description=='')?i:THIS.mvItems[i].description;
							list+='<li id="'+i+'" class="left"><a href="'+THIS.mvItems[i].album+'&'+i+'"  class="openItem" title="'+descr+'">';
							list+='<div class="item"><img src="'+THIS.mvItems[i].thumb_url+'" class="left" width="'+o.thsize+'" height="'+o.thsize+'"></div>';
							list+='</a></li>';
						}
					break;
				}
				
				return list;
			}
			
			this.setDimensions = function(){
				if(THIS.infoPage){
					var d_height = $(window).height();
					var d_width = $(window).width();
					var height = (d_height-2*THIS.y_margin)<300?300:d_height-2*THIS.y_margin;
					var width = (d_width-2*THIS.x_margin)<400?400:d_width-2*THIS.x_margin;
					$('#mv-infopage').height(height).width(width).css({'top':THIS.y_margin+'px','left':THIS.x_margin+'px'});
				}
			}
			
			this.getDimension = function(){
				var d_height = $(window).height();
				var d_width = $(window).width();
				var goal = (d_height<d_width)?d_height:d_width;
				var closest = null;
				$.each(THIS.dimensions, function(){
				  if (closest == null || Math.abs(this - goal) < Math.abs(closest - goal)) {
				    closest = this;
				  }
				});
				return closest;
			}
			
			this.changeInfo = function(id){
				var meta = '<table>';
				for(var i in mv.mvItems[id].metadata){
					for(var j in mv.mvItems[id].metadata[i]){
						meta+='<tr><td>'+j+'</td><td>'+mv.mvItems[id].metadata[i][j]+'</td></tr>';
					}
				}
				meta+='</table>';
				
				$('#mv-infopage .img img').attr('src',mv.mvItems[id].img_url);
				$('#mv-infopage .description').html(mv.mvItems[id].description);
				$('#mv-infopage .metadata').html(meta);
			}
		}
		
	};
	
})(jQuery);