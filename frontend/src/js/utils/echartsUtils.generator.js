#!/usr/bin/env node

//@ts-check

const indent = '\t';
const optionsVariable = 'object';
const chainsVariable = 'chains';
const originalChainsVariable = 'originalChains';
const innerVariableName = '_value';

const src = __dirname + '/echartsUtils.src';
const target = __dirname + '/echartsUtils.js';

const blockBegin = removeBlanks('//#region !!! WARNING !!! Generated codes block');
const blockEnd = removeBlanks('//#endregion !!! WARNING !!! Generated codes block');

let { readFileSync, writeFileSync } = require('fs');

/** @type {{[funcName: string]: {param: string; codes: string; ifc: string[]}}} */
let codesMap = {};
main();

function main() {
	// load pseudo codes
	let pseudoCodes = readFileSync(src, 'utf8');

	// split to lines
	let lines = [], lastFuncName = '';
	pseudoCodes.split(/[\n\r]+/)
		// remove empty and comment lines
		.filter(l => l.trim())
		.filter(l => !l.startsWith('#'))
		.forEach(line => {
			let mt = line.match(/^\s*func\s+(.+?)\s*(=|$)/);
			if (mt) { lastFuncName = mt[1]; lines.push(line); }
			else {
				if (line.match(/^\s*\+=/)) {
					//append function body:
					lines.push(line.replace(/^\s*\+=/, `func ${lastFuncName} =`));
				} else {
					lines[lines.length - 1] += ' ' + line.trim() + ' '
				}
			}
		});
	// console.log(lines)

	scanLines(lines);

	let codes = combineCodes();
	let targetCodes = readFileSync(target, 'utf8');
	targetCodes = inject(targetCodes, codes);
	writeFileSync(target, targetCodes);
	console.log(`\n  success: generated ${Object.keys(codesMap).length} functions!\n`)
}

function inject(targetCodes = '', codes = '') {
	let lines = targetCodes.split('\n');
	let begin = -1, end = -1;
	lines.forEach((line, i) => {
		line = removeBlanks(line);
		if (line == blockBegin) return begin = i;
		if (line == blockEnd) return end = i;
	});
	if (begin < 0) return fatal('missing inject begin block');
	if (end < 0) return fatal('missing inject end block');
	if (begin >= end) return fatal('wrong order of begin block and end block');
	return lines.slice(0, begin + 1).join('\n') + '\n\n' + codes + '\n' + lines.slice(end).join('\n');
}

function combineCodes() {
	let funcNames = Object.keys(codesMap), lastFuncName = funcNames.length - 1;
	let result = [
		`let ${chainsVariable} = Object.assign({`,
		...funcNames.map((name, i) => name.trim() + (i != lastFuncName ? ',' : '')).map(prependIndent),
		`}, ${originalChainsVariable});`,
		`return ${chainsVariable};`
	].map(prependIndent).join('\n') + '\n\n';

	for (let funcName in codesMap) {
		let { param, codes } = codesMap[funcName];
		result += [
			`function ${funcName}(${param}) {`,
			...codes.split('\n').map(prependIndent),
			``,
			`${indent}return ${chainsVariable};`,
			`}`
		].map(prependIndent).join('\n') + '\n';
	}
	return result;
}

/** @param {string[]} lines */
function scanLines(lines) {
	for (let line of lines) {
		if (!line.startsWith('func')) continue;

		let mt = [];
		//eslint-disable-next-line no-unused-vars
		let _ = '', funcName = '', param = '', value = '', target = '', isPush = 'push';
		let splitValue = false;
		//func a = param => object => target
		mt = line.match(/^func\s+(\w+)\s+=\s*(.+?)\s*=>\s*(.+?)\s*(|push)?=>\s*\$(.+)$/)
		if (mt) {
			[_, funcName, param, value, isPush, target] = mt;
			splitValue = true;
		} else {
			// func a = param => target
			mt = line.match(/^func\s+(\w+)\s+=\s*(.+?)\s*(push)?=>\s*\$(.+)$/);
			if (mt) {
				[_, funcName, param, isPush, target] = mt;
				value = param;
				//constant value
				if (param.match(/\s*const\s+/)) {
					value = param.replace(/\s*const\s+/, '');
					param = '';
				}
			}
		}

		param = param.trim();
		if (funcName in codesMap) {
			let func = codesMap[funcName];
			func.param = (func.param ? (func.param + ', ') : '') + param;

			let codes = solve(target, isPush, value, splitValue, func.ifc);
			func.codes = combineFunctionBody(func.codes, codes);
		} else {
			let ifc = [];
			let codes = solve(target, isPush, value, splitValue, ifc);
			codesMap[funcName] = { param, codes, ifc};
		}

	}
}

function combineFunctionBody(body1 = '', body2 = '') {
	//remove same if condition
	let conditions = body1.split('\n')
		.map(line => line.match(/^\s*if\(!(.+?)\)/)).filter(v => v)
		.map(match => match[1]);
	let codes = body1 + '\n' +body2.split('\n')
		.map(line => {
			let mt = line.match(/^\s*if\(!(.+?)\)/)
			if (!mt) return line;
			if (conditions.indexOf(mt[1]) > 0) return;
			return line;
		}).filter(v => typeof v != 'undefined').join('\n');

	return codes;
}

/** @param {string} path */
function solve(path, isPush, value,
	splitValueToVariable = false, ifConditions = []) {

	let codes = '';
	let index = -1, lastIndex = 0, hasIf = false;
	if (splitValueToVariable) {
		codes += `let ${innerVariableName} = ${value};\n`;
		value = innerVariableName;
	}
	while ((index = path.indexOf('.', lastIndex)) >= 0) {
		let express = `${optionsVariable}.${path.slice(0, index)}`;
		// same if condition, just ignore it
		if (ifConditions.indexOf(express) < 0) {
			ifConditions.push(express);
			let expressValue = dotPath2Object(path.slice(index + 1), isPush, value);
			codes += hasIf ? 'else ' : '';
			codes += `if(!${express}) ${express} = ${expressValue};\n`;
			hasIf = true;
		}
		lastIndex = index + 1;
	}
	if (isPush) {
		codes += hasIf ? 'else ' : '';
		codes += `if(!${optionsVariable}.${path}) ` +
			`${optionsVariable}.${path} = [ ${value} ];\n` +
			`else ${optionsVariable}.${path}.push(${value});`;
	} else {
		codes += hasIf ? 'else ' : '';
		codes += `${optionsVariable}.${path} = ${value};`;
	}
	return codes;
}

/**
 * dotPath2Object('a.b.c', false, 100) => '{ a: { b: { c: 100 } } }' |
 * dotPath2Object('a.b.c', true, 100) => '{ a: { b: { c: [ 100 ] } } }'
 * @param {string} path
 * @param {boolean} isPush
 * @param {string} value
 */
function dotPath2Object(path, isPush, value) {
	let prefix = '{ ', suffix = ' }';
	let index = -1;
	while ((index = path.indexOf('.')) >= 0) {
		prefix += path.slice(0, index) + ': { ';
		suffix += ' }';
		path = path.slice(index + 1);
	}
	if (isPush)
		return prefix + path + ': [ ' + value + ' ]' + suffix;
	return prefix + (path == value ? '' : (path + ': '))
		+ value + suffix;
}

function prependIndent(line) { return `${indent}${line}`; }
function removeBlanks(str) { return str.replace(/\s/g, ''); }
/** @returns {never} */
function fatal(reason) { console.error(`\n  error: ${reason}\n`); process.exit(1); }
