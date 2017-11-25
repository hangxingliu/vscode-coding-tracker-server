# File List

## Structure

- `frontend` front-end codes
	- `dist` front-end target codes (after building, optimizing and combining by builder)
	- `lib` third party libraries (bootstrap, echarts ...)
	- `src` sources
		- `js`
			- `charts` charts modules
			- `i18n` i18n strings and methods
			- `routes` each child report page routers
			- `ui` some module to controlling user interface
			- `utils` some toolkit modules
		- `modules` some pug/html fragments
		- `sass` sass style-sheet sources
- `build` config and source of frontend builder
	- Reference: <https://github.com/hangxingliu/fe-build-scripts>
- `lib` server side codes
- `test` unit test codes
- `docs` some documents about this project
- `bash_scripts` some bash helper scripts

## Files

- `app.js` this server program launch and entry script

- `lib/Handler404and500.js` add page not found and server error handler to express server
- `lib/Launcher.js` a module to get server script launch arguments and echo help information by **commander** library
- `lib/Log.js` log module
- `lib/ParamsChecker.js` check upload data complete
- `lib/Storage.js` module to storage tracking data
- `lib/TokenMiddleware.js` a token middleware to check upload token
- `lib/Version.js` version description and check module
- `lib/Welcome.js` module to echo welcome and version information to express server
- `lib/UpgradeDatabaseFiles.js` module to upgrade old version database files to current version
- `lib/RandomToken.js` module to randomly generate token string

- `lib/analyze/AnalyzeCore.js` analyze tracking data core class module
- `lib/analyze/ReportMiddleware.js` a report API middleware

- `lib/utils/cleanDatabaseFiles` a Node.js script to clean up a folder files
- `lib/utils/upgradeDatabaseFiles` a Node.js script to upgrade old database files in a folder to current version
- `lib/utils/analyzer` a Node.js utility for analyzing database files

- `database/*.*` data of your vscode using track

