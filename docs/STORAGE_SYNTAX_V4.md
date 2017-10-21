# Storage Syntax Version 4

This document be updated on `2017/10/22`

## Summary

- The database that use in vscode coding tracker is pure text file
- The text defining lines are used for compressing database file
- The text defining lines are not existent by default. They are created by compress script. 
- Version 3 is compatible in version 4

## File Name

The extension name of database file is `.db`   
And it looks like: `YYMDD.db`   
`YYMDD` means that this database file included record uploaded on day DD/MM/YYYY

`M` is a character in (1,2,3,4,5,6,7,8,9,A,B,C)

## Line Types

There are four line types in database file:

1. Version line
2. Comment line
3. Text defining line
4. Tracking record line

### 1. Version line

It always in the front of database file (first line).   
It only include a version string.   
In this version. The version line is:

```
4.0
```

### 2. Comment line

The line starts with `#`

### 3. Text defining line

It is a line starts with `d `.  
It looks like: (define a string `javascript` as `$1`)

```
d 1 javascript
```

Then defined string can be used in tracking record line, for example:
```
0 1504976149711 1000 $1 testFile testProj testComputer %3A%3A 10 200 0 0
# The meaning of $1 in last line is javascript 
```

### Tracking record line

The line include 12 columns or 7 columns(version 3.0)   
And all string should be escape by `encodeURIComponent` (Exclude `$` in defined string variable and `:` in vcs field)

Format: 

```
type time long lang file proj pcid vcs line char reserved1 reserved2
```

Description:

- type: `int`  record type:  0:open(default) | 2:code | 1:look(reserved) 
- time: `int`  record happened timestamp
- long: `int`  record duration times (unit:second)
- lang: `string` language
- file: `string` file path (relative workspace root path)
- proj: `string` project path(workspace)
- pcid: `string` computer id
- vcs: `string` vcs(version control system) information
	- valid vcs info:
		1. `::`: no vcs
		2: `vcsName::branchName`: using vcs which be called `vcsName`. and root path in vcs is same with workspace root path. current branch is `branchName`
		3: `vcsName:vcsRootPath:branchName`: using vcs which be called `vcsName`. and root path in vcs is `vcsRootPath`. current branch is `branchName` 
- line: `int` line counts
- char: `int` character counts
- reserved1(**optional**): `string` reserved field 1, default value: 0
- reserved2(**optional**): `string` reserved field 2, default value: 0

## Valid Example Database File

```
3.0
0 1488560825949 294515 javascript mdjs.js %2Fpath%2Fto%2project ubuntu
2 1488561059090 5000 javascript mdjs.js %2Fpath%2Fto%2project ubuntu
0 1488561846988 60918 css mdcss.css %2Fpath%2Fto%2project ubuntu
0 1488561918367 130119 javascript mdjs.js %2Fpath%2Fto%2project ubuntu
2 1488561923500 45000 javascript mdjs.js %2Fpath%2Fto%2project ubuntu
0 1488562174377 7514 html demo.html %2Fpath%2Fto%2project ubuntu
```

```
4.0
0 1488560825949 294515 javascript mdjs.js %2Fpath%2Fto%2project ubuntu git::master  40 0 0 0
2 1488561059090 5000 javascript mdjs.js %2Fpath%2Fto%2project ubuntu git::master 40 0 0 0
0 1488561846988 60918 css mdcss.css %2Fpath%2Fto%2project ubuntu git::master 100 0 0 0
0 1488561918367 130119 javascript mdjs.js %2Fpath%2Fto%2project ubuntu git::master 50 0 0 0
2 1488561923500 45000 javascript mdjs.js %2Fpath%2Fto%2project ubuntu git::master 50 0 0 0
0 1488562174377 7514 html demo.html %2Fpath%2Fto%2project ubuntu git::gh-pages 100 0 0 0
```

```
4.0
# Define
d 1 %2Fpath%2Fto%2project
d 2 git::master
d 3 ubuntu
d 4 javascript
d 5 mdjs.js
# Record
0 1488560825949 294515 $4 $5 $1 $3 $2  40 0 0 0
2 1488561059090 5000 $4 $5 $1 $3 $2 40 0 0 0
0 1488561846988 60918 css mdcss.css $1 $3 $2 100 0 0 0
0 1488561918367 130119 $4 $5 $1 $3 $2 50 0 0 0
2 1488561923500 45000 $4 $5 $1 $3 $2 50 0 0 0
0 1488562174377 7514 html demo.html $1 $3 git::gh-pages 100 0 0 0
```

