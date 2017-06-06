#!/usr/bin/env node

// version 0.2.0

/// <reference path="../types/type.d.ts" />

const CONFIG_FILE = `${__dirname}/build.config.yaml`;

require('colors');

let fs = require('fs-extra'),
	path = require('path'),
	Options = require('commander'),
	glob = require('glob'),
	{ join: joinPath, dirname, basename } = require('path'),
	{ read: loadConfig } = require('./config_reader');

//>>>>>>>>> Processor
let ejs = require('ejs'),
	pug = require('pug'),	
	yaml = require('js-yaml'),
	browserify = require('browserify'),
	babel = require('babel-core'),
	sass = require('node-sass'),
	autoprefixer = require('autoprefixer'),
	cheerio = require('cheerio'),
	postcss = require('postcss'),
	htmlMinifier = require('html-minifier'),
	sourceMapConvert = require('convert-source-map');

let watch = require('watch');

//>>>>>>>>> Log functions
let start = name => {
	console.log(`# ${name} `.bold + `...`);
	return {
		done: () =>console.log(` ${name} done`.green),
		fail: err => console.error(` ${name} fail:`.red + `\n` + err)
	};
};

/**
 * @type {ConfigObject}
 */
let config = {};
/**
 * @type {ProcessorConfigObject}
 */
let processorConfig = {};

function main() {
	let opts = loadLaunchParameters(),
		exit = sign => process.exit(sign);

	config = loadConfig(CONFIG_FILE);
	processorConfig = config.processor;
	
	config.clean_dist && (cleanTarget() || exit(1));
	copyAssets() || exit(2);

	(processorConfig.ejs || processorConfig.ejs_template_tags) && setEjsFileLoader();
	
	processorConfig.ejs_variables && (loadEjsVariables() || exit(3));

	renderPages();
	handlerScripts();
	handlerStyles();

	opts.watch ? (console.log("# Watch mode is on".bold) + watchSources()) 	
		: console.log("  Tip: -w option could turn on the watch mode".grey);
}

function cleanTarget() {
	let log = start('clean target folder');
	try { fs.removeSync(config.dist); } catch (err) { return log.fail(err), false; }
	return log.done(), true;
}
function copyAssets() {
	let log = start(`copy asset files`);
	console.log(`asset folders: ${config.src_assets.map(v => v.name).join(', ')}`);
	try {
		config.src_assets.map(assets => fs.copySync(assets.from, assets.to));
	} catch (err) {
		return log.fail(err), false;
	}
	return log.done(), true;
}


//>>>>>>>>>>  EJS/Pug
function isPugFile(file) { return file.endsWith('.pug') || file.endsWith('.jade'); }
function setEjsFileLoader() {
	ejs.fileLoader = filePath => {
		if (isPugFile(filePath))
			return processorConfig.pug ?
				pug.compileFile(filePath, { basedir: config.src, filename: basename(filePath) })(ejsRenderVariables)
				: (console.error(`  error: The include file is a pug file. And you had not turn on the pug processor in config file!`.red, '\n',
					`    ${filePath}`.red), "");
		if (!fs.existsSync(filePath)) {
			filePath.endsWith('.ejs') && (filePath = filePath.replace(/\.ejs$/, '.html'));
			if (!fs.existsSync(filePath))
				return console.error(`  error: The include page is not existed!`.red, '\n',
					`    ${filePath}`.red), "";
		}
		return fs.readFileSync(filePath, 'utf8');
	};
}
let ejsRenderVariables = {};
function loadEjsVariables() {
	let obj = {}, log = start("load ejs variables");
	config.processor.ejs_variables.files.map(file => {
		try {
			let extend = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
			obj = Object.assign(obj, extend);
		} catch (err) { return log.fail(err), false; }
	});
	ejsRenderVariables = obj
	return true;
}
function renderPages() {
	let log = start('render pages'), count = 0;
	let files = globFiles(config.src_globs, { cwd: config.src });
	console.log(` pages count: ${files.length}`);
	files.map(name => {
		count++;
		let path = joinPath(config.src, name);
		if (isPugFile(name))
			processorConfig.pug ?
				callback(null, pug.compileFile(path, { basedir: config.src, filename: basename(path) })(ejsRenderVariables))
				: fs.readFile(path, 'utf8', callback);
		processorConfig.ejs ? ejs.renderFile(path, ejsRenderVariables, { root: config.src }, callback)	
			: fs.readFile(path, 'utf8', callback);
		function callback(err, content) {
			if (--count <= 0) log.done();
			if (err) return console.error(`  error: render page ${path}`.red, '\n', err.stack);
			if (processorConfig.ejs_template_tags.enable)
				content = renderEjsTemplateTags(content);
			if (processorConfig.html_minifier.enable)
				content = htmlMinifier.minify(content, processorConfig.html_minifier);
			writeFileWithMkdirsSync(`${config.dist}/${name}`, content);
		}
	});
}
const DEFAULT_EJS_TEMPLATE_TAG_SELECTOR = 'script[type="text/template"]';
function renderEjsTemplateTags(html) {
	let selector = processorConfig.ejs_template_tags.selector || DEFAULT_EJS_TEMPLATE_TAG_SELECTOR;
	console.log(`  selector: ${selector}`);
	let ejsTagCache = [],
		random = parseInt(Math.random() * 10000),
		mark = `ejstagcache_${random}_`,
		start = `${mark}start`, end = `${mark}end`,
		recover = new RegExp(`${start}(\\d*)${end}`,'g');
	try {
		let $ = cheerio.load(html);
		let $tags = $(selector);
		for (var i = 0; i < $tags.length; i++) {
			let $tag = $tags.eq(i), html = fs.readFileSync(`${config.src}/${$tag.attr('src')}`, 'utf8');
			if (processorConfig.html_minifier.enable)
				html = htmlMinifier.minify(html, processorConfig.html_minifier);
			$tag.html(html.replace(/<%([\s\S]*?)%>/g, match =>
				(ejsTagCache.push(match), `${start}${ejsTagCache.length - 1}${end}`)));
			$tag.removeAttr('src');
		}
		let newHTML = $.html({ decodeEntities: false }); //避免中文被编码
		return newHTML.replace(recover, (_, index) => ejsTagCache[index]);
	} catch (err) {
		console.error(`  error: render ejs template tags`.red, '\n', err.stack);
		return html;
	}
}

//>>>>>>>>>>> handlerScripts
function handlerScripts() {
	let log = start('handler scripts'), count = 0;
	let files = globFiles(config.src_script_globs, { cwd: config.src });
	files.map(name => {
		count++;
		browserifyAndBabel(joinPath(config.src, name), joinPath(config.dist, name),
			() => --count <= 0 && log.done())
	});
}
function browserifyAndBabel(from, to, then) {
	let scriptName = basename(to);
	//Extend .babelrc path
	let babelrcPath = '';
	if ((babelrcPath = processorConfig.babel.babelrc) &&
		(!path.isAbsolute(babelrcPath)) )
		babelrcPath = path.join(process.cwd(), babelrcPath);
	
	browserify([from], { debug: true, basedir: dirname(to) })
		.bundle((err, buffer) => {
			if (err) return console.error(`  error: browserify ${scriptName}`.red, "\n", err), then();	
			let codes = String(buffer);	
			let sourceMap = JSON.parse(sourceMapConvert.fromSource(codes).toJSON());	
			codes = sourceMapConvert.removeMapFileComments(codes);	
			try {
				let options = {
					sourceMaps: true,
					inputSourceMap: sourceMap
				};
				if (babelrcPath) options.extends = babelrcPath;
				let result = babel.transform(codes,  options);
				writeFileWithMkdirsSync(to, result.code + `\n//# sourceMappingURL=${scriptName}.map`);
				fs.writeFileSync(to + ".map", JSON.stringify(result.map, null, "\t"));
				return then();
			} catch (ex) {
				return console.error(`  error: babel transformFile ${scriptName}`.red, "\n", ex.stack), then();
			}
		});
}

//>>>>>>>>>>> handlerStyles
function handlerStyles() {
	let log = start('handler styles'), count = 0;
	let files = globFiles(config.src_styles_globs, { cwd: config.src });
	files.map(name =>{
		handlerSassLessAndCss(joinPath(config.src, name), joinPath(config.dist, name),
			() => --count <= 0 && log.done())
	});
}
function handlerSassLessAndCss(from, to, then) {
	if (from.endsWith('less')) throw new Error('TODO: support less');
	if (from.endsWith('.sass') || from.endsWith('.scss'))
		return handlerSass(from, to.replace(/\.s[ca]ss$/, '.css'), to.endsWith('.sass'), then);
	if (from.endsWith('.css'))
		return fs.copy(from, to, err => (err && console.error(`  error: copy css file: ${from}`)) + then());
	console.error(`  warning: unkown style file format: ${from}`);
	then();
}
function handlerSass(from, to, indented, then){	
	let styleName = basename(from);
	let SourcesmapTo = `${to}.map`;
	sass.render({
		file: from,
		indentedSyntax: false,
		outputStyle: 'compressed',
		outFile: to,
		sourceMap: SourcesmapTo,
	}, (err, result) => {
		if (err) return console.error(`  error: sass compile ${styleName}`.red, '\n', err), then();
		postcss([autoprefixer]).process(result.css, {
			from: styleName,
			to: styleName.replace(/\.scss$/, '.css'),
			map: { inline: false, prev: JSON.parse(result.map) }
		}).then(result => {
			let ws = result.warnings();
			if (ws.length > 0) {
				console.log(`warn: auto prefixer ${styleName}`.yellow.bold);
				ws.forEach(warn => console.log(`  ${warn.toString()}`.yellow));
			}
			writeFileWithMkdirsSync(to, result.css);
			fs.writeFileSync(SourcesmapTo, JSON.stringify(result.map, null, '\t'));
			then();
		}).catch(err =>
			console.error(`  error: auto prefixer ${styleName}`.red, '\n', err)), then();
		});
}		

function watchSources() {
	watch.unwatchTree(config.src);
	watch.watchTree(config.src, { interval: 0.5 }, function (path, curr, prev) {
		if (typeof path == "object" && prev === null && curr === null)
			return; //First time scan
		//TODO accurately execute handler
		console.log("watch >", path);
		if (path.endsWith('.yaml'))
			return loadEjsVariables() + renderPages();
		if (path.endsWith('.html') || path.endsWith('.ejs') || path.endsWith('.pug') || path.endsWith('.jade'))
			return renderPages();
		if (path.endsWith('.js')) 
			return handlerScripts();
		if (path.endsWith('.css') || path.endsWith('.sass') ||
			path.endsWith('.scss') || path.endsWith('.less')) 
			return handlerStyles();
	});
}

function loadLaunchParameters() {
	return Options.description(`Frontend build script`)
		.option('-w, --watch', 'turn on the watch mode')
		.parse(process.argv);
}

//>>>>>>>>>>>> Glob
function globFiles(globArray, options) {
	let allFiles = [];
	globArray.map(globStr => {
		try {
			allFiles = allFiles.concat(glob.sync(globStr, options));
		} catch (err) {
			console.error(`  error: invalid glob: ${glob}`);
		}
	});
	return allFiles;
}
//>>>>>>>>>>>>> Write file
function writeFileWithMkdirsSync(path, content) {
	let dir = dirname(path);
	fs.existsSync(dir) || fs.mkdirsSync(dir);
	fs.writeFileSync(path, content);
}

main();
