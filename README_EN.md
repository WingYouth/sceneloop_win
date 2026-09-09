# SceneLoop

[简体中文](README.md) | [English](README_EN.md)

SceneLoop is a packaged binary workflow for producing AI comics, AI short dramas, single-image animation, and AI product ads. Submit scripts, images, product materials, and creative requirements through an AI agent such as Hermes, OpenClaw, Claude Code, or Codex; the native programs in this distribution perform the actual text, image, and video production.

SceneLoop is developed by **Xi'an Wenyao Network Information Technology Co., Ltd.**

[Visit the SceneLoop product website](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

> This guide covers the Windows edition of the SceneLoop Skill.

## Package Contents

```text
sceneloop_win/
├── README.md
├── README_EN.md
├── SKILL.md
└── scripts/
    ├── sceneloop.exe   drama and single-image animation
    ├── ai-ads.exe      AI product advertising
    └── setup.exe       licensing and model configuration
```

All three programs are prebuilt Windows x64 (AMD64) binaries. Users do not need Python, a compiler, or the project source code, and should not move an individual executable out of this Skill directory.

## Features

- Accepts `.docx`, `.md`, and `.txt` scripts.
- Plans projects from the requested aspect ratio, visual style, language, resolution, and target duration.
- Generates `storyboard.json`, `characters.json`, and `locations.json` automatically.
- Creates missing character images, location images, shot first frames, and videos.
- Supports animation, 3D, live-action, and other visual directions.
- Maintains character, location, and visual continuity between adjacent shots.
- Supports shot-level generation, resumable runs, and retries for failed shots.
- Supports **Animate one image**: one uploaded image and a motion or camera description produce a video directly.
- Supports the MiniMax H3 v5 multi-reference video model for `9:16` and `16:9` image animations and drama shots.
- Automatically preserves the uploaded image's subjects, composition, colors, lighting, materials, and original visual style while applying only the motion, local effects, or camera movement explicitly requested by the user.
- Creates one 15-second Fast UGC product ad from one to five product images or commerce-page screenshots.
- Runs AI Ads through the separate `ai-ads.exe` binary while preserving authorization, factual constraints, resumable state, and successful assets.

## Workflow

```text
Upload script
  -> Initialize project
  -> Adapt script for visual production
  -> Plan storyboard, characters, and locations
  -> Generate character references
  -> Generate location references
  -> Check shot assets
  -> Generate first frames
  -> Generate shot videos
  -> Maintain continuity
  -> Output videos
```

The host agent handles the user conversation, collects parameters, and invokes SceneLoop. SceneLoop's configured models perform the actual text, image, and video production; the agent must not substitute its own models for these production steps.

Image animation uses a separate lightweight workflow:

```text
Uploaded image + motion description
  -> Create a lightweight project and permanently archive the source image
  -> Use the image as the opening frame and visual-style reference
  -> Generate one animated video directly
  -> Save the source image, video, and generation settings
```

This workflow does not create a script, storyboard, characters, locations, or a separate shot first-frame project.

AI product ads use a separate workflow:

```text
Product images or commerce screenshot + short brief
  -> Identify grounded product facts and plan the creative
  -> Generate five image assets
  -> Generate five three-second video clips
  -> Assemble one 15-second Fast UGC preview
```

Drama, image animation, and AI Ads share local licensing and model configuration, but their project data remains separate.

## Windows Requirements

Before you begin, prepare:

- 64-bit Windows 10 or Windows 11.
- A prebuilt SceneLoop Windows directory matching your computer architecture. This repository provides the AMD64 version.
- Git installed and available from PowerShell.
- A working Hermes, OpenClaw, Claude Code, or Codex installation; only one is required.
- Node.js 18 or later and npm 9 or later when using the npm installer.
- A SceneLoop License Key.
- API keys required by your selected text, image, and video models.
- Network access to the model services and SceneLoop License Server.
- Administrator access for the initial Memurai installation and configuration.
- `ffmpeg.exe` and `ffprobe.exe` available in `PATH` when assembling AI Ads videos.

Users of this prebuilt distribution do not need to install Python.

### Check Your Windows Architecture

Open PowerShell and run:

```powershell
$env:PROCESSOR_ARCHITECTURE
```

- If the result is `AMD64`, you can use the prebuilt binaries in this repository.
- If the result is `ARM64`, obtain the corresponding Windows ARM64 build; the current AMD64 binaries are not compatible.

macOS binaries do not run on Windows. Packages for different operating systems and architectures are not interchangeable.

## Install Hermes

Download Hermes Desktop or Hermes CLI from the [Hermes website](https://hermes-agent.nousresearch.com/), then configure the Hermes Runtime and agent model.

Before installing SceneLoop, start a normal conversation in Hermes to confirm that Hermes works correctly.

## Install OpenClaw

If you use OpenClaw, follow the [OpenClaw getting-started guide](https://docs.openclaw.ai/start/getting-started) to install and configure it. Confirm in PowerShell that this command works:

```powershell
openclaw --version
```

You may use Hermes, OpenClaw, Claude Code, or Codex; installing more than one is not required.

## Install the SceneLoop Skill

SceneLoop supports both GitHub and npm distribution. GitHub users can continue cloning this repository, while end users can use the interactive npm installer.

### Install with npm (Recommended)

The npm package contains the complete Windows x64 SceneLoop Skill and three prebuilt executables. The installer detects Hermes, OpenClaw, Claude Code, and Codex, then asks where to install SceneLoop. You may select one, several, or all detected agents.

Open PowerShell outside the `sceneloop_win` source directory and run:

```powershell
Set-Location $HOME
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win
```

Specify one or more targets when needed:

```powershell
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --agent hermes
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --agent claude,codex
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --all --yes
```

Inspect detection or preview changes without writing files:

```powershell
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --list
npx --yes --registry=https://registry.npmjs.org/ sceneloop-win --all --dry-run
```

For a persistent global command:

```powershell
npm install -g sceneloop-win --registry=https://registry.npmjs.org/
sceneloop-win
```

The `npm i sceneloop-win` command shown by the npm website is the generic project-dependency command. End users should normally use the `npx` command above.

| Agent | Default SceneLoop Skill directory |
|---|---|
| Hermes | `%LOCALAPPDATA%\hermes\skills\sceneloop`, or the configured `HERMES_HOME` |
| OpenClaw | `%USERPROFILE%\.openclaw\skills\sceneloop` |
| Claude Code | `%USERPROFILE%\.claude\skills\sceneloop` |
| Codex | `%USERPROFILE%\.agents\skills\sceneloop` |

When updating an existing installation, the installer replaces only `SKILL.md`, the READMEs, and the three `.exe` files. It preserves `scripts\.env` and user project data. Previous files are backed up under `%LOCALAPPDATA%\SceneLoopInstaller\backups\`. If Windows reports that a file is in use, close SceneLoop and the corresponding agent before retrying.

> `sceneloop-win` is restricted to Windows x64. npm or the installer rejects Windows ARM64, macOS, and Linux because this repository's binaries are not compatible with those platforms.

### Install in Hermes from GitHub

This GitHub repository already contains the extracted Skill directory. Run in PowerShell:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$HermesSkills = Join-Path $HermesHome "skills"
New-Item -ItemType Directory -Force $HermesSkills | Out-Null
$SceneLoopSkill = Join-Path $HermesSkills "sceneloop"
git clone https://github.com/WingYouth/sceneloop_win.git $SceneLoopSkill
& "$SceneLoopSkill\scripts\sceneloop.exe" --help
```

Check the Skill:

```powershell
hermes skills list
```

After installation, start a new Hermes conversation or run:

```text
/reset
```

### Update an Existing GitHub Installation

If SceneLoop is already installed, run in PowerShell:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoopSkill = Join-Path $HermesHome "skills\sceneloop"
Set-Location $SceneLoopSkill
git pull --ff-only origin main
```

After updating, start a new Hermes conversation or run `/reset` in the current conversation.

### Install with the OpenClaw CLI

OpenClaw can install this extracted Skill directly from GitHub:

```powershell
openclaw skills install git:WingYouth/sceneloop_win --as sceneloop --global
openclaw skills list
```

OpenClaw installs a global Skill in its managed Skill directory. Start a new OpenClaw conversation after installation so it loads the updated Skill list. See the [official OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills) for current commands and directory rules.

## Publish to npm (Maintainers)

Validate the installer and package file list before publishing:

```powershell
npm test
npm run pack:check
```

For the first release:

```powershell
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish --cache .npm-cache
```

For later releases, increment the version before publishing:

```powershell
npm version patch
npm publish --cache .npm-cache
```

npm publishing requires account 2FA or a Granular Access Token that can bypass 2FA. The `files` allowlist in `package.json` publishes only `SKILL.md`, both READMEs, the installer, and the three prebuilt executables. It excludes `.git`, local configuration, and unrelated working files. Always inspect `npm run pack:check` and confirm that no License Key, API key, or `.env` is included.

npm publishing does not interfere with GitHub. You can still commit, tag, and push this repository normally, and the GitHub clone-based installation remains available.

## First-Time Setup and Licensing

When you request generation in a host agent, SceneLoop first checks the runtime, Memurai, license, and model configuration. If setup is incomplete, the agent launches `setup.exe`.

Initial Windows setup may need to install and start the Memurai service. Right-click PowerShell or Windows Terminal, select **Run as administrator**, and run Setup once:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$Setup = Join-Path $HermesHome "skills\sceneloop\scripts\setup.exe"
& $Setup
```

If you installed the Skill through another agent, run `setup.exe` from that agent's managed `sceneloop\scripts\` directory.

Setup performs these steps:

1. Checks the Windows environment.
2. Checks for a Redis-compatible service and installs Memurai through WinGet if required.
3. Configures Memurai as an automatically started Windows service and verifies the connection.
4. Activates the device with your SceneLoop License Key.
5. Lets you select Vision, Text, Image, and Video models.
6. Collects their API keys through the local interactive interface.
7. Verifies and saves the configuration locally.

To use MiniMax H3 v5, select `minimax-h3-lightx2v-v5` from the video-model list and enter its `minimax_h3_v5` only in the local Setup prompt. Setup saves and checks the configuration but does not submit a paid video-generation task just to test this credential.

Enter License Keys and API keys only in the local Setup window or terminal. Never send them through Hermes, OpenClaw, Feishu, group chats, or screenshots.

### Check License Status

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoop = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop.exe"
& $SceneLoop license status
```

Device binding data remains in local Memurai. When a runtime lease expires, SceneLoop renews it online using the existing binding, so you normally do not need to enter the License Key again.

You normally run `setup.exe` only once when installing SceneLoop on a new computer. Daily generation does not require Setup again. Rerun it only after moving to another computer, losing the License or Memurai data, losing the `.env` configuration, or when changing models or API keys.

## First Generation

Upload a script in Hermes or OpenClaw and describe the request, for example:

```text
Use SceneLoop to turn this script into episode 1 of an AI comic drama.
```

Before production, the agent confirms:

1. An English project ID and episode number.
2. An aspect ratio such as `16:9` or `9:16`.
3. A visual style; if you only request a short drama, it asks whether you want live action.
4. The dialogue and narration language.
5. A video model and one of that model's supported resolutions; higher resolutions generally increase model cost.
6. Whether to use the recommended character-and-location review flow or, after a risk warning, generate the full episode directly.
7. Target finished-video duration when you explicitly request one.

The recommended default generates character and location references first and presents them for approval before first-frame and video generation. SceneLoop fills missing assets and does not recreate completed assets without a reason.

## Animate One Image

Upload one JPEG, PNG, or WebP image in Hermes or OpenClaw and describe the desired subject motion, local effect, or camera movement. For example:

```text
Use SceneLoop's image-animation workflow. Make the person blink gently and smile, let the hair move slightly in the wind, and slowly push the camera forward. Generate a five-second video.
```

The agent selects **Animate one image** directly and does not ask for a script, project ID, episode number, characters, locations, or visual style. SceneLoop automatically:

1. Infers portrait or landscape orientation from the image; for a square image, it asks the user to choose when the model does not support `1:1`.
2. Uses the uploaded image as the authoritative visual reference and exact opening frame.
3. Preserves subject identity and appearance, object design, environment, composition, colors, lighting, materials, and the overall visual style.
4. Applies only the requested motion, local effects, and camera movement while avoiding unrelated additions, deformation, flicker, identity drift, and unintended restyling.
5. Creates a lightweight project that permanently stores the source image, expanded model prompt, generation settings, and final video.

For `minimax-h3-lightx2v-v5`, the available resolutions are:

- Portrait: `480p竖`, `768p竖`, and `1080p竖`
- Landscape: `480p横`, `768p横`, and `1080p横`

It supports whole-second durations from 1 through 10 seconds. Queueing and generation may wait for up to 30 minutes in total, with status polled once per second.

## Create an AI Product Ad

Upload one to five product images or commerce-page screenshots through the host agent and ask for a product ad. For example:

```text
Use SceneLoop to create a natural 15-second vertical UGC ad from this product screenshot. Generate it directly.
```

The current Fast UGC workflow produces five three-second shots and assembles one 15-second preview. It supports `9:16` and model-supported `16:9`. One clear product screenshot is sufficient; users do not need to transcribe the visible product name, price, or specifications.

When the user authorizes direct generation, the agent states and confirms the complete cost scope once. The `ai-ads.exe` runtime then performs product understanding, planning, image generation, video generation, and assembly. If execution is interrupted, resume the same project; successful assets and provider tasks are not submitted again.

Check AI Ads readiness in PowerShell:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$AIAds = Join-Path $HermesHome "skills\sceneloop\scripts\ai-ads.exe"
& $AIAds readiness
& $AIAds models
```

For another host agent, use `scripts\ai-ads.exe` under its managed Skill directory. The current release is not intended for arbitrary ad durations, bulk variants, automatic publishing, or complete post-production.

## Example Requests

### Vertical AI Comic Drama

```text
Use SceneLoop to make episode 1 of this script. The project ID is city_story, the aspect ratio is 9:16, the style is high-quality 3D animation, keep the dialogue in English, and use 720p video.
```

### Live-Action Short Drama

```text
Use SceneLoop to make a cinematic live-action vertical short drama. The project ID is night_case, episode 1, aspect ratio 9:16, English dialogue, and 720p video.
```

### Continue a Specific Shot

```text
Continue shot 6 of episode 1 in night_case. Check existing assets and render through the video stage.
```

### Retry Failed Shots

```text
Use SceneLoop to retry the failed shots in episode 1 of city_story without overwriting successful videos.
```

### Animate an Uploaded Image

```text
Use SceneLoop to animate this image: make the person blink naturally, add a light breeze to the clothes and hair, and slowly push the camera forward while preserving the original visual style.
```

### Create a 15-Second Product Ad

```text
Use SceneLoop to turn these product images into a natural 15-second 9:16 UGC ad with native English speech. Run it directly.
```

## Output Files

SceneLoop stores project references separately from video output:

```text
references/<project_id>/
  source/                         source scripts
  scripts_prompts/episode_001/    adapted script and storyboard JSON
  character_prompts/episode_001/  character definitions and references
  scene_prompts/episode_001/      location definitions and references
  shot_prompts/episode_001/       shot first and last frames
  runtime/episode_001/            run state and shot reports

output/<project_id>/
  episodes/episode_001/
    shot_001.mp4
    shot_002.mp4
```

`references/` contains scripts, JSON, images, and reports. `output/` contains videos only.

Image animations use a separate lightweight project directory:

```text
image_animation_projects/<project_id>/
  source/original.<jpg|jpeg|png|webp>  archived uploaded image
  output/animated_<request_hash>.mp4   generated animation video
  project.json                         original motion text, expanded model prompt, and generation state
```

Repeated requests with the same image, prompt, model, resolution, duration, and seed reuse the existing video. A change to any generation setting or prompt-policy version creates a new request result.

AI Ads projects are stored in the Skill's ads workspace by default:

```text
workspace/ads/ads_projects/<project_id>/
  manifest.json                    project manifest and resumable state
  ...                              evidence, plans, images, videos, and final preview
```

Do not delete the project directory after an interrupted run. Resume the same project to reuse completed results.

## Troubleshooting

### PowerShell Cannot Run the Program or Find a File

Recalculate the installation path and check the files:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoopSkill = Join-Path $HermesHome "skills\sceneloop"
Test-Path "$SceneLoopSkill\scripts\sceneloop.exe"
Test-Path "$SceneLoopSkill\scripts\ai-ads.exe"
Test-Path "$SceneLoopSkill\scripts\setup.exe"
```

All three commands should return `True`.

### Windows SmartScreen Blocks the Executable

Only for an official package whose source and file hash you have verified, select **More info**, then **Run anyway**. Do not disable Windows Defender or SmartScreen globally.

If Windows marks the downloaded archive as blocked, right-click the ZIP file, open **Properties**, select **Unblock**, and extract it again.

### Memurai Connection Failure

Run PowerShell as administrator:

```powershell
sc.exe config Memurai start= auto
sc.exe start Memurai
Get-Service Memurai
Test-NetConnection 127.0.0.1 -Port 6379
```

`Get-Service` should report `Running`, and `TcpTestSucceeded` should be `True`. If Memurai is not installed, run `setup.exe` again.

### Hermes Does Not Invoke SceneLoop

```powershell
hermes skills list
```

Confirm that `sceneloop` appears, then start a new Hermes conversation or run `/reset`. Explicitly ask Hermes to use SceneLoop.

### OpenClaw Does Not Invoke SceneLoop

```powershell
openclaw skills list
```

Confirm that `sceneloop` appears, then start a new OpenClaw conversation and explicitly request SceneLoop. If the Skill is absent, repeat the OpenClaw installation commands above.

### Invalid License Status

Confirm that Memurai is running, then execute:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoop = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop.exe"
& $SceneLoop license verify
```

If the device has never been activated, run `setup.exe` again from an administrator PowerShell. Do not bypass or modify license validation.

### License Key Is Requested on Every Run

This should not happen under normal conditions. Check that:

1. Memurai remains running and is configured for automatic startup.
2. You are still using the default Redis DB 4.
3. `FLUSHDB` has not been run, and Memurai or its data has not been removed.
4. Review the exact error codes returned by `license status` and `license verify`.

### Model Returns 401, 403, or Insufficient Balance

- `401` usually indicates an invalid or expired API key, or a key configured for the wrong provider.
- `403` usually indicates account permissions, insufficient balance, or a service that has not been enabled.
- After changing model configuration, run `setup.exe` again to verify it.

### Image or Video Generation Times Out

Timeouts may occur when a model service is busy or the network is unstable. Keep completed assets and ask SceneLoop to retry failed shots instead of restarting the entire project.

MiniMax H3 v5 image-animation and multi-reference video tasks wait for up to 30 minutes, including both queueing and generation. If the task is still incomplete after 30 minutes, SceneLoop stops waiting; whether the provider continues processing depends on the model service. Check the lightweight project for an existing output before retrying to avoid unnecessary duplicate generation.

## Security

- Never expose License Keys or API keys in chats, logs, screenshots, or public repositories.
- Do not modify or bypass SceneLoop license validation.
- Hermes and OpenClaw only coordinate the workflow; they must not replace SceneLoop's production models.
- The package contains no user credentials. Licensing and model configuration take place locally.

## About Us

SceneLoop is developed and maintained by **Xi'an Wenyao Network Information Technology Co., Ltd.**

- Product website: [SceneLoop](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

© 2024 - 2026 西安文鳐网络信息科技有限责任公司 版权所有
