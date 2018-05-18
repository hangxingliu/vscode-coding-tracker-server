# Token File Schema

## Token types

1. **uploadToken**: Token could be only used for **upload tracking data**.
2. **viewReportToken**: Token could be only used for **view report**.
3. **adminToken**: Token could be used for **upload, view report, modify server and everything**.
	- The token you passed by command line arguments `--token` is an admin token.

## Schema

JSON schema file: `../lib/schema/TokenFile.json`



## Example

Example 1

``` json
{
	"adminToken": [{
		"remark": "Admin token for leader",
		"token": "john-is-a-admin"
	}],
	"viewReportToken": [{
		"remark": "This is a token for view report",
		"token": "123456"
	}],
	"uploadToken": [{
		"remark": "Token for Mike",
		"token": "mike-has-a-cat",
		"computerId": "MikeComputer"
	}, {
		"remark": "Token for Nick with project A",
		"token": "nick-works-hard-in-project-A",
		"computerId": ["NickComputer", "NickLaptop"],
		"project": "projectA"
	}, {
		"remark": "Token for leader",
		"token": "a-token-can-upload-everything"
	}]
}
```

Example 2 (`public`: everyone could view report without token)

``` json
{
	"adminToken": [{
		"remark": "Token for myself (upload, view report and everything)",
		"token": "a-lazy-fox-jumps-over-a-brown"
	}],
	"viewReportToken": "public"
}
```
