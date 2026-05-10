# AGENTS.md —— 二次元正太风个人起始页

> **权威文档已迁移至 [PROJECT.md](./PROJECT.md)**，本文件仅保留设计 token 参考与动效接口。
> 本文件基于 2026-05 状态更新。本项目为纯静态前端项目，无构建工具、无框架、无依赖。

---

## 1. 项目概述

一个单页个人浏览器起始页，气质定位为「晨光薄纱 · 棉花糖融化 · 奶白温润」的二次元正太风。**当前布局模仿 Bing/Google 起始页**：内容坐上中部、搜索框为视觉中心、时钟为辅助元素。

核心功能包括：

- **实时时钟**：52px/weight-300，冒号呼吸灯与秒脉冲动画。
- **多搜索引擎切换**：百度、谷歌、必应、DuckDuckGo。
- **搜索建议**：基于百度 JSONP API 的实时补全，150ms 防抖。
- **书签网格**：64px 圆形图标，可增删改，自动探测 favicon，带首字母兜底。
- **时间问候语**：根据当前时段显示不同文案，固定于视口底部。
- **背景氛围层**：呼吸式渐变光斑 + 50 个漂浮微粒。

**技术栈：** 纯原生 HTML / CSS / JavaScript，无框架，无构建工具，无包管理器，零外部依赖。

**运行方式：** 直接在浏览器中打开 `index.html` 即可，无需编译或启动开发服务器。

---

## 2. 文件结构

```
D:\experiment1\2\
├── index.html              # 主页面入口（加载 css/style.css + 5 个 JS 模块）
├── css/
│   └── style.css           # 全局样式、设计令牌、Bing风格视觉系统（~1015 行）
├── js/
│   ├── clock.js            # 时钟模块：冒号呼吸灯、秒脉冲
│   ├── search.js           # 搜索引擎切换 + 百度 JSONP 搜索建议 + 本地存储
│   ├── ambience.js         # 背景漂浮微粒系统（50 粒子、8 方向、正弦波摆动）
│   ├── bookmark-manager.js # 书签网格 CRUD、favicon 自动探测、弹窗编辑
│   └── greeting.js         # 时间问候语（5 个时段规则、每小时刷新）
├── .gitignore              # 忽略 startpage/、node_modules/、.claude/、系统文件等
├── PROJECT.md              # 【权威】AI 交接文档，替代本文件的架构描述
├── AGENTS.md               # 本文件
└── CLAUDE.md               # Claude Code 专用快速参考
```

> **历史清理注意：**
> - 根目录 `main.js` 已在 `e3cdcd2` 提交中删除。
> - `startpage/` 子目录在 `.gitignore` 中，物理存在但不被 Git 追踪，为旧版轻量版本。
> - 详见 **PROJECT.md** 获取完整的当前架构、布局尺寸、陷阱与演进记录。

---

## 3. 设计系统（Design Tokens）

所有视觉参数集中定义在 `:root`，**后续修改必须从这里统一调整**，禁止在选择器中硬编码色值。

### 3.1 色彩

| Token | 值 | 用途 |
|---|---|---|
| `--accent` | `#FFB7A5` | 唯一强调色（暖杏色） |
| `--accent-soft` | `rgba(255,183,165,0.25)` | 悬停背景、激活态底色 |
| `--accent-glow` | `rgba(255,183,165,0.35)` | 输入框聚焦光晕 |
| `--accent-hover` | `rgba(255,183,165,0.15)` | 引擎下拉项悬停 |
| `--text-main` | `#5A4A42` | 主文字（深灰棕，禁止纯黑） |
| `--text-sub` | `#9E8E86` | 次要文字 |
| `--text-placeholder` | `#C4B5AD` | 占位符文字 |
| `--surface` | `rgba(255,255,255,0.6)` | 卡片/表面底色 |
| `--surface-hover` | `rgba(255,255,255,0.75)` | 表面悬停提亮 |
| `--border-light` | `rgba(255,255,255,0.85)` | 极淡白光边框/内阴影 |

**背景渐变（body 与 `.ambient-base`）：**
```css
background: linear-gradient(135deg, #E8F0F5 0%, #FFFBF5 45%, #FDF2F0 100%);
```
- 方向：135°（左上 → 右下）
- 色阶：淡蓝 → 奶白基底 → 淡粉
- 必须保持 `background-attachment: fixed`

### 3.2 阴影层级

| Token | 值 | 用途 |
|---|---|---|
| `--shadow-float` | `0 8px 32px rgba(90,74,66,0.05)` | 默认悬浮感 |
| `--shadow-hover` | `0 12px 40px rgba(90,74,66,0.08)` | 悬停时略加深 |
| `--shadow-inner` | `inset 0 0 0 1px rgba(255,255,255,0.9)` | 内描边，模拟厚度 |

**原则：** 阴影必须使用 `rgba(90,74,66,0.05~0.08)` 级别，**禁止**出现沉重黑色投影。

### 3.3 圆角尺度

| Token | 值 | 用途 |
|---|---|---|
| `--radius-card` | `24px` | 主容器卡片 |
| `--radius-pill` | `9999px` | 搜索栏、按钮（胶囊形） |
| `12px` | — | 引擎当前按钮、下拉项、建议首末项 |
| `16px` | — | 引擎下拉浮层、弹窗输入框 |
| `20px` | — | 搜索建议下拉框 |

### 3.4 过渡曲线

| Token | 值 | 用途 |
|---|---|---|
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹性动画（浮层展开、悬停回弹） |
| `--ease-soft` | `cubic-bezier(0.4,0,0.2,1)` | 柔和过渡（颜色、阴影、透明度） |

---

## 4. 模块详解

### 4.1 时钟模块（js/clock.js）

- 自包含 IIFE，页面加载即执行。
- 使用 `pad()` 手动格式化 `HH:mm:ss`，而非 `toLocaleTimeString`，以便拆分出可独立控制动画的 `<span class="clock-colon">`。
- **冒号呼吸灯**：`.clock-colon` 默认播放 `colonBreathe` 1.8s 循环。
- **秒脉冲**：每秒检测到秒数变化时，给两个冒号添加 `.pulse` 类触发一次 `colonPulse` 缩放动画；通过移除→强制 reflow→重新添加的方式保证动画可重播。
- 时钟数字使用 `font-variant-numeric: tabular-nums` 防止跳动。

### 4.2 搜索引擎切换模块（js/search.js）

**支持的引擎：**

| key | 名称 | 图标 | URL 模板 |
|---|---|---|---|
| `baidu` | 百度 | 🔍 | `https://www.baidu.com/s?wd=` |
| `google` | 谷歌 | 🔎 | `https://www.google.com/search?q=` |
| `bing` | 必应 | 🌐 | `https://www.bing.com/search?q=` |
| `duckduckgo` | DuckDuckGo | 🦆 | `https://duckduckgo.com/?q=` |

**状态持久化：**
- `localStorage` 键名：`preferred_engine`
- 默认值：`baidu`
- 读取失败时静默回退到默认值

**交互细节：**
- 引擎按钮位于搜索栏内部左侧，与输入框共用 `.search-field` 外框。
- 点击按钮展开/收起下拉浮层；点击外部自动关闭。
- 下拉浮层使用 `transform-origin: top left`，展开动画为 `opacity + translateY(-8px) + scale(0.98) → 正常`。
- 当前选中项左侧显示暖杏色小圆点（`.engine-dot`）。
- 切换引擎时，搜索框 `placeholder` 先淡出（`.is-switching`，150ms）再更换文字并淡入。
- 回车搜索、上下键选择建议、ESC 关闭建议框等逻辑与引擎切换共存。

**搜索建议：**
- 使用百度搜索建议 JSONP API：`https://suggestion.baidu.com/su?wd={kw}&cb={callback}`
- 防抖 150ms
- 建议下拉框样式与引擎下拉框独立，圆角 20px
- 悬停/键盘选中背景为 `--accent-soft`
- 每次请求生成唯一回调名 `baiduSuggestionCallback_{timestamp}`，成功或失败后清理临时 `script` 标签与全局回调函数。

### 4.3 背景氛围层模块（js/ambience.js）

- 自包含 IIFE，操作 `#ambientParticles` 容器。
- 生成 50 个 SVG 微粒（`PARTICLE_COUNT` 建议保持 40~60）。
- 三种形状：四角星 `star4`、泡泡 `bubble`、十字星 `cross`，每种有独立的透明度池与颜色池（含暖杏色混入）。
- 8 个运动方向（四边 + 四角对角线），速度按真实穿越距离计算，确保 30~60 秒完成一次穿越。
- 垂直于运动方向的正弦波摆动（`sineAmp`、`sineFreq`、`sinePhase`）。
- 使用 `requestAnimationFrame` 循环，带 `dt` 上限 0.1s 防止切页后跳变。
- 粒子出界或寿命耗尽时 `reset()`，初始加载时随机散布在屏幕内。

> `startpage/js/ambience.js` 为精简版：20 粒子、尺寸 4~12px、透明度 15%~30%，其余算法相同。

### 4.4 书签网格管理模块（js/bookmark-manager.js）

- 自包含 IIFE，操作 `#bookmarkGrid`。
- **数据持久化**：`localStorage` 键名 `bookmarks`，首次访问无数据时自动写入 4 个预设（B站、Google、ChatGPT、GitHub）。
- **favicon 探测**：
  - 优先级 1：`https://www.google.com/s2/favicons?domain={domain}&sz=128`
  - 优先级 2：`https://icons.duckduckgo.com/ip3/{domain}.ico`
  - 加载失败时自动回退到首字母圆形兜底（`.bookmark-initial`）。
  - B站域名特殊处理：直接走首字母兜底（`isBilibili` 检测正则：`/bilibili|b23\.tv/i`）。
- **CRUD 操作**：
  - 添加：点击 "+" 号打开弹窗，输入名称与网址，自动探测 favicon 并实时预览。
  - 编辑：悬停书签卡片时显示编辑按钮（铅笔图标），可修改名称与网址。
  - 删除：悬停时显示删除按钮（× 图标），带 `bookmarkRemove` 淡出动画，动画结束后从 DOM 与 localStorage 移除。
- **弹窗**：动态创建 `.bm-overlay` + `.bm-modal`，支持点击遮罩、ESC、取消按钮关闭。网址输入框防抖 500ms 自动刷新预览。
- **网格布局**：CSS Grid 固定 4 列（`repeat(4, 1fr)`），内部垂直滚动条隐藏。

### 4.5 时间问候语模块（js/greeting.js）

- 自包含 IIFE，操作 `#greetingText`。
- 按小时段返回不同文案（5 段规则，含跨午夜 22:00–04:59）。
- 每小时自动刷新一次，切换时带 200ms 淡入淡出过渡。
- 固定定位在视口底部（`position: fixed; bottom: 60px; z-index: 100;`），`pointer-events: none` 不拦截点击。

### 4.6 视觉层（css/style.css）

**关键布局约定（当前 Bing 风格）：**
- `body` 使用 `display: flex; justify-content: center; align-items: flex-start; min-height: 100vh;`，内容坐上中部。
- `.container` 为纯布局容器（无背景、无边框、无阴影），`margin-top: 14vh; max-width: 680px; gap: 0`。
- 三层间距用 `margin-bottom` 控制：`.layer-clock` 28px、`.layer-search` 40px、`.layer-bookmark` 0。
- `.search-field` 为 `display: flex`，高度 52px，`border-radius: 26px`，背景 `rgba(255,255,255,0.75)`。
- 搜索框 `.search-box` 宽度 `min-width: 600px; max-width: 720px`。
- 聚焦效果由 `.search-field:focus-within` 统一控制（暖杏色光晕）。

**书签网格样式要点：**
- `.bookmark-grid` 使用 `display: flex; flex-wrap: wrap`，`gap: 28px 32px`。
- `.bookmark-icon-wrap` 为 64px 圆形毛玻璃容器，悬停时上浮 6px。
- `.bookmark-favicon-wrap` 与 `.bookmark-initial` 为 32px 内层圆形。
- 编辑/删除按钮（22px）平时 `opacity: 0`，悬停卡片时浮现。
- `max-height: 140px` + 隐藏滚动条处理溢出。

**响应式断点：**
- `@media (max-width: 480px)`：容器 `margin-top: 10vh`，时钟 40px，图标 48px/28px，网格间距 20px 24px，引擎名称隐藏。

**背景氛围层：**
- 三层固定全屏元素（`.ambient-base` z-index 0、`.ambient-blobs` z-index 1、`.ambient-particles` z-index 2），`pointer-events: none`。
- 两个大半径高斯模糊光斑分别使用 26s 与 34s 的交替漂移动画。

---

## 5. 构建与测试

### 5.1 构建

本项目**无构建步骤**。没有 `package.json`、`pyproject.toml`、`Cargo.toml` 或任何其他构建配置文件。

开发时直接在浏览器中打开 `index.html` 即可预览。推荐使用任意本地静态服务器（如 VS Code 的 Live Server 插件、Python `http.server`、Node `serve` 等）以避免 `file://` 协议下的潜在限制。

### 5.2 测试

本项目**无自动化测试套件**，无 linter，无格式化工具配置。

验证方式：
- 手动在浏览器中打开页面，检查时钟是否正常走动、冒号是否有脉冲动画。
- 测试搜索引擎切换、下拉浮层动画、placeholder 过渡。
- 测试搜索建议的键盘导航（↑/↓/Enter/Esc）。
- 测试书签的添加、编辑、删除、空状态、favicon 加载失败后的首字母兜底。
- 测试弹窗的打开、保存、取消、ESC 关闭、遮罩点击关闭。
- 在浏览器 DevTools 中切换至移动端视口，验证 `@media (max-width: 480px)` 响应式表现。
- 测试隐私模式/无痕窗口，确保 `localStorage` 被禁用时页面不报错。

---

## 6. 代码风格指南

### 6.1 CSS

- **设计令牌优先**：所有色值、阴影、圆角、过渡曲线必须引用 `:root` 中的 CSS 自定义属性，禁止在普通选择器中硬编码色值。
- **强调色唯一性**：只允许使用 `#FFB7A5` 作为强调色，禁止引入第二种高饱和色。
- **禁止纯黑/深灰边框：** 所有边框必须使用 `--border-light` 或内阴影模拟层次。
- **注释结构**：CSS 按功能分区，使用 `/* ---------- N. 区块名 ---------- */` 格式。

### 6.2 JavaScript

- **分文件管理**：
  - 时钟逻辑在 `js/clock.js`
  - 搜索逻辑在 `js/search.js`
  - 氛围层在 `js/ambience.js`
  - 书签管理在 `js/bookmark-manager.js`
  - 问候语在 `js/greeting.js`
  - 样式写在 `css/style.css`
  - 不要往 `main.js` 或根目录旧文件中追加功能。
- **localStorage 容错**：读写 `localStorage` 必须包在 `try...catch` 中，避免隐私模式报错。
- **JSONP 清理**：搜索建议的临时 `script` 标签和全局回调函数必须在成功/失败后清理，防止内存泄漏。
- **事件委托**：如无必要，优先直接绑定；搜索建议列表项与引擎下拉项在渲染时逐个绑定点击事件（当前实现方式）。
- **自包含 IIFE**：`js/clock.js`、`js/ambience.js`、`js/bookmark-manager.js`、`js/greeting.js` 均为 IIFE，无 exports，无外部依赖。
- **混合语法风格**：根目录 JS 模块混用 `var` 与 `const/let`（`js/clock.js`、`js/ambience.js`、`js/bookmark-manager.js`、`js/greeting.js` 以 `var` 为主；`js/search.js` 使用 `const/let`）。新增代码建议保持与所在文件一致的风格。

### 6.3 HTML

- 语义化标签与 ARIA 属性：引擎选择器使用 `aria-haspopup`、`aria-expanded`、`aria-label`、`role="listbox"`、`role="option"` 等。
- 脚本放在 `</body>` 前，按 `js/clock.js` → `js/search.js` → `js/ambience.js` → `js/bookmark-manager.js` → `js/greeting.js` 顺序加载。

---

## 7. 开发约束与注意事项

1. **强调色唯一性：** 只允许使用 `#FFB7A5` 作为强调色，禁止引入第二种高饱和色。
2. **禁止纯黑/深灰边框：** 所有边框必须使用 `--border-light` 或内阴影模拟层次。
3. **分文件管理：** 各模块逻辑必须写在对应 `js/` 文件中。
4. **localStorage 容错：** 读写 `localStorage` 必须包在 `try...catch` 中，避免隐私模式报错。
5. **搜索引擎配置扩展：** 如需新增引擎，只需在 `js/search.js` 顶部 `engines` 数组中追加对象，无需改动 DOM 结构。
6. **JSONP 清理：** 搜索建议的临时 `script` 标签和全局回调函数必须在成功/失败后清理，防止内存泄漏。
7. **`*` transition 陷阱已修复：** 全局 `* { transition: transform ... }` 已在 `e3cdcd2` 提交中移除，不再与 CSS 动画和 `position: fixed` 居中定位冲突。
8. **脚本执行顺序：** 本项目没有 `DOMContentLoaded` 或 `defer`，所有 JS 都是 IIFE、加载即执行。`<script>` 标签必须放在它所操作的 DOM 元素**之后**，否则 `getElementById` 返回 `null`。

---

## 8. 动效预留接口

以下类名和 `@keyframes` 已预定义，供后续 JS 交互直接调用：

| 类名 / Keyframes | 说明 |
|---|---|
| `body.is-breathing` | 启动背景渐变呼吸动画（`filter: brightness` 循环，8s） |
| `.is-pulsing` | 触发一次弹性缩放脉冲（`softPulse`） |
| `.is-floating` | 启动上下漂浮循环（`float`，3s） |

**使用方式：**
```js
document.body.classList.add('is-breathing');
```

---

## 9. 部署

本项目为纯静态页面，部署方式极为灵活：

- 直接双击 `index.html` 在浏览器中打开（个人本地使用）。
- 上传至任何静态托管服务（GitHub Pages、Vercel、Netlify、Cloudflare Pages、对象存储 CDN 等）。
- `startpage/` 子目录可作为独立轻量版本单独部署（不含书签管理器与问候语模块）。
- 无需环境变量、无需服务端运行时、无需数据库。

---

## 10. 已知待扩展点（非 bug）

- [ ] 背景呼吸动画默认处于 `paused` 状态，需用户手动或通过 JS 开启。
- [ ] 搜索建议目前仅接入百度 API，切换其他引擎时建议词仍来自百度词库（行为与主流浏览器地址栏一致）。
- [ ] 尚未实现天气模块（用户明确指示不要涉及）。
