module.exports = {
	formatTime: (hours = 0, minutes = 0, seconds = 0) => {
		let result = [];
		if (hours > 0) result.push(`${hours}小时`);
		if (minutes > 0) result.push(`${minutes}分钟`);
		if (seconds > 0) result.push(`${seconds}秒`);
		if (result.length == 0)
			return `0`;
		return result.join(' ');
	},
	daysOfTheWeek: ['日', '一', '二', '三', '四', '五', '六'],

	title_summary: '编程时间总结',
	title_24hs: '24小时总结',
	title_projects: '项目耗时',
	title_projects_tip: '(点击图表项目查看详细)',
	title_languages: '按语言分类',
	title_files: '文件耗时',
	title_computers: '按计算机分类',
	title_welcome: '欢迎来到报告页面',
	title_vcs: '按版本控制系统分类(git)',

	title_share: '分享',

	title_author: '作者',
	title_version: '版本',
	title_help: '帮助',
	title_license: '开源协议',
	title_components: '相关组件',
	title_connect: '链接',

	title_server_version: '服务器版本:',
	title_storage_version: '存储文件版本:',

	title_files_in_proj: '项目中的文件:',
	title_last_xx_days: '最近',

	title_totally_1: '合计: ',
	title_totally_2: '专注时间:',

	full_report: '完整报告',

	option_7_days: '7天',
	option_30_days: '30天',
	option_365_days: '365天',

	word_top: '前',
	word_all: '全部',
	word_day: '天',

	show_welcome: '欢迎/帮助信息',

	// link in the bottom
	link_github_repo_server: 'Github仓库(服务器端代码)',
	link_github_repo_extension: 'Github仓库(VSCode插件端代码)',
	link_vscode_marketplace: 'VSCode插件市场',

	// welcome Info
	welcome_subtitle: '这是VSCode Coding Tracker的编程情况报告页面, 你能在这儿看到你日常的编程情况统计',
	welcome_intro: '简介:',
	welcome_watching_time: '你使用(查看)VSCode的时长 (包括Coding time)',
	welcome_coding_time: '你在VSCode中写代码(敲键盘)的时长',
	welcome_tips: '提示:',
	welcome_tips_click_hover_title: '将鼠标放到或点击图表项',
	welcome_tips_click_hover: '将鼠标放到图表项上以获得详细信息. 点击项目图表项可以查看针对某个项目的详细报告',
	welcome_tips_language_title: '更换页面语言',
	welcome_tips_language: '在页面上方可更换语言, 在这个图标旁:',
	welcome_contribution: '帮助改进:',
	welcome_contribution_1: '如果你有什么好的点子 或 发现了一些bug/缺陷. 欢迎给这个项目提交 ',
	welcome_contribution_2: ' 或 ',
	welcome_btn_close: 'OK. 隐藏这个欢迎信息',
	welcome_reopen: '你可以点击页面底部的"欢迎/帮助信息"以重新显示这个信息',

	// share
	share_content: '分享文本',
	share_font_size: '字号',
	share_mark_line: '标记线',
	share_mark_line_max: '最大值',
	share_mark_line_average: '平均值',
	share_mark_line_min: '最小值',
	share_tip: '点击图表上的项目可 添加/删除 标记点',
	share_btn: '保存为图片分享'
};
