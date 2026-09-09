# SceneLoop

[简体中文](README.md) | [English](README_EN.md)

SceneLoop 是一套面向 AI 漫剧、AI 短剧、单图动效和 AI 商品广告生产的二进制智能工作流。用户可以通过 Hermes、OpenClaw、Claude Code、Codex 等 AI Agent 提交剧本、图片、商品素材和创作要求；发行包内的原生程序负责实际的文本、图片和视频生产。

本项目由 **西安文鳐网络信息科技有限责任公司** 开发。

[访问 SceneLoop 产品官网](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

> 本文档适用于 SceneLoop Skill 的 Windows 版本。

## 发行包内容

```text
sceneloop_win/
├── README.md
├── README_EN.md
├── SKILL.md
└── scripts/
    ├── sceneloop.exe   短剧与单图动效
    ├── ai-ads.exe      AI 商品广告
    └── setup.exe       授权与模型配置
```

三个程序都是 Windows x64（AMD64）预编译二进制文件。普通用户不需要 Python、编译器或项目源码，也不应把单个程序移出当前 Skill 目录。

## 核心能力

- 支持 `.docx`、`.md` 和 `.txt` 剧本。
- 根据用户指定的画面比例、画风、语言、清晰度和目标时长规划项目。
- 自动生成 `storyboard.json`、`characters.json` 和 `locations.json`。
- 自动补齐角色图、场景图、镜头首帧和逐镜视频。
- 支持动画、3D、真人短剧等不同视觉方向。
- 根据相邻镜头关系管理人物、场景和画面连续性。
- 支持按镜头生成、断点续作和失败镜头重试。
- 支持“图片动效（Animate one image）”：一张上传图片加一段动作或镜头描述即可直接生成视频。
- 支持 MiniMax H3 v5 多参考视频模型，可用于 `9:16` 和 `16:9` 图片动效及短剧镜头。
- 图片动效会自动参考上传图片的主体、构图、色彩、光影、材质和原始风格，只执行用户明确要求的动作、局部效果或镜头运动。
- 支持根据 1–5 张商品图片或电商页面截图制作一条 15 秒 Fast UGC 商品广告。
- AI Ads 使用独立的 `ai-ads.exe` 程序，保留授权确认、事实约束、断点续作以及已经成功生成的资产。

## 工作流程

```text
用户上传剧本
  -> 项目初始化
  -> 剧本视觉化适配
  -> 分镜、角色和场景规划
  -> 角色参考图生成
  -> 场景参考图生成
  -> 镜头资产检查
  -> 首帧生成
  -> 逐镜视频生成
  -> 连续性衔接
  -> 视频输出
```

Host Agent 负责与用户对话、收集参数和调用 SceneLoop。文本、图片和视频的正式生产由 SceneLoop 内部配置的模型完成，Agent 不会使用自身模型替代生产步骤。

图片动效使用独立的轻量流程：

```text
上传图片 + 动效描述
  -> 创建轻量项目并永久归档原图
  -> 使用原图作为首帧和视觉风格基准
  -> 直接生成一个动效视频
  -> 保存原图、视频和生成参数
```

该流程不会创建剧本、分镜、人物角色、场景图或镜头首帧项目。

AI 商品广告使用独立流程：

```text
商品图片或页面截图 + 简短需求
  -> 商品事实识别与广告策划
  -> 5 个画面资产
  -> 5 个三秒视频片段
  -> 合成一条 15 秒 Fast UGC 预览
```

短剧、单图动效和 AI Ads 共用本机授权与模型配置，但项目数据彼此独立。

## Windows 安装要求

开始前请准备：

- Windows 10 或 Windows 11，64 位系统。
- 与电脑架构匹配的 SceneLoop Windows 预编译目录；当前仓库提供 AMD64 版本。
- 已安装 Git，并可在 PowerShell 中使用 `git` 命令。
- 已安装并可正常工作的 Hermes、OpenClaw、Claude Code 或 Codex；安装一个即可。
- Node.js 18 或更高版本及 npm 9 或更高版本（仅 npm 安装方式需要）。
- SceneLoop License Key。
- 文本模型、图片模型和视频模型所需的 API Key。
- 可访问模型服务和 SceneLoop License Server 的网络。
- 首次安装和配置 Memurai 时可使用管理员权限。
- 使用 AI Ads 成片合成时，PowerShell 需要能够找到 `ffmpeg.exe` 和 `ffprobe.exe`。

普通用户使用当前预编译版本时，不需要安装 Python。

### 查看 Windows 系统架构

打开 PowerShell，执行：

```powershell
$env:PROCESSOR_ARCHITECTURE
```

- 返回 `AMD64`：可以使用当前仓库中的预编译程序。
- 返回 `ARM64`：需要获取对应的 Windows ARM64 版本，不能使用当前 AMD64 程序。

macOS 程序不能在 Windows 运行，不同系统和架构的安装包不能混用。

## 安装 Hermes

推荐先从 [Hermes 官网](https://hermes-agent.nousresearch.com/) 下载 Hermes Desktop 或 Hermes CLI，并完成 Hermes Runtime 和 Agent 模型配置。

在安装 SceneLoop 前，请先在 Hermes 中进行一次普通对话，确认 Hermes 能够正常工作。

## 安装 OpenClaw

如果使用 OpenClaw，请先按照 [OpenClaw 官方文档](https://docs.openclaw.ai/start/getting-started) 完成安装和模型配置，并在 PowerShell 中确认以下命令可用：

```powershell
openclaw --version
```

Hermes、OpenClaw、Claude Code 和 Codex 任选其一即可，不要求同时安装。

## 安装 SceneLoop Skill

SceneLoop 同时支持 GitHub 和 npm 两种分发方式。GitHub 用户仍可克隆本仓库；普通用户推荐通过 npm 运行交互式安装器。

### 通过 npm 安装（推荐）

当前 npm 包包含完整的 Windows x64 SceneLoop Skill 和三个预编译程序。安装器会检测 Hermes、OpenClaw、Claude Code 和 Codex，然后询问需要安装到哪个 Agent；支持输入多个编号或选择全部。

请在 `sceneloop_win` 源码目录之外打开 PowerShell，然后执行：

```powershell
Set-Location $HOME
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win
```

也可以显式指定一个或多个目标：

```powershell
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --agent hermes
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --agent claude,codex
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --all --yes
```

安装前查看检测结果或预演操作：

```powershell
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --list
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --all --dry-run
```

需要长期保留命令时，可以全局安装：

```powershell
npm install -g sceneloop-win --registry=https://registry.npmjs.org/
sceneloop-win
```

npm 网站显示的 `npm i sceneloop-win` 是通用的项目依赖安装命令；普通 SceneLoop 用户应优先使用上面的 `npx` 命令。

默认安装位置：

| Agent | SceneLoop Skill 目录 |
|---|---|
| Hermes | `%LOCALAPPDATA%\hermes\skills\sceneloop`，设置 `HERMES_HOME` 时使用该目录 |
| OpenClaw | `%USERPROFILE%\.openclaw\skills\sceneloop` |
| Claude Code | `%USERPROFILE%\.claude\skills\sceneloop` |
| Codex | `%USERPROFILE%\.agents\skills\sceneloop` |

更新已有安装时，安装器只替换 `SKILL.md`、README 和三个 `.exe`，不会删除 `scripts\.env` 或用户项目数据。旧版本文件备份到 `%LOCALAPPDATA%\SceneLoopInstaller\backups\`。如果 Windows 提示文件正在使用，请关闭 SceneLoop 和对应 Agent 后重试。

> `sceneloop-win` 明确限制为 Windows x64。Windows ARM64、macOS 和 Linux 会在安装前被 npm 或安装器拒绝，不能混用本仓库的二进制程序。

### 通过 GitHub 安装到 Hermes

当前 GitHub 仓库已经是解压后的 Skill 目录，在 PowerShell 中执行：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$HermesSkills = Join-Path $HermesHome "skills"
New-Item -ItemType Directory -Force $HermesSkills | Out-Null
$SceneLoopSkill = Join-Path $HermesSkills "sceneloop"
git clone https://github.com/WingYouth/sceneloop_win.git $SceneLoopSkill
& "$SceneLoopSkill\scripts\sceneloop.exe" --help
```

检查 Skill：

```powershell
hermes skills list
```

安装完成后，请新建一个 Hermes 会话，或在现有会话中执行：

```text
/reset
```

### 更新已有的 GitHub 安装

如果已经安装过 SceneLoop，可在 PowerShell 中执行：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoopSkill = Join-Path $HermesHome "skills\sceneloop"
Set-Location $SceneLoopSkill
git pull --ff-only origin main
```

更新完成后新建 Hermes 会话，或在现有会话中执行 `/reset`。

### 通过 OpenClaw CLI 安装

OpenClaw 可以直接从 GitHub 安装这个已经解压的 Skill：

```powershell
openclaw skills install git:WingYouth/sceneloop_win --as sceneloop --global
openclaw skills list
```

OpenClaw 会把全局 Skill 安装到其托管的 Skill 目录。安装后请新建 OpenClaw 会话，使新的 Skill 清单生效。安装命令和 Skill 目录规则以 [OpenClaw Skills 官方文档](https://docs.openclaw.ai/tools/skills) 为准。

## 发布到 npm（维护者）

发布前验证安装器和 npm 文件清单：

```powershell
npm test
npm run pack:check
```

首次发布：

```powershell
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish --cache .npm-cache
```

后续版本必须先升级版本号：

```powershell
npm version patch
npm publish --cache .npm-cache
```

npm 发布要求账号启用 2FA，或者使用允许绕过 2FA 的 Granular Access Token。`package.json` 的 `files` 白名单只发布 `SKILL.md`、中英文 README、安装器和三个预编译程序，不会发布 `.git`、本地配置或其他工作文件。发布前仍应检查 `npm run pack:check`，确认没有 License Key、API Key 或 `.env`。

npm 发布不会影响 GitHub：修改完成后仍可正常提交、打标签并推送本仓库，GitHub 克隆安装方式继续有效。

## 首次设置与授权

在 Host Agent 中提出生成请求时，SceneLoop Skill 会先自动检查运行程序、Memurai、License 和模型配置；配置不完整时，Agent 会启动 `setup.exe`。

Windows 首次配置可能需要安装和启动 Memurai 服务。推荐先右键 PowerShell 或 Windows Terminal，选择“以管理员身份运行”，然后手动执行一次 Setup：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$Setup = Join-Path $HermesHome "skills\sceneloop\scripts\setup.exe"
& $Setup
```

如果通过其他 Agent 安装，请从该 Agent 托管的 `sceneloop\scripts\` 目录运行 `setup.exe`。

Setup 将依次完成：

1. 检查 Windows 基础环境。
2. 检查 Redis 兼容服务；本机没有可用服务时，通过 WinGet 安装 Memurai。
3. 将 Memurai 配置为 Windows 自动启动服务，并验证连接。
4. 输入 SceneLoop License Key，完成本机设备绑定。
5. 选择视觉、文本、图片和视频模型。
6. 在本机交互界面中输入对应 API Key。
7. 验证配置并保存到本机。

如果要使用 MiniMax H3 v5，请在视频模型列表中选择
`minimax-h3-lightx2v-v5`，并只在本机 Setup 提示中输入对应的
`minimax_h3_v5`。Setup 只保存和检查配置，不会为了测试凭证而提交付费视频生成任务。

License Key 和 API Key 只应在本机 Setup 窗口或终端中输入，不要发送到 Hermes、OpenClaw、飞书、群聊或截图中。

### 检查授权状态

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoop = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop.exe"
& $SceneLoop license status
```

设备绑定信息会长期保存在本机 Memurai 中。运行租约到期后，SceneLoop 会使用已有绑定在线续签，正常情况下不需要再次输入 License Key。

`setup.exe` 通常只在一台新电脑首次安装时运行一次。日常生成不需要重复运行。只有更换电脑、License 或 Memurai 数据丢失、`.env` 配置丢失，或者需要更换模型和 API Key 时，才需要再次运行 Setup。

## 第一次生成

在 Hermes 或 OpenClaw 中上传剧本，然后直接说明需求，例如：

```text
请使用 SceneLoop 将这个剧本制作成第一集 AI 漫剧。
```

正式生成前，Hermes 会依次确认：

1. 英文项目 ID 和集数。
2. 画面比例，例如 `16:9` 或 `9:16`。
3. 画风要求；如果用户只说“短剧”，会先确认是否需要真人风格。
4. 台词和旁白语言。
5. 视频模型及该模型支持的清晰度；更高的清晰度通常会产生更高的模型费用。
6. 采用先确认角色图和场景图的推荐流程，还是在风险提示后直接生成完整一集。
7. 用户明确提出时，确认目标成片时长。

默认推荐先生成角色和场景参考图并交给用户确认，确认后再生成首帧和视频。缺少的资产会自动补齐，已经成功生成的资产不会无故重复生成。

## 生成一张图片的动效

在 Hermes 或 OpenClaw 中上传一张 JPEG、PNG 或 WebP 图片，并直接描述希望出现的动作、局部效果或镜头运动，例如：

```text
请使用 SceneLoop 的图片动效流程，让人物轻轻眨眼并微笑，头发随风轻微摆动，镜头缓慢推进，生成 5 秒视频。
```

Agent 会直接选择 **Animate one image**，不会再询问剧本、项目 ID、集数、人物角色、场景或画风。SceneLoop 会自动：

1. 根据图片方向选择横屏或竖屏比例；方图在模型不支持 `1:1` 时会询问用户选择方向。
2. 将上传图片作为唯一视觉基准和准确首帧。
3. 保持原图中的人物身份、外观、物体造型、环境、构图、色彩、光影、材质和整体风格。
4. 只增加用户明确要求的动作、局部效果和镜头运动，避免无关增删、变形、闪烁、身份漂移和意外风格变化。
5. 创建一个轻量项目，永久保存原始图片、完整模型提示词、生成参数和最终视频。

使用 `minimax-h3-lightx2v-v5` 时，可选分辨率为：

- 竖屏：`480p竖`、`768p竖`、`1080p竖`
- 横屏：`480p横`、`768p横`、`1080p横`

支持 1–10 秒整数时长。排队与生成合计最长等待 30 分钟，状态每秒查询一次。

## 生成 AI 商品广告

向 Host Agent 上传 1–5 张商品图片或电商页面截图，再说明希望制作商品广告。例如：

```text
请使用 SceneLoop 根据这张商品截图制作一条真实自然的 15 秒竖屏 UGC 广告，直接生成。
```

当前 Fast UGC 流程固定生成 5 个三秒镜头并合成为一条 15 秒预览，支持 `9:16` 和模型允许的 `16:9`。一个清晰的商品截图即可开始，用户不需要手工抄写页面上的商品名称、价格或规格。

当用户授权“直接生成”时，Agent 会一次性说明并确认完整成本范围，然后由 `ai-ads.exe` 执行商品识别、策划、图片生成、视频生成和合成。执行中断后应继续同一个项目；已经成功的资产和模型任务不会重新提交。

可在 PowerShell 中检查 AI Ads 是否就绪：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$AIAds = Join-Path $HermesHome "skills\sceneloop\scripts\ai-ads.exe"
& $AIAds readiness
& $AIAds models
```

如果安装在其他 Agent 中，请使用对应 Skill 目录下的 `scripts\ai-ads.exe`。当前版本不用于任意时长广告、多版本批量投放、自动发布或完整后期制作。

## 常用对话示例

### 生成一集竖屏漫剧

```text
请用 SceneLoop 制作这个剧本的第一集。项目 ID 是 city_story，画面比例 9:16，使用高品质 3D 动画风格，台词保持中文，视频清晰度 720p。
```

### 生成真人风格短剧

```text
请用 SceneLoop 制作真人电影质感的竖屏短剧。项目 ID 是 night_case，第一集，比例 9:16，中文台词，视频清晰度 720p。
```

### 继续生成指定镜头

```text
请继续 night_case 第一集第 6 镜，检查已有资产后生成到视频。
```

### 重试失败镜头

```text
请使用 SceneLoop 重试 city_story 第一集生成失败的镜头，不要覆盖已经成功的视频。
```

### 生成图片动效

```text
请使用 SceneLoop 让这张图动起来：人物自然眨眼，衣服和头发有轻微风吹效果，镜头缓慢向前推进，保持原图画风。
```

### 生成 15 秒商品广告

```text
请使用 SceneLoop 根据这些商品图片生成一条 15 秒、9:16 的自然 UGC 广告，使用中文原生语音，直接执行。
```

## 输出文件

SceneLoop 将项目资料和视频分开保存：

```text
references/<project_id>/
  source/                         原始剧本
  scripts_prompts/episode_001/    适配剧本与分镜 JSON
  character_prompts/episode_001/  角色定义与角色参考图
  scene_prompts/episode_001/      场景定义与场景参考图
  shot_prompts/episode_001/       镜头首帧和尾帧
  runtime/episode_001/            运行状态与镜头报告

output/<project_id>/
  episodes/episode_001/
    shot_001.mp4
    shot_002.mp4
```

`references/` 保存剧本、JSON、图片和运行报告，`output/` 只保存视频。

图片动效使用独立的轻量项目目录：

```text
image_animation_projects/<project_id>/
  source/original.<jpg|jpeg|png|webp>  归档的上传原图
  output/animated_<request_hash>.mp4   生成的动效视频
  project.json                         原始动效描述、完整模型提示词和生成状态
```

相同图片、提示词、模型、分辨率、时长和 Seed 的重复请求会复用已有视频；任一生成参数或提示词策略变化都会创建新的请求结果。

AI Ads 项目默认保存在 Skill 的广告工作区中：

```text
workspace/ads/ads_projects/<project_id>/
  manifest.json                    项目清单和可恢复状态
  ...                              商品证据、策划、图片、视频与最终预览
```

不要在任务中断后删除项目目录；继续同一项目即可复用已经完成的结果。

## 常见问题

### PowerShell 无法执行程序或找不到文件

先重新计算安装路径并检查文件：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoopSkill = Join-Path $HermesHome "skills\sceneloop"
Test-Path "$SceneLoopSkill\scripts\sceneloop.exe"
Test-Path "$SceneLoopSkill\scripts\ai-ads.exe"
Test-Path "$SceneLoopSkill\scripts\setup.exe"
```

三个命令都应返回 `True`。

### Windows SmartScreen 阻止 `.exe`

只对公司正式交付、来源和文件哈希已经核验的安装包选择“更多信息”并点击“仍要运行”。不要为了运行 SceneLoop 全局关闭 Windows Defender 或 SmartScreen。

如果 Windows 将下载文件标记为受阻，可以右键 ZIP 文件，打开“属性”，勾选“解除锁定”，然后重新解压。

### Memurai 连接失败

以管理员身份打开 PowerShell，执行：

```powershell
sc.exe config Memurai start= auto
sc.exe start Memurai
Get-Service Memurai
Test-NetConnection 127.0.0.1 -Port 6379
```

`Get-Service` 应显示 `Running`，`TcpTestSucceeded` 应为 `True`。如果尚未安装 Memurai，请重新运行 `setup.exe`。

### Hermes 没有调用 SceneLoop

```powershell
hermes skills list
```

确认列表中存在 `sceneloop`，然后新建 Hermes 会话或执行 `/reset`。提出任务时明确说明“使用 SceneLoop”。

### OpenClaw 没有调用 SceneLoop

```powershell
openclaw skills list
```

确认列表中存在 `sceneloop`，然后新建 OpenClaw 会话。提出任务时明确说明“使用 SceneLoop”。如果列表中没有该 Skill，请重新执行上面的 OpenClaw 安装命令。

### License 状态无效

先确认 Memurai 正常，再执行：

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoop = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop.exe"
& $SceneLoop license verify
```

如果设备从未激活，使用管理员 PowerShell 重新运行 `setup.exe`。请勿尝试绕过或修改 License 校验。

### 每次运行都要求重新输入 License Key

正常情况下不应重复输入。请检查：

1. Memurai 服务是否保持运行并设置为自动启动。
2. 是否仍使用默认 Redis DB 4。
3. 是否执行过 `FLUSHDB`、卸载 Memurai 或删除其数据。
4. `license status` 和 `license verify` 返回的具体错误码。

### 模型返回 401、403 或余额不足

- `401`：通常表示 API Key 无效、过期或配置到了错误的模型服务商。
- `403`：通常表示账号权限、余额或服务开通状态存在问题。
- 修改模型配置后，重新运行 `setup.exe` 完成验证。

### 图片或视频生成超时

模型服务繁忙或网络不稳定时可能发生超时。保留已经成功的资产，让 SceneLoop 重试失败镜头即可，无需从头生成整个项目。

MiniMax H3 v5 的图片动效和多参考视频任务会等待最多 30 分钟，该时间包含排队和实际生成。超过 30 分钟仍未完成时，SceneLoop 会停止本次等待；服务端任务是否继续运行取决于模型服务。重新执行前先检查轻量项目中的现有输出，避免不必要的重复生成。

## 安全说明

- 不要在聊天、日志、截图或公开仓库中暴露 License Key 和 API Key。
- 不要修改或绕过 SceneLoop License 校验。
- Hermes 或 OpenClaw 只负责调度，不得使用自身模型替代 SceneLoop 的正式生产模型。
- 安装包不包含任何用户密钥；所有授权与模型配置均在用户本机完成。

## 关于我们

SceneLoop 由 **西安文鳐网络信息科技有限责任公司** 开发并维护。

- 产品官网：[SceneLoop](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

© 2024 - 2026 西安文鳐网络信息科技有限责任公司 版权所有
