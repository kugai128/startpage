---
name: Git 同步习惯
description: 每次编辑代码后自动 commit 并 push 到 GitHub
type: feedback
originSessionId: 077fa275-b695-4c68-a66d-12d18416efc0
source: claude-code
---

每次对项目文件做出修改后，必须立即执行 git commit + push 同步到 GitHub。

**Why:** 用户明确要求所有调整都同步到 GitHub Pages，确保线上版本始终最新。

**How to apply:** 每次 Edit/Write 操作完成后：
1. `git add -A`
2. `git commit -m "简短描述改动"`
3. `git push`
不需要每次都问用户，直接执行。
