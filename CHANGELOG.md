## CHANGELOG

## 0.3.0

1. Added two API(`ajax/kill` and `ajax/test`)
2. Added unit test (And automatic test before commit) and eslint support
	- Install git client test before commit hook by using `npm install-git-hooks`
3. Supported 403, 404 and 500 HTTP status code to special response
4. Removed low version upload data support.
	- although there are not support for low version upload data anytime. 
	- but uploading an old version data will get a error JSON object in this version. 
5. Show is this server run under local mode in welcome JSON information.

## 0.2.0

1. **Added beta version report web page** and analyze cli tools
2. Added local mode, random token and public report options
2. Allowed api/upload token passing by query string, such as `/ajax/report/last24hs?token=${YOUR_TOKEN}`
3. Added more debug output in debug mode

## 0.1.3

1. Upgraded storage database file version from 2.0 to 3.0
2. Added two useful utilities (cleaner and updater)
3. Supported 3.0 upload format included upload computer ID
4. Fixed some bug

## Older version

Because this repository be separated from
 [original extension repository](https://github.com/hangxingliu/vscode-coding-tracker),
 so older version information you could find in that repository CHANGELOG or commit information.