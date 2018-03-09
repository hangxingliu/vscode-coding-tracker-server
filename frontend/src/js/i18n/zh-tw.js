module.exports = {
	formatTime: (hours = 0, minutes = 0, seconds = 0) => {
		let result = [];
		if (hours > 0) result.push(`${hours}小時`);
		if (minutes > 0) result.push(`${minutes}分鐘`);
		if (seconds > 0) result.push(`${seconds}秒`);
		if (result.length == 0)
			return `0`;
		return result.join(' ');
	},
	daysOfTheWeek: ['日', '一', '二', '三', '四', '五', '六'],

	title_summary: '編程時間總結',
	title_24hs: '24小時總結',
	title_projects: '項目耗時',
	title_projects_tip: '(點擊圖表項目查看詳細)',
	title_languages: '按語言分類',
	title_files: '文件耗時',
	title_computers: '按計算機分類',
	title_welcome: '歡迎來到報告頁面',
	title_vcs: '按版本控制系統分類(git)',

	title_share: '分享',

	title_author: '作者',
	title_version: '版本',
	title_help: '幫助',
	title_license: '開源協議',
	title_components: '相關組件',
	title_connect: '鏈接',

	title_server_version: '服務器版本:',
	title_storage_version: '存儲文件版本:',

	title_files_in_proj: '項目中的文件:',
	title_last_xx_days: '最近',

	title_totally_1: '合計:',
	title_totally_2: '專注時間:',

	full_report: '完整報告',

	option_7_days: '7天',
	option_30_days: '30天',
	option_365_days: '365天',

	word_top: '前',
	word_all: '全部',
	word_day: '天',

	show_welcome: '歡迎/幫助信息',

	// link in the bottom
	link_github_repo_server: 'Github倉庫(服務器端代碼)',
	link_github_repo_extension: 'Github倉庫(VSCode插件端代碼)',
	link_vscode_marketplace: 'VSCode插件市場',

	// welcome Info
	welcome_subtitle: '這是VSCode Coding Tracker的編程情況報告頁面, 你能在這兒看到你日常的編程情況統計',
	welcome_intro: '簡介:',
	welcome_watching_time: '你使用(查看)VSCode的時長 (包括Coding time)',
	welcome_coding_time: '你在VSCode中寫代碼(敲鍵盤)的時長',
	welcome_tips: '提示:',
	welcome_tips_click_hover_title: '將鼠標放到或點擊圖表項',
	welcome_tips_click_hover: '將鼠標放到圖表項上以獲得詳細信息. 點擊項目圖表項可以查看針對某個項目的詳細報告',
	welcome_tips_language_title: '更換頁面語言',
	welcome_tips_language: '在頁面上方可更換語言, 在這個圖標旁:',
	welcome_contribution: '幫助改進:',
	welcome_contribution_1: '如果你有什麼好的點子 或 發現了一些bug/缺陷. 歡迎給這個項目提交',
	welcome_contribution_2: '或',
	welcome_btn_close: 'OK. 隱藏這個歡迎信息',
	welcome_reopen: '你可以點擊頁面底部的"歡迎/幫助信息"以重新顯示這個信息',

	// share
	share_content: '分享文本',
	share_font_size: '字號',
	share_mark_line: '標記線',
	share_mark_line_max: '最大值',
	share_mark_line_average: '平均值',
	share_mark_line_min: '最小值',
	share_tip: '點擊圖表上的項目可 添加/刪除 標記點',
	share_btn: '保存為圖片分享'
};
