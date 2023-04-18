var libraryDialog = function(id, type, withThumbnails, callback) {
	var html = '<div id="libraryList"'+(withThumbnails ? ' class="thumbContainer"' : '')+'></div>' ;
	var dialog = $('<div></div>').html(html).dialog({
		width: 'auto',
		modal: true,
		resizable: false,
		title: 'Available '+type+'s',
		beforeClose: () => {
			$('#libraryList').parent().remove();
		}
	});
	if (withThumbnails) {
		$('#libraryList').parent().parent().css({position:"fixed", left:"30px", right:"30px", top:"30px", bottom:"30px", 'overflow-y': "auto"});
	}
	var process = function(res) {
		try { 
			$('#libraryManage').dialog('close');
		} catch (e) {}
		res = JSON.parse(res);
		if (res.success == false) {
			betterAlert(res.error.code || res.error, 'An error has ocurred.');
		} else {
			getObjects(res);
		}
	}
	var getObjects = (res) => {
		$('.previewHolder').remove();
		$('.library').remove();
		for (var i = 0 ; i < res.savedObjects.length ; i++) {
			var obj = res.savedObjects[i];
			var url = obj.name ;
			var local = false ;
			if (!(url.indexOf('http://') == 0 || url.indexOf('https://')) == 0) {
				url = './assets/' + url ;
				local = true ;
			}
			var code ;
			if (withThumbnails) {
				code = '<div class="previewHolder" id="library_'+obj.rowid+'" alias="'+obj.alias+'" local="'+local+'" filename="'+obj.name+'">'+
				       '<img src="'+url+'" class="imagePreview"><br/>'+obj.alias+'</div>';
			} else {
				code = '<li class="library" id="library_'+obj.rowid+'" alias="'+obj.alias+'" local="'+local+'" filename="'+obj.name+'">'+obj.alias+'</li>';
			}
			$('#libraryList').append(code);
			$('#library_'+obj.rowid).on().click(function (event) {
				$.post('/reuseObject', { playmat: id, alias: $(this).attr('alias'), x: $(window).scrollLeft(), y: $(window).scrollTop() }, (resu)=>{
					dialog.dialog('close');
					if (callback != undefined) {
						callback(JSON.parse(resu));
					}
				});
			});
			$('#library_'+obj.rowid).contextmenu(function (event){
				event.preventDefault();
				var alias = $(this).attr('alias');
				var local = $(this).attr('local');
				var filen = $(this).attr('filename');
				var html = '<label for="libraryName">'+type.charAt(0).toUpperCase()+type.substr(1)+' name:</label><br/>' +
						   '<input id="libraryName" style:"width:400px" value="'+alias+'">';
				var anotherDialog = $('<div id="libraryManage"></div>').html(html).dialog({
					title: 'Manage '+type,
					width: 'auto',
					modal: true,
					resizable: false,
					beforeClose: () => {
						$('#libraryManage').remove();
					},
					buttons: {
						Ok: () => {
							var newAlias = $('#libraryName').val() ;
							var newName  = filen ;
							if (local == 'true') {
								newName  = newName.replace(alias, newAlias);
							}
							if (alias != newAlias) {
								$.post('/updateObject', { oldAlias: alias, newAlias: newAlias, type: type, local: local, oldFile: filen, newFile: newName}, process);
							} else {
								anotherDialog.dialog('close'); 
							}
						},
						Delete: () => {
							betterConfirm('Deleting this '+type+' will remove if from every playmat. Are you sure','Confirm',()=> {
								$.post('/deleteObject', { alias: alias, type: type, local: local, file: filen}, process);
							});
						},
						Cancel: () => { 
							anotherDialog.dialog('close'); 
						}
					}
				});
			});
		}
	}
			
	$.post('/getObjects',{ type: type }, process);
}