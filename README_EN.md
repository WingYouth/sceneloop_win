# SceneLoop

[简体中文](README.md) | [English](README_EN.md)

SceneLoop is an intelligent workflow for producing AI comics and AI short dramas. Give a script and creative requirements to an AI agent such as Hermes or OpenClaw, and SceneLoop handles visual adaptation, storyboard planning, character and location assets, first frames, and shot-by-shot video generation.

SceneLoop is developed by **Xi'an Wenyao Network Information Technology Co., Ltd.**

[Visit the SceneLoop product website](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

> This guide covers the Windows edition of the SceneLoop Skill.

## Features

- Accepts `.docx`, `.md`, and `.txt` scripts.
- Plans projects from the requested aspect ratio, visual style, language, resolution, and target duration.
- Generates `storyboard.json`, `characters.json`, and `locations.json` automatically.
- Creates missing character images, location images, shot first frames, and videos.
- Supports animation, 3D, live-action, and other visual directions.
- Maintains character, location, and visual continuity between adjacent shots.
- Supports shot-level generation, resumable runs, and retries for failed shots.

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

Hermes or OpenClaw handles the user conversation, collects parameters, and invokes SceneLoop. SceneLoop's configured models perform the actual text, image, and video production; the agent must not substitute its own models for these production steps.

## Windows Requirements

Before you begin, prepare:

- 64-bit Windows 10 or Windows 11.
- A prebuilt SceneLoop Windows directory matching your computer architecture. This repository provides the AMD64 version.
- Git installed and available from PowerShell.
- A working Hermes Desktop, Hermes CLI, or OpenClaw installation.
- A SceneLoop License Key.
- API keys required by your selected text, image, and video models.
- Network access to the model services and SceneLoop License Server.
- Administrator access for the initial Memurai installation and configuration.

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

You may use either Hermes or OpenClaw; installing both is not required.

## Install the SceneLoop Skill

### Install in Hermes

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

### Install in OpenClaw

OpenClaw can install this extracted Skill directly from GitHub:

```powershell
openclaw skills install git:WingYouth/sceneloop_win --as sceneloop --global
openclaw skills list
```

OpenClaw installs a global Skill in its managed Skill directory. Start a new OpenClaw conversation after installation so it loads the updated Skill list. See the [official OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills) for current commands and directory rules.

## First-Time Setup and Licensing

When you upload a script and request generation in Hermes or OpenClaw, SceneLoop first checks the runtime, Memurai, license, and model configuration. If setup is incomplete, the agent launches `sceneloop-setup.exe`.

Initial Windows setup may need to install and start the Memurai service. Right-click PowerShell or Windows Terminal, select **Run as administrator**, and run Setup once:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$Setup = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop-setup.exe"
& $Setup
```

If you installed the Skill through OpenClaw, run `sceneloop-setup.exe` from the corresponding `sceneloop\scripts\` path in OpenClaw's managed Skill directory.

Setup performs these steps:

1. Checks the Windows environment.
2. Checks for a Redis-compatible service and installs Memurai through WinGet if required.
3. Configures Memurai as an automatically started Windows service and verifies the connection.
4. Activates the device with your SceneLoop License Key.
5. Lets you select a text model and enter its API key.
6. Lets you select an image model and enter its API key.
7. Lets you select a video model and enter its API key.
8. Verifies and saves the configuration locally.

Enter License Keys and API keys only in the local Setup window or terminal. Never send them through Hermes, OpenClaw, Feishu, group chats, or screenshots.

### Check License Status

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoop = Join-Path $HermesHome "skills\sceneloop\scripts\sceneloop.exe"
& $SceneLoop license status
```

Device binding data remains in local Memurai. When a runtime lease expires, SceneLoop renews it online using the existing binding, so you normally do not need to enter the License Key again.

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
5. Video resolution; higher resolutions generally increase model cost.
6. Target finished-video duration when you explicitly request one.

After confirmation, SceneLoop runs the workflow required by the current project. It fills missing assets and does not recreate completed assets without a reason.

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

## Troubleshooting

### PowerShell Cannot Run the Program or Find a File

Recalculate the installation path and check the files:

```powershell
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA "hermes" }
$SceneLoopSkill = Join-Path $HermesHome "skills\sceneloop"
Test-Path "$SceneLoopSkill\scripts\sceneloop.exe"
Test-Path "$SceneLoopSkill\scripts\sceneloop-setup.exe"
```

Both commands should return `True`.

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

`Get-Service` should report `Running`, and `TcpTestSucceeded` should be `True`. If Memurai is not installed, run `sceneloop-setup.exe` again.

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

If the device has never been activated, run `sceneloop-setup.exe` again from an administrator PowerShell. Do not bypass or modify license validation.

### License Key Is Requested on Every Run

This should not happen under normal conditions. Check that:

1. Memurai remains running and is configured for automatic startup.
2. You are still using the default Redis DB 4.
3. `FLUSHDB` has not been run, and Memurai or its data has not been removed.
4. Review the exact error codes returned by `license status` and `license verify`.

### Model Returns 401, 403, or Insufficient Balance

- `401` usually indicates an invalid or expired API key, or a key configured for the wrong provider.
- `403` usually indicates account permissions, insufficient balance, or a service that has not been enabled.
- After changing model configuration, run `sceneloop-setup.exe` again to verify it.

### Image or Video Generation Times Out

Timeouts may occur when a model service is busy or the network is unstable. Keep completed assets and ask SceneLoop to retry failed shots instead of restarting the entire project.

## Security

- Never expose License Keys or API keys in chats, logs, screenshots, or public repositories.
- Do not modify or bypass SceneLoop license validation.
- Hermes and OpenClaw only coordinate the workflow; they must not replace SceneLoop's production models.
- The package contains no user credentials. Licensing and model configuration take place locally.

## About Us

SceneLoop is developed and maintained by **Xi'an Wenyao Network Information Technology Co., Ltd.**

- Product website: [SceneLoop](https://www.wenyaotech.com/products?category=autodrama&product=sceneloop)

© 2024 - 2026 西安文鳐网络信息科技有限责任公司 版权所有
