//@ts-check
/// <reference path="./index.d.ts" />

function App() {
	require('./ui/versionAndWelcome');
	require('./api').init();
	require('./i18n/index');
	require('./reportFilter');

	// binding router for each sub-page
	require('./router').init([
		require('./routes/overview'),
		require('./routes/24hours'),
		require('./routes/projects'),
		require('./routes/languages'),
		require('./routes/vcs'),

		// open special sub-page following hash(#xxx) in URL, and "overview" sub-page by default
	]).followRouterInURL('overview');

}
//@ts-ignore
global.app = new App();
