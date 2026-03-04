# WebCom 项目概览

## 1. 项目简介

**WebCom**（npm 包名：`lfjs-webcom`）是一个轻量级的前端工具与组件库，不依赖任何第三方框架（无需 React / Vue / jQuery 等），可直接在原生 HTML 页面引入使用，也支持以 ES Module 方式在现代 JS 项目中按需 import。

- **GitHub**：https://github.com/sasumi/WebCom
- **版本**：1.0.0
- **许可证**：MIT
- **作者**：sasumi

---

## 2. 目录结构

```
WebCom/
├── src/                  # 源代码
│   ├── index.js          # 统一导出入口
│   ├── Lang/             # 基础工具函数层（无 DOM 依赖或轻量 DOM 工具）
│   │   ├── Array.js      # 数组/对象工具
│   │   ├── Base64.js     # Base64 编解码
│   │   ├── Cookie.js     # Cookie 读写
│   │   ├── Dom.js        # DOM 操作工具
│   │   ├── Event.js      # 事件工具
│   │   ├── File.js       # 文件/MIME 工具
│   │   ├── Form.js       # 表单工具
│   │   ├── Html.js       # HTML 处理工具
│   │   ├── Img.js        # 图片工具
│   │   ├── Math.js       # 数学工具
│   │   ├── MD5.js        # MD5 哈希
│   │   ├── MIME.js       # MIME 类型映射
│   │   ├── Net.js        # 网络请求工具
│   │   ├── ReportApi.js  # 上报 API 工具
│   │   ├── Route.js      # 路由/History 工具
│   │   ├── String.js     # 字符串工具
│   │   ├── Time.js       # 时间/日期工具
│   │   └── Util.js       # 通用工具
│   ├── I18N/
│   │   └── Lang.js       # 国际化翻译工具
│   ├── Widget/           # UI 组件层（依赖 Lang，提供可视化交互）
│   │   ├── Autofill.js   # 表单自动填充
│   │   ├── Copy.js       # 剪贴板复制
│   │   ├── Dialog.js     # 对话框
│   │   ├── Emoji.js      # Emoji 面板
│   │   ├── FileDrop.js   # 拖拽上传
│   │   ├── ImgPreview.js # 图片预览
│   │   ├── LocalStorageSetting.js # localStorage 配置持久化
│   │   ├── Masker.js     # 遮罩层
│   │   ├── Menu.js       # 右键/点击菜单
│   │   ├── NoviceGuide.js # 新手引导
│   │   ├── Paginate.js   # 分页器
│   │   ├── ParallelPromise.js # 并发 Promise 管理
│   │   ├── PswHelper.js  # 密码强度辅助
│   │   ├── QuickJsonRequest.js # 快速 JSON 请求
│   │   ├── Select.js     # 自定义下拉选择框
│   │   ├── Sortable.js   # 拖拽排序
│   │   ├── Tab.js        # Tab 切换
│   │   ├── Theme.js      # 主题/CSS 变量
│   │   ├── Tip.js        # 气泡提示
│   │   ├── Toast.js      # 消息通知
│   │   ├── Toc.js        # 目录树生成
│   │   └── Uploader.js   # 文件上传
│   └── Auto/             # 自动化组件层（依赖 Widget，通过 data-* 属性声明式使用）
│       ├── ACComponent.js      # 自动组件注册与挂载核心
│       ├── ACAsync.js          # 异步表单提交
│       ├── ACBatchFiller.js    # 批量填充
│       ├── ACColumnFiller.js   # 列填充
│       ├── ACConfirm.js        # 确认对话框
│       ├── ACCopy.js           # 复制按钮
│       ├── ACDateRangeSelector.js # 日期范围快捷选择
│       ├── ACDialog.js         # 弹窗打开
│       ├── ACHighlight.js      # 关键词高亮
│       ├── ACHotKey.js         # 快捷键绑定
│       ├── ACInlineEditor.js   # 行内编辑器
│       ├── ACInputEllipsis.js  # 输入框省略号
│       ├── ACMultiSelectRelate.js # 多选关联
│       ├── ACPreview.js        # 图片预览
│       ├── ACSelect.js         # 自定义 Select
│       ├── ACSelectAll.js      # 全选/取消
│       ├── ACTextCounter.js    # 字符计数
│       ├── ACTip.js            # 气泡提示绑定
│       ├── ACToast.js          # Toast 提示
│       ├── ACUnSaveAlert.js    # 离开页面提示
│       ├── ACUploader.js       # 上传组件
│       └── ACViewCopy.js       # 查看并复制
├── dist/                 # 构建输出（多格式）
├── build/                # 构建脚本
├── test/                 # 测试页面
├── doc/                  # 项目文档（本目录）
├── samples/              # 使用示例
├── package.json
└── rollup.config.js
```

---

## 3. 三层架构

```
┌─────────────────────────────────────────────────┐
│         Auto 层（声明式自动挂载组件）              │
│  通过 data-component="xxx" 属性自动初始化         │
├─────────────────────────────────────────────────┤
│         Widget 层（命令式 UI 组件）               │
│  通过 JS API 直接调用，如 Dialog.show(...)        │
├─────────────────────────────────────────────────┤
│         Lang 层（基础工具函数）                   │
│  纯函数/工具类，如 formatDate()、requestJSON()   │
└─────────────────────────────────────────────────┘
```

**加载顺序**（参见 `src/index.js`）：
1. **Lang** 模块优先加载（无外部依赖）
2. **I18N** 模块
3. **Widget** 模块（依赖 Lang）
4. **Auto** 模块（依赖 Widget + Lang）
5. **ACComponent** 最后加载（依赖所有 Auto 组件）

---

## 4. 构建与分发

使用 **Rollup** 打包，同时输出 5 种格式：

| 文件 | 格式 | 适用场景 |
|------|------|---------|
| `dist/webcom.umd.js` | UMD | 通用（Node.js / 浏览器全局变量） |
| `dist/webcom.cjs.js` | CommonJS | Node.js / Bundler |
| `dist/webcom.amd.js` | AMD | RequireJS |
| `dist/webcom.es.js` | ES Module | 现代浏览器 / Vite / Rollup（含 sourcemap） |
| `dist/webcom.browser.js` | IIFE | 直接 `<script>` 引入，全局变量 `WebCom` |

### 构建命令

```bash
npm run build    # 执行 rollup -c
```

---

## 5. 使用方式

### 方式一：浏览器 script 标签直接引入

```html
<script src="dist/webcom.browser.js"></script>
<script>
  WebCom.Toast.showSuccess('Hello WebCom!');
</script>
```

### 方式二：ES Module import（推荐）

```html
<script type="module">
  import { Toast, Dialog, formatDate } from './dist/webcom.es.js';
  Toast.showInfo('欢迎使用 WebCom');
</script>
```

### 方式三：按需 import 源码（开发环境）

```javascript
import { Toast } from './src/Widget/Toast.js';
import { formatDate } from './src/Lang/Time.js';
```

---

## 6. 代码规范

### 6.1 模块规范

- 所有模块使用 **ES Module**（`import` / `export`）
- 函数优先使用 **箭头函数**（`export const fn = () => {}`）
- 类方法优先使用 **static** 静态方法，减少实例化开销
- 工具函数使用 **JSDoc** 注释标注参数类型

### 6.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 函数/变量 | camelCase | `formatDate`, `arrayColumn` |
| 类 | PascalCase | `Dialog`, `Toast`, `BizEvent` |
| 常量 | UPPER_SNAKE_CASE | `ONE_DAY`, `HTTP_METHOD` |
| Auto 组件类 | `AC` + PascalCase | `ACAsync`, `ACDialog` |
| CSS 类名前缀 | `Theme.Namespace`（`lf-`） | `lf-dialog`, `lf-toast` |
| `data-*` 属性 | `data-{component}-{param}` | `data-async-url`, `data-tip-content` |

### 6.3 Auto 组件约定

Auto 组件类必须实现以下两个静态方法之一（或全部）：

| 方法签名 | 触发时机 | 适用场景 |
|---------|---------|---------|
| `static init(node, params)` | DOM 就绪时自动执行（页面加载/动态挂载） | 初始化型组件（Tip、TextCounter 等） |
| `static active(node, params, event)` 返回 `Promise` | 节点被点击/激活时执行 | 动作型组件（Dialog、Confirm、Async 等） |

`params` 对象由 `data-{alias}-{param}` 属性自动解析，例如：

```html
<button data-component="dialog" data-dialog-url="/detail" data-dialog-title="详情">
  查看详情
</button>
```

解析结果：`params = { url: "/detail", title: "详情" }`

### 6.4 主题与 CSS 变量

组件样式通过 CSS 变量（Custom Properties）实现主题化，主要变量由 `Widget/Theme.js` 定义：

| CSS 变量 | 说明 |
|---------|------|
| `--background-color` | 背景色 |
| `--color` | 前景色 |
| `--color-link` | 链接色 |
| `--panel-radius` | 面板圆角 |
| `--element-height` | 标准元素高度 |

通过 `Theme.setDark()` / `Theme.setLight()` 可切换暗色/亮色主题。

### 6.5 事件系统

内部使用 `BizEvent` 自定义事件总线：

```javascript
import { BizEvent } from './src/Lang/Event.js';
const event = new BizEvent();
event.listen((data) => console.log(data));
event.fire('hello');
```

---

## 7. 国际化（I18N）

通过 `I18N/Lang.js` 的 `trans()` 函数实现文本翻译：

```javascript
import { trans, setLang } from './src/I18N/Lang.js';
setLang('en');
trans('确认'); // 'Confirm'
```

内置支持中文（默认）和英文，可通过扩展语言包添加更多语言。

---

## 8. 浏览器兼容性

- 现代浏览器（Chrome 80+、Firefox 75+、Safari 13+、Edge 80+）
- 使用原生 `<dialog>` 元素、CSS 变量、ES6+ 语法
- 不支持 IE

---

## 更多文档

- [Lang 工具函数库 API](./lang.md)
- [Widget UI 组件 API](./widget.md)
- [Auto 自动化组件 API](./auto.md)
