//@ts-check
function init() {
	let $dlg = $('#dlgStatus'),
		
		$title = $dlg.find('.modal-title'),
		
		$loading = $dlg.find('.alert-info'),
		$error = $dlg.find('.alert-danger'),
		
		$errorReason = $error.find('code'),
		
		show = () => $dlg.modal({ keyboard: false, backdrop: 'static' }),
		hide = () => $dlg.modal('hide');
	
	return { loading, failed, hide: delayHide };

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
		$errorReason.html(JSON.stringify(error, null, '  '));
		show();
	}
	function delayHide() {
		setTimeout(hide, 50);
	}
}
module.exports = {init};