//@ts-check

/**
 * @param {JQuery} $form
 * @return {Object}
 */
function encode($form) {
	let result = {};
	$form.find('[name]').each((i, ele) => {
		let $input = $(ele),
			v = hasValAttr($input) ? $input.val() : $input.text();
		if ($input.data('ignore')) return;
		result[$input.attr('name')] = v;
	});
	return result;
}

/**
 * @param {JQuery} $form 
 * @param {Object} data 
 */
function fill($form, data) {
	data = data || {};
	$form.find('[name]').each((i, ele) => {
		let $input = $(ele),
			key = $input.attr('name'),
			v = (data[key] || '');
		if ($input.data('ignore')) return;
		hasValAttr($input) ? $input.val(v) : $input.text(v);
	});
}

/**
 * @param {JQuery} $dom 
 */
function isValueTag($dom) { return hasValAttr($dom); }

/**
 * @param {JQuery} $dom 
 */
function hasValAttr($dom) { 
	let tagName = $dom.prop('tagName');
	return tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT'; 
}

module.exports = {
	encode, fill, isValueTag
};