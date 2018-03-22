//@ts-check

const click = 'click';

let utils = require('../utils/utils'),
	dateTime = require('../utils/datetime');

let $dialog = $('#dlgAssociate'),
	$containerAssociation = $('#containerAssociation'),
	$btnNewAssociation = $('#btnNewAssociation'),
	$btnApply = $('#btnApplyAssociation'),
	$msgAssociationErr = $('#msgAssociationErr');

module.exports = { showAssociateDialog };

function onClickRemove() {
	$(this).parents('.row').remove();
}

/**
 * @param {{name: string; watching: number; coding: number}[]} projects
 * @param {Association[]} oldAssociation
 * @param {(ass: Association[]) => any} callback
 */
function showAssociateDialog(projects, oldAssociation, callback) {
	const html = utils.escapeHtml;

	/** @type {string[]} */
	let namesInAssociation = [].concat(...oldAssociation.map(a => a.projects));
	let otherPaths = [], otherNames = [];
	for (let i in namesInAssociation) {
		let name = namesInAssociation[i];
		if (!name) continue;
		let index = projects.findIndex(function (p) { return p.name == name });
		if(index < 0) {
			otherPaths.push(name);
			otherNames.push(utils.getShortProjectName(decodeURIComponent(name)));
		}
	}

	let projectNames = projects.map(p => utils.getShortProjectName(decodeURIComponent(p.name)));
	let projectCosts = projects.map(p => dateTime.getReadableTime(p.watching));

	// reset association container
	$containerAssociation[0].innerHTML = '';
	for (let i in oldAssociation) {
		let ass = oldAssociation[i];
		$containerAssociation.append(generateAssociateView(ass))
			.find('.btn-del').off(click).on(click, onClickRemove);
	}

	$msgAssociationErr.hide();
	$dialog.modal();

	$btnNewAssociation.off(click).on(click, () => {
		$containerAssociation.append(generateAssociateView())
			.find('.btn-del').off(click).on(click, onClickRemove);
	});

	$btnApply.off(click).on(click, () => {
		/** @type {Association[]} */
		let associations = [];
		try {
			let allProjectPathMap = {};
			let cards = $containerAssociation[0].querySelectorAll('.card');
			for (let i = 0, i2 = cards.length; i < i2; i++) {
				let card = cards[i];
				let name = String(card.querySelector('.input-name')['value']);
				if (!name) throw new Error(`Empty name of association`);
				if (name.indexOf('}') >= 0)
					throw new Error(`Name could not contains character '}' because there has defect in echarts`);

				let projectSelects = card.querySelectorAll('select');
				let projects = [];
				for (let j = 0, j2 = projectSelects.length; j < j2; j++) {
					let v = projectSelects[j].value;
					projects.push(v);
					if (v in allProjectPathMap)
						throw new Error(`Repeated project: "${decodeURIComponent(v)}"`);
					allProjectPathMap[v] = true;
				}
				if (projects.length < 2)
					throw new Error(`An association has two projects at least`);

				associations.push({ name, projects });
			}
		} catch (e) {
			$msgAssociationErr.text('message' in e ? e.message : e).show();
			return;
		}
		callback(associations);
		$dialog.modal('hide');
	});

	/** @param {Association} [association] */
	function generateAssociateView(association = { name: '', projects: [] }) {
		return `<div class="row mt-1">
			<div class="col-12">
				<div class="card">
					<div class="card-body">
						<div class="d-flex justify-content-between">
							<h5 class="card-subtitle text-muted">Association</h5>
							<h5 style="cursor: pointer" class="text-danger ion-trash-b btn-del"></h5>
						</div>
						<div class="mt-2 d-sm-none">Name:</div>
						<div class="input-group mb-3">
							<span class="input-group-addon d-none d-sm-block" >Name</span>
							<input class="form-control input-name" type="text"
								value="${html(association.name)}" />
						</div>
						<div class="d-sm-none">Projects:</div>
						${[1, 2, 3].map(i =>
							generateSelect("Project " + i, i - 1, association.projects[i - 1])).join('')}
					</div>
				</div>
			</div>
		</div>`;
	}

	/**
	 * @param {string} prepend
	 * @param {number} dataId
	 * @param {string} selectedProject
	 */
	function generateSelect(prepend, dataId, selectedProject) {
		if (!selectedProject) selectedProject = "";

		/** @type {(label: string, value: string) => string} */
		let option = (label, value) =>
			`<option ${selectedProject == value ? "selected" : ""} value="${html(value)}">${html(label)}</option>`;

		return `<div class="input-group my-1">
			<span class="input-group-addon d-none d-sm-block">${prepend}</span>
			<select class="form-control" data-id="${dataId}">
				${option("None", "")}
				${otherNames.map((name, i) => option(name + " (--)", otherPaths[i]))}
				${projectNames.map((name, i) => option(name + " (" + projectCosts[i] + ")", projects[i].name))}
			</select>
		</div>`;
	}
}
