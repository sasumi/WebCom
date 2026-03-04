# Auto 自动化组件

Auto 层是 WebCom 最具特色的层次，允许通过 HTML `data-*` 属性声明式地绑定组件，无需手写 JavaScript 初始化代码。这与原生 HTML 的编写方式高度一致，特别适合服务端模板渲染场景。

---

## 核心机制：ACComponent

所有 Auto 组件通过 `ACComponent` 统一管理、自动扫描和挂载。

### 使用方式

在 HTML 元素上添加 `data-component` 属性，值为组件别名（多个用逗号分隔）：

```html
<button data-component="dialog" data-dialog-url="/page" data-dialog-title="详情">
  打开详情
</button>
```

### 参数传递规则

参数通过 `data-{组件别名}-{参数名}` 方式传递：

```html
<!-- 组件别名: tip, 参数名: content -->
<span data-component="tip" data-tip-content="这是提示内容">鼠标悬停查看</span>
```

支持多级参数（`.` 和 `-` 均被转换为多级对象路径）：

```html
<!-- 等价于 params = { size: { width: "600" } } -->
<button data-component="dialog" data-dialog-size-width="600">...</button>
```

> **注意**：`data-*` 属性名全部为小写，WebCom 内部会进行大小写兼容处理。

### 自动挂载方式

```javascript
import { ACComponent } from './src/Auto/ACComponent.js';

// 扫描指定范围内的 data-component 节点并初始化
ACComponent.init(document.body);

// 监听 DOM 变化，动态节点也会自动初始化（推荐）
ACComponent.observe(document.body);
```

### 手动注册自定义组件

```javascript
ACComponent.register('mycomp', MyComponentClass);
```

自定义组件类需实现：

```javascript
class MyComponentClass {
  // 初始化型（页面加载时执行）
  static init(node, params) {}

  // 动作型（节点被点击/激活时执行，返回 Promise）
  static active(node, params, event) {
    return new Promise((resolve, reject) => {});
  }
}
```

### 组件别名对照表

| 别名 | 组件类 | 说明 |
|------|--------|------|
| `async` | `ACAsync` | 异步表单/请求 |
| `batchfiller` | `ACBatchFiller` | 批量填充 |
| `columnfiller` | `ACColumnFiller` | 列填充 |
| `confirm` | `ACConfirm` | 确认对话框 |
| `copy` | `ACCopy` | 复制按钮 |
| `viewcopy` | `ACViewCopy` | 查看并复制 |
| `daterangeselector` | `ACDateRangeSelector` | 日期范围快捷选择 |
| `dialog` | `ACDialog` | 弹窗打开 |
| `highlight` / `hl` | `ACHighlight` | 关键词高亮 |
| `hotkey` | `ACHotKey` | 快捷键绑定 |
| `inlineeditor` | `ACInlineEditor` | 行内编辑器 |
| `selectrelate` | `ACMultiSelectRelate` | 多选关联 |
| `preview` | `ACPreview` | 图片预览 |
| `select` | `ACSelect` | 自定义 Select |
| `selectall` | `ACSelectAll` | 全选/取消 |
| `textcounter` | `ACTextCounter` | 字符计数 |
| `inputellipsis` | `ACInputEllipsis` | 输入框省略号 |
| `tip` | `ACTip` | 气泡提示 |
| `toast` | `ACToast` | Toast 提示 |
| `unsavealert` | `ACUnSaveAlert` | 离开页面提示 |
| `uploader` | `ACUploader` | 上传组件 |

---

## 各组件详细说明

---

### ACAsync — 异步请求

将按钮/链接/表单的提交行为转换为 AJAX 请求，响应成功后自动处理（刷新页面或跳转）。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-async-url` | 请求 URL（优先级高于 `href` / `form.action`） |
| `data-async-method` | 请求方法，默认 `GET` |
| `data-async-data` | 附加数据（JSON 字符串） |
| `data-async-requestformat` | 请求体格式：`JSON`（默认）/ `FORM` |
| `data-async-onsuccess` | 成功回调函数名（全局函数名字符串） |

**默认成功响应处理**：
- 如果响应中有 `message`，弹出 Toast 提示
- 如果响应中有 `forward_url`，跳转到该 URL
- 否则刷新当前页面

#### 静态属性

```javascript
ACAsync.REQUEST_FORMAT   // 全局请求格式，默认 REQUEST_FORMAT.JSON
ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE  // 全局成功回调，可覆盖自定义
ACAsync.onSuccess  // BizEvent，成功时触发
```

#### 示例

```html
<!-- 按钮点击后发起 DELETE 请求 -->
<button data-component="async"
        data-async-url="/api/item/123"
        data-async-method="DELETE">
  删除
</button>

<!-- 表单异步提交（自动序列化表单数据）-->
<form action="/api/save" method="post" data-component="async">
  <input name="title" type="text">
  <button type="submit">保存</button>
</form>
```

#### 注意事项

- 提交期间按钮自动添加 `data-submitting` 属性防止重复提交
- 表单提交时，子级提交按钮的 `formaction` 属性优先于 `form.action`
- 自定义 `onsuccess` 函数接收 `(responseData)` 参数

---

### ACConfirm — 确认对话框

在执行动作前弹出确认对话框，用户点击确认后才继续执行。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-confirm-title` | 对话框标题，默认 `"确认"` |
| `data-confirm-message` | 确认消息内容，默认 `"确认进行该项操作？"` |

#### 示例

```html
<button data-component="confirm,async"
        data-confirm-title="删除确认"
        data-confirm-message="确定要永久删除该记录吗？此操作不可撤销。"
        data-async-url="/api/delete/123"
        data-async-method="DELETE">
  删除记录
</button>
```

> 多组件叠加时，按顺序执行，前一个 Promise resolve 后才执行下一个。

---

### ACDialog — 弹窗打开

点击时打开一个对话框（HTML 内容或 iframe 页面）。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-dialog-url` | iframe 对话框页面地址 |
| `data-dialog-content` | 对话框 HTML 内容 |
| `data-dialog-title` | 对话框标题（优先于 `a[title]`） |
| `data-dialog-width` | 对话框宽度 |
| `data-dialog-height` | 对话框高度 |

> `<a>` 标签的 `href` 自动作为 iframe URL，`title` 属性自动作为标题。

#### 示例

```html
<!-- 打开 iframe 对话框 -->
<a href="/user/edit/1" title="编辑用户" data-component="dialog">编辑</a>

<!-- 打开 HTML 内容对话框 -->
<button data-component="dialog"
        data-dialog-title="帮助说明"
        data-dialog-content="<p>这里是帮助说明内容</p>"
        data-dialog-width="500">
  查看帮助
</button>
```

---

### ACTip — 气泡提示绑定

当鼠标悬停（或指定触发方式）时，在元素旁显示气泡提示。

**触发方式**：`init`（初始化时绑定）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-tip-content` | 提示内容（优先级高于 `title`） |
| `title` | 提示内容（会被清空以避免浏览器默认 tooltip） |
| `data-tip-triggertype` | 触发方式：`hover`（默认）/ `click` / `focus` |

#### 示例

```html
<!-- 使用 title 属性（推荐，简洁） -->
<button title="点击后执行操作" data-component="tip">操作按钮</button>

<!-- 显式指定，点击触发 -->
<span data-component="tip"
      data-tip-content="这是详细说明"
      data-tip-triggertype="click">查看说明</span>
```

---

### ACToast — Toast 通知

点击时显示一条 Toast 通知消息。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-toast-message` | 消息内容，默认 `"提示信息"` |
| `data-toast-type` | 消息类型：`info`（默认）/ `success` / `warning` / `error` / `loading` |

#### 示例

```html
<button data-component="toast"
        data-toast-message="操作已完成"
        data-toast-type="success">
  显示成功提示
</button>
```

---

### ACCopy — 复制按钮

点击时将指定内容复制到剪贴板。

**触发方式**：`init`（初始化时绑定交互）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-copy-content` | 要复制的内容（为空时复制元素 `innerText`） |
| `data-copy-trigger` | 触发方式：`1`（自身节点）/ `2`（内部新建触发图标） |

#### 示例

```html
<!-- 简单复制链接 -->
<input type="button" value="复制链接"
       data-component="copy"
       data-copy-content="https://example.com">

<!-- 内容区复制：点击时复制整个区域文字 -->
<span data-component="copy">这段文字可以被复制</span>

<!-- 代码块：在代码块内自动插入复制图标 -->
<pre data-component="copy" data-copy-trigger="2"><code>const a = 1;</code></pre>
```

---

### ACViewCopy — 查看并复制

点击时弹出对话框显示内容，并提供复制按钮（可选下载功能）。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-viewcopy-content` | 要显示/复制的内容（必填） |
| `data-viewcopy-file` | 指定文件名则显示"下载"按钮（空字符串使用默认名 `文件.txt`） |
| `data-viewcopy-filemime` | 下载文件 MIME，默认 `text/plain` |

#### 示例

```html
<!-- 查看并复制 Token -->
<button data-component="viewcopy"
        data-viewcopy-content="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  查看 Token
</button>

<!-- 支持下载为文件 -->
<button data-component="viewcopy"
        data-viewcopy-content="SELECT * FROM users WHERE id=1"
        data-viewcopy-file="query.sql"
        data-viewcopy-filemime="text/x-sql">
  查看 SQL
</button>
```

---

### ACHighlight — 关键词高亮

将元素内匹配到的关键词文本用高亮样式标注。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-highlight-keyword` | 要高亮的关键词 |
| `data-hl-kw` | 关键词（简写） |

#### 静态属性

```javascript
ACHighlight.cssClass = 'highlight'; // 高亮 CSS 类名，可自定义
```

#### 示例

```html
<p data-component="highlight" data-highlight-keyword="WebCom">
  这是一段包含 WebCom 关键词的介绍文字。
</p>
```

---

### ACHotKey — 快捷键绑定

将全局键盘快捷键绑定到指定元素的点击事件。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-hotkey-keys` | 快捷键字符串，如 `ctrl+k`、`alt+enter` |

按住 `Alt` 键时，页面上所有绑定了快捷键的元素旁会自动显示快捷键提示徽章。

#### 静态属性

```javascript
ACHotKey.TOGGLE_HOTKEY_TIP = true; // 是否开启 Alt 键提示，默认 true
```

#### 示例

```html
<button data-component="hotkey" data-hotkey-keys="ctrl+s">保存</button>
<input type="search" data-component="hotkey" data-hotkey-keys="ctrl+f">
```

---

### ACTextCounter — 字符计数

在输入框旁实时显示已输入字符数量及最大限制。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `maxlength`（原生属性） | 最大字符数（优先使用） |
| `data-textcounter-maxlength` | 手动指定最大字符数 |
| `data-textcounter-trim` | 值为存在时，计算长度时先 trim |

#### 示例

```html
<!-- 使用原生 maxlength -->
<input type="text" maxlength="100" data-component="textcounter">

<!-- 手动指定 -->
<textarea data-component="textcounter" data-textcounter-maxlength="500"></textarea>
```

---

### ACInputEllipsis — 输入框省略号

只读状态下内容溢出显示省略号，获得焦点后恢复正常。

**触发方式**：`init`

```html
<input type="text" value="很长很长的内容，超出时显示省略号..."
       data-component="inputellipsis"
       style="width:150px">
```

---

### ACSelect — 增强 Select

将原生 `<select>` 或 `<input[list]>` 替换为增强版下拉组件。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-select-displaysearchinput` | 是否显示搜索框（有值即开启） |

#### 示例

```html
<!-- 单选下拉框增强 -->
<select name="city" data-component="select" data-select-displaysearchinput>
  <option value="">请选择城市</option>
  <option value="bj">北京</option>
  <option value="sh">上海</option>
</select>

<!-- 多选下拉框增强 -->
<select name="tags" multiple data-component="select">
  <option value="js">JavaScript</option>
  <option value="ts">TypeScript</option>
</select>

<!-- datalist 输入自动补全增强 -->
<input type="text" name="fruit" list="fruitList" data-component="select">
<datalist id="fruitList">
  <option value="苹果">苹果</option>
  <option value="香蕉">香蕉</option>
</datalist>
```

---

### ACSelectAll — 全选/取消全选

在容器内实现 checkbox 全选/取消全选功能，自动同步选中状态显示。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-selectall-container` | checkbox 所在容器选择器，默认 `body` |
| `data-selectall-selector` | checkbox 选择器，默认 `input[type=checkbox]` |
| `data-selectall-tip` | 提示模板，`%c` 为已选数，`%s` 为总数 |

#### 静态属性

```javascript
ACSelectAll.SELECT_ALL_TEXT    // '全选'（可修改）
ACSelectAll.UNSELECT_ALL_TEXT  // '取消选择'（可修改）
ACSelectAll.SELECT_TIP_TEMPLATE // '已选择 %c/%s'（可修改）
```

#### 示例

```html
<div id="item-list">
  <input type="checkbox" name="ids" value="1"> 选项A
  <input type="checkbox" name="ids" value="2"> 选项B
  <input type="checkbox" name="ids" value="3"> 选项C
</div>

<button data-component="selectall"
        data-selectall-container="#item-list"
        data-selectall-tip="已选 %c 项，共 %s 项">
  全选
</button>
```

---

### ACMultiSelectRelate — 多选关联按钮

当容器内有 checkbox 被选中时，启用关联按钮，并将选中的 checkbox 数据附加到按钮的 URL 中。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-multiselectrelate-container` | checkbox 所在容器选择器，默认 `body` |

#### 示例

```html
<div id="table-body">
  <input type="checkbox" name="ids" value="1"> 记录A
  <input type="checkbox" name="ids" value="2"> 记录B
</div>

<!-- 无选中时禁用，有选中时启用，并将选中值追加到 URL -->
<button data-component="confirm,async"
        data-multiselectrelate-container="#table-body"
        data-confirm-message="确定批量删除？"
        data-async-url="/api/batch-delete"
        data-async-method="POST">
  批量删除
</button>
```

---

### ACPreview — 图片预览

点击触发图片预览灯箱效果。

**触发方式**：`init`（父容器模式）/ `active`（点击模式）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-preview-watch` | 父容器模式：监听子节点选择器（如 `img`） |
| `data-preview-src` | 图片地址（为空时自动取 `src` / `href`） |
| `data-preview-selector` | 图片组选择器（多图组内翻页） |

#### 示例

```html
<!-- 父容器模式：监听容器内所有图片点击 -->
<div data-component="preview" data-preview-watch="img">
  <img src="/photo1.jpg">
  <img src="/photo2.jpg">
  <img src="/photo3.jpg">
</div>

<!-- 单图点击预览 -->
<img src="/photo.jpg" data-component="preview">

<!-- 组内翻页预览 -->
<img src="/photo1.jpg" data-component="preview" data-preview-selector=".gallery img" class="gallery">
<img src="/photo2.jpg" data-component="preview" data-preview-selector=".gallery img" class="gallery">
```

---

### ACBatchFiller — 批量填充

选中多个表单控件，批量统一设置相同的值（弹出对话框输入一次，统一赋值）。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-batchfiller-selector` | 需要填充的表单元素 CSS 选择器 |

#### 示例

```html
<table>
  <tr><td><input name="price[]" type="number" class="price-input"></td></tr>
  <tr><td><input name="price[]" type="number" class="price-input"></td></tr>
  <tr><td><input name="price[]" type="number" class="price-input"></td></tr>
</table>

<button data-component="batchfiller"
        data-batchfiller-selector=".price-input">
  批量设置价格
</button>
```

---

### ACColumnFiller — 列填充

在表格中，对同一列的所有输入框批量填充相同值（自动检测所在列）。

**触发方式**：`active`（点击时触发）

通常放置在表格表头单元格中：

```html
<table>
  <thead>
    <tr>
      <th>商品名</th>
      <th>
        价格
        <button data-component="columnfiller">批量填充</button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr><td>商品A</td><td><input name="price_1" type="number"></td></tr>
    <tr><td>商品B</td><td><input name="price_2" type="number"></td></tr>
  </tbody>
</table>
```

---

### ACInlineEditor — 行内编辑器

将展示型文本转换为可编辑状态，支持各种输入类型，提供保存/取消操作。

**触发方式**：`active`（点击时触发）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-inlineeditor-type` | 编辑类型：`text`、`number`、`select`、`date`、`time`、`datetime` |
| `data-inlineeditor-value` | 当前值 |
| `data-inlineeditor-options` | 选项列表（JSON 字符串，`select` 类型使用） |
| `data-inlineeditor-saveurl` | 保存接口 URL |
| `data-inlineeditor-savefield` | 提交时的字段名 |
| `data-inlineeditor-savedata` | 附加数据（JSON 字符串） |

#### 示例

```html
<!-- 内联文本编辑 -->
<span data-component="inlineeditor"
      data-inlineeditor-type="text"
      data-inlineeditor-value="旧的名称"
      data-inlineeditor-saveurl="/api/update"
      data-inlineeditor-savefield="name"
      data-inlineeditor-savedata='{"id":123}'>
  旧的名称
</span>

<!-- 内联下拉选择 -->
<span data-component="inlineeditor"
      data-inlineeditor-type="select"
      data-inlineeditor-value="active"
      data-inlineeditor-options='[["active","启用"],["inactive","禁用"]]'
      data-inlineeditor-saveurl="/api/update-status">
  启用
</span>
```

---

### ACUnSaveAlert — 离开页面提示

监听表单修改状态，离开页面时若有未保存内容则弹出确认提示。

**触发方式**：`init`（绑定到 `<form>` 元素）

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-unsavealert-message` | 自定义提示消息 |

```html
<form action="/api/save" data-component="unsavealert,async"
      data-unsavealert-message="您有未保存的修改，确定离开吗？">
  <input name="title" type="text">
  <button type="submit">保存</button>
</form>
```

> 通常与 `async` 组件配合使用——异步提交成功后自动重置已保存状态。

---

### ACUploader — 上传组件

为普通 input 元素注入文件上传组件。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-uploader-value` | 初始值（已上传文件 URL） |
| `data-uploader-name` | 表单字段名 |
| `data-uploader-thumb` | 初始缩略图 URL |
| `data-uploader-uploadurl` | 上传接口地址 |
| `data-uploader-accept` | 可接受类型 |
| `data-uploader-multiple` | 多文件上传 |
| `data-uploader-maxcount` | 最大文件数 |

所有 `Uploader` 构造函数参数均可通过 `data-uploader-{param}` 传递。

#### 示例

```html
<input type="text" name="avatar"
       data-component="uploader"
       data-uploader-uploadurl="/api/upload"
       data-uploader-accept="image/*"
       data-uploader-maxcount="1">
```

---

### ACDateRangeSelector — 日期范围快捷选择

在一对日期范围输入框旁添加快捷选择菜单（今天、昨天、本周、本月等）。

**触发方式**：`init`

#### HTML 属性

| 属性 | 说明 |
|------|------|
| `data-daterangeselector-start` | 开始日期输入框选择器 |
| `data-daterangeselector-end` | 结束日期输入框选择器 |
| `data-daterangeselector-type` | 类型：`date`（默认）/ `datetime` / `time` / `year` |

#### 静态属性

```javascript
ACDateRangeSelector.WEEK_START = 1; // 每周第一天，1-7（1=周一） 
```

#### 示例

```html
<input type="date" id="start-date" name="start">
~
<input type="date" id="end-date" name="end">
<span data-component="daterangeselector"
      data-daterangeselector-start="#start-date"
      data-daterangeselector-end="#end-date"
      data-daterangeselector-type="date">
  快速选择 ▼
</span>
```

---

## 组件叠加与顺序

`data-component` 支持多个组件以逗号分隔，按从左到右顺序执行（前一个 Promise resolve 后执行下一个）：

```html
<!-- 执行顺序：confirm → async -->
<button data-component="confirm,async"
        data-confirm-message="确认删除？"
        data-async-url="/delete/1"
        data-async-method="DELETE">
  删除
</button>
```

---

## 动态节点支持

使用 `ACComponent.observe()` 后，动态插入的节点会自动被扫描和初始化：

```javascript
import { ACComponent } from './src/Auto/ACComponent.js';
ACComponent.observe(document.body);

// 后续动态插入的节点无需手动初始化
const newBtn = document.createElement('button');
newBtn.setAttribute('data-component', 'tip');
newBtn.setAttribute('data-tip-content', '动态创建的按钮');
newBtn.textContent = '测试';
document.body.appendChild(newBtn); // 自动初始化
```
