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
		// Defaults
		if( !o ) var o = {};
		if( o.url == undefined ) o.url = 'http://sookoll.ee/dev/miuview-api/html';
		if( o.request == undefined ) o.request = 'getalbum';
		if( o.album == undefined ) o.album = '*';
		if( o.item == undefined ) o.item = '*';
		if( o.key == undefined ) o.key = '';
		if( o.thsize == undefined ) o.thsize = 150;
		if( o.size == undefined ) o.size = 1000;

		$(this).each(function(){
			
			var mv = new MiuViewG(this);
			
			$.history.init(mv.historyCall,{unescape:'&'});
			
			Shadowbox.init({
				skipSetup:true,
				continuous:true,
				onOpen:function(i){
					mv.initHistory = false;
				},
				onFinish:function(i){
					
					var item = Shadowbox.current;
					item = mv.getCurrentId(item);
					
					var hash = window.location.hash;
					var parts = hash.split('&');
					window.location.hash = parts[0]+'&'+item;
				},
				onClose:function(i){
					var hash = window.location.hash;
					var parts = hash.split('&');
					window.location.hash = parts[0];
					mv.initHistory = true;
				}
			});
			
			$('.miuview_gallery li a').live('click',function(e){
				e.preventDefault();
				var hash = $(this).attr('url');
				hash = hash.replace(/^.*#/,'');
				$.history.load(hash);
			});
						
		});
		
				
		function MiuViewG(div){
			
			var THIS = this;
			this.initHistory = true;
			this.div=div;
			this.mvAlbums={};
			this.mvItems={};
			
			this.historyCall=function(hash) {
				
				if(hash==''){
					// gallery page
					$(THIS.div).html('');
					var req = o.request;
					switch(req){
						case 'getalbum':
							var data = {request:req,album:o.album,thsize:o.thsize};
						break;
						case 'getitem':
							var data = {request:req,album:o.album,item:o.item,thsize:o.thsize,size:o.size};
						break;
					}
					THIS.doGalleryView(data,req);
				}else if(THIS.initHistory == true){
					
					$(THIS.div).html('');
					Shadowbox.clearCache();
					
					var parts = hash.split('&');
					
					// album page
					THIS.mvItems={};
					var req = 'getitem';
					var data = {request:req,album:parts[0],item:o.item,thsize:o.thsize,size:o.size};
					THIS.doGalleryView(data,req);
					Shadowbox.setup();
					
					// item page
					if(parts[1]){
						Shadowbox.open({
							gallery:parts[0],
							content:THIS.mvItems[parts[1]].img_url,
							player:'img',
							title:THIS.mvItems[parts[1]].description
						});
					}
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
			
			this.doGalleryView=function(data,type){
				
				THIS.doRequest(data,type);
				var content = THIS.galleryContent(type);
				$(THIS.div).html('<ul class="miuview_gallery">'+content+'</ul>');
				
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
						for(var i in data.albums){
							THIS.mvAlbums[data.albums[i].id] = data.albums[i];
						}
					break;
					case 'getitem':
						for(var i in data.items){
							THIS.mvItems[data.items[i].id] = data.items[i];
						}
					break;
				}
				
				
			}
			this.galleryContent=function(type){
				var list='';
				switch(type){
					case 'getalbum':
						for(var i in THIS.mvAlbums){
							var descr = THIS.mvAlbums[i].description==null?i:THIS.mvAlbums[i].description;
							var image = THIS.mvAlbums[i].thumb==null || THIS.mvAlbums[i].thumb==''?'no_image.gif':THIS.mvAlbums[i].thumb_url;
							list+='<li id="'+i+'" class="left"><a href="'+i+'" url="'+i+'" class="openAlbum" title="Vaata albumit">';
							list+='<img src="'+image+'" class="left" width="'+o.thsize+'" height="'+o.thsize+'"><br>';
							list+='<span class="caption">'+descr+' pilte '+THIS.mvAlbums[i].items_count+'</span>';
							list+='</a></li>';
						}
					break;
					case 'getitem':
						for(var i in THIS.mvItems){
							var descr = (THIS.mvItems[i].description==null || THIS.mvItems[i].description=='')?i:THIS.mvItems[i].description;
							list+='<li id="'+i+'" class="left"><a href="'+THIS.mvItems[i].img_url+'" url="'+THIS.mvItems[i].album+'&'+i+'" rel="shadowbox['+THIS.mvItems[i].album+'];player=img" title="'+descr+'">';
							list+='<img src="'+THIS.mvItems[i].thumb_url+'" class="left" width="'+o.thsize+'" height="'+o.thsize+'"><br>';
							list+='<span class="caption">'+descr+'</span>';
							list+='</a></li>';
						}
					break;
				}
				
				return list;
			}
		}
		
	};
	
})(jQuery);