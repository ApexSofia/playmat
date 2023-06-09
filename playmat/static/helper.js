var betterAlert = function(message, title, callback) {
	if (!title)
		title = 'Alert';
	if (!message)
		message = 'No Message to Display.';
	
	var dialog = $('<div id="betterAlert"></div>').html(message).dialog({
		title: title,
		resizable: false,
		modal: true,
		width: 'auto',
		beforeClose: function( event, ui ) {
			$('#betterAlert').remove();
		},
		buttons: {
			'Ok': () => {
				dialog.dialog('close');
				if (callback != undefined) {
					callback();
				}
			}
		}
	});
};

var betterConfirm = function(message, title, callbackOk, callbackCancel) {
	if (!title)
		title = 'Confirm';
	if (!message)
		message = 'No Message to Display.';
	
	var dialog = $('<div id="betterConfirm"></div>').html(message).dialog({
		title: title,
		resizable: false,
		modal: true,
		width: 'auto',
		beforeClose: function( event, ui ) {
			$('#betterConfirm').remove();
		},
		buttons: {
			'Ok': () => {
				dialog.dialog('close');
				if (callbackOk != undefined) {
					callbackOk();
				}
			},
			'Cancel': () => {
				dialog.dialog('close');
				if (callbackCancel != undefined) {
					callbackCancel();
				}
			}
		}
	});
};

var fileDialog = function(file, action, extensions, message, title, properties, callback) {
	if (!title)
		title = file ? 'File upload' : 'Web import';
	if (!message)
		message = file ? 'Please select a file.' : 'Please select a file.';
	if (!properties)
		properties = {};
	
	var html = '<form id="uploadFileForm"'+ (file ? ' enctype="multipart/form-data"':'') ;
	if (action != undefined ) {
		html = html + ' action="'+action+'"';
	}
	if (!extensions) {
		extensions = [] ;
	}
	html = html + '>' ;
	html = html + '<span>' + message + '</span><br/><br/>' +
	              '<img id="uploadSpinner" src="loader.gif" class="spinner" style="display: none"/><br/>';
	if (file) {
		html = html + '<label for="uploadFile">File</label><br>\n' +
					  '<input id= "uploadFile" name="file" type="file" accept="'+extensions.join(',')+'" style="width:400px"/><br><br>';
	} else {
		html = html + '<img   id="previewFile"/ class="imagePreview"><br/>\n' +
		              '<label for="uploadFile">File</label><br>\n' +
					  '<input id= "uploadFile" name="url" type="url" style="width:400px"/><br><br>';
	}
	html = html + '<label for="uploadName">Name</label><br>' +
	              '<input id="uploadName" name="fileName" type="text" style="width:400px"/>' ;
	for (var key in properties) {
		html = html + '<input name="'+key+'" type="hidden" value="'+properties[key]+'"/>' ;
	}
	html = html + '</form>' ;
	
	upload = () => {
		var filename = $('#uploadFile').val();
		if (check(['uploadFile','uploadName'])) {
			var ext = false ;
			for (var i = 0 ; i < extensions.length ; i ++) {
				if (filename.endsWith(extensions[i])) {
					ext = true ;
				}
			}
			if (ext) {
				$('#uploadSpinner').show();
				if (file) {
					var formData = new FormData($('#uploadFileForm')[0]);
					$.ajax({
						url: action,
						type: "post",
						dataType: 'json',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						complete: function(res){
							$('#uploadSpinner').hide();
							dialog.dialog('close');
							if (callback != undefined) {
								callback(res.responseJSON);
							}
						}
					});
				} else {
					$.post(action, $('#uploadFileForm').serialize(), function (res) {
						$('#uploadSpinner').hide();
						dialog.dialog('close');
						if (callback != undefined) {
							callback(JSON.parse(res));
						}					
					});
				}
			} else {
				betterAlert('Supported extensions: '+extensions.join(' '));
			}
		} else {
			betterAlert('Incomplete information');
		}
	}
	
	var buttons = {} ;
	if (file) {
		buttons.Upload = () => { upload(); } ;
	} else {
		buttons.Import = () => { upload(); } ;
	}
	buttons.Cancel = () => { dialog.dialog('close'); }
	var dialog = $('<div></div>').html(html).dialog({
		title: title,
		resizable: false,
		width:'auto',
		modal: true,
		beforeClose: function( event, ui ) {
			$('#uploadFileForm').remove();
		},
		buttons: buttons
	});
	
	$("#uploadFileForm").on("submit", function(event){
		event.preventDefault();
		upload();
	});
	
	$('#uploadFile').on().change(function (event) {
		$('#previewFile').attr('src', '');
		$('#previewFile').attr('src', $('#uploadFile').val());
	});
};

var check = function (fields) {
	for (var i = 0 ; i < fields.length ; i++) {
		var text ;
		if ($('input[name='+fields[i]+']').attr('type') == 'radio') {
			text = $('input[name='+fields[i]+']:checked').val() ;
		} else {
			text = $('#'+fields[i]).val() ;
		}
		if (text == undefined || text == '') {
			return false ;
		}
	}
	return true ;
};

var toggleMenu = function(dialogName) {
	var isOpen = $('#'+dialogName).dialog("isOpen");
	if (!isOpen) {
		var parentMenu = $('#'+dialogName).attr('parentMenu');
		if (parentMenu) {
			$('div[parentMenu='+parentMenu+']').dialog('close');
		}
		$('#'+dialogName).dialog('open');
		$('div[aria-describedby='+dialogName+'] div.ui-dialog-titlebar').hide();
		console.log();
	} else {
		$('#'+dialogName).dialog('close');
		$('div[parentMenu='+dialogName+']').dialog('close');
	}						
};

var exists = function(element) {
	return $(element).length > 0 ;
}