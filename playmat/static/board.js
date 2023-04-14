var processBoard = function(objects){
	var getPath = (url) => {
		if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
			return url ;
		} else {
			return './assets/' + url ;
		}
	};
	
	var updateToken = function(id){
		$.post('/updateToken', {
			playmat : $('#playmatId').val(), 
			id      : id.replace('object_',''), 
			scale   : $('#'+id).css('scale'),
			opacity : $('#'+id).css('opacity'), 
			rotate  : $('#'+id).css('rotate').replace('deg','').replace('none','0'),
			x       : $('#'+id).css('left').replace('px',''), 
			y       : $('#'+id).css('top').replace('px','')
		}, (res) => {
			processBoard(JSON.parse(res).objects);
		});
	}
	
	var deleteToken = function(id){
		$.post('/deleteToken', {
			playmat : $('#playmatId').val(), 
			id      : id.replace('object_','')
		}, (res) => {
			processBoard(JSON.parse(res).objects);
		});
	}
	
	// Updates the background and create/update the tokens as needed 
	var safe = {} ;
	for (var i = 0 ; i < objects.length ; i++) {
		var obj = objects[i] ;
		if (obj.type == 'background') {
			$('body').css('background-image','none');
			$('body').css('background-color','#000000');
			if (!exists('#object_background')) {
				var img = '<img src="'+getPath(obj.name)+'" id="object_background" '+
						   'style="position:absolute; left:0px; top:0px; z-index:5">' ;
				$('body').append(img);
			} else {
				var org = $('#object_background').attr('src');
				if (org != getPath(obj.name)) {
					$('#object_background').attr('src', getPath(obj.name));
				}
			}
		} else if (obj.type == 'token') {
			var id  = 'object_' + obj.rowid ;
			safe[id] = true ;
			if (!exists('#'+id)) {
				var img = '<img class="token" rowid="'+obj.rowid+'" src="'+getPath(obj.name)+'" id="'+id+'" '+
						   'style="position:absolute; left:'+obj.x+'px; top:'+obj.y+'px; '+
								  'scale:'+obj.scale+'; opacity:'+obj.opacity+'; rotate:'+obj.rotate+'deg; z-index:8">' ;
				$('body').append(img);
				$('#'+id).draggable({
					stop: function(event, ui) {
						updateToken(this.id);
					}
				});
				$('#'+id).contextmenu(function (event){
					var id = event.currentTarget.id;
					if (!exists('#imageMenu')) {
						var scale   = $('#'+id).css('scale') ;
						var opacity = $('#'+id).css('opacity') ;
						var rotate  = $('#'+id).css('rotate') ;
						var html = '<form>' +
								   '<label for="tokenScale">Scale: '+scale+'</label><br/>'+
								   '<div   id= "tokenScale" class="sliderPlaceholder"></div><br/>'+
								   '<label for="tokenOpacity">Opacity: '+opacity+'</label><br/>'+
								   '<div   id= "tokenOpacity" class="sliderPlaceholder"/></div><br/>'+
								   '<label for="tokenRotate">Rotate: '+rotate+'</label><br/>'+
								   '<div   id= "tokenRotate" class="sliderPlaceholder"/></div>';
						var dialog = $('<div id="imageMenu"></div>').html(html).dialog({
							buttons: {
								Ok: () => {
									updateToken(this.id);
									dialog.dialog('close');
								},
								Delete: () => {
									deleteToken(this.id);
									dialog.dialog('close');
								},
								Cancel: () => {
									$('#'+id).css('opacity', opacity);
									$('#'+id).css('rotate', rotate);
									var style = $('#'+id).attr('style');
									style = style.replace(/scale: [0-9.]+;/, 'scale: '+scale+';');
									$('#'+id).attr('style', style);
									dialog.dialog('close');
								}
							},
							open: function() {
								$('#tokenScale').slider({ min: 0.1, max: 4, step: 0.05, value: scale, 
									slide: (event, ui) => { 
										$('label[for=tokenScale]').text('Scale: '+ui.value);
										var style = $('#'+id).attr('style');
										style = style.replace(/scale: [0-9.]+;/, 'scale: '+ui.value+';');
										$('#'+id).attr('style', style);
										// $('#'+id).css('scale', ui.value); // Thisn doesn't work, WTF
									}
								});
								$('#tokenOpacity').slider({ min: 0.1, max: 1, step: 0.02, value: opacity, 
									slide: (event, ui) => { 
										$('label[for=tokenOpacity]').text('Opacity: '+ui.value); 
										$('#'+id).css('opacity', ui.value);
									}
								});
								$('#tokenRotate').slider({ min: 0, max: 360, step: 1, value: rotate.replace('deg',''), 
									slide: (event, ui) => { 
										$('label[for=tokenRotate]').text('Rotate: '+ui.value+'deg'); 
										$('#'+id).css('rotate', ui.value+'deg');
									}
								});
							},
							beforeClose: function( event, ui ) {
								$('#imageMenu').remove();
							}
						});
					}
					return(false);
				});
			} else {
				$('#'+id).css('left',    obj.x + 'px');
				$('#'+id).css('top',     obj.y + 'px');
				$('#'+id).css('scale',   obj.scale);
				$('#'+id).css('opacity', obj.opacity);
				$('#'+id).css('rotate',  obj.rotate);
			}
		}
	}
	
	// Deletes unneeded tokens
	$('.token').each((token, tok) => {
		if (!safe[tok.id] === true) {
			$('#'+tok.id).remove();
		}
	});
};