<!-- From: D:\experiment1\2\AGENTS.md -->
# AGENTS.md —— 二次元正太风个人起始页

> 本文件记录项目架构、设计规范与开发决策，供后续会话或开发者快速恢复上下文。
> 本项目为纯静态前端项目，无构建工具、无框架、无依赖。

---

## 1. 项目概述

一个单页个人浏览器起始页，气质定位为「晨光薄纱 · 棉花糖融化 · 奶白温润」的二次元正太风。核心功能包括：

- **实时时钟**：每秒更新，24 小时制（`zh-CN` 本地化）。
- **多搜索引擎切换**：百度、谷歌、必应、DuckDuckGo。
- **搜索建议**：基于百度搜索建议 JSONP API 的实时补全。
- **快捷链接**：B站、GitHub（硬编码于 `index.html`）。

**技术栈：** 纯原生 HTML / CSS / JavaScript，无框架，无构建工具，无包管理器，零外部依赖。

**运行方式：** 直接在浏览器中打开 `index.html` 即可，无需编译或启动开发服务器。

---

## 2. 文件结构

```
D:\experiment1\2\
├── index.html          # 页面骨架，引入 css/style.css、main.js、js/search.js
├── main.js             # 仅保留时钟逻辑（与时钟模块解耦，避免污染）
├── css/
│   └── style.css       # 全局样式、设计令牌、正太风视觉系统
├── js/
│   └── search.js       # 搜索引擎切换 + 百度搜索建议(JSONP) + 本地存储
├── AGENTS.md           # 本文件
└── CLAUDE.md           # Claude Code 专用快速参考
```

> **历史清理：** 根目录下曾存在 `style.css`（已移至 `css/style.css`）和包含搜索逻辑的 `main.js`（已拆分）。请勿在根目录重建旧版样式文件。

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

**背景渐变（body）：**
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
| `12px` | — | 引擎当前按钮、下拉项 |
| `16px` | — | 引擎下拉浮层 |
| `20px` | — | 搜索建议下拉框 |

### 3.4 过渡曲线

| Token | 值 | 用途 |
|---|---|---|
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹性动画（浮层展开、悬停回弹） |
| `--ease-soft` | `cubic-bezier(0.4,0,0.2,1)` | 柔和过渡（颜色、阴影、透明度） |

---

## 4. 模块详解

### 4.1 时钟模块（main.js）

- 仅包含 `updateClock()` + `setInterval`
- 使用 `toLocaleTimeString('zh-CN', { hour12: false })`
- 页面加载立即执行一次，避免显示 `00:00:00`

**约束：** 时钟逻辑独立在 `main.js`，**禁止**将搜索逻辑写回此文件。

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
- 引擎按钮位于搜索栏内部左侧，与输入框共用 `.search-field` 外框
- 点击按钮展开/收起下拉浮层；点击外部自动关闭
- 下拉浮层使用 `transform-origin: top left`，展开动画为 `opacity + translateY(-8px) + scale(0.98) → 正常`
- 当前选中项左侧显示暖杏色小圆点（`.engine-dot`）
- 切换引擎时，搜索框 `placeholder` 先淡出（`.is-switching`，150ms）再更换文字并淡入
- 回车搜索、上下键选择建议、ESC 关闭建议框等逻辑与引擎切换共存

**搜索建议：**
- 使用百度搜索建议 JSONP API：`https://suggestion.baidu.com/su?wd={kw}&cb={callback}`
- 防抖 150ms
- 建议下拉框样式与引擎下拉框独立，圆角 20px
- 悬停/键盘选中背景为 `--accent-soft`

### 4.3 视觉层（css/style.css）

**关键布局约定：**
- `.container` 使用 `position: absolute + transform: translate(-50%,-50%)` 居中
- `.search-field` 为 `display: flex` 横排容器：左侧引擎选择器 + 右侧输入框
- `#search` 本身透明背景、无边框，聚焦效果由 `.search-field:focus-within` 统一控制

**引擎选择器样式要点：**
- `.engine-current`：`rgba(255,255,255,0.6)` 背景，`12px` 圆角，带内阴影
- `.engine-dropdown`：`rgba(255,251,245,0.92)` 奶白底色，`backdrop-filter: blur(12px)`，`16px` 圆角

**响应式断点：**
- `@media (max-width: 480px)`：卡片内边距缩小、时钟字号降至 42px、引擎名称隐藏（仅显示图标）

---

## 5. 构建与测试

### 5.1 构建

本项目**无构建步骤**。没有 `package.json`、`pyproject.toml`、`Cargo.toml` 或任何其他构建配置文件。

开发时直接在浏览器中打开 `index.html` 即可预览。推荐使用任意本地静态服务器（如 VS Code 的 Live Server 插件、Python `http.server`、Node `serve` 等）以避免 `file://` 协议下的潜在限制。

### 5.2 测试

本项目**无自动化测试套件**，无 linter，无格式化工具配置。

验证方式：
- 手动在浏览器中打开页面，检查时钟是否正常走动。
- 测试搜索引擎切换、下拉浮层动画、placeholder 过渡。
- 测试搜索建议的键盘导航（↑/↓/Enter/Esc）。
- 在浏览器 DevTools 中切换至移动端视口，验证 `@media (max-width: 480px)` 响应式表现。
- 测试隐私模式/无痕窗口，确保 `localStorage` 被禁用时页面不报错。

---

## 6. 代码风格指南

### 6.1 CSS

- **设计令牌优先**：所有色值、阴影、圆角、过渡曲线必须引用 `:root` 中的 CSS 自定义属性，禁止在普通选择器中硬编码。
- **强调色唯一性**：只允许使用 `#FFB7A5` 作为强调色，禁止引入第二种高饱和色。
- **禁止纯黑/深灰边框：** 所有边框必须使用 `--border-light` 或内阴影模拟层次。
- **注释结构**：CSS 按功能分区，使用 `/* ---------- N. 区块名 ---------- */` 格式。

### 6.2 JavaScript

- **分文件管理**：搜索相关逻辑必须写在 `js/search.js`，样式写在 `css/style.css`，时钟逻辑在 `main.js`。不要往 `main.js` 或根目录旧文件中追加功能。
- **localStorage 容错**：读写 `localStorage` 必须包在 `try...catch` 中，避免隐私模式报错。
- **JSONP 清理**：搜索建议的临时 `script` 标签和全局回调函数必须在成功/失败后清理，防止内存泄漏。
- **事件委托**：如无必要，优先直接绑定；搜索建议列表项在渲染时逐个绑定点击事件（当前实现方式）。

### 6.3 HTML

- 语义化标签与 ARIA 属性：引擎选择器使用 `aria-haspopup`、`aria-expanded`、`aria-label`、`role="listbox"`、`role="option"` 等。
- 脚本放在 `</body>` 前，按 `main.js` → `js/search.js` 顺序加载。

---

## 7. 开发约束与注意事项

1. **强调色唯一性：** 只允许使用 `#FFB7A5` 作为强调色，禁止引入第二种高饱和色。
2. **禁止纯黑/深灰边框：** 所有边框必须使用 `--border-light` 或内阴影模拟层次。
3. **分文件管理：** 搜索相关逻辑必须写在 `js/search.js`，样式写在 `css/style.css`。不要往 `main.js` 或根目录旧文件中追加功能。
4. **localStorage 容错：** 读写 `localStorage` 必须包在 `try...catch` 中，避免隐私模式报错。
5. **搜索引擎配置扩展：** 如需新增引擎，只需在 `js/search.js` 顶部 `engines` 数组中追加对象，无需改动 DOM 结构。
6. **JSONP 清理：** 搜索建议的临时 `script` 标签和全局回调函数必须在成功/失败后清理，防止内存泄漏。

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
- 无需环境变量、无需服务端运行时、无需数据库。

---

## 10. 已知待扩展点（非 bug）

- [ ] 背景呼吸动画默认处于 `paused` 状态，需用户手动或通过 JS 开启
- [ ] 搜索建议目前仅接入百度 API，切换其他引擎时建议词仍来自百度词库（行为与主流浏览器地址栏一致）
- [ ] 尚未实现天气模块（用户明确指示不要涉及）
- [ ] 尚未实现书签/链接的自定义编辑功能
