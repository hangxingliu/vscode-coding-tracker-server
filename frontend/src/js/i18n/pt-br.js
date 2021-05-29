module.exports = {
	formatTime: (hours = 0, minutes = 0, seconds = 0) => {
		let result = [];
		if (hours > 0) result.push(hours == 1 ? '1hora' : `${hours}horas`);
		if (minutes > 0) result.push(minutes == 1 ? '1minuto' : `${minutes}minutos`);
		if (seconds > 0) result.push(seconds == 1 ? '1segundo' : `${seconds}segundos`);
		if (result.length == 0)
			return `0`;
		return result.join(' ');
	},
	daysOfTheWeek: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sab.'],
	title_summary: 'Atividade',
	title_24hs: 'Relatório das últimas 24 horas',
	title_projects: 'Grupo por projeto',
	title_projects_tip: ' (clique em um item no diagrama para obter detalhes)',
	title_languages: 'Idiomas',
	title_files: 'Tipos Arquivos',
	title_computers: 'Computador',
	title_welcome: 'Relatórios VSCode Coding Tracker',

	title_share: 'Compartilhar',

	title_author: 'Autor',
	title_version: 'Versão',
	title_help: 'Ajuda',
	title_license: 'Licença',
	title_components: 'Componentes',
	title_connect: 'Links',

	title_server_version: 'Versão do servidor:',
	title_storage_version: 'Versão de armazenamento:',

	title_files_in_proj: 'Arquivos do projeto:',
	title_last_xx_days: 'Recentes',

	title_totally_1: 'Total: ',
	title_totally_2: 'Visto; ',

	full_report: 'Relatório detalhado',

	option_7_days: '7 dias',
	option_30_days: '30 dias',
	option_365_days: '365 dias',

	word_top: 'Top',
	word_all: 'Tudo',
	word_day: 'dias',

	show_welcome: 'Informações de boas-vindas',

	// link in the bottom
	link_github_repo_server: 'Repositório servidor backend',
	link_github_repo_extension: 'Repositório da extensão',
	link_vscode_marketplace: 'Link Marketplace VSCode',

	// welcome Info
	welcome_subtitle: '',
	welcome_intro: 'Introdução:',
	welcome_watching_time: 'Tempo de exibição (incluindo tempo de digitação)',
	welcome_coding_time: 'Tempo gasto digitando',
	welcome_tips: 'Dicas:',
	welcome_tips_click_hover_title: 'Clique ou passe o mouse sobre o gráfico',
	welcome_tips_click_hover: 'Passe o mouse para obter detalhes. Clique na coluna do projeto para obter um relatório detalhado do projeto.',
	welcome_tips_language_title: 'Alterar idioma',
	welcome_tips_language: 'A seleção do idioma está no topo da página ao lado do ícone:',
	welcome_contribution: 'Cooperação:',
	welcome_contribution_1: 'Se você tiver uma ideia ou encontrar um bug, por favor crie-o ',
	welcome_contribution_2: ' ou ',
	welcome_btn_close: 'OK. Ocultar esta informação',
	welcome_reopen: 'Você pode abrir esta janela novamente clicando no botão "Informações de boas-vindas"',

	// share
	share_content: 'Texto',
	share_font_size: 'Tamanho do texto',
	share_mark_line: 'Adicionar linha',
	share_mark_line_max: 'Máximo',
	share_mark_line_average: 'Médio',
	share_mark_line_min: 'Mínimo',
	share_tip: '(Clique em um ponto no diagrama para adicionar um marcador com o tempo)',
	share_btn: 'Salvar'
};
