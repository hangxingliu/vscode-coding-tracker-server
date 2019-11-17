module.exports = {
	formatTime: (hours = 0, minutes = 0, seconds = 0) => {
		let result = [];
		if (hours > 0) result.push(hours == 1 ? '1 h' : `${hours}hs`);
		if (minutes > 0) result.push(minutes == 1 ? '1 min' : `${minutes} mins`);
		if (seconds > 0) result.push(seconds == 1 ? '1 sec' : `${seconds} secs`);
		if (result.length == 0)
			return `0`;
		return result.join(' ');
	},
	daysOfTheWeek: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
	title_summary: 'Activité sur VSCode',
	title_24hs: '24 dernières heures',
	date_24_hs: '24 heures',
	date_from: ' depuis ',
	title_projects: 'Projets ',
	title_projects_tip: ' (cliquez sur un élément du graphique pour plus de détails)',
	title_languages: 'Langages',
	title_files: 'Fichiers',
	title_computers: 'Ordinateurs',
	title_welcome: 'VSCode Coding Tracker',
	title_vcs: 'Branches Git',

	title_share: 'Partager',

	title_author: 'Auteur',
	title_version: 'Version',
	title_help: 'Aide',
	title_license: 'Licence',
	title_components: 'Composants',
	title_connect: 'Liens',
	title_new_preport_ui: 'Nouvelle UI',

	title_server_version: 'Version du serveur : ',
	title_storage_version: 'Version du stockage : ',

	title_files_in_proj: 'Fichiers du projet :',
	title_last_xx_days: 'Récents',

	title_totally_1: 'Lecture :',
	title_totally_2: 'Codage :',

	title_associate_projects: 'Associer des Projets',
	new_project_association: 'Associer',

	report_date_range: 'Période des rapports',
	nav_recent_7: '7 derniers jours',
	nav_recent_14: '14 derniers jours',
	nav_recent_30: '30 derniers jours',
	nav_recent_365: ' 365 derniers jours',
	nav_recent_this_week: 'Cette semaine',
	nav_recent_last_week: 'Semaine dernière',
	nav_recent_this_month: 'Ce mois',
	nav_recent_last_month: 'Mois dernier',
	nav_recent_custom_range: 'Date personnalisée',
	nav_language: 'Langue',

	full_report: 'Rapport complet',

	option_7_days: '7 jours',
	option_30_days: '30 jours',
	option_365_days: '365 jours',

	word_top: 'Top',
	word_all: 'Tous',
	word_day: 'jours',

	more_24_hours_report: 'Rapport complet (24h)',
	languages_full_report: 'Rapport complet (langages)',

	show_welcome: 'Bienvenue',

	// link in the bottom
	link_github_repo_server: 'Dépôt github du serveur',
	link_github_repo_extension: 'Dépôt github de l\'extension',
	link_vscode_marketplace: 'Market place de l\'extension VSCode',

	// welcome Info
	welcome_subtitle: 'Ceci est la page du rapport de programmation de VSCode Coding Tracker, vous pouvez voir vos statistiques de programmation quotidiennes ici',
	welcome_intro: 'Introduction :',
	welcome_watching_time_title: 'Lecture du code',
	welcome_watching_time: 'Temps de lecture dans VSCode (codage compris)',
	welcome_coding_time_title: 'Codage',
	welcome_coding_time: 'La durée pendant laquelle vous écrivez du code (frappe au clavier) dans VSCode',
	welcome_tips: 'Astuces :',
	welcome_tips_click_hover_title: 'Cliquez ou passez la souris sur un graphique',
	welcome_tips_click_hover: 'Survolez pour plus d\'informations. Cliquez sur la colonne du projet pour obtenir un rapport de projet détaillé.',
	welcome_tips_language_title: 'Changer de langue',
	welcome_tips_language: 'La sélection de la langue est en haut de la page, près de l\'icône :',
	welcome_contribution: 'Contribution :',
	welcome_contribution_1: 'Si vous avez une idée ou si vous trouvez une erreur, c\'est ici : ',
	welcome_contribution_2: ' ou ',
	welcome_contribution_3: 'Toute traduction dans d\'autres langues est la bienvenue. ',
	welcome_contribution_4: 'Ainsi que toute correction d\'orthographe ou de grammaire.',
	welcome_contribution_5: 'Concernant toute contribution, traduction comprise, veuillez vous référer à',


	welcome_btn_close: 'OK. Cacher ce message de bienvenue',
	welcome_reopen: 'Vous pouvez rouvrir cette fenêtre en cliquant sur le bouton "Bienvenue"',

	// share
	share_content: 'Texte',
	share_font_size: 'Taille du texte',
	share_mark_line: 'Ligne de repère',
	share_mark_line_max: 'Maximum',
	share_mark_line_average: 'Moyenne',
	share_mark_line_min: 'Minimum',
	share_tip: '(Cliquez sur un point du diagramme pour ajouter un marqueur dans le temps)',
	share_btn: 'Enregistrer l\'image'
};
