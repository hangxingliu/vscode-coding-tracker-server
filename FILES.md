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


- `database/*.*` Data of your vscode using track

- `utils/cleanDatabaseFiles` a Node.js script to clean up a folder files
- `utils/upgradeDatabaseFiles` a Node.js script to upgrade old database files in a folder to current version
- `utils/analyzer` a Node.js utility for analyzing database files

- `hooks/pre-commit` bash script to launch pre-commit-test.js script before commit
- `hooks/pre-commit-test.js` a Node.js script to check are unit test passed before commit. And block commit if test failed

- `test/` some test scripts

- `frontend` some frontend files, its test files, its build files