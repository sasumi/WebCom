/**
 * WebCom Samples 公共辅助脚本
 */

// 注入公共导航和样式
const NAV_HTML = `<nav id="sample-nav">
  <a href="index.html">&larr; 示例索引</a>
</nav>`;

const COMMON_STYLE = `
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
  #sample-nav { background: #1e3a5f; padding: 0.6em 1.5em; }
  #sample-nav a { color: #93c5fd; text-decoration: none; font-size: 0.9em; }
  #sample-nav a:hover { color: #fff; }
  .page-wrap { max-width: 900px; margin: 0 auto; padding: 1.5em 2em 4em; }
  h1 { font-size: 1.5em; color: #1e3a5f; border-bottom: 2px solid #dbeafe; padding-bottom: 0.4em; margin-bottom: 0.3em; }
  .subtitle { color: #666; margin: 0 0 2em; font-size: 0.9em; }
  h2 { font-size: 1.1em; color: #374151; margin-top: 2em; }
  .demo-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5em; margin: 1em 0; }
  .code-block { background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 1em 1.2em; font-size: 0.85em; font-family: 'Fira Code', Consolas, monospace; overflow-x: auto; margin: 0.5em 0 1.5em; line-height: 1.6; white-space: pre; }
  .param-table { width: 100%; border-collapse: collapse; font-size: 0.85em; margin: 0.5em 0 1.5em; }
  .param-table th { background: #f1f5f9; text-align: left; padding: 0.5em 0.8em; color: #475569; }
  .param-table td { padding: 0.45em 0.8em; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .param-table code { background: #f1f5f9; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.95em; }
  button, input[type=button] { background: #2563eb; color: #fff; border: none; padding: 0.45em 1.2em; border-radius: 5px; cursor: pointer; font-size: 0.9em; }
  button:hover, input[type=button]:hover { background: #1d4ed8; }
  button.secondary { background: #6b7280; }
  button.secondary:hover { background: #4b5563; }
  button.danger { background: #dc2626; }
  button.danger:hover { background: #b91c1c; }
  input[type=text], input[type=number], input[type=date], input[type=datetime-local], select, textarea {
    border: 1px solid #d1d5db; border-radius: 5px; padding: 0.4em 0.7em; font-size: 0.9em; outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; }
  label { font-size: 0.9em; color: #374151; }
  .result-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.8em 1em; font-size: 0.85em; color: #166534; margin-top: 0.8em; min-height: 2em; }
  .gap { display: flex; gap: 0.7em; flex-wrap: wrap; align-items: center; }
  .note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 0.6em 1em; font-size: 0.85em; color: #78350f; border-radius: 0 5px 5px 0; margin: 0.5em 0 1em; }
</style>`;

document.head.insertAdjacentHTML('beforeend', COMMON_STYLE);
document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
