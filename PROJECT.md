# PROJECT.md — AI 交接文档

> 本文档记录项目的完整当前状态、架构决策、陷阱与演进历史，供任何 AI 或开发者快速接管。
> **最后更新：2026-05-10** | 分支：master | 远程：https://github.com/kugai128/startpage.git

---

## 1. 项目身份

**名称**：二次元正太风个人起始页
**用途**：浏览器新标签页/起始页
**部署**：GitHub Pages → https://kugai128.github.io/startpage/
**气质定位**：晨光薄纱 · 棉花糖融化 · 奶白温润
**技术栈**：纯原生 HTML + CSS + JS（零框架、零构建工具、零依赖、零包管理器）

**运行方式**：直接双击 `index.html` 在浏览器中打开即可。无需编译、无需服务器。

---

## 2. 文件结构（精确到每个文件）

```
D:\experiment1\2\
├── index.html              ← 主入口，加载 1 个 CSS + 5 个 JS
├── css/
│   └── style.css           ← 全局样式，所有视觉都在这里（~1015 行）
├── js/
│   ├── clock.js            ← 时钟模块（冒号呼吸 + 秒脉冲动画）
│   ├── search.js           ← 搜索引擎切换 + 百度 JSONP 搜索建议
│   ├── ambience.js         ← 背景漂浮微粒（50 个 SVG 粒子）
│   ├── bookmark-manager.js ← 书签 CRUD + favicon 自动探测 + 弹窗
│   └── greeting.js         ← 时间问候语（底部水印文案）
├── .gitignore              ← 忽略 startpage/ / node_modules/ / .claude/ / 系统文件
├── AGENTS.md               ← 旧版设计文档（部分信息已过时）
├── CLAUDE.md               ← Claude Code 快速参考
└── PROJECT.md              ← 本文件（AI 交接文档，权威来源）
```

**已删除的遗留文件**：根目录 `main.js`（旧版简易时钟）已在 `e3cdcd2` 提交中删除。

**注意**：本地存在 `startpage/` 子目录但未被 Git 追踪（`.gitignore` 排除），是旧版轻量部署版本。

---

## 3. HTML 加载顺序（关键！）

所有 JS 均为 IIFE、加载即执行、无 `DOMContentLoaded` 或 `defer`。

```html
<script src="js/clock.js"></script>             <!-- 1. 时钟 -->
<script src="js/search.js"></script>            <!-- 2. 搜索 -->
<script src="js/ambience.js"></script>          <!-- 3. 背景微粒 -->
<script src="js/bookmark-manager.js"></script>  <!-- 4. 书签 -->
<script src="js/greeting.js"></script>          <!-- 5. 问候语 -->
```

**铁律**：`<script>` 标签必须放在它所操作的 DOM 元素之后，否则 `getElementById` 返回 `null`。

---

## 4. 当前布局架构（Bing/Google 风格）

**设计哲学**：内容偏上、下半留给背景呼吸。搜索框是绝对视觉主角。

### 4.1 整体定位

| 层级 | 定位方式 | 说明 |
|---|---|---|
| `body` | `display: flex; align-items: flex-start; justify-content: center` | 内容坐上中部，非垂直居中 |
| `.container` | `margin-top: 14vh; max-width: 680px; gap: 0` | 纯布局容器，无任何卡片样式 |
| `.greeting-footer` | `position: fixed; bottom: 60px` | 不参与布局流 |

### 4.2 三层纵向间距

```
时钟 (52px/300)        ← 页面辅助元素
    ↓ 28px margin-bottom
搜索框 (52px高, 600-720px宽)  ← 页面绝对主角
    ↓ 40px margin-bottom
书签网格 (64px图标, gap 28px/32px)  ← 自然承接
```

**间距全部用 `margin-bottom` 控制，`.container` 上 `gap: 0`。**

### 4.3 关键尺寸速查

| 元素 | 桌面 | 移动端 (≤480px) |
|---|---|---|
| 时钟字号 | 52px / weight 300 | 40px |
| 搜索框宽度 | min 600px, max 720px | max 100% |
| 搜索框高度 | 52px (border-radius 26px) | 48px |
| 搜索框背景 | rgba(255,255,255,0.75) | — |
| 搜索框阴影 | 0 4px 16px rgba(0,0,0,0.05) | — |
| 书签图标容器 | 64px | 48px |
| favicon/首字母 | 32px | 28px |
| 书签名称 | 12px, max-width 72px | 10px |
| 添加按钮 | 64px, 加号 32px | 48px, 加号 24px |
| 书签网格间距 | 28px 32px | 20px 24px |
| 操作按钮 | 22px, SVG 12px | — |

### 4.4 Z-index 栈

| 层级 | 元素 |
|---|---|
| z-0 | `.ambient-base`（保险底色渐变） |
| z-1 | `.ambient-blobs`（两个呼吸光斑） |
| z-2 | `.ambient-particles`（50 个 SVG 微粒） |
| z-10 | `.container`（内容，不需要显式声明） |
| z-100 | `.suggestions` / `.greeting-footer` |
| z-200 | `.engine-dropdown` |
| z-500 | `.bm-overlay`（书签弹窗） |

---

## 5. 模块详解

### 5.1 时钟模块 (js/clock.js)

- **IIFE**，操作 `#clock` 元素
- 手动构建 HTML 结构：`<span class="clock-digits">` + `<span class="clock-colon">`
- 冒号使用 `colonBreathe` 动画（1.8s opacity 循环）
- 每秒检测秒数变化，触发 `colonPulse` 缩放脉冲（通过 remove→reflow→add class 重播）
- 数字使用 `font-variant-numeric: tabular-nums` 防抖动
- 入场动画：`clockEnter`（0.8s 上浮淡入）

### 5.2 搜索模块 (js/search.js)

- **非 IIFE**（模块级作用域），使用 `const/let`
- 四个引擎：百度/谷歌/必应/DuckDuckGo（`engines` 数组，追加引擎只需加对象）
- 引擎持久化：`localStorage` key `preferred_engine`，默认百度
- 搜索建议：百度 JSONP API `suggestion.baidu.com/su`，150ms 防抖
- JSONP 回调名 `baiduSuggestionCallback_{timestamp}`，成功/失败后清理 script 标签和全局回调
- 键盘导航：↑↓ 选择建议、Enter 搜索、Esc 关闭
- 引擎切换：placeholder 先淡出（`.is-switching`，150ms）再淡入
- 点击外部自动关闭下拉和建议框

### 5.3 背景氛围模块 (js/ambience.js)

- **IIFE**，操作 `#ambientParticles` 容器
- 50 个 SVG 微粒（`PARTICLE_COUNT`，建议保持 40~60）
- 三种形状：`star4`（四角星）、`bubble`（泡泡）、`cross`（十字星）
- 每种形状独立透明度池（30%~55%）和颜色池（含暖杏色混入）
- 8 个运动方向（四边正交 + 四角对角线）
- 速度按真实穿越距离计算，确保 30~60 秒完成一次穿越
- 正弦波摆动（`sineAmp` 12~32px, `sineFreq` 0.6~1.8圈）
- `requestAnimationFrame` 循环，`dt` 上限 0.1s 防跳变
- 粒子出界或寿命耗尽时 `reset()`，初始加载随机散布

### 5.4 书签管理模块 (js/bookmark-manager.js)

- **IIFE**，使用 `var` 风格
- 数据持久化：`localStorage` key `bookmarks`
- 首次加载无数据时自动写入 4 个预设（B站/Google/ChatGPT/GitHub）
- **Favicon 探测链**：
  1. `google.com/s2/favicons?domain={domain}&sz=128`
  2. `icons.duckduckgo.com/ip3/{domain}.ico`
  3. 失败 → 首字母圆形兜底
- B站特殊处理：`isBilibili()` 检测域名正则 `/bilibili|b23\.tv/i`，跳过 favicon 直接首字母
- 增删改动画：删除 `bookmarkRemove`（0.25s 淡出缩小）、添加 `bookmarkEnter`（0.4s 上浮淡入，延迟 0.1s×索引）
- 弹窗动态创建（`.bm-overlay` + `.bm-modal`），支持遮罩/ESC/取消关闭
- 网址输入框防抖 500ms 自动刷新 favicon 预览

### 5.5 问候语模块 (js/greeting.js)

- **IIFE**，操作 `#greetingText`
- 5 段时段规则（含跨午夜 22:00-4:59）
- 每小时自动刷新，200ms 淡入淡出过渡
- `pointer-events: none`，不拦截点击

---

## 6. 设计系统（Design Tokens）

所有令牌定义在 `:root`，**禁止在选择器中硬编码色值**。

| Token | 值 | 用途 |
|---|---|---|
| `--accent` | `#FFB7A5` | 唯一强调色（暖杏），禁止引入第二种饱和色 |
| `--accent-soft` | `rgba(255,183,165,0.25)` | 悬停/激活底色 |
| `--accent-glow` | `rgba(255,183,165,0.35)` | 聚焦光晕 |
| `--accent-hover` | `rgba(255,183,165,0.15)` | 下拉项悬停 |
| `--text-main` | `#5A4A42` | 主文字（**禁止纯黑**） |
| `--text-sub` | `#9E8E86` | 次要文字 |
| `--text-placeholder` | `#C4B5AD` | 占位符 |
| `--border-light` | `rgba(255,255,255,0.85)` | 白光边框 |
| `--shadow-float` | `0 8px 32px rgba(90,74,66,0.05)` | 悬浮阴影 |
| `--shadow-hover` | `0 12px 40px rgba(90,74,66,0.08)` | 悬停阴影 |
| `--shadow-inner` | `inset 0 0 0 1px rgba(255,255,255,0.9)` | 内描边 |
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹性动画 |
| `--ease-soft` | `cubic-bezier(0.4,0,0.2,1)` | 柔和过渡 |

**背景渐变**（body 与 `.ambient-base` 共用）：
```css
background: linear-gradient(135deg, #E8F0F5 0%, #FFFBF5 45%, #FDF2F0 100%);
background-attachment: fixed;
```

---

## 7. 关键约束与已知陷阱

### 7.1 铁律

1. **强调色唯一**：只能用 `#FFB7A5`，禁止第二种饱和色
2. **禁止纯黑**：文字为 `#5A4A42`，阴影用 `rgba(90,74,66,0.05~0.08)`
3. **分文件管理**：时钟/搜索/氛围/书签/问候语各归其文件，不要合并
4. **`localStorage` 容错**：读写必须 `try/catch`（隐私模式兼容）
5. **设计令牌优先**：所有色值/阴影/圆角引用 `:root` 变量
6. **脚本顺序不可改**：`clock → search → ambience → bookmark-manager → greeting`

### 7.2 已知陷阱

- **`*` 全局 transition 已移除**：之前在 `*` 上设 `transition: transform 0.3s` 会与 CSS 动画、`position: fixed` 的 `transform: translateX(-50%)` 居中定位冲突。现在各元素自行声明。
- **`.suggestions` 使用 `display: none` 切换**：CSS transition 与 `display` 变化冲突，opacity/transform 过渡可能不生效。如需修复可改用 `visibility + opacity` 方案。
- **搜索建议始终走百度 API**：切换引擎只改变搜索目标，建议词来源不变（主流浏览器行为一致）。
- **`startpage/` 目录被 Git 忽略**：是旧版独立部署版本。
- **无自动化测试**：验证靠手动打开浏览器。

---

## 8. Git 与部署

| 项目 | 值 |
|---|---|
| 远程 | `https://github.com/kugai128/startpage.git` (origin) |
| Pages | `https://kugai128.github.io/startpage/` |
| 分支 | `master`（唯一分支） |
| 部署方式 | push 到 master → GitHub Pages 自动构建 |

### 近期提交历史

```
a95c60f feat: Bing/Google 主流起始页比例 —— 内容偏上 + 搜索框为绝对主角
f4b9ff6 feat: 去卡片化 —— Bing 风格全屏垂直居中布局
e3cdcd2 chore: 清理死代码 + 优化全局样式 + 修复移动端适配
847fcfb feat: 搜索框聚焦暖杏色光效 + placeholder 温柔过渡
4279e5e style: 卡片加高至 340px，内部三层纵向均匀分布
```

---

## 9. 设计演进记录

| 版本阶段 | 特征 |
|---|---|
| 早期 | 卡片容器（毛玻璃、圆角、阴影、固定 840×340px） |
| 第一次重构 | 去卡片化，内容垂直居中，时钟 72px 大标题 |
| 当前（最新） | Bing/Google 风格：内容偏上（margin-top: 14vh）、搜索框主角、时钟缩小为辅助 |

---

## 10. 常用操作

```bash
# 本地预览
open index.html

# 提交并部署
git add <files>
git commit -m "feat: 描述"
git push origin master
# → 自动部署到 kugai128.github.io/startpage/
```
