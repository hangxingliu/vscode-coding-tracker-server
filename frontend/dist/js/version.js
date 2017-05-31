(() => {
	$.get('/', versionInfo => {
		$('#versionServer').text(versionInfo.serverVersion);
		$('#versionStorage').text(versionInfo.storageVersion);
	})
})();
