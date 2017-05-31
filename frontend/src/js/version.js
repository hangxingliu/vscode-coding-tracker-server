//@ts-check
function displayVersionInfo() {
	$.get('/', versionInfo => {
		$('#versionServer').text(versionInfo.serverVersion);
		$('#versionStorage').text(versionInfo.storageVersion);
	})
}
module.exports = { displayVersionInfo };