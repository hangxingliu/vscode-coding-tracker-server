# Contributing 

**Please** to read this document before **contributing code, translations or building**

vscode-coding-tracker<sup>1</sup> is a open-sources project licensed under [GPL-3.0](LICENSE).

> [1]: included two repository [vscode-coding-tracker](https://github.com/hangxingliu/vscode-coding-tracker) and [vscode-coding-tracker-server](https://github.com/hangxingliu/vscode-coding-tracker-server)

## Commit Issue/Pull Request

Submitting an issue to this project is a easy way to contribute. 
If you find a bug in this project or have of an improvement, you can create an [issue](https://github.com/hangxingliu/vscode-coding-tracker-server/issues).
Of course, Pull Requests are welcomed for bug fixes and improvements.

### Before Submitting an Issue

1. Ensure you are in the correct repository between `vscode-coding-tracker` and `vscode-coding-tracker-server`
	- `vscode-coding-tracker-server` if you met trouble in report page (included charts, report result, translations ...)
	- otherwise, commit to `vscode-coding-tracker` repository.
2. Search for issues or feature requests that may have already been filed.
3. Please include information the following in your issue:
	- **VS Code version**
	- **extension version**
	- **your operation system**
	- **server version** (in the end of report page)
	- **Detailed reproduction ways or error tracking information**

### Pull Request Requirements

1. Passed test suites. [Travis-CI](https://travis-ci.org/hangxingliu/vscode-coding-tracker-server)
2. The target of pull request must be develop branch if there has any develop branch looks like `x.y.z-develop` in repository.
3. Included any one description followed in your pull request content
	- What bugs your pull request fixes
	- What improvements your pull request includes

## Internationalize (Translation)

1. Create a translation js file in `frontend/src/js/i18n/`
2. Add a line likes `'language_code': require('./language_code')` into `frontend/src/js/i18n/index.js`
3. Add a item likes `option(value='language_code') Language Name` into `frontend/src/modules/top_navbar.pug`
4. You can build frontend code and have a look.

## Editing, Building, Running and Testing

### Locating files

1. Server side code (Node.js) is in folder `lib` and file `app.js`
2. Frontend code (report page code) is in folder `frontend/src`
	- distribution frontend files (after building) in folder `frontend/dist`
3. Libraries used in frontend in folder `frontend/lib`

Detailed files manifest: [FILES.md](docs/FILES.md)

### Before editing code

1. Make sure `node` and `npm` environments have been installed in your system. 
2. Executing `npm install` for Node.js tradition
3. If you want to edit frontend code (for example: HTML, style-sheet, scripts). Please install dependencies of builder by:
	- Linux/macOS, Executing script`./build/install-dependencies`
	- Windows, You should install dependencies manually by referring `./build/install-dependencies` file
4. Recommended IDE: `Visual Studio Code`

### Building frontend code

`npm run build` or `npm run build-live`(building automatically after file be modified)

- Build configuration file location: `build/build.config.yaml`
- Build scripts from repository: [fe-build-scripts](https://github.com/hangxingliu/fe-build-scripts)

### Launching server

`npm start` or `npm run server`

- To pass parameters to server script, execute like this: `npm start -- --port=23333`
- **Tips:** To debug server scripts with tracking data in local computer:
	- `npm start -- --public-report --port=9000 --output="$HOME/.coding-tracker"`

### Test suites

`npm test` or `npm run test-no-eslint-tsc`
