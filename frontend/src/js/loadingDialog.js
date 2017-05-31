//@ts-check
function LoadingDialog(loadStatusDlgJQDom) {
	var $dlg = loadStatusDlgJQDom,
		$title = $dlg.find('.modal-title'),
		$loading = $dlg.find('.alert-info'),
		$error = $dlg.find('.alert-danger'),
		$errorReason = $error.find('code'),
		show = () => $dlg.modal({ keyboard: false, backdrop: 'static' }),
		hide = () => $dlg.modal('hide');
	
	this.loading = () => {
		$title.text('Loading report...');
		$loading.show();
		$error.hide();
		show();
	}
	
	this.failed = error => {
		$title.text('Load Failed!');
		$loading.hide();
		$error.show();
		$errorReason.html(JSON.stringify(error, null, '  '));
		show();
	}
	
	this.hide = hide;
}
module.exports = LoadingDialog;