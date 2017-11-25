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

![screenshots_2](screenshots/2.jpg)

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

### 0.5.0 (2017/11/27)

0. Support collect and report version control system(Git) activities.
1. More report charts. Better i18n, date format and time format.
2. Custom report date range. Custom start time for 24hours report.
3. New report page using Bootstrap4 with multiple child report pages.
4. Upgrade upload and storage protocol to 4.0. Improve storage action.
5. Breaking change in frontend structure (charts, i18n, routes, ui, utils ...).

more version information: [CHANGELOG.md](CHANGELOG.md)

## Editing, Modifying and Building codes

Goto chapter *Editing, Building, Running and Testing* in [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing

It is **necessary** to read [CONTRIBUTING.md](CONTRIBUTING.md) before **contributing codes/translations or building codes**

## Files manifest

redirect to [FILES.md](docs/FILES.md)

## Author

[LiuYue](https://github.com/hangxingliu)

## Contributors

[Dolgishev Viktor (@vdolgishev)][vdolgishev]

## License

[GPL-3.0](LICENSE)

[vdolgishev]: https://github.com/vdolgishev
