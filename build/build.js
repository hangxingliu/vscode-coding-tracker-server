#!/usr/bin/env node

// version 0.3.0

//@ts-check
/// <reference path="../types/type.d.ts" />

const CONFIG_FILE = `${__dirname}/build.config.yaml`;

require('colors');

let fs = require('fs-extra'),
	Options = require('commander'),
	glob = require('glob'),
	yaml = require('js-yaml'),	
	postcss = require('postcss'),
	browserify = require('browserify'),
	sourceMapConvert = require('convert-source-map'),
	{ join: joinPath, dirname, basename, isAbsolute } = require('path'),
	Async = require('async'),
	{ read: loadConfig } = require('./config_reader');

//>>>>>>>>> Processor
let ejs = null, //require('ejs'),
	pug = null, //require('pug'),	
	babel = null, //require('babel-core'),
	sass = null, //require('node-sass'),
	autoprefixer = null, //require('autoprefixer'),
	cheerio = null, //require('cheerio'),
	htmlMinifier = null, //require('html-minifier'),
	browserSync = null, // require('browser-sync'),
	watch = null //require('watch');
;
function loadProcessors(opts) {
	let c = processorConfig;
	if (c.sass.enable) sass = require('node-sass');
	if (c.less.enable) console.log('LESS is TODO...');
	if (c.autoprefixer.enable) autoprefixer = require('autoprefixer');
	if (c.browser_sync.enable && opts.watch) browserSync = require('browser-sync');
	if (c.babel.enable) babel = require('babel-core');
	if (c.html_minifier.enable) htmlMinifier = require('html-minifier');
	if (c.ejs.enable) ejs = require('ejs');
	if (c.ejs_template_tags.enable) cheerio = require('cheerio');
	if (c.pug.enable) pug = require('pug');

	if (opts.watch) watch = require('watch');
}


//>>>>>>>>> Log functions
let start = name => {
	console.log(`# ${name} `.bold + `...`);
	return {
		done: () =>console.log(` ${name} done`.green),
		fail: (err, msg = "") => console.error(` ${name} fail: ${msg}`.red + `\n`, err && (err.stack || err))
	};
};

/**
 * @type {ConfigObject}
 */
let config = null;
/**
 * @type {ProcessorConfigObject}
 */
let processorConfig = null;

function main() {
	let opts = loadLaunchParameters(),
		exit = sign => process.exit(sign);

	config = loadConfig(CONFIG_FILE);
	processorConfig = config.processor;
	//加载相应的插件
	loadProcessors(opts);

	config.clean_dist && (cleanTarget() || exit(1));
	copyAssets() || exit(2);

	(processorConfig.ejs || processorConfig.ejs_template_tags) && setEjsFileLoader();
	
	processorConfig.ejs_variables && (loadEjsVariables() || exit(3));

	renderPages();
	handlerScripts();
	handlerStyles();

	//opts.watch 是启动参数 watch
	//@ts-ignore
	opts.watch ? (console.log("# Watch mode is on".bold), watchSources()) 	
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
function getPugOptions(filePath) { return { basedir: config.src, filename: basename(filePath) }; }
function setEjsFileLoader() {
	ejs.fileLoader = filePath => {
		if (isPugFile(filePath))
			return processorConfig.pug ?
				pug.compileFile(filePath, getPugOptions(filePath))(ejsRenderVariables)
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
function renderPages(callback) {
	let log = start('render pages');
	let files = globFiles(config.src_globs, { cwd: config.src });
	console.log(` pages count: ${files.length}`);
	Async.map(files, (name, callback) => {
		let path = joinPath(config.src, name);
		if (isPugFile(name) && processorConfig.pug)
			return render(null, pug.compileFile(path, getPugOptions(path))(ejsRenderVariables));
		if (processorConfig.ejs)
			return ejs.renderFile(path, ejsRenderVariables, { root: config.src }, render);
		readFile(path, render);

		function render(err, content) {
			if (err) return callback({ path, err });
			if (processorConfig.ejs_template_tags.enable)
				content = renderEjsTemplateTags(content);
			if (processorConfig.html_minifier.enable) {
				try { content = htmlMinifier.minify(content, processorConfig.html_minifier); }
				catch (err) { return callback({ path, err });}
			}
			writeFileWithMkdirsSync(`${config.dist}/${name}`, content);
			callback(null, true);
		}
	}, err => {
		err ? log.fail(err.err, err.path) : log.done();
		callback && callback(err);
	});
}
const DEFAULT_EJS_TEMPLATE_TAG_SELECTOR = 'script[type="text/template"]';
function renderEjsTemplateTags(html) {
	let selector = processorConfig.ejs_template_tags.selector || DEFAULT_EJS_TEMPLATE_TAG_SELECTOR;
	// console.log(`  selector: ${selector}`);
	let ejsTagCache = [],	
		random = parseInt(String(Math.random() * 10000)),
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
function handlerScripts(callback) {
	let log = start('handler scripts');
	let { src, dist } = config,	
		files = globFiles(config.src_script_globs, { cwd: src });
	Async.map(files, (name, cb) => browserifyAndBabel(joinPath(src, name), joinPath(dist, name), cb),
		() => (log.done(), callback && callback()));
}
function browserifyAndBabel(from, to, then) {
	let scriptName = basename(to);
	//Extend .babelrc path
	let babelrcPath = '';
	if ((babelrcPath = processorConfig.babel.babelrc) &&
		(!isAbsolute(babelrcPath)) )
		babelrcPath = joinPath(process.cwd(), babelrcPath);
	
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
function handlerStyles(callback) {
	let log = start('handler styles');
	let { src, dist } = config,
		files = globFiles(config.src_styles_globs, { cwd: src });
	Async.map(files, (name, cb) => handlerSassLessAndCss(joinPath(src, name), joinPath(dist, name), cb),	
		() => (log.done(), callback && callback()));
}
function handlerSassLessAndCss(from, to, then) {
	if (from.endsWith('less')) throw new Error('TODO: support less');
	if (from.endsWith('.sass') || from.endsWith('.scss'))
		return handlerSass(from, to.replace(/\.s[ca]ss$/, '.css'), to.endsWith('.sass'), then);
	if (from.endsWith('.css'))
		return fs.copy(from, to, err => (err && console.error(`  error: copy css file: ${from}`)) + then());
	console.error(`  warning: unknown style file format: ${from}`);
	then();
}
function handlerSass(from, to, indented, then){	
	let styleName = basename(from);
	let SourcesMapTo = `${to}.map`;
	sass.render({
		file: from,
		indentedSyntax: false,
		outputStyle: 'compressed',
		outFile: to,
		sourceMap: SourcesMapTo,
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
			fs.writeFileSync(SourcesMapTo, JSON.stringify(result.map, null, '\t'));
			then();
		}).catch(err => {
			console.error(`  error: auto prefixer ${styleName}`.red, '\n', err);
			then();
		})
	});
}		

function watchSources() {
	let bs = null;
	if (processorConfig.browser_sync.enable){
		bs = browserSync.create();
		bs.init(processorConfig.browser_sync);
	}	
	watch.unwatchTree(config.src);
	watch.watchTree(config.src, { interval: 0.5 }, function (path, curr, prev) {
		if (typeof path == "object" && prev === null && curr === null)
			return; //First time scan
		//TODO accurately execute handler
		console.log("watch >", path);
		if (path.endsWith('.yaml'))
			return loadEjsVariables(), renderPages(reloadHTML);
		if (path.endsWith('.html') || path.endsWith('.ejs') || path.endsWith('.pug') || path.endsWith('.jade'))
			return renderPages(reloadHTML);
		if (path.endsWith('.js')) 
			return handlerScripts(reloadJS);
		if (path.endsWith('.css') || path.endsWith('.sass') ||
			path.endsWith('.scss') || path.endsWith('.less')) 
			return handlerStyles(reloadCSS);
	});
	function reloadHTML() { bs && bs.reload('*.html') }
	function reloadJS() { bs && bs.reload('*.js') }
	function reloadCSS() { bs && bs.reload('*.css') }
	
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
//>>>>>>>>>>>>> ReadFile
function readFile(path, cb = null) { return cb ? fs.readFile(path, 'utf8', cb) : fs.readFileSync(path, 'utf8'); }
//>>>>>>>>>>>>> Write file
function writeFileWithMkdirsSync(path, content) {
	let dir = dirname(path);
	fs.existsSync(dir) || fs.mkdirsSync(dir);
	fs.writeFileSync(path, content);
}

main();
