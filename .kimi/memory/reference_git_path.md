---
name: Git 命令路径
description: 本机 git 不在 PATH，需用完整路径执行
type: reference
originSessionId: 077fa275-b695-4c68-a66d-12d18416efc0
source: claude-code
---

本机 PowerShell 中 `git` 命令不可用（不在 PATH）。git 安装在 `C:\Program Files\Git\cmd\git.exe`。

**How to apply:** 所有 git 命令使用完整路径：
```powershell
& "C:\Program Files\Git\cmd\git.exe" add -A
& "C:\Program Files\Git\cmd\git.exe" commit -m "..."
& "C:\Program Files\Git\cmd\git.exe" push
```
gh CLI 在 PATH 中可用，`gh` 命令可直接调用。
