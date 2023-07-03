# WebCom轻代码库

[TOC]

## 一、简介

WebCom是基于ES6语法封装的前端通用辅助库。代码库中包含各类语言增强函数、对象，以及一些常见的UI Widget。同时代码库还提供了一套建议的低代码研发模式的前端框架，提供给类似管理台场景使用，减少前端人员投入。

## 二、安装使用

1、引入
html或js直接使用ES6方式引入即可。

<script src="/dist/webcom.es.js" type="module"></script>

```js
import {formSerializeJSON} from "/dist/webcom.es.js";
let data = formSerializeJSON(dom);
```

2、Widget使用

```js
import {Dialog} from "/dist/webcom.es.js";
Dialog.alert('提示', '提示内容');
```

3、自动组件使用

```js
//启动
import {ACComponent} from "/dist/webcom.es.js";
ACComponent.watch(document, 'data-component');
```

```html
<!-- HTML 中使用 -->
<a href="/cgi-bin/deletePost&id=1" data-component="confirm,async" data-confirm-message="确认删除该文章？">删除文章</a>

<a href="/cgi-bin/update&id=1" data-component="dialog">窗口方式编辑文章</a>
```

## 三、搭建自己的自动组件

自动组件为 class 封装，其中包含 `static init(node, param){}` 方法、`static active(node, param){}` 方法。
两个方法均返回 `Promise` 对象，其中 resolve 方法表示继续执行其他组件，reject表示终端后续组件执行（多组件情况下）。组件通过 `ACComponent.register('MyComponent', class); ` 方式注册。详细可参考代码库中已经存在的自动组件。
