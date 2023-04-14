var betterAlert = function(message, title, callback) {
	if (!title)
		title = 'Alert';
	if (!message)
		message = 'No Message to Display.';
	
	var dialog = $('<div id="betterAlert"></div>').html(message).dialog({
		title: title,
		resizable: false,
		modal: true,
		buttons: {
			'Ok': () => {
				dialog.dialog('close');
				$('#betterAlert').remove();
				if (callback != undefined) {
					callback();
				}
			}
		}
	});
};

var fileDialog = function(action, extensions, message, title, properties, callback) {
	if (!title)
		title = 'File upload';
	if (!message)
		message = 'Please select a file.';
	if (!properties)
		properties = {};
	
	var html = '<form id="uploadFileForm" enctype="multipart/form-data"' ;
	if (action != undefined ) {
		html = html + ' action="'+action+'"';
	}
	if (!extensions) {
		extensions = [] ;
	}
	html = html + '>' ;
	html = html + '<span>' + message + '</span><br/><br/>' +
	              '<img id="uploadSpinner" src="loader.gif" class="spinner" style="display: none"/><br/>'+
	              '<label for="uploadFile">File</label><br>\n' +
	              '<input id="uploadFile" name="file" type="file" accept="'+extensions.join(',')+'"/><br><br>'+
				  '<label for="uploadName">Name</label><br>' +
	              '<input id="uploadName" name="fileName" type="text" style="width: 97%;"/>' ;
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
							callback();
						}
					}
				});
			} else {
				betterAlert('Supported extensions: '+extensions.join(' '));
			}
		} else {
			betterAlert('Incomplete information');
		}
	}
	
	var dialog = $('<div></div>').html(html).dialog({
		title: title,
		resizable: false,
		width:'auto',
		modal: true,
		beforeClose: function( event, ui ) {
			$('#uploadFileForm').remove();
		},
		buttons: {
			'Upload': () => {				
				upload();
			},
			'Cancel': () => {
				dialog.dialog('close');
			}
		}
	});
	
	$("#uploadFileForm").on("submit", function(event){
		event.preventDefault();
		upload();
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
		$('#'+dialogName).dialog('open');
		$('div[aria-describedby='+dialogName+'] div.ui-dialog-titlebar').hide();
	} else {
		$('#'+dialogName).dialog('close');
		$('div[parentMenu='+dialogName+']').dialog('close');
	}						
};

var exists = function(element) {
	return $(element).length > 0 ;
}