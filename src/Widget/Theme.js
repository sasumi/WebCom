import {insertStyleSheet} from "../Lang/Dom.js";

const NS = 'WebCom-';
const VAR_PREFIX = '--' + NS;
const ICON_FONT = NS + 'iconfont';

//css 样式变量名定义
const CSS_VAR_COLOR = VAR_PREFIX + 'color';
const CSS_VAR_COLOR_LIGHTEN = VAR_PREFIX + 'color-lighten';
const CSS_VAR_DISABLE_COLOR = VAR_PREFIX + 'disable-color';
const CSS_VAR_BACKGROUND_COLOR = VAR_PREFIX + 'background-color';
const CSS_VAR_PANEL_SHADOW = VAR_PREFIX + 'panel-shadow';
const CSS_VAR_PANEL_BORDER = VAR_PREFIX + 'panel-border';
const CSS_VAR_PANEL_BORDER_COLOR = VAR_PREFIX + 'panel-border-color';
const CSS_VAR_PANEL_RADIUS = VAR_PREFIX + 'panel-radius';
const CSS_VAR_FULL_SCREEN_BACKDROP_FILTER = VAR_PREFIX + 'full-screen-backdrop-filter';
const CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR = VAR_PREFIX + 'full-screen-background-color';

insertStyleSheet(`
@font-face {
	font-family: '${ICON_FONT}';  /* Project id 3359671 */
	src: url('//at.alicdn.com/t/c/font_3359671_6sdhf2dfnne.woff2?t=1703834753032') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_6sdhf2dfnne.woff?t=1703834753032') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_6sdhf2dfnne.ttf?t=1703834753032') format('truetype');
}
:root {
	${CSS_VAR_COLOR}:#333;
	${CSS_VAR_COLOR_LIGHTEN}:#666;
	${CSS_VAR_DISABLE_COLOR}:#aaa;
	${CSS_VAR_BACKGROUND_COLOR}:#fff;
	
	${CSS_VAR_PANEL_SHADOW}:1px 1px 5px #bcbcbcb3;
	${CSS_VAR_PANEL_BORDER_COLOR}:#ccc;
	${CSS_VAR_PANEL_BORDER}:1px solid var(${CSS_VAR_PANEL_BORDER_COLOR});
	${CSS_VAR_PANEL_RADIUS}:4px;
	
	${CSS_VAR_FULL_SCREEN_BACKDROP_FILTER}:blur(4px);
	${CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR}:#33333342;
}`, NS+'style');

export const Theme = {
	Namespace: NS,
	CssVarPrefix: VAR_PREFIX,
	CssVar: {
		'COLOR': CSS_VAR_COLOR,
		'CSS_LIGHTEN': CSS_VAR_COLOR_LIGHTEN,
		'DISABLE_COLOR': CSS_VAR_DISABLE_COLOR,
		'BACKGROUND_COLOR': CSS_VAR_BACKGROUND_COLOR,
		'PANEL_SHADOW': CSS_VAR_PANEL_SHADOW,
		'PANEL_BORDER': CSS_VAR_PANEL_BORDER,
		'PANEL_BORDER_COLOR': CSS_VAR_PANEL_BORDER_COLOR,
		'PANEL_RADIUS': CSS_VAR_PANEL_RADIUS,
		'FULL_SCREEN_BACKDROP_FILTER': CSS_VAR_FULL_SCREEN_BACKDROP_FILTER,
		'FULL_SCREEN_BACKGROUND_COLOR': CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR,
	},
	IconFont: ICON_FONT,
	TipIndex: 10, //功能提示类(指向具体元素)
	MaskIndex: 100, //遮罩(（全局或指定面板遮罩类）
	DialogIndex: 1000, //对话框等窗口类垂直索引
	FullScreenModeIndex: 10000, //全屏类（全屏类
	ContextIndex: 100000, //右键菜单
	ToastIndex: 1000000, //消息提示（顶部呈现）
}