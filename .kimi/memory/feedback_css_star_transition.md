---
name: CSS 通用选择器 transition 陷阱
description: "* 的 transition 会破坏 CSS 动画和 fixed 定位"
type: feedback
originSessionId: 077fa275-b695-4c68-a66d-12d18416efc0
source: claude-code
---

本项目 `css/style.css` 中有全局规则：
```css
* {
    transition: background-color ..., box-shadow ..., transform ..., opacity ...;
}
```
这个 `*` 选择器会给**所有元素**加 `transition: transform ...`，导致：
1. CSS 动画结束后 `transform` 被 transition 覆盖/重置
2. `position: fixed` 元素的 `translateX(-50%)` 居中丢失
3. 元素视觉位置偏移或"消失"

**Why:** 用户给全局元素加了弹性过渡效果方便交互，但副作用是动画结束后的 transform 被 `*` 的 transition 抢占。

**How to apply:** 给需要动画或 fixed 定位的元素显式加 `transition: none` 覆盖通配符规则。或者排除特定类名：`*:not(.xxx) { transition: ... }`。
