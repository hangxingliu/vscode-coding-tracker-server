module.exports = {
    formatTime: (hours = 0, minutes = 0, seconds = 0) => {
        let result = [];
        if (hours > 0) result.push(`${hours}時`);
        if (minutes > 0) result.push(`${minutes}分`);
        if (seconds > 0) result.push(`${seconds}秒`);
        if (result.length == 0)
            return `0`;
        return result.join(' ');
    },
    daysOfTheWeek: ['日', '月', '火', '水', '木', '金', '土'],

    title_summary: 'コーディング時間',
    title_24hs: '24 時間 ',
    title_projects: 'プロジェクト別',
    title_projects_tip: '（チャートをクリックして詳細表示）',
    title_languages: '言語別',
    title_files: 'ファイル別',
    title_computers: 'コンピューター別',
    title_welcome: 'レポートページへようこそ',
    title_vcs: 'バージョン管理システム（git）による分類',

    title_share: '共有',

    title_author: '作者',
    title_version: 'バージョン',
    title_help: 'ヘルプ',
    title_license: 'ライセンス',
    title_components: '関連コンポーネント',
    title_connect: 'リンク',

    title_server_version: 'サーバーのバージョン:',
    title_storage_version: 'ストレージファイルのバージョン:',

    title_files_in_proj: 'プロジェクト内のファイル:',
    title_last_xx_days: '最近',

    title_totally_1: 'watching for',
    title_totally_2: 'coding for',

    full_report: '完全なレポート',

    option_7_days: '7日',
    option_30_days: '30日 ',
    option_365_days: '365日',

    word_top: '上位',
    word_all: '全て',
    word_day: '日',

    show_welcome: 'ようこそ/ヘルプ情報',

    //下部にリンク
    link_github_repo_server: 'Github（サーバー）',
    link_github_repo_extension: 'Github（VSCodeプラグイン）',
    link_vscode_marketplace: 'VSCodeプラグインマーケット',

    //ようこそ情報
    welcome_subtitle: 'これはVSCodeコーディングトラッカーのコーディングレポートページです。毎日のコーディング統計をここで確認できます',
    welcome_intro: 'はじめに:',
    welcome_watching_time: 'VSCodeを使用（表示）する時間の長さ（コーディング時間を含む）',
    welcome_coding_time: 'VSCodeでコード（キーボード）を書く時間の長さ',
    welcome_tips: 'ヒント:',
    welcome_tips_click_hover_title: 'チャートをクリックかホバーする',
    welcome_tips_click_hover: 'マウスをチャートに移動すると、詳細情報が表示されます。プロジェクトバーに移動すると、プロジェクトの詳細レポートを表示します。',
    welcome_tips_language_title: '言語を変更する',
    welcome_tips_language: 'ページ上部のこのアイコンの横にある言語を変更できます:',
    welcome_contribution: '改善に役立つ:',
    welcome_contribution_1: '良いアイデアがある場合、またはいくつかのバグ/欠陥を見つけた場合、送ってください',
    welcome_contribution_2: 'または',
    welcome_btn_close: 'ウェルカムメッセージを非表示にする',
    welcome_reopen: 'ページ下部の[ようこそ/ヘルプ情報]をクリックして,この情報を再表示できます',

    // 共有
    share_content: 'テキストを共有する',
    share_font_size: 'フォントサイズ',
    share_mark_line: 'マークライン',
    share_mark_line_max: '最大',
    share_mark_line_average: '平均',
    share_mark_line_min: '最小',
    share_tip: 'チャート上のアイテムをクリックして,マーカーポイントを追加/削除します',
    share_btn: '画像として保存'
};