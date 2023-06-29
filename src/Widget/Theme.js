import {insertStyleSheet} from "../Lang/Dom.js";

const NS = 'WebCom-';
const ICON_FONT_CLASS = NS + `icon`;
const ICON_FONT = NS + 'iconfont';
const DEFAULT_ICONFONT_CSS = `
@font-face {
	font-family: '${ICON_FONT}';  /* Project id 3359671 */
  src: url('//at.alicdn.com/t/c/font_3359671_a8ndu7byul8.woff2?t=1688055274391') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_a8ndu7byul8.woff?t=1688055274391') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_a8ndu7byul8.ttf?t=1688055274391') format('truetype');
}

.${ICON_FONT_CLASS} {
	font-family: "${ICON_FONT}" !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
`;

insertStyleSheet(DEFAULT_ICONFONT_CSS);

export const Theme = {
	Namespace: NS,
	IconFont: ICON_FONT,
	IconFontClass: ICON_FONT_CLASS,
	TipIndex: 10, //功能提示类(指向具体元素)
	MaskIndex: 100, //遮罩(（全局或指定面板遮罩类）
	DialogIndex: 1000, //对话框等窗口类垂直索引
	FullScreenModeIndex: 10000, //全屏类（全屏类
	ContextIndex: 100000, //右键菜单
	ToastIndex: 1000000, //消息提示（顶部呈现）
}