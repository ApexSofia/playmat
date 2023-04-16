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
			mirror  : getMirror(id),
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
	
	var setScale = function(id, value){
		var style = $('#'+id).attr('style');
		style = style.replace(/scale\s*:\s*[0-9.]+\s*;/, 'scale: '+value+';');
		$('#'+id).attr('style', style);
	}
	
	var getMirror = function(id){
		var mirror = ($('#'+id).css('transform').replace(/\s/g,'') == ('matrix(-1,0,0,1,0,0)')) ;
		return (mirror ? '1' : '0');
	}
	
	var setMirror = function(id, mirror){
		$('#'+id).css('transform',  'scale('+(mirror == '1' ? '-':'')+'1,1)');
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
								  'scale:'+obj.scale+'; opacity:'+obj.opacity+'; rotate:'+obj.rotate+'deg; '+
								  'transform: scale('+(obj.mirror == '1' ? '-' : '')+'1,1); z-index:8">' ;
				$('body').append(img);
				$('#'+id).draggable({
					drag: function (event, ui) {
						__dx = ui.position.left - ui.originalPosition.left;
						__dy = ui.position.top - ui.originalPosition.top;
						ui.position.left = ui.originalPosition.left + (__dx);
						ui.position.top = ui.originalPosition.top + (__dy);
						//
						ui.position.left += __recoupLeft;
						ui.position.top += __recoupTop;
					},
					start: function (event, ui) {
						$(this).css('cursor', 'move');
						var left = parseInt($(this).css('left'), 10);
						left = isNaN(left) ? 0 : left;
						var top = parseInt($(this).css('top'), 10);
						top = isNaN(top) ? 0 : top;
						__recoupLeft = left - ui.position.left;
						__recoupTop = top - ui.position.top;
					},
					stop: function (event, ui) {
						$(this).css('cursor', 'default');
						updateToken(this.id);
					},
					create: function (event, ui) {
						$(this).attr('oriLeft', $(this).css('left'));
						$(this).attr('oriTop', $(this).css('top'));
					}
				});
				$('#'+id).contextmenu(function (event){
					var id = event.currentTarget.id;
					if (!exists('#imageMenu')) {
						var scale   = $('#'+id).css('scale') ;
						var opacity = $('#'+id).css('opacity') ;
						var rotate  = $('#'+id).css('rotate') ;
						var mirror  = getMirror(id) ;
						var html = '<form>' +
								   '<label for="tokenScale">Scale: '+scale+'</label><br/>'+
								   '<div   id= "tokenScale" class="sliderPlaceholder"></div><br/>'+
								   '<label for="tokenOpacity">Opacity: '+opacity+'</label><br/>'+
								   '<div   id= "tokenOpacity" class="sliderPlaceholder"/></div><br/>'+
								   '<label for="tokenRotate">Rotate: '+rotate+'</label><br/>'+
								   '<div   id= "tokenRotate" class="sliderPlaceholder"/></div><br/>'+
								   '<input id= "tokenMirror" type="checkbox"'+(mirror == '1' ? ' checked':'')+'/><label for="tokenMirror"> Mirror </label> ';
						var dialog = $('<div id="imageMenu"></div>').html(html).dialog({
							title: 'Token properties',
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
									setScale(id, scale);
									setMirror(id, mirror);
									dialog.dialog('close');
								}
							},
							position: {
								my: 'left+20 top+20', 
								at: 'right bottom', 
								of: event
							},
							open: function() {
								$('#tokenScale').slider({ min: 0.1, max: 4, step: 0.05, value: scale, 
									slide: (event, ui) => { 
										$('label[for=tokenScale]').text('Scale: '+ui.value);
										setScale(id, ui.value);
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
								$('#tokenMirror').change(function(){
									$('#'+id).css('transform',  'scale('+(this.checked ? '-':'')+'1,1)');
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
				$('#'+id).css('opacity', obj.opacity);
				$('#'+id).css('rotate',  obj.rotate);
				setScale(id, obj.scale);
				setMirror(obj.mirror);
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