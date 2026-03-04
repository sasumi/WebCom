# Lang 工具函数库

Lang 层是 WebCom 的基础层，提供纯粹的工具函数，大部分函数没有副作用，可在任何环境中独立使用。

---

## 目录

- [Array.js — 数组/对象工具](#arrayjs)
- [Base64.js — Base64 编解码](#base64js)
- [Cookie.js — Cookie 操作](#cookiejs)
- [Dom.js — DOM 操作工具](#domjs)
- [Event.js — 事件工具](#eventjs)
- [File.js — 文件工具](#filejs)
- [Form.js — 表单工具](#formjs)
- [Html.js — HTML 处理](#htmljs)
- [Img.js — 图片工具](#imgjs)
- [Math.js — 数学工具](#mathjs)
- [MD5.js — MD5 哈希](#md5js)
- [MIME.js — MIME 类型](#mimejs)
- [Net.js — 网络请求](#netjs)
- [ReportApi.js — 上报接口](#reportapijs)
- [Route.js — 路由工具](#routejs)
- [String.js — 字符串工具](#stringjs)
- [Time.js — 时间/日期工具](#timejs)
- [Util.js — 通用工具](#utiljs)

---

## Array.js

数组与对象操作工具函数。

### `arrayColumn(arr, col_name)`

提取数组中所有对象的指定属性值，类似 PHP `array_column`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `arr` | `Array` | 对象数组 |
| `col_name` | `String` | 属性名 |

**返回**：`Array`

```javascript
import { arrayColumn } from './src/Lang/Array.js';
const users = [{id:1, name:'Alice'}, {id:2, name:'Bob'}];
arrayColumn(users, 'name'); // ['Alice', 'Bob']
```

---

### `arrayIndex(arr, val)`

查找值在数组中的索引。

```javascript
arrayIndex(['a', 'b', 'c'], 'b'); // '1'
```

---

### `isEquals(obj1, obj2)`

比较两个对象是否全等（浅比较所有属性）。

```javascript
isEquals({a:1, b:2}, {a:1, b:2}); // true
```

---

### `arrayDistinct(arr)`

数组去重（引用等值去重）。

```javascript
arrayDistinct([1, 2, 2, 3]); // [1, 2, 3]
```

---

### `arrayGroup(arr, by_key, limit?)`

按对象属性值对数组进行分组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `arr` | `Array` | 对象数组 |
| `by_key` | `String` | 分组键名 |
| `limit` | `Boolean` | 为 `true` 时每组仅保留第一项 |

```javascript
const data = [{type:'A', v:1}, {type:'B', v:2}, {type:'A', v:3}];
arrayGroup(data, 'type');
// { A: [{type:'A',v:1},{type:'A',v:3}], B: [{type:'B',v:2}] }
```

---

### `sortByKey(obj)`

按对象 Key 字母顺序排序，返回新对象。

```javascript
sortByKey({c:3, a:1, b:2}); // {a:1, b:2, c:3}
```

---

### `chunk(list, size)`

数组分块（按指定大小切割）。

```javascript
chunk([1,2,3,4,5], 2); // [[1,2],[3,4],[5]]
```

---

### `objectPushByPath(path, value, srcObj?, glue?)`

按路径字符串向对象中嵌套赋值。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `String` | — | 路径，如 `'a.b.c'` |
| `value` | `any` | — | 要赋的值 |
| `srcObj` | `Object` | `{}` | 源对象 |
| `glue` | `String` | `'.'` | 路径分隔符 |

```javascript
let obj = {};
objectPushByPath('user.name', 'Alice', obj);
// obj = { user: { name: 'Alice' } }
```

---

### `objectKeyMapping(obj, mapping)`

对象属性名映射/重命名。

```javascript
objectKeyMapping({a:1, b:2}, {a:'x'}); // {x:1, b:2}
```

---

### `objectGetByPath(obj, path, glue?)`

按路径字符串读取对象中的嵌套属性值。

```javascript
objectGetByPath({user:{name:'Alice'}}, 'user.name'); // 'Alice'
```

---

### `arrayFilterTree(parent_id, all_list, option?, level?, group_by_parents?)`

从平铺列表中递归构建目录树或带层级的平铺结构。

| option 属性 | 类型 | 默认值 | 说明 |
|------------|------|--------|------|
| `return_as_tree` | `Boolean` | `false` | 是否以树结构返回 |
| `level_key` | `String` | `'tree_level'` | 层级信息键名 |
| `id_key` | `String` | `'id'` | 主键键名 |
| `parent_id_key` | `String` | `'parent_id'` | 父级键名 |
| `children_key` | `String` | `'children'` | 子集键名（树模式） |

```javascript
const list = [
  {id:1, parent_id:0, name:'根'},
  {id:2, parent_id:1, name:'子A'},
  {id:3, parent_id:1, name:'子B'},
];
arrayFilterTree(0, list, {return_as_tree: true});
```

---

## Base64.js

Base64 编解码工具。

### `Base64Encode(text)` / `base64Decode(text)`

标准 Base64 编解码。

```javascript
import { Base64Encode, base64Decode } from './src/Lang/Base64.js';
Base64Encode('Hello');       // 'SGVsbG8='
base64Decode('SGVsbG8=');    // 'Hello'
```

---

### `base64UrlSafeEncode(text)`

URL 安全的 Base64 编码（`+` 替换为 `-`，`/` 替换为 `_`，去除 `=`）。

---

### `convertBlobToBase64(blob)` (async)

将 Blob 对象转换为 Base64 Data URL。

```javascript
const base64 = await convertBlobToBase64(blob);
```

---

## Cookie.js

### `setCookie(name, value, days, path?)`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `String` | — | Cookie 名 |
| `value` | `String` | — | Cookie 值 |
| `days` | `Number` | — | 有效天数 |
| `path` | `String` | `'/'` | 路径 |

### `getCookie(name)` / `deleteCookie(name)`

读取 / 删除指定 Cookie。

```javascript
import { setCookie, getCookie, deleteCookie } from './src/Lang/Cookie.js';
setCookie('token', 'abc123', 7);
getCookie('token');    // 'abc123'
deleteCookie('token');
```

---

## Dom.js

DOM 操作工具，是使用频率最高的模块。

### 视口尺寸

```javascript
getViewWidth()   // 视口宽度
getViewHeight()  // 视口高度
```

### 元素显示/隐藏

```javascript
hide(dom)              // 隐藏元素
show(dom)              // 显示元素
remove(dom)            // 从 DOM 中移除
toggle(dom, toShow?)   // 切换显示/隐藏
```

### 元素禁用/启用

```javascript
disabled(el, disabledClass?)
enabled(el, disabledClass?)
toggleDisabled(el, disabledClass?, forceEnabled?)
lockElementInteraction(el, payload)  // 执行期间锁定交互，完成后自动恢复
```

### 查找元素

```javascript
findOne(selector, parent?)            // 返回第一个匹配元素
findAll(selector, parent?)            // 返回所有匹配元素
findAllOrFail(selector, parent?)      // 找不到时抛出异常
waitForSelector(selector, option?)    // 等待选择器匹配（返回 Promise）
waitForSelectors(selector, option?)   // 等待多个选择器匹配
matchParent(dom, selector)            // 向上查找匹配父节点
```

**`waitForSelector` option 参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeout` | `Number` | `5000` | 超时毫秒数 |
| `interval` | `Number` | `100` | 轮询间隔 |

### 位置与尺寸

```javascript
getDomOffset(target)       // 元素到文档的偏移 {top, left}
getDomDimension(dom)       // 元素尺寸 {width, height}
keepRectCenter(w, h, containerDimension?)   // 计算居中坐标
keepDomInContainer(target, container?)      // 保持元素在容器内
keepRectInContainer(objDim, ctnDim?)        // 计算不越界的坐标
rectAssoc(rect1, rect2)    // 判断两个矩形是否相交
rectInLayout(rect, layout) // 判断矩形是否在布局范围内
```

### DOM 变化监听

```javascript
onDomTreeChange(dom, callback, includeElementChanged?)
// 监听 DOM 树变化（MutationObserver）

domChangedWatch(container, matchedSelector, notification, executionFirst?)
// 监听容器内匹配选择器的节点变化

mutationEffective(dom, option, payload, minInterval?)
// 防抖的 MutationObserver 封装
```

### 创建与加载

```javascript
createDomByHtml(html, parentNode?)   // 从 HTML 字符串创建 DOM
loadCss(file, forceReload?)          // 动态加载 CSS 文件
loadScript(src, forceReload?)        // 动态加载 JS 文件
insertStyleSheet(styleSheetStr, id?, doc?)  // 插入 style 标签
```

### 文本 & 高亮

```javascript
bindTextAutoResize(textarea, init?)  // textarea 自动高度
bindTextSupportTab(textarea, tabChar?)  // textarea 支持 Tab 缩进
nodeHighlight(node, pattern, hlClass)   // 高亮节点内匹配的文本
nodeIndex(node)                         // 获取节点在父节点中的位置索引
```

### 全屏

```javascript
enterFullScreen(element)   // 进入全屏
exitFullScreen()           // 退出全屏
toggleFullScreen(element)  // 切换全屏
isInFullScreen()           // 判断是否处于全屏
```

### 上下文窗口（跨 iframe）

```javascript
setContextWindow(win)   // 设置上下文窗口（用于 iframe 中的操作）
getContextWindow()      // 获取当前上下文窗口
getContextDocument()    // 获取当前上下文 Document
```

---

## Event.js

事件工具。

### `BizEvent` 自定义事件总线

```javascript
import { BizEvent } from './src/Lang/Event.js';

const evt = new BizEvent();

// 监听
evt.listen((a, b) => console.log(a, b));

// 触发
evt.fire('hello', 'world');

// 取消监听
evt.remove(handler);
```

### 键盘相关

```javascript
KEYBOARD_KEY_MAP   // 键盘键名映射对象（含所有常用键）
KEYS               // 常用键枚举

// 绑定热键（支持 ctrl+k、alt+a 等组合键）
bindHotKeys(node, keyStr, payload, option?)

// 持续按键
bindKeyContinuous(node, key, payload, interval?)
```

### DOM 事件工具

```javascript
// 绑定多个事件
bindNodeEvents(nodes, event, payload, option?, triggerAtOnce?)

// 绑定激活事件（click + Enter/Space 键）
bindNodeActive(nodes, payload, cancelBubble?, triggerAtOnce?)

// hover 事件
onHover(nodes, hoverIn?, hoverOut?, hoverClass?)

// 事件委托
eventDelegate(container, selector, eventName, payload)

// 触发事件
fireEvent(nodes, event)
triggerDomEvent(node, event)

// DOM Ready
onDocReady(callback)
```

### 对象变化监听

```javascript
// 用 Proxy 监听对象属性 set
objectOnChanged(obj, onSet)
```

---

## File.js

文件/MIME 相关工具。

```javascript
resolveFileExtension(fileName)                 // 获取文件扩展名
resolveFileName(fileName)                      // 获取文件名（不含扩展名）
getMimeByExtension(ext, defaultMIME?)          // 根据扩展名获取 MIME 类型
fileAcceptMath(fileMime, acceptStr)            // 判断文件 MIME 是否匹配 accept 字符串
readFileInLine(file, linePayload, onFinish?, onError?)  // 按行读取文本文件
imgToFile(img, fileAttr?)                      // img 元素转 File 对象
fileToImg(file)                                // File 对象转 img 元素（返回 Promise）
blobToFile(blob, fileAttr?)                    // Blob 转 File
imageFileFormatConvert(file, toFormat, newName?) // 图片格式转换（返回 Promise）
```

---

## Form.js

表单读写与校验工具。

### 值获取

```javascript
getElementValue(el)                          // 获取表单元素的当前值
getElementValueByName(name, container?)      // 按 name 获取表单元素的值
getAvailableElements(dom, ignore_empty_name?) // 获取可用（非禁用）的表单元素列表
```

### 序列化

```javascript
formSerializeJSON(dom, validate?)            // 表单序列化为 JSON 对象
formSerializeString(dom, validate?)          // 表单序列化为查询字符串
getFormDataAvailable(dom, validate?)         // 获取 FormData
serializePhpFormToJSON(dom, validate?)       // PHP 风格数组名表单 → JSON
```

### 表单提交

```javascript
// 将表单提交绑定为 JSON 格式请求
bindFormSubmitAsJSON(form, onSubmitting?)
```

### 表单校验

```javascript
formValidate(dom, name_validate?)            // 基础校验，返回 Boolean
inputAble(el)                                // 元素是否可输入
inputTypeAble(el)                            // 类型是否支持文本输入
```

### 未保存离开提醒

```javascript
bindFormUnSavedUnloadAlert(form, alertMsg?)  // 绑定表单未保存离开提醒
validateFormChanged(form, us_sid?)           // 检查表单是否有修改
resetFormChangedState(form)                  // 重置表单修改状态
setWindowUnloadMessage(msg, target)          // 设置离开页面提示
bindFormAutoSave(form, savePromise, minSaveInterval?) // 自动保存
```

### 数据转换

```javascript
convertFormDataToObject(formDataMap, formatSchema, mustExistsInSchema?)
convertObjectToFormData(objectMap, boolMapping?)
fixedPhpJSON(data)      // 修复 PHP JSON 数组问题
fixGetFormAction(form)  // 修复 GET 表单 action 参数
```

---

## Html.js

HTML 字符串处理工具。

```javascript
// HTML 转纯文本
html2Text(html)

// HTML 实体转义 / 反转义
escapeHtml(str, tabSize?, allowLineBreaker?)
unescapeHtml(html)
escapeAttr(s, preserveCR?)
entityToString(entity)
decodeHTMLEntities(str)
stringToEntity(str, radix)

// 关键词高亮
highlightText(text, kw, replaceTpl?)

// 构建隐藏 input
buildHtmlHidden(maps)

// CSS 工具
cssSelectorEscape(str)    // 转义 CSS 选择器特殊字符
dimension2Style(h)        // 数字/字符串转 CSS 尺寸值

// 标签分类常量
BLOCK_TAGS      // 块级标签列表
PAIR_TAGS       // 成对标签列表
SELF_CLOSING_TAGS  // 自闭合标签列表
REMOVABLE_TAGS     // 可移除标签列表
```

---

## Img.js

图片相关工具。

```javascript
loadImgBySrc(src)                // 预加载图片（返回 Promise<HTMLImageElement>）
getHighestResFromSrcSet(srcset_str)  // 从 srcset 中获取最高分辨率地址
getBase64BySrc(src)              // 图片地址转 Base64（返回 Promise<String>）
getBase64ByImg(img)              // img 元素转 Base64
getAverageRGB(imgEl)             // 取图片平均 RGB 颜色
scaleFixCenter({...})            // 等比缩放居中计算
```

**`scaleFixCenter` 参数**：

| 参数 | 说明 |
|------|------|
| `width` | 图片宽度 |
| `height` | 图片高度 |
| `containerWidth` | 容器宽度 |
| `containerHeight` | 容器高度 |

返回 `{width, height, top, left}`。

---

## Math.js

```javascript
GOLDEN_RATIO      // 黄金比例 ≈ 0.618
between(val, min, max, includeEqual?)   // 判断值是否在范围内
randomInt(min, max)    // 生成随机整数（含边界）
round(num, precision?) // 四舍五入到指定精度，默认保留 2 位
```

---

## MD5.js

```javascript
import { MD5 } from './src/Lang/MD5.js';
MD5('hello'); // '5d41402abc4b2a76b9719d911017c592'
```

---

## MIME.js

```javascript
MIME_BINARY_DEFAULT    // 'application/octet-stream'
MIME_EXTENSION_MAP     // 扩展名 → MIME 类型映射对象（覆盖常见格式）
```

---

## Net.js

网络请求工具。

### 常量

```javascript
HTTP_METHOD   // { GET, POST, PUT, DELETE, OPTIONS, HEAD, CONNECT, TRACE }
REQUEST_FORMAT  // { JSON, FORM }
RESPONSE_FORMAT // { JSON, XML, HTML, TEXT }
```

### `requestJSON(url, data, method?, option?)`

发起 HTTP 请求，返回 Promise。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `String` | — | 请求地址 |
| `data` | `Object/String` | — | 请求数据 |
| `method` | `String` | `'GET'` | 请求方法 |
| `option` | `Object` | `{}` | 扩展选项 |

**option 参数**：

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `requestFormat` | `String` | `'JSON'` | 请求体格式 |
| `responseFormat` | `String` | `'JSON'` | 响应解析格式 |
| `timeout` | `Number` | `0` | 超时毫秒数（0 不超时） |
| `headers` | `Object` | `{}` | 额外请求头 |

```javascript
import { requestJSON, HTTP_METHOD } from './src/Lang/Net.js';

requestJSON('/api/data', {page:1})
  .then(data => console.log(data))
  .catch(err => console.error(err));

requestJSON('/api/save', {name:'Alice'}, HTTP_METHOD.POST);
```

### `Net` 类（高级用法）

```javascript
import { Net } from './src/Lang/Net.js';
const req = new Net(url, data, method, option);
req.send().then(response => {});
req.abort(); // 取消请求
```

### URL 工具

```javascript
mergerUriParam(uri, data)         // 合并 URL 参数
QueryString.stringify(data)       // 对象转查询字符串
QueryString.parse(str)            // 查询字符串转对象
setHash(data)                     // 设置 URL Hash
getHash()                         // 获取 URL Hash
openLinkWithoutReferer(link)      // 无 Referer 打开链接
```

### 下载

```javascript
downloadString(string, fileName, fileMime?)  // 下载字符串内容为文件
downloadFile(url, saveName?)                 // 触发文件下载
downloadFiles(urls, itemCallback?)           // 批量下载
```

---

## ReportApi.js

上报接口工具（用于数据埋点）。

```javascript
import { onReportApi } from './src/Lang/ReportApi.js';
onReportApi.listen((url, data) => { /* 自定义处理 */ });
```

---

## Route.js

History API 路由工具。

```javascript
pushState(param, title?)    // 更新 URL（pushState），param 为对象或字符串
onStateChange(payload)      // 监听 popstate 事件
```

---

## String.js

字符串工具函数。

```javascript
// 模板字符串替换（非 ES6 模板，用于运行时）
extract(es_template, params)   // extract('Hello ${name}', {name:'Alice'})

// 字符操作
capitalize(str)                // 首字母大写
strToPascalCase(str, capitalize_first?) // 下划线/连字符转 PascalCase
cutString(str, len, eclipse_text?) // 截断并添加省略号
trim(str, chars?, dir?)        // 去除首尾指定字符

// 编码
toHtmlEntities(str)
fromHtmlEntities(str)
utf8Encode(str)
utf8Decode(str)
getUTF8StrLen(str)   // UTF8 字节长度（中文=3字节）
regQuote(str)        // 转义正则特殊字符

// 随机
randomString(length?, sourceStr?)    // 随机字符串
randomWords(count?, letterMax?)      // 随机单词（伪英文）
randomSentence(maxLength?, multipleLine?) // 随机句子

// 格式化
formatSize(num, precision?)   // 字节大小格式化（如 '1.23 MB'）
explodeBy(separator, str)     // 按分隔符切割并去除空白元素

// 校验
isValidUrl(urlString)         // 是否合法 URL
isJSON(json)                  // 是否合法 JSON
isNum(val)                    // 是否为数值

// 版本
versionCompare(v1, v2, index)  // 版本号比较，返回 -1/0/1

// 常量
TRIM_BOTH / TRIM_LEFT / TRIM_RIGHT
```

---

## Time.js

时间与日期工具。

### 时间常量（毫秒）

```javascript
ONE_MINUTE    // 60000
ONE_HOUR      // 3600000
ONE_DAY       // 86400000
ONE_WEEK      // 604800000
ONE_MONTH_30  // 2592000000
ONE_MONTH_31  // 2678400000
ONE_YEAR_365  // 31536000000
```

### `formatDate(format, date?)`

日期格式化。

| 格式符 | 说明 |
|--------|------|
| `Y` | 4位年份 |
| `m` | 2位月份 |
| `d` | 2位日 |
| `H` | 2位小时（24h） |
| `i` | 2位分钟 |
| `s` | 2位秒 |

```javascript
import { formatDate } from './src/Lang/Time.js';
formatDate('Y-m-d H:i:s');               // '2026-02-27 10:30:00'
formatDate('Y/m/d', new Date('2025-01-01')); // '2025/01/01'
```

### 频率控制

```javascript
// 延迟执行（防抖）
frequencyControl(payload, interval, executeOnFistTime?)
```

### 其他

```javascript
getMonthLastDay(year, month)   // 指定月份最后一天（day 数）
getLastMonth(year, month)      // 上一个月 {year, month}
getNextMonth(year, month)      // 下一个月 {year, month}
monthsOffsetCalc(monthNum, start_date?) // 月份偏移计算
prettyTime(micSec, delimiter?) // 毫秒转人类可读时间字符串
countDown(timeout, tickFunc, onFinish)  // 倒计时（每秒回调）
getETA(startTime, index, total, pretty?) // 预计完成时间
```

---

## Util.js

通用工具函数。

### ID/标识

```javascript
guid(prefix?)        // 生成 GUID 字符串
getCurrentScript()   // 获取当前执行的 script 标签
```

### 环境检测

```javascript
inMobile()           // 是否移动端
isObject(item)       // 是否为普通对象
isFunction(value)    // 是否为函数
isPromise(obj)       // 是否为 Promise
```

### 节流/防抖

```javascript
throttle(fn, intervalMiSec)       // 节流（按时间间隔执行）
throttleEffect(fn, intervalMiSec) // 节流（确保最后一次执行）
debounce(fn, intervalMiSec)       // 防抖
```

### 单次执行

```javascript
// 缓存首次执行结果，后续直接返回
doOnce(markKey, dataFetcher?, storageType?)
// storageType: 'storage'(localStorage) | 'memory'(内存)
```

### 对象深合并

```javascript
mergeDeep(target, ...sources)    // 深度合并对象
```

### 模块动态加载

```javascript
getLibEntryScript()    // 获取库入口 script 标签
getLibModule()         // 动态 import 本库（返回 Promise）
getLibModuleTop()      // 从顶层 window 获取本库模块
```

### Promise 状态

```javascript
PROMISE_STATE_PENDING / PROMISE_STATE_FULFILLED / PROMISE_STATE_REJECTED
getPromiseState(promise)   // 获取 Promise 当前状态（返回 Promise）
```

### 控制台

```javascript
CONSOLE_COLOR   // 预定义颜色映射
bindConsole(method, payload)   // 监听控制台方法调用
```
