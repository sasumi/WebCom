import {insertStyleSheet} from "../Lang/Dom.js";

const NS = 'WebCom-';
const ICON_FONT_CLASS = NS + `icon`;
const ICON_FONT = NS+'iconfont';
const DEFAULT_ICONFONT_CSS = `
@font-face {
  font-family: "${ICON_FONT}"; /* Project id 3359671 */
  src: url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.woff2?t=1651059735967') format('woff2'),
       url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.woff?t=1651059735967') format('woff'),
       url('//at.alicdn.com/t/font_3359671_iu2uo75bqf.ttf?t=1651059735967') format('truetype');
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
	DialogIndex: 1000,
	MaskIndex: 100,
	FullScreenModeIndex: 10000
}