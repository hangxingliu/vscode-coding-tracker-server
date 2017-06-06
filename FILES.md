# File List

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

- `git-pre-commit-hook` bash script to execute unit test scripts before commit

- `test/` some test scripts

- `build` some frontend builder scripts (from <https://github.com/hangxingliu/fe-build-scripts>)

- `frontend/dist` frontend target files (after build)
- `frontend/lib` some frontend libraries (such jquery, bootstrap, echarts ... )

- `frontend/src/index.html` the main html page (report page source file)
- `frontend/src/variables.yaml` Some variables will be inject into target html in build processor  
- `frontend/src/modules` some html parts(snippets). they will be combine into index.html in build processor
- `frontend/src/sass` style-sheet sass files
- `frontend/src/js` some  frontend javascript and type define typescript files
