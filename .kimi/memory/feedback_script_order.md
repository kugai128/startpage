---
name: 脚本执行顺序与 DOM 就绪
description: script 标签必须在引用的 DOM 元素之后
type: feedback
originSessionId: 077fa275-b695-4c68-a66d-12d18416efc0
source: claude-code
---

本项目没有使用 `DOMContentLoaded` 或 `defer`。所有 JS 模块都是 IIFE，加载即执行。因此：
- `<script>` 标签必须放在它所操作的 DOM 元素**之后**
- 如果脚本在元素之前，`getElementById` 返回 `null`，脚本直接退出

**Why:** 本次问候语模块反复"消失"，原因之一就是 `<script src="greeting.js">` 在 `<p id="greetingText">` 之前加载，JS 找不到元素直接 return。

**How to apply:** 始终将 `<script>` 放在页面末尾、所有 DOM 元素之后。或者确保目标元素在 `<script>` 标签之前。
