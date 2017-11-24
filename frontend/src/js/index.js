//@ts-check
/// <reference path="./index.d.ts" />

function App() {
	require('./ui/versionAndWelcome');
	require('./api').init();
	require('./i18n/index');
	require('./reportFilter');

	require('./router').init([
		require('./routes/overview'),
		require('./routes/24hours'),
		require('./routes/projects'),
		require('./routes/languages'),
		require('./routes/vcs'),
	]).followRouterInURL('overview');

}
//@ts-ignore
global.app = new App();
