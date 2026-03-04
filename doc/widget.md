# Widget UI 组件库

Widget 层提供封装好的可视化 UI 交互组件，通过 JavaScript API 命令式调用。所有组件样式通过 `insertStyleSheet` 自动注入，无需额外引入 CSS 文件。

---

## 目录

- [Dialog — 对话框](#dialog)
- [Toast — 消息通知](#toast)
- [Tip — 气泡提示](#tip)
- [Menu — 上下文菜单](#menu)
- [Select — 下拉选择框](#select)
- [Tab — 选项卡](#tab)
- [Sortable — 拖拽排序](#sortable)
- [Paginate — 分页器](#paginate)
- [Uploader — 文件上传](#uploader)
- [ImgPreview — 图片预览](#imgpreview)
- [FileDrop — 拖拽文件区域](#filedrop)
- [NoviceGuide — 新手引导](#noviceguide)
- [Toc — 目录树](#toc)
- [Emoji — Emoji 面板](#emoji)
- [Copy — 剪贴板复制](#copy)
- [ParallelPromise — 并发 Promise](#parallelpromise)
- [Sortable — 拖拽排序](#sortable)
- [Theme — 主题管理](#theme)
- [LocalStorageSetting — 本地配置持久化](#localstoragesetting)
- [Masker — 遮罩层](#masker)
- [Autofill — 表单自动填充](#autofill)
- [QuickJsonRequest — 快速 JSON 请求](#quickjsonrequest)
- [PswHelper — 密码强度](#pswhelper)

---

## Dialog

对话框组件，基于原生 `<dialog>` 元素构建，支持普通对话框、确认框、输入框、iframe 对话框，支持模态/非模态、多层叠加。

### 快速调用（静态方法）

#### `Dialog.show(title, content, config?)`

打开一个自定义对话框。

| 参数 | 类型 | 说明 |
|------|------|------|
| `title` | `String` | 标题 |
| `content` | `String/Object` | 字符串为 HTML 内容，`{src: url}` 为 iframe |
| `config` | `Object` | 配置项见下方 |

**config 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `Number/String` | `500` | 对话框宽度 |
| `height` | `Number/String` | `auto` | 对话框高度 |
| `modal` | `Boolean` | `true` | 是否模态 |
| `showTopCloseButton` | `Boolean` | `true` | 是否显示右上角关闭按钮 |
| `showScreenToggleButton` | `Boolean` | `false` | 是否显示全屏切换按钮 |
| `buttons` | `Array` | `[{title:'关闭'}]` | 底部按钮列表 |
| `onClose` | `Function` | `null` | 关闭回调 |
| `zIndex` | `Number` | 自动 | 层级 |

**buttons 项**：

```javascript
{
  title: '确认',          // 按钮文字
  class: DLG_CLS_BTN,    // 按钮样式（主按钮用 DLG_CLS_BTN）
  callback: () => {}     // 点击回调，返回 false 阻止关闭
}
```

**返回**：`Dialog` 实例

```javascript
import { Dialog } from './src/Widget/Dialog.js';

const dlg = Dialog.show('用户详情', '<p>内容区 HTML</p>', {
  width: 600,
  buttons: [
    { title: '保存', class: Dialog.DLG_CLS_BTN, callback: () => {
      // 保存操作
      return false; // 阻止关闭
    }},
    { title: '取消' }
  ],
  onClose: () => console.log('对话框已关闭')
});
```

#### `Dialog.confirm(title, content, opt?)`

确认对话框，返回 Promise 在点击确认时 resolve。

```javascript
Dialog.confirm('删除确认', '确定要删除该记录吗？').then(() => {
  // 执行删除
}).catch(() => {
  // 用户取消
});
```

#### `Dialog.alert(title, content, opt?)`

告警/通知对话框。

```javascript
Dialog.alert('提示', '操作已完成！');
```

#### `Dialog.iframe(title, iframeSrc, opt?)`

加载 iframe 页面的对话框。

```javascript
Dialog.iframe('文章详情', '/article/123', { width: 800, height: 600 });
```

#### `Dialog.prompt(title, option?)`

输入框对话框，返回 Promise 在点击确认时 resolve 输入值。

| option 属性 | 类型 | 默认值 | 说明 |
|------------|------|--------|------|
| `initValue` | `String` | `''` | 初始值 |
| `placeholder` | `String` | `''` | 占位文本 |

```javascript
Dialog.prompt('输入名称', { initValue: '旧名称' }).then(value => {
  console.log('用户输入：', value);
});
```

### 常量

```javascript
DLG_CLS_BTN        // 主按钮样式类名
DLG_CLS_WEAK_BTN   // 次要按钮样式类名
```

### 实例方法

```javascript
dlg.show()    // 显示对话框
dlg.hide()    // 隐藏对话框
dlg.close()   // 关闭并销毁对话框
```

### 注意事项

- iframe 内容的 `<dialog>` 元素会被绑定到父级窗口，避免层级问题
- 存在模态对话框时，其他对话框自动进入禁用状态
- 按 `Esc` 键关闭最上层可关闭的对话框

---

## Toast

轻量消息通知组件，自动消失，支持多种类型。

### 快速调用

```javascript
import { Toast } from './src/Widget/Toast.js';

Toast.showInfo('提交成功');
Toast.showSuccess('保存成功');
Toast.showWarning('请注意填写格式');
Toast.showError('网络错误，请重试');
Toast.showLoading('加载中...');

// 延迟显示 loading（避免快速操作时的闪烁）
Toast.showLoadingLater('处理中...', 200);
```

### `Toast.showToast(message, type?, timeout?, timeoutCallback?)`

通用方法。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `String` | — | 消息内容 |
| `type` | `String` | `null` | 类型，见下方常量 |
| `timeout` | `Number` | 按类型自动 | 显示毫秒数 |
| `timeoutCallback` | `Function` | `null` | 消失后回调 |

### 类型常量

| 常量 | 值 | 默认显示时长（ms） |
|------|----|--------------------|
| `Toast.TYPE_INFO` | `'info'` | 2000 |
| `Toast.TYPE_SUCCESS` | `'success'` | 2000 |
| `Toast.TYPE_WARNING` | `'warning'` | 3000 |
| `Toast.TYPE_ERROR` | `'error'` | 5000 |
| `Toast.TYPE_LOADING` | `'loading'` | 0（不自动消失） |

### 实例方法

```javascript
const t = new Toast('处理中...', Toast.TYPE_LOADING);
t.show();
// 操作完成后
t.hide();
```

### 注意事项

- 同一时间只显示一条 Toast，新的会替换旧的
- `TYPE_LOADING` 类型不会自动消失，需手动调用 `hide()` 或被新 Toast 覆盖

---

## Tip

气泡提示（Tooltip）组件。

### `Tip.show(content, relateNode, option?)`

在指定节点旁显示气泡。

| 参数 | 类型 | 说明 |
|------|------|------|
| `content` | `String` | 提示内容（支持 HTML） |
| `relateNode` | `Node` | 关联 DOM 节点 |
| `option` | `Object` | 配置项 |

**option 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `triggerType` | `String` | `'hover'` | 触发方式：`'hover'` / `'click'` / `'focus'` |
| `position` | `String` | 自动 | 提示位置：`'top'` / `'bottom'` / `'left'` / `'right'` |
| `theme` | `String` | `'default'` | 主题 |

### `Tip.bindNode(content, relateNode, option?)`

绑定节点触发提示（常用）。

```javascript
import { Tip } from './src/Widget/Tip.js';

Tip.bindNode('这是一段提示文字', document.querySelector('#myBtn'), {
  triggerType: 'hover'
});
```

### `Tip.bindAsync(relateNode, dataFetcher, option?)`

异步加载提示内容。

```javascript
Tip.bindAsync(node, () => {
  return fetch('/api/tooltip').then(r => r.text());
});
```

### `Tip.hideAll()`

隐藏所有已显示的气泡。

---

## Menu

上下文菜单与点击菜单。

### `createMenu(commands, onExecute?)`

创建菜单 DOM（不显示）。

### `showContextMenu(commands, position)`

在指定位置显示上下文菜单。

| 参数 | 类型 | 说明 |
|------|------|------|
| `commands` | `Array` | 菜单项列表 |
| `position` | `Object` | `{x, y}` 位置 |

**菜单项格式**：

```javascript
[
  { text: '编辑', action: () => {} },
  { text: '删除', action: () => {}, disabled: true },
  '-',  // 分隔线
  { text: '子菜单', children: [
    { text: '选项A', action: () => {} }
  ]}
]
```

### `bindTargetContextMenu(target, commands, option?)`

绑定右键菜单。

### `bindTargetClickMenu(target, commands, option?)`

绑定点击菜单。

### `bindTargetMenu(target, commands, option?)`

绑定上下文/点击菜单（通用）。

```javascript
import { bindTargetContextMenu } from './src/Widget/Menu.js';

bindTargetContextMenu(document.querySelector('#myTable'), [
  { text: '复制行', action: (e) => copyRow(e) },
  { text: '删除行', action: (e) => deleteRow(e) },
]);
```

---

## Select

增强版下拉选择框，支持单选/多选/搜索，视觉上替代原生 `<select>`。

### `Select.bindSelect(selectEl, params?)`

将原生 `<select>` 元素绑定高级 Select 组件。

| params 属性 | 类型 | 默认值 | 说明 |
|------------|------|--------|------|
| `displaySearchInput` | `Boolean` | `true` | 是否显示搜索框 |
| `multiple` | `Boolean` | 继承 select | 是否多选 |
| `placeholder` | `String` | 继承 select | 占位文本 |

```javascript
import { Select } from './src/Widget/Select.js';

Select.bindSelect(document.querySelector('#mySelect'), {
  displaySearchInput: true
});
```

### `Select.bindTextInput(inputEl, params?)`

将带有 `<datalist>` 的 `<input>` 元素绑定 Select 组件（自动补全）。

```html
<input type="text" id="city" list="cityList">
<datalist id="cityList">
  <option value="北京">北京</option>
  <option value="上海">上海</option>
</datalist>
```

```javascript
Select.bindTextInput(document.querySelector('#city'));
```

---

## Tab

选项卡切换。

### `tabConnect(tabs, contents, option?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `tabs` | `NodeList/String` | Tab 节点列表或选择器 |
| `contents` | `NodeList/String` | 内容区节点列表或选择器 |
| `option` | `Object` | 配置项 |

**option 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `contentActiveClass` | `String` | `'active'` | 内容区激活类名 |
| `tabActiveClass` | `String` | `'active'` | Tab 激活类名 |
| `triggerEvent` | `String` | `'click'` | 触发事件 |

```javascript
import { tabConnect } from './src/Widget/Tab.js';

tabConnect('.tab-item', '.tab-content', {
  tabActiveClass: 'selected',
  contentActiveClass: 'visible'
});
```

---

## Sortable

拖拽排序，支持列表子节点任意拖拽重排。

### `sortable(listContainer, option?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `listContainer` | `Node/String` | 列表父容器 |
| `option` | `Object` | 配置项 |

**option 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `triggerSelector` | `String` | `''` | 拖动触发器选择器（空则整个子节点可拖） |
| `ClassOnDrag` | `String` | 自动 | 占位元素类名 |
| `ClassProxy` | `String` | 自动 | 拖动代理元素类名 |
| `onStart` | `Function(child)` | `() => {}` | 开始拖动回调，返回 false 阻止 |
| `onInput` | `Function(cur, target)` | `() => {}` | 排序变化中回调 |
| `onChange` | `Function(cur, target)` | `() => {}` | 排序确定后回调 |

```javascript
import { sortable } from './src/Widget/Sortable.js';

sortable('#list', {
  triggerSelector: '.drag-handle',
  onChange: (fromIndex, toIndex) => {
    console.log(`从 ${fromIndex} 移动到 ${toIndex}`);
  }
});
```

### 注意事项

- 会自动监听容器 DOM 变化并重新绑定拖拽属性
- 支持通过 `triggerSelector` 指定拖拽把手，避免内部交互被误触

---

## Paginate

分页器渲染。

### `renderPaginate(paginate, onChange)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `paginate` | `Object` | 分页数据 |
| `onChange` | `Function(page)` | 翻页回调 |

**paginate 对象**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `item_total` | `Number` | 总条数 |
| `page_size` | `Number` | 每页条数 |
| `page` | `Number` | 当前页码（从 1 开始） |

**返回**：`HTMLElement`（分页器 DOM，需自行插入页面）

```javascript
import { renderPaginate } from './src/Widget/Paginate.js';

const pager = renderPaginate({ item_total: 100, page_size: 10, page: 1 }, (page) => {
  loadData(page);
});
document.querySelector('#pager-container').appendChild(pager);
```

---

## Uploader

文件上传组件，支持图片和文件，带预览缩略图。

### `new Uploader(config)`

| config 属性 | 类型 | 默认值 | 说明 |
|------------|------|--------|------|
| `name` | `String` | — | 表单字段名 |
| `value` | `String` | `''` | 初始值（文件 URL） |
| `uploadUrl` | `String` | — | 上传接口 URL |
| `accept` | `String/Array` | `'*'` | 可接受的文件类型 |
| `multiple` | `Boolean` | `false` | 是否支持多文件 |
| `maxCount` | `Number` | `1` | 最大文件数 |
| `thumb` | `String` | `''` | 初始缩略图 URL |
| `onUpload` | `Function` | `null` | 自定义上传函数 |
| `onChange` | `Function(file, value)` | `null` | 值变化回调 |

### 文件类型常量

```javascript
FILE_TYPE_STATIC_IMAGE  // ['image/png', 'image/jpeg', ...]
FILE_TYPE_IMAGE         // ['image/*']
FILE_TYPE_VIDEO         // ['video/*']
FILE_TYPE_AUDIO         // ['audio/*']
FILE_TYPE_DOCUMENT      // ['.txt', '.md', '.doc', '.docx']
FILE_TYPE_SHEET         // ['.xls', '.xlsx', '.csv']
FILE_TYPE_ZIP           // ['.7z', '.zip', '.rar']
```

### 上传状态常量

```javascript
UPLOAD_STATE_EMPTY    // 空值
UPLOAD_STATE_PENDING  // 上传中
UPLOAD_STATE_ERROR    // 上传失败
UPLOAD_STATE_NORMAL   // 正常（有值）
```

```javascript
import { Uploader, FILE_TYPE_IMAGE } from './src/Widget/Uploader.js';

const uploader = new Uploader({
  name: 'avatar',
  uploadUrl: '/api/upload',
  accept: FILE_TYPE_IMAGE,
  maxCount: 3,
  onChange: (files, value) => {
    console.log('上传完成', value);
  }
});
document.querySelector('#upload-container').appendChild(uploader.dom);
```

---

## ImgPreview

图片预览/灯箱组件，支持鼠标滚轮缩放、多图切换。

### 导入

```javascript
import { showImgPreview, showImgListPreview } from './src/Widget/ImgPreview.js';
```

### `showImgPreview(src)`

预览单张图片。

```javascript
showImgPreview('https://example.com/photo.jpg');
```

### `showImgListPreview(srcList, startIndex?)`

预览图片列表，支持左右翻页。

```javascript
showImgListPreview([
  '/img/photo1.jpg',
  '/img/photo2.jpg',
  '/img/photo3.jpg'
], 0);
```

### 常量

```javascript
IMG_PREVIEW_MODE_SINGLE    // 单图模式
IMG_PREVIEW_MODE_MULTIPLE  // 多图模式

IMG_PREVIEW_MS_SCROLL_TYPE_NONE   // 滚轮：无操作
IMG_PREVIEW_MS_SCROLL_TYPE_SCALE  // 滚轮：缩放
IMG_PREVIEW_MS_SCROLL_TYPE_NAV    // 滚轮：导航切图
```

---

## FileDrop

文件拖拽区域绑定。

### `bindFileDrop(container, option?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `container` | `Node/String` | 拖拽区域容器 |
| `option` | `Object` | 配置项 |

**option 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accept` | `String/Array` | `'*'` | 可接受文件类型 |
| `multiple` | `Boolean` | `true` | 是否多文件 |
| `onDrop` | `Function(files)` | — | 文件放入回调 |
| `onEnter` | `Function` | — | 拖入区域回调 |
| `onLeave` | `Function` | — | 离开区域回调 |

```javascript
import { bindFileDrop } from './src/Widget/FileDrop.js';

bindFileDrop('#drop-zone', {
  accept: 'image/*',
  onDrop: (files) => {
    console.log('接收到文件', files);
  }
});
```

---

## NoviceGuide

新手引导/步骤引导。

### 使用方式

```javascript
import { NoviceGuide } from './src/Widget/NoviceGuide.js';

const guide = new NoviceGuide([
  {
    target: '#menu',
    title: '菜单',
    content: '这里是主菜单，点击展开各功能模块'
  },
  {
    target: '#search',
    title: '搜索',
    content: '在这里输入关键词进行全局搜索'
  }
]);
guide.start();
```

---

## Toc

目录树（Table of Contents）自动生成。

### 使用方式

```javascript
import { Toc } from './src/Widget/Toc.js';

// 从内容容器中自动提取标题生成目录
const toc = Toc.create('#article', {
  headings: 'h2,h3,h4',  // 参与生成目录的标签
  container: '#toc'       // 目录注入的容器
});
```

---

## Emoji

Emoji 表情面板。

### `getEmojiPanelHtml(config?)`

获取 Emoji 面板 HTML 字符串。

### `bindEmojiTrigger(triggerNode, option?)`

绑定 Emoji 触发器节点，点击时弹出面板。

```javascript
import { bindEmojiTrigger } from './src/Widget/Emoji.js';

bindEmojiTrigger(document.querySelector('#emoji-btn'), {
  onSelect: (emoji) => {
    textarea.value += emoji;
  }
});
```

### `emojiCharToImg(char)`

将 Emoji 字符转换为 `<img>` 标签（用于不支持 Emoji 渲染的场景）。

---

## Copy

剪贴板复制工具。

### `copy(text, show_msg?)`

复制文本到剪贴板。

```javascript
import { copy } from './src/Widget/Copy.js';

copy('https://example.com');
copy('需要复制的内容', true); // show_msg: true 时显示 Toast 提示
```

### `copyFormatted(html, silent?)`

复制带格式的 HTML 内容（粘贴到支持富文本的地方时保留格式）。

---

## ParallelPromise

并发 Promise 管理，支持限制并发数量。

### `new ParallelPromise(max?)`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max` | `Number` | `5` | 最大并发数 |

```javascript
import { ParallelPromise } from './src/Widget/ParallelPromise.js';

const pool = new ParallelPromise(3); // 最多同时3个

const tasks = urls.map(url => () => fetch(url).then(r => r.json()));
pool.run(tasks).then(results => {
  console.log('全部完成', results);
});
```

---

## Theme

主题管理，CSS 变量定义与切换。

### 常量

```javascript
Theme.Namespace      // 'lf-'（CSS 类名前缀）
Theme.IconFont       // 图标字体名称
Theme.DialogIndex    // 对话框基础 z-index
Theme.CssVar         // CSS 变量名映射
```

### 方法

```javascript
Theme.setDark()      // 切换到暗色主题
Theme.setLight()     // 切换到亮色主题
Theme.toggle()       // 切换主题
Theme.isDark()       // 是否当前暗色主题
```

---

## LocalStorageSetting

`localStorage` + 表单双向绑定，实现用户配置持久化。

### `new LocalStorageSetting(key, defaults?)`

```javascript
import { LocalStorageSetting } from './src/Widget/LocalStorageSetting.js';

const setting = new LocalStorageSetting('userPrefs', {
  fontSize: 14,
  darkMode: false
});

setting.get('fontSize');          // 14
setting.set('fontSize', 16);      // 保存到 localStorage
setting.bindForm('#pref-form');   // 表单双向绑定
```

---

## Masker

全屏遮罩层。

```javascript
import { Masker } from './src/Widget/Masker.js';

Masker.show();   // 显示遮罩
Masker.hide();   // 隐藏遮罩
```

---

## Autofill

表单自动填充（开发/测试辅助）。

### `initAutofillButton(scopeSelector?)`

在表单附近绑定"自动填充"按钮，点击后随机填充表单字段。

```javascript
import { initAutofillButton } from './src/Widget/Autofill.js';
initAutofillButton('#myForm');
```

### `fillForm(formOrContainer)`

立即随机填充表单。

---

## QuickJsonRequest

快速发起 JSON 请求的辅助对象。

```javascript
import { QuickJsonRequest } from './src/Widget/QuickJsonRequest.js';

QuickJsonRequest.get('/api/data').then(data => {});
QuickJsonRequest.post('/api/save', {name:'test'}).then(data => {});
```

---

## PswHelper

密码强度检测辅助。

```javascript
import { PswHelper } from './src/Widget/PswHelper.js';

// 绑定密码输入框，自动显示强度指示器
PswHelper.bind('#password');

// 手动检测强度（返回 0-4 的分数）
PswHelper.check('MyP@ssw0rd!');
```
