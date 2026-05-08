---
name: 问候语模块调试状态
description: 问候语 position:fixed 底部定位仍在排查中
type: project
originSessionId: 077fa275-b695-4c68-a66d-12d18416efc0
source: claude-code
---

**当前状态：调试中（2026-05-08）**

用户要求将问候语放在视口最底部（`position: fixed; bottom: 24px`），但多次修改后问候语仍然不显示或位置不对。

已排查的问题：
1. `*` 通用 transition 破坏 transform — 已加 `transition: none` 覆盖
2. `<script>` 在 DOM 元素之前 — 已将 `<p>` 移到脚本前面
3. 当前调试版本：红色边框 + 红色背景，z-index: 9999

**待确认：** 用户刷新后是否能看到红色边框元素。如果看不到，可能是 GitHub Pages 缓存问题，需加 cache-busting 参数。

**目标样式：**
- `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`
- `z-index: 100; pointer-events: none`
- `font-size: 11px; color: rgba(90,74,66,0.35); letter-spacing: 0.1em`
- 入场动画 0.8s ease-out 延迟 1.0s
