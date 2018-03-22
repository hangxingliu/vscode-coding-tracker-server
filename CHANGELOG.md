# CHANGELOG

### 0.6.0 (2018/03/23)

0. Support exporting/downloading report data as CSV format.
1. Support adding association for projects (So you can merge report from different projects).
2. Fix incorrect 24 hours report.
3. Fix some wrong i18n on the UI.
4. More compatible with old browsers and mobile browsers.

### 0.5.0 (2017/11/26)

0. Support collect and report version control system(Git) activities.
1. More report charts. Better i18n, date format and time format.
2. Custom report date range. Custom start time for 24hours report.
3. New report page using Bootstrap4 with multiple child report pages.
4. Upgrade upload and storage protocol to 4.0. Improve storage action.
5. Breaking change in frontend structure (charts, i18n, routes, ui, utils ...).

### 0.4.1 (2017/07/19)

0. add Russian translation (Thank [Dolgishev Viktor (@vdolgishev)][vdolgishev])
1. fix a fatal bug (Storing data file without version in first line)
2. fix a small bug about default language item. and some wrong spelling in codes.

### 0.4.0

0. full projects and languages report
1. detailed report of specified project (each day coding times and echo file coding times)
2. i18n support (English, 简体中文, 繁體中文)(And waiting for your translation)
3. add startup welcome/help info
4. support share now (you can share your coding activities as chart image with your friend)
5. optimized loading dialog, chart, tooltip of chart and frontend codes (include new builder scripts) display

### 0.3.1

1. Added total time display in report page
2. Fixed mark point (maximum time) could not fully show. (add more padding to chart)

### 0.3.0

1. Added two API(`ajax/kill` and `ajax/test`)
2. Added unit test (And automatic test before commit) and eslint support
	- Install git client test before commit hook by using `npm install-git-hooks`
3. Supported 403, 404 and 500 HTTP status code to special response
4. Removed low version upload data support.
	- although there are not support for low version upload data anytime. 
	- but uploading an old version data will get a error JSON object in this version. 
5. Show is this server run under local mode in welcome JSON information.

### 0.2.0

1. **Added beta version report web page** and analyze cli tools
2. Added local mode, random token and public report options
2. Allowed api/upload token passing by query string, such as `/ajax/report/last24hs?token=${YOUR_TOKEN}`
3. Added more debug output in debug mode

### 0.1.3

1. Upgraded storage database file version from 2.0 to 3.0
2. Added two useful utilities (cleaner and updater)
3. Supported 3.0 upload format included upload computer ID
4. Fixed some bug

### Older version

Because this repository be separated from
 [original extension repository](https://github.com/hangxingliu/vscode-coding-tracker),
 so older version information you could find in that repository CHANGELOG or commit information.

 [vdolgishev]: https://github.com/vdolgishev
