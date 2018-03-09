//@ts-check

const VERSION_KEY = 'coding-tracker-version';

let $welcomeInfo = $('#welcomeInfo'),
	currentServerVersion = '';

$welcomeInfo.find('.btn-hide-welcome').on('click', hideWelcome);
$('.btn-show-welcome').on('click', showWelcome);

init();

module.exports = { show: showWelcome };

function hideWelcome() { $welcomeInfo.slideUp(); localStorage.setItem(VERSION_KEY, currentServerVersion); }
function showWelcome() { $welcomeInfo.slideDown(); }
function init() {
	$.get('/', info => {
		currentServerVersion = info.serverVersion;
		$('#version [name]').each((i, e) => { $(e).text(info[$(e).attr('name')]); })
		localStorage.getItem(VERSION_KEY) != currentServerVersion && showWelcome();
	});
}
