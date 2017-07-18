# Visual Studio Code Coding Tracker Server

<a href="https://www.npmjs.com/package/vscode-coding-tracker-server">
<img src="https://img.shields.io/npm/v/vscode-coding-tracker-server.svg?style=flat-square" />
</a>
<a href="https://travis-ci.org/hangxingliu/vscode-coding-tracker-server">
<img src="https://img.shields.io/travis/hangxingliu/vscode-coding-tracker-server/master.svg?style=flat-square&label=master" />
</a>
<a href="https://travis-ci.org/hangxingliu/vscode-coding-tracker-server">
<img src="https://img.shields.io/travis/hangxingliu/vscode-coding-tracker-server/develop.svg?style=flat-square&label=dev" />
</a>

VSCode Coding Tracker extension server side program. 
> See more:   
> VSCode Coding Tracker extension   
> [GitHub repo](https://github.com/hangxingliu/vscode-coding-tracker)   
> [VSCode Extensions Marketplace](https://marketplace.visualstudio.com/items?itemName=hangxingliu.vscode-coding-tracker)
> 
> ---
> That repository be separate from above extension repository.
> So you could find more older commit information in that repository. 

## Screenshot

![screenshots1](screenshots/1.png)

## How To Install And Use

1. Make sure You have installed `Node.js` development environment included `npm`
2. Install this server program
	- Way 1 : Clone this repository and execute **`npm i`** in the folder where this README.md located 
	- Way 2 : Using **`npm i vscode-coding-tracker-server`** anywhere you want to install to
3. Execute **`npm start`** or **`node app`** to launch this server program. 
	- You could give it more options like **`npm start -- ${MORE_SERVER_OPTIONS}`** if you start it by using `npm start`
4. Open URL `http://domain:port/report?token=${YOUR_TOKEN}` to get coding report
	- In default, URL in local is `http://127.0.0.1:10345/report?token=${YOUR_TOKEN}`
	- If you using `--public-report` option to launch server, you could ignore the query parameter `token` in above URL

> More server option things:
>
> `--local`: It means server bind address on `127.0.0.1` when server listening.
> **(Other computer could not upload data and visit report page in this mode)**
>
> `--random-port`: It means server will using a 8 length random string as API/upload token
>  **even if you giving a token by `-t` option**
>
> `--public-report`: It means anyone could visit report page without token
> 
> **more options information you could find by using command `node app --help`**

## Current Version

## 0.4.1 (2017/07/19)

0. add Russian translation (Thank [Dolgishev Viktor (@vdolgishev)][vdolgishev])
1. fix a fatal bug (Storing data file without version in first line)
2. fix a small bug about default language item. and some wrong spelling in codes.

## 0.4.0

0. full projects and languages report
1. detailed report of specified project (each day coding times and echo file coding times)
2. i18n support (English, 简体中文, 繁體中文)(And waiting for your translation)
3. add startup welcome/help info
4. support share now (you can share your coding activities as chart image with your friend)
5. optimized loading dialog, chart, tooltip of chart and frontend codes (include new builder scripts) display

more version information: [CHANGELOG.md](CHANGELOG.md)

## Contributing

You can get information about functions of each folder and files by [FILES.md](FILES.md) 

### Server codes

You can look codes in folder `lib` and file `app.js`

### Frontend codes

1. install dependencies of frontend builder by executing `./install-builder-dependencies`
	- For Windows user: Install dependencies manually, you can refer `./install-builder-dependencies` file
2. test build script is OK `npm run build` or `npm run build-live`
3. look or edit codes in `frontend` folder

### Internationalize (Translation)

1. create a translation js file in `frontend/src/js/i18n/`
2. add a line likes `'language_code': require('./i18n/language_code')` into `frontend/src/js/i18n.js`
3. add a item likes `option(value='language_code') Language Name` into `frontend/src/modules/top_navbar.pug`
4. you can build frontend codes and have a look.

Actually, you can refer this commit about adding Russian translations by [Dolgishev Viktor (@vdolgishev)][vdolgishev]:   
<https://github.com/hangxingliu/vscode-coding-tracker-server/commit/b16499f3d9a1fbe4061fbe1a9617240c71e4e220>

## Files manifest

redirect to [FILES.md](FILES.md)

## Author

[LiuYue](https://github.com/hangxingliu)

## Contributors

[Dolgishev Viktor (@vdolgishev)][vdolgishev]

## License

[GPL-3.0](LICENSE)

[vdolgishev]: https://github.com/vdolgishev
