#!/usr/bin/env bash

function help() {
	echo -e '';
	echo -e '  usage: npm run new-version -- <version>';
	echo -e '';
	echo -e '  description:';
	echo -e '';
	echo -e '    Add new git tag be named <version> and its description is "release <version>"';
	echo -e '    Before adding, this script will check is version information correct in project correct';
	echo -e '    For example: is version of package.json correct, is version add into CHANGELOG and README ...';
	echo -e '';
	echo -e '  example:';
	echo -e '';
	echo -e '    npm run new-version 0.5.1';
	echo -e '';
	exit 0;
}
function fatal() {
	echo -e "\n  error: $1\n";
	exit 1;
}

IS_HELP="$(echo $* | grep 'h')";
[[ -z "$1" ]] && help;
[[ -n "$IS_HELP" ]] && help;

[[ -z `which jq` ]] && fatal "command \"jq\" is not existed! (sudo apt install jq)";

VERSION="$1";
VERSION_FILTERED=`echo $VERSION | awk '/^[0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]?$/'`;
[[ -z "$VERSION_FILTERED" ]] && fatal "invalid version parameter: \"${VERSION}\"";

echo "[~] new version: \"$VERSION_FILTERED\"";

# =========================
#   package.json
# =========================
[[ ! -f "package.json" ]] && fatal "package.json is missing!";
VERSION_IN_PACKAGE=`jq '.version' < package.json`;
[[ -z `echo $VERSION_IN_PACKAGE | awk /^\"${VERSION}\"$/` ]] &&
	fatal "version in argument(\"$VERSION\") is not equals in package.json ($VERSION_IN_PACKAGE)";

echo "[~] version same with package.json";


# =========================
#   package-lock.json
# =========================
[[ ! -f "package-lock.json" ]] && fatal "package-lock.json is missing!";
VERSION_IN_PACKAGE_LOCK=`jq '.version' < package-lock.json`;
[[ -z `echo $VERSION_IN_PACKAGE_LOCK | awk /^\"${VERSION}\"$/` ]] &&
	fatal "version in argument(\"$VERSION\") is not equals in package-lock.json ($VERSION_IN_PACKAGE_LOCK)";

echo "[~] version same with package-lock.json";

# =========================
#   CHANGELOG.md
#     match "### version (yyyy/mm/dd)" in CHANGELOG.md
# =========================
[[ ! -f "CHANGELOG.md" ]] && fatal "CHANGELOG.md is missing!";
VERSION_IN_CHANGELOG=`awk '/^###./' CHANGELOG.md | grep $VERSION | grep $(date "+20%y/%m/%d")`;
[[ -z "$VERSION_IN_CHANGELOG" ]] &&
	fatal "there has not any version information about \"$VERSION ($(date '+20%y/%m/%d'))\" in CHANGELOG.md";

echo "[~] version has write into CHANGELOG.md";


# =========================
#   README.md
#     match "### version (yyyy/mm/dd)" in README.md
# =========================
[[ ! -f "README.md" ]] && fatal "README.md is missing!";
VERSION_IN_README=`awk '/^###./' README.md | grep $VERSION | grep $(date "+20%y/%m/%d")`;
[[ -z "$VERSION_IN_README" ]] &&
	fatal "there has not any version information about \"$VERSION ($(date '+20%y/%m/%d'))\" in README.md";

echo "[~] version has write into README.md";

# =========================
#   app.js
# =========================
[[ ! -f "app.js" ]] && fatal "app.js is missing!";
VERSION_IN_JS=`awk '/Version:/' app.js | grep "$VERSION"`;
[[ -z "$VERSION_IN_JS" ]] &&
	fatal "there has not any \"Version: $VERSION\" string in app.js";

echo "[~] version has write into app.js";

# =========================
#   git add tag
# =========================
read -r -p "Add a git tag \"${VERSION}\" [y/N] > " CONFIRM
case "$CONFIRM" in
    [yY][eE][sS]|[yY]) ;;
    *) exit 0;;
esac

echo "[.] adding tag into git ..."
git tag -a "${VERSION}" -s -m "release ${VERSION}"
[[ "$?" == "0" ]] || fatal "add tag failed!";

echo -e "\n[+] add tag ${VERSION} into git success! (next step: \"npm publish\" and \"vsce publish\")\n"
