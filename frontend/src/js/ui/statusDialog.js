//@ts-check

let $dlg = $('#dlgStatus'),
	$title = $dlg.find('.modal-title'),
	$loading = $dlg.find('.alert-info'),
	$error = $dlg.find('.alert-danger'),
	$errorReason = $error.find('code');

let dialogVisible = 0,
	requestHideBeforeShowing = false;

$dlg.on('show.bs.modal', () => { dialogVisible = 1; });
$dlg.on('shown.bs.modal', () => {
	if (requestHideBeforeShowing) {
		$dlg.modal('hide');
		requestHideBeforeShowing = false;
		return;
	}
	dialogVisible = 2;
});
$dlg.on('hidden.bs.modal', () => { dialogVisible = 0; });

module.exports = { show, hide, loading, failed };

function show() { 
	if(dialogVisible == 0)
		$dlg.modal({ keyboard: false, backdrop: 'static' })
}
function hide() { 
	switch (dialogVisible) { 
		case 0: return;
		case 1: requestHideBeforeShowing = true; return;
		case 2: $dlg.modal('hide');	
	}
}

function loading(){
	$title.text('Loading report...');
	$loading.show();
	$error.hide();
	show();
}

function failed(error){
	$title.text('Load Failed!');
	$loading.hide();
	$error.show();
	$errorReason.html(typeof error == 'string' ? error: JSON.stringify(error, null, '  '));
	show();
}
