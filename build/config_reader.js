//@ts-check
/// <reference path="../types/type.d.ts" />

(function () {
	let yaml = require('js-yaml'),
		{ readFileSync } = require('fs-extra'),
		{ join: joinPath } = require('path');
	
	/**
	 * @param {string} filePath
	 * @returns {ConfigObject}
	 */
	function reader(filePath) {
		let configStr = readFileSync(filePath, 'utf8'),
			config = yaml.safeLoad(configStr);
		
		if (!isString(config.name))
			throw incompleteError(`config.name`, 'String');
		
		if (!isObject(config.src))
			throw incompleteError(`config.src`, 'Object');
		if (!isString(config.src.base))
			throw incompleteError(`config.src.base`, 'String');
		
		if (!isStringOrStringArray(config.src.scripts))
			throw incompleteError(`config.src.scripts`, 'String/String[]');
		if (!isStringOrStringArray(config.src.styles))
			throw incompleteError(`config.src.styles`, 'String/String[]');
		
		if (!isStringOrStringArray(config.src.assets))
			throw incompleteError(`config.src.assets`, 'String/String[]');
		if (!isStringOrStringArray(config.src.pages))
			throw incompleteError(`config.src.pages`, 'String/String[]');

		if (!isObject(config.dist))
			throw incompleteError(`config.dist`, 'Object');
		if (!isString(config.dist.base))
			throw incompleteError(`config.dist.base`, 'String');
		if (!isBoolean(config.dist.clean))
			throw incompleteError(`config.dist.clean`, 'Boolean');
		
		let basePath = process.cwd(),
			distBasePath = joinPath(basePath, config.dist.base),
			srcBasePath = joinPath(basePath, config.src.base);

		/**
		 * @type {ConfigObject}
		 */
		//@ts-ignore
		let result = {};

		result.name = config.name;
		result.src = srcBasePath;
		result.dist = distBasePath;
		result.clean_dist = !!config.dist.clean;

		let assetsConfig = config.src.assets;
		result.src_assets = (isString(assetsConfig) ? [assetsConfig] : assetsConfig)
			.map(path => ({ name: path, from: joinPath(srcBasePath, path), to: joinPath(distBasePath, path) }));
		
		let pagesConfig = config.src.pages;
		result.src_globs = (isString(pagesConfig) ? [pagesConfig] : pagesConfig);
		
		let scriptsConfig = config.src.scripts;
		result.src_script_globs = (isString(scriptsConfig) ? [scriptsConfig] : scriptsConfig);
		let stylesConfig = config.src.styles;
		result.src_styles_globs = (isString(stylesConfig) ? [stylesConfig] : stylesConfig);
		
		/**
		 * @type {ProcessorConfigObject}
		 */
		//@ts-ignore
		let processor = {};
		let configProcessor = config.processor || {};
		
		processor.sass = { enable: !!configProcessor.sass };
		processor.less = { enable: !!configProcessor.less };
		processor.autoprefixer = { enable: !!configProcessor.autoprefixer };
		processor.ejs = { enable: !!configProcessor.ejs };
		processor.pug = { enable: !!configProcessor.pug };

		processor.html_minifier = isObjectHasEnableField(configProcessor.html_minifier)
			? configProcessor.html_minifier
			: { enable: !!configProcessor.html_minifier };
		processor.babel = isObjectHasEnableField(configProcessor.babel)
			? configProcessor.babel
			:{ enable: !!configProcessor.babel };
		processor.ejs_variables =
			isObjectHasEnableField(configProcessor.ejs_variables)
				? configProcessor.ejs_variables
				: { enable: !!configProcessor.ejs_variables };
		processor.ejs_template_tags = isObjectHasEnableField(configProcessor.ejs_template_tags)
			? configProcessor.ejs_template_tags
			: { enable: !!configProcessor.ejs_template_tags };
			
		result.processor = processor;
		return result;
	
	}
	
	function isObject(obj) { return obj && typeof obj == 'object'; }
	function isString(obj) { return typeof obj == 'string'; }
	function isBoolean(obj) { return typeof obj == 'boolean'; }
	function isStringArray(obj) { 
		if (!Array.isArray(obj)) return false;
		for (let it of obj) if (typeof it != 'string') return false;
		return true;
	}
	function isStringOrStringArray(obj) { return isString(obj) || isStringArray(obj); }
	function incompleteError(name, type) {
		return new Error(`Config is incomplete. "${name}" is not a ${type}!`);
	}
	function isObjectHasEnableField(obj) { return isObject(obj) && isBoolean(obj.enable); }
	
	module.exports = { read: reader };
})();