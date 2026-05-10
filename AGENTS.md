# AGENTS.md —— 二次元正太风个人起始页

> 本文档面向 AI 编码代理。阅读者被假定为对项目一无所知。
> **权威架构文档**：请参阅 [PROJECT.md](./PROJECT.md) 获取完整的历史演进、精确尺寸、已知陷阱与 Git 部署信息。
> **最后更新**：2026-05-10

---

## 1. 项目概述

**名称**：二次元正太风个人浏览器起始页  
**用途**：浏览器新标签页 / 个人起始页  
**部署地址**：https://kugai128.github.io/startpage/  
**远程仓库**：https://github.com/kugai128/startpage.git  

**气质定位**：晨光薄纱 · 棉花糖融化 · 奶白温润。

**当前布局模仿 Bing/Google 起始页**：内容坐上中部、搜索框为绝对视觉中心、时钟为辅助元素。

**核心功能**：
- **实时时钟**：52px / weight-300，冒号呼吸灯与秒脉冲动画。
- **多搜索引擎切换**：百度、谷歌、必应、DuckDuckGo。
- **搜索建议**：基于百度搜索建议 JSONP API 的实时补全，150ms 防抖。
- **书签网格**：64px 圆形图标，可增删改，自动探测 favicon，带首字母兜底。
- **时间问候语**：根据当前时段显示不同文案，固定于视口底部。
- **背景氛围层**：呼吸式渐变光斑 + 50 个漂浮微粒。

**技术栈**：纯原生 HTML / CSS / JavaScript。零框架、零构建工具、零包管理器、零外部依赖。

---

## 2. 文件结构与关键配置

### 2.1 项目根目录

```
D:\experiment1\2\
├── index.html              # 主页面入口（加载 css/style.css + 5 个 JS 模块）
├── css/
│   └── style.css           # 全局样式、设计令牌、Bing 风格视觉系统（~1014 行）
├── js/
│   ├── clock.js            # 时钟模块：冒号呼吸灯、秒脉冲、入场动画
│   ├── search.js           # 搜索引擎切换 + 百度 JSONP 搜索建议 + 本地存储
│   ├── ambience.js         # 背景漂浮微粒系统（50 粒子、8 方向、正弦波摆动）
│   ├── bookmark-manager.js # 书签网格 CRUD、favicon 自动探测、弹窗编辑
│   └── greeting.js         # 时间问候语（5 个时段规则、每小时刷新）
├── .gitignore              # 忽略 startpage/、node_modules/、.claude/、系统文件等
├── PROJECT.md              # 【权威】AI 交接文档，含架构演进与精确尺寸速查
├── AGENTS.md               # 本文件
└── CLAUDE.md               # Claude Code 专用快速参考
```

### 2.2 关键配置说明

本项目**没有任何传统意义上的构建配置文件**：

- **无 `package.json`** —— 不依赖 Node.js/npm。
- **无 `pyproject.toml` / `requirements.txt`** —— 不依赖 Python。
- **无 `Cargo.toml`** —— 不依赖 Rust。
- **无 `vite.config.*` / `webpack.config.*` / `rollup.config.*` 等** —— 无任何前端构建工具。

唯一的配置类文件是 `.gitignore`，用于排除本地开发产物（`node_modules/`、`startpage/`、`.claude/`、编辑器文件、系统文件）。

`startpage/` 子目录在 `.gitignore` 中，物理存在但不被 Git 追踪，是旧版轻量版本（含独立的 `index.html`、`main.js`、`css/`、`js/`）。

---

## 3. 技术栈与运行时架构

### 3.1 纯静态前端

- **HTML5**：语义化标签 + ARIA 属性（`aria-haspopup`、`aria-expanded`、`role="listbox"`、`role="option"` 等）。
- **CSS3**：CSS 自定义属性（Design Tokens）、Flexbox、CSS Grid（书签区使用 `display: flex; flex-wrap: wrap`）、`backdrop-filter` 毛玻璃、`@keyframes` 动画、`requestAnimationFrame` 配合 JS。
- **JavaScript**：ES5/ES6 混合，无 Babel/TypeScript。

### 3.2 脚本加载与执行模型

所有 JS **均为 IIFE（立即执行函数）或顶层脚本，加载即执行**。不使用 `DOMContentLoaded`、`defer` 或 `async`。

**加载顺序（不可更改）**：

```html
<script src="js/clock.js"></script>             <!-- 1. 时钟 -->
<script src="js/search.js"></script>            <!-- 2. 搜索 -->
<script src="js/ambience.js"></script>          <!-- 3. 背景微粒 -->
<script src="js/bookmark-manager.js"></script>  <!-- 4. 书签 -->
<script src="js/greeting.js"></script>          <!-- 5. 问候语 -->
```

**铁律**：`<script>` 标签必须放在它所操作的 DOM 元素**之后**，否则 `getElementById` 返回 `null`。

### 3.3 外部依赖

项目零 npm 依赖。运行时唯一接触的外部服务：

| 服务 | 用途 | 文件 |
|---|---|---|
| `suggestion.baidu.com/su?wd=...&cb=...` | 搜索建议 JSONP | `js/search.js` |
| `google.com/s2/favicons?domain=...&sz=128` | favicon 探测优先级 1 | `js/bookmark-manager.js` |
| `icons.duckduckgo.com/ip3/{domain}.ico` | favicon 探测优先级 2 | `js/bookmark-manager.js` |

---

## 4. 代码组织与模块划分

### 4.1 模块职责

| 文件 | 作用域风格 | 核心职责 |
|---|---|---|
| `js/clock.js` | IIFE，`var` 为主 | 操作 `#clock`，手动拼装 `HH:mm:ss` HTML，拆分 `<span class="clock-colon">` 以便独立控制呼吸/脉冲动画。 |
| `js/search.js` | 顶层脚本，`const/let` | 操作 `#search`、`#engineSelector`、`#suggestions`。引擎配置数组、localStorage 持久化、百度 JSONP 建议、键盘导航、点击外部关闭。 |
| `js/ambience.js` | IIFE，`const` + `class` | 操作 `#ambientParticles`。`Particle` 类管理 50 个 SVG 微粒的生成、运动、正弦波摆动与重置。 |
| `js/bookmark-manager.js` | IIFE，`var` 为主 | 操作 `#bookmarkGrid`。书签数据 CRUD、 favicon 探测链（Google → DuckDuckGo → 首字母兜底）、动态弹窗、B 站特殊处理。 |
| `js/greeting.js` | IIFE，`var` 为主 | 操作 `#greetingText`。5 段时段规则匹配、每小时刷新、200ms 淡入淡出。 |

### 4.2 样式组织

所有视觉样式集中在 `css/style.css`（~1014 行）。按功能分区，注释格式为 `/* ---------- N. 区块名 ---------- */`。

关键分区：
1. reset & 奶白基底
2. 动效预留接口（`:root` Design Tokens）
3. 背景呼吸动画
4. 主容器布局
5. 时钟样式与动画
6. 搜索区域（搜索框、引擎选择器、建议下拉）
7. 书签网格与弹窗
8. 弹性悬停动效预留
9. 响应式（`@media (max-width: 480px)`）
10. 背景氛围层（光斑 + 微粒）

---

## 5. 设计系统（Design Tokens）

所有视觉参数集中定义在 `:root`，**禁止在选择器中硬编码色值**。

### 5.1 色彩

| Token | 值 | 用途 |
|---|---|---|
| `--accent` | `#FFB7A5` | 唯一强调色（暖杏色） |
| `--accent-soft` | `rgba(255,183,165,0.25)` | 悬停背景、激活态底色 |
| `--accent-glow` | `rgba(255,183,165,0.35)` | 输入框聚焦光晕 |
| `--accent-hover` | `rgba(255,183,165,0.15)` | 引擎下拉项悬停 |
| `--text-main` | `#5A4A42` | 主文字（深灰棕，禁止纯黑） |
| `--text-sub` | `#9E8E86` | 次要文字 |
| `--text-placeholder` | `#C4B5AD` | 占位符文字 |
| `--border-light` | `rgba(255,255,255,0.85)` | 极淡白光边框/内阴影 |

**背景渐变**：
```css
background: linear-gradient(135deg, #E8F0F5 0%, #FFFBF5 45%, #FDF2F0 100%);
background-attachment: fixed;
```

### 5.2 阴影层级

| Token | 值 | 用途 |
|---|---|---|
| `--shadow-float` | `0 8px 32px rgba(90,74,66,0.05)` | 默认悬浮感 |
| `--shadow-hover` | `0 12px 40px rgba(90,74,66,0.08)` | 悬停时略加深 |
| `--shadow-inner` | `inset 0 0 0 1px rgba(255,255,255,0.9)` | 内描边，模拟厚度 |

### 5.3 圆角与过渡

| Token | 值 | 用途 |
|---|---|---|
| `--radius-card` | `24px` | 主容器卡片 |
| `--radius-pill` | `9999px` | 搜索栏、按钮（胶囊形） |
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹性动画 |
| `--ease-soft` | `cubic-bezier(0.4,0,0.2,1)` | 柔和过渡 |

---

## 6. 构建、测试与部署

### 6.1 构建

**无构建步骤**。没有 `package.json`，没有编译、打包、转译过程。

开发时直接在浏览器中打开 `index.html` 即可预览。推荐使用任意本地静态服务器（如 VS Code Live Server、Python `http.server`、Node `serve` 等）以避免 `file://` 协议下的潜在限制。

### 6.2 测试

**无自动化测试套件**，无 linter，无格式化工具配置。

验证方式为手动测试：
- 时钟是否正常走动、冒号是否有脉冲动画。
- 搜索引擎切换、下拉浮层动画、placeholder 过渡。
- 搜索建议的键盘导航（↑/↓/Enter/Esc）。
- 书签的添加、编辑、删除、空状态、favicon 加载失败后的首字母兜底。
- 弹窗的打开、保存、取消、ESC 关闭、遮罩点击关闭。
- 在浏览器 DevTools 中切换至移动端视口，验证 `@media (max-width: 480px)` 响应式表现。
- 测试隐私模式/无痕窗口，确保 `localStorage` 被禁用时页面不报错。

### 6.3 部署

纯静态页面，部署方式极为灵活：

- **GitHub Pages**（当前方式）：push 到 `master` 分支即自动部署至 `https://kugai128.github.io/startpage/`。
- 也可直接双击 `index.html` 本地使用，或上传至 Vercel / Netlify / Cloudflare Pages / 对象存储 CDN 等任意静态托管服务。

---

## 7. 代码风格指南

### 7.1 CSS

- **设计令牌优先**：所有色值、阴影、圆角、过渡曲线必须引用 `:root` 中的 CSS 自定义属性，禁止在普通选择器中硬编码色值。
- **强调色唯一性**：只允许使用 `#FFB7A5` 作为强调色，禁止引入第二种高饱和色。
- **禁止纯黑/深灰边框**：所有边框必须使用 `--border-light` 或内阴影模拟层次。
- **注释结构**：CSS 按功能分区，使用 `/* ---------- N. 区块名 ---------- */` 格式。
- **无全局 `*` transition**：之前在 `*` 上设置 `transition: transform ...` 会与 CSS 动画和 `position: fixed` 居中定位冲突。已在 `e3cdcd2` 提交中移除，现由各元素显式声明。

### 7.2 JavaScript

- **分文件管理**：各模块逻辑必须写在对应 `js/` 文件中，不要合并到 `main.js` 或根目录旧文件中。
- **localStorage 容错**：读写 `localStorage` 必须包在 `try...catch` 中，避免隐私模式报错。
- **JSONP 清理**：搜索建议的临时 `script` 标签和全局回调函数必须在成功/失败后清理，防止内存泄漏。
- **事件委托**：搜索建议列表项与引擎下拉项在渲染时逐个绑定点击事件（当前实现方式）。
- **自包含 IIFE**：`js/clock.js`、`js/ambience.js`、`js/bookmark-manager.js`、`js/greeting.js` 均为 IIFE，无 exports，无外部依赖。
- **混合语法风格**：根目录 JS 模块混用 `var` 与 `const/let`（`js/clock.js`、`js/ambience.js`、`js/bookmark-manager.js`、`js/greeting.js` 以 `var` 为主；`js/search.js` 使用 `const/let`）。新增代码建议保持与所在文件一致的风格。

### 7.3 HTML

- 语义化标签与 ARIA 属性：引擎选择器使用 `aria-haspopup`、`aria-expanded`、`aria-label`、`role="listbox"`、`role="option"` 等。
- 脚本放在 `</body>` 前，按 `js/clock.js` → `js/search.js` → `js/ambience.js` → `js/bookmark-manager.js` → `js/greeting.js` 顺序加载。

---

## 8. 安全与稳定性注意事项

1. **localStorage 隐私模式兼容**：所有 `localStorage` 读写已包裹 `try/catch`，在隐私模式下静默回退到默认值，不会抛错阻断页面。
2. **JSONP 内存泄漏防护**：`js/search.js` 中每次请求生成唯一回调名 `baiduSuggestionCallback_{timestamp}`，并在成功/失败时 `delete window[callbackName]` 且移除 `<script>` 标签。
3. **书签 URL 处理**：使用 `new URL(url).hostname` 提取域名，构造失败时返回空字符串。用户输入的 URL 未经严格校验，仅做 `trim()` 后使用，不会执行 XSS（仅作为 `href` 与 `window.location.href` 赋值）。
4. **外部图片加载**：favicon 图片通过 `new Image()` 预加载探测，失败时自动回退到首字母圆形兜底，避免破损图标。
5. **B 站特殊处理**：由于 B 站 favicon 探测链表现不佳，通过 `isBilibili()` 正则 `/bilibili|b23\.tv/i` 直接跳过 favicon，使用首字母兜底。

---

## 9. 动效预留接口

以下类名和 `@keyframes` 已预定义，供后续 JS 交互直接调用：

| 类名 / Keyframes | 说明 |
|---|---|
| `body.is-breathing` | 启动背景渐变呼吸动画（`filter: brightness` 循环，8s） |
| `.is-pulsing` | 触发一次弹性缩放脉冲（`softPulse`） |
| `.is-floating` | 启动上下漂浮循环（`float`，3s） |

**使用方式**：
```js
document.body.classList.add('is-breathing');
```

---

## 10. 已知待扩展点（非 bug）

- [ ] 背景呼吸动画默认处于 `paused` 状态，需通过 JS 添加 `is-breathing` 类开启。
- [ ] 搜索建议目前仅接入百度 API，切换其他引擎时建议词仍来自百度词库（行为与主流浏览器地址栏一致）。
- [ ] 尚未实现天气模块（用户明确指示不要涉及）。
