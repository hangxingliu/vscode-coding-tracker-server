//@ts-check

let utils = require('../utils/utils'),
	csv = require('../utils/csv'),
	download = require('downloadjs');

let $dialog = $('#dlgExportCSV'),
	$fileName = $('#txtExportCSVName'),
	$count = $('#txtExportRowNum'),
	$table = $('#tableExportPreview'),
	$btnOK = $('#btnExportDownload');

module.exports = { showExportDialog, getFileNameFromFilter };

/**
 * @param {string} defaultFileName
 * @param {string[]} headers
 * @param {string[][]} body
 */
function showExportDialog(defaultFileName, headers, body) {
	const html = utils.escapeHtml;
	const PREVIEW_ROWS = 5;

	let rowCount = body.length;
	let previewBody = body.slice(0, PREVIEW_ROWS);

	let tableHTML = `
		<thead>
			<tr>${headers.map((header,i) =>
				`<th>
					<input class="check-column" type="checkbox" id="exportColSel${i}" checked data-col="${i}">
					<label for="exportColSel${i}" class="mb-0">${header}</label>
				</th>`).join('')}</tr>
		</thead>
		<tbody>
			${previewBody.map(row => `<tr>${row.map(col => `<td>${html(col)}</td>`).join('')}</tr>`).join('')}
			${rowCount > PREVIEW_ROWS
				? ('<tr>' + headers.map(() => '<td class="text-muted">...</td>').join('') + '</tr>')
				: ''}
		</tbody>`;

	$fileName.val(defaultFileName);
	$count.text(rowCount);
	$table.html(tableHTML);
	$dialog.modal();

	$btnOK.off('click').on('click', () => {
		let checkedColumns = $dialog.find('.check-column:checked');

		let columns = {};
		checkedColumns.each((i, e) => { columns[$(e).data('col')] = true });
		if (Object.keys(columns).length == 0) return;

		let targetHeaders = headers.filter((h, i) => i in columns),
			targetBody = body.map(row => row.filter((col, i) => i in columns));

		let csvContent = csv.csvFromArray(targetHeaders, targetBody);
		download(csvContent, String($fileName.val()) + '.csv');

		$dialog.modal('hide');
	});
}

function getFileNameFromFilter() {
	let text = String($('.current-range').eq(0).text());
	return text.replace(/\W/g, '-').toLowerCase();
}
