# Contributing 

It is **necessary** to read this document before **contributing codes/translations or building codes**

vscode-coding-tracker<sup>1</sup> is a open-sources project licensed under [GPL-3.0](LICENSE).

> [1]: included two repository [vscode-coding-tracker](https://github.com/hangxingliu/vscode-coding-tracker) and [vscode-coding-tracker-server](https://github.com/hangxingliu/vscode-coding-tracker-server)

## Commit Issue/Pull Request

Committing issue to this project is a easy way to contributing.   
If you met bug or inadequacy in this project, you can create a issue in issues page of this repository.

### Before Commit Issue

1. Do a search to see if the issue or feature request has already been filed.
2. Find correct repository between `vscode-coding-tracker` and `vscode-coding-tracker-server`
	- commit to `vscode-coding-tracker-server` if you met trouble in report page (included charts, report result, translations ...)
	- otherwise, commit to `vscode-coding-tracker` repository.
3. Please report information followed in your issue content:
	- **extension version**
	- **your operation system**
	- **server version** (in the end of report page)
	- **Detailed reproduction ways or error tracking information**

Of course, you can commit a PR to this project in "Pull Request" page if you believe your codes could fix some bug existed this project or improve this project.

### Pull Request Requirements

1. Passed test suites. [Travis-CI](https://travis-ci.org/hangxingliu/vscode-coding-tracker-server)
2. The target of pull request must be develop branch if there has any develop branch looks like `x.y.z-develop` in repository.
3. Included any one description followed in your pull request content
	- What bugs your pull request fixed
	- What improving your pull request included

## Internationalize (Translation)

1. create a translation js file in `frontend/src/js/i18n/`
2. add a line likes `'language_code': require('./language_code')` into `frontend/src/js/i18n/index.js`
3. add a item likes `option(value='language_code') Language Name` into `frontend/src/modules/top_navbar.pug`
4. you can build frontend codes and have a look.

## Editing, Building, Running and Testing

### Locating files

1. server side codes (Node.js) in folder `lib` and file `app.js`
2. frontend codes (report page codes) in folder `frontend/src`
	- distributional frontend files (after building) in folder `frontend/dist`
3. libraries used in frontend in folder `frontend/lib`

Detailed files manifest: [FILES.md](docs/FILES.md)

### Before editing codes

1. Make sure `node` and `npm` environments have been installed in your system. 
2. Executing `npm install` for Node.js tradition
3. If you want to editing frontend codes (included HTML, style-sheet, scripts). Please install dependencies of builder by executing script`./build/install-dependencies`
	- For Windows user: You should install dependencies manually by referring `./build/install-dependencies` file
4. Recommended IDE: `Visual Studio Code`

### Building frontend codes

`npm run build` or `npm run build-live`(building automatically after file be modified)

- Builder configuration file location: `build/build.config.yaml`
- Builder scripts from repository: [fe-build-scripts](https://github.com/hangxingliu/fe-build-scripts)

### Launching server

`npm start` or `npm run server`

- You want passing some parameters to server script. You can execute like this: `npm start -- --port=23333`
- **Tips:** How to debug server scripts with tracking data in local computer:
	- `npm start -- --public-report --port=9000 --output="$HOME/.coding-tracker"`

### Test suites

`npm test` or `npm run test-no-eslint-tsc`
