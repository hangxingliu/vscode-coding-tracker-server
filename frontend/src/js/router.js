/// <reference path="./index.d.ts" />

/** @type {IRoutesMap} */
let routesMap = {};
/** @type {IRoute} */
let activeRoute = null

let Router = {
	init,
	isRouteExist,
	to,
	parseRoutePath,
	installRouteLinks,
	followRouterInURL
};
module.exports = Router;

/**
 * @param {IRoute[]} routes
 */
function init(routes) {
	routesMap = {};
	routes.forEach(route => routesMap[route.name] = route);

	installRouteLinks();
	return Router;
}

function isRouteExist(name) { return name in routesMap; }

function installRouteLinks() {
	$('[data-route]').off('click').on('click', function () {
		let $this = $(this),
			path = $this.attr('data-route');
		let [route, params] = parseRoutePath(path);
		to(route, params);
	}).attr('href', 'javascript:;');
}

/**
 * @param {string} path
 * @returns {[string, string]} 0: name; 1: params
 */
function parseRoutePath(path) {
	path = path.trim();

	let index = path.indexOf('/');
	if (index < 0) return [path, ''];
	return [path.slice(0, index), path.slice(index + 1)];
}

function followRouterInURL(defaultRoute) {
	let [defaultName, defaultParams] = parseRoutePath(defaultRoute);
	let hash = location.hash;
	if (!hash)
		return to(defaultName, defaultParams);
	let [name, params] = parseRoutePath(hash.slice(1));
	if (!isRouteExist(name))
		return to(defaultName, defaultParams);
	return to(name, params);
}

/**
 * @param {string} name
 * @param {string} params
 */
function to(name, params) {
	if (!isRouteExist(name))
		return console.error(`Route ${name} is not existed!`);

	location.hash = params ? `#${name}/${params}` : `#${name}`;

	if (activeRoute) {
		if (activeRoute.name == name) {
			console.log(`Updating route ${name}`);
			return activeRoute.update && activeRoute.update(params);
		}
		console.log(`Route from ${activeRoute.name} to ${name}`);
		activeRoute.stop && activeRoute.stop();
	} else {
		console.log(`Route ${name}`);
	}

	$('[data-route]').removeClass('active')
		.filter(`[data-route="${name}"]`).addClass('active');
	activeRoute = routesMap[name];
	activeRoute.start(params);
}

