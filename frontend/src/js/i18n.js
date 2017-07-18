//@ts-check

const STORAGE_NAME = 'coding-tracker-i18n';
const HAS_LS = require('./utils').hasLocalStorage();
let languages = {
	'zh-cn': require('./i18n/zh-cn'),
	'zh-tw': require('./i18n/zh-tw'),
	'ru': require('./i18n/ru')
}, language = '';

function storageGet(key) { return HAS_LS ? localStorage.getItem(key) : null; }
function storageSet(key, value) { HAS_LS && localStorage.setItem(key, value); }

function update() {
	language = storageGet(STORAGE_NAME) || '';
	if (language in languages) {
		let data = languages[language];
		let $items = $('[data-i18n]');
		let english = 'en' in languages ? null : {};
		for (let i = 0, i1 = $items.length; i < i1; i++){
			let $item = $items.eq(i),
				name = $item.data('i18n');
			if (name in data) {
				//get default english text
				english && (english[name] = $item.text());
				$item.text(data[name]);
			}
		}
		english && (languages.en = english);
	}
}

function setLanguage(lang) {
	storageSet(STORAGE_NAME, lang);
	update();
}

function get(key) {
	let data = languages[language]
	return data && data[key];
}

module.exports = {
	update,
	setLanguage,
	get,
	get language() { return language }
};