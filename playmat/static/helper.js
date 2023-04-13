betterAlert = function(message, title, callback) {
	if (!title)
		title = 'Alert';
	if (!message)
		message = 'No Message to Display.';
	
	var dialog = $('<div></div>').html(message).dialog({
		title: title,
		resizable: false,
		modal: true,
		buttons: {
			'Ok': () => {
				dialog.dialog('close');
				if (callback != undefined) {
					callback();
				}
			}
		}
	});
}

check = function (fields) {
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
}