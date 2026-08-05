---
name: sceneloop
description: Produce or continue an AI drama from a TXT, Markdown, or DOCX script with the packaged SceneLoop runtime. Use whenever the user requests a faithful visual script adaptation, storyboard JSON, character or location references, shot first frames, shot videos, an episode, or a complete AI drama. After secure setup, collect project-wide aspect ratio, visual direction, dialogue language, and model-supported video resolution, run only the SceneLoop CLI, preserve configured models and completed assets, and resume the smallest missing scope.
---

# SceneLoop

SceneLoop turns a script into an ordered episode of per-shot videos. Hermes,
OpenClaw, Feishu, and other host Agents coordinate the user conversation, but
the packaged SceneLoop runtime performs every production stage.

## Non-Negotiable Rules

1. Use SceneLoop for script adaptation, storyboard planning, character images,
   location images, first frames, videos, episode rendering, and continuation
   of existing work.
2. Never replace a SceneLoop text, image, video, or multimodal model call with
   the host Agent's own model capabilities.
3. Never fabricate or manually repair canonical JSON, generated images, model
   responses, continuity frames, or videos.
4. Never bypass, patch, or weaken the SceneLoop license gate.
5. Do not edit packaged code, templates, model configuration, or `.env` during
   production. Setup may write deployment configuration.
6. Keep successful assets unless the user explicitly requests regeneration.
7. Never expose API keys, License Keys, authorization headers, Base64 images,
   or raw provider responses in chat, logs, command summaries, or Agent Memory.

The host Agent may collect parameters, invoke SceneLoop, inspect real output,
explain failures, present files, and maintain compact continuation memory.

## Runtime Resolution

At every activation, resolve two commands without hardcoding an absolute user
path.

Resolve the SceneLoop runtime in this order:

1. executable path from `SCENELOOP_EXECUTABLE`;
2. `sceneloop` or `sceneloop.exe` available through `PATH`;
3. `${HERMES_SKILL_DIR}/scripts/sceneloop` on macOS/Linux or
   `${HERMES_SKILL_DIR}/scripts/sceneloop.exe` on Windows.

Resolve setup in this order:

1. executable path from `SCENELOOP_SETUP_EXECUTABLE`;
2. `sceneloop-setup` or `sceneloop-setup.exe` available through `PATH`;
3. `${HERMES_SKILL_DIR}/scripts/sceneloop-setup` on macOS/Linux or
   `${HERMES_SKILL_DIR}/scripts/sceneloop-setup.exe` on Windows.

Hermes replaces `${HERMES_SKILL_DIR}` with the installed Skill directory.
Other hosts must resolve the directory containing their loaded `SKILL.md`.
Do not assume a home, download, repository, or operating-system-specific
absolute path.

Use the resolved runtime path for every command shown below as `sceneloop`.

## Automatic Setup

Credential readiness is a blocking gate and must run before collecting
`project_id`, episode number, or any creative settings.

1. Run `sceneloop --help`.
2. Run `sceneloop license status`.
3. If the runtime is missing, the License reports `LICENSE_NOT_ACTIVATED`, or
   provider configuration is incomplete, tell the user that local SceneLoop
   authorization and model-provider setup must be completed before production.
4. Execute the resolved `sceneloop-setup` automatically in a user-visible,
   interactive local session. Do not ask the user to locate or launch it.
5. Tell the user to enter the License Key and the API Keys requested for the
   selected text, image, and video providers only inside the local setup
   prompt. Never ask the user to paste a secret into chat, Feishu, Hermes,
   OpenClaw, command arguments, or Agent Memory.
6. Wait for setup to finish. It selects the three default model aliases, saves
   the required provider credentials locally, and tests those credentials.
7. After setup, resolve the runtime again and run
   `sceneloop license status`.
8. Continue to project questions only when the License is valid and setup has
   completed. If setup fails or the secure local prompt is unavailable, stop
   and report the setup failure; do not begin planning and do not substitute
   the host Agent's models.

Do not rerun setup when the runtime is healthy. An expired signed lease is not
an installation failure: SceneLoop automatically verifies its persisted device
binding and refreshes the lease. Request License activation only when the
runtime reports `LICENSE_NOT_ACTIVATED`.

When a later SceneLoop command reports a missing provider environment key,
treat it as incomplete setup: launch `sceneloop-setup` again and configure the
credential locally. Do not ask for the key in chat.

If neither the runtime nor bundled setup can be resolved, report that the
SceneLoop Skill package is incomplete. Never substitute host-Agent generation.

## User Inputs

Only after the credential readiness gate succeeds, collect these values for a
new project before planning:

- source `.txt`, `.md`, or `.docx` script;
- English `project_id`;
- episode number;
- project-wide aspect ratio: `16:9`, `9:16`, or `1:1`;
- visual direction, either explicit customer requirements or an explicit
  instruction to derive it from the script;
- dialogue and narration language: `source` to preserve the script language,
  or a language code such as `zh`, `en`, `ja`, or `ko`;
- video resolution selected from the locked video model's configured choices.

First confirm the source script, English `project_id`, and episode number.
Then complete the ordered project-setting questions below. Do not start
planning after collecting only the project ID and episode number.

Collect project settings in this exact conversational order:

1. Ask the user to choose the project-wide aspect ratio.
2. Wait for the user's aspect-ratio answer.
3. Then proactively ask for the desired visual style. Accept a natural-language
   direction such as live-action cinematic drama, 3D animation, 2D ink
   animation, or illustration. This is not a fixed style preset list.
4. Wait for the user's visual-style answer.
5. Ask which language the spoken dialogue and narration must use. Explain that
   `source` preserves the original script language, while `en`, `zh`, `ja`,
   `ko`, or another valid language code requests that spoken content in the
   selected language. Do not infer this choice from the script.
6. Wait for the user's language answer.
7. Resolve the configured video-model alias, then run
   `sceneloop models video --model <video_model>` and read that model's
   `supported_resolutions`.
8. Ask the user to choose one of those exact values. State clearly that higher
   resolution generally costs more and takes longer, while actual billing
   follows the model provider. Identify the configured default as the
   recommended starting point, but do not select it without the user's answer.
9. Wait for the user's resolution answer.
10. Do not invoke the `plan` stage until aspect ratio, visual style, dialogue
   language, and video resolution are all confirmed.
   If the user wants SceneLoop to decide the style, pass an explicit
   instruction to derive one coherent visual style from the script.

When the user describes the requested product only as a short drama or uses
the term `短剧` without naming a visual medium, explicitly ask whether the
result should use a live-action, real-performer style. Wait for the answer. A
yes selects `live_action`; a no selects `standard` and still requires the
user's desired non-live-action visual direction.

When the user explicitly selects a live-action, real-actor, or filmed-drama
style, pass `--production-mode live_action`. For animation, illustration, 3D,
or any other generated visual medium, pass `--production-mode standard`.
`productionMode` is a technical workflow switch, not a style preset; always
pass the user's actual visual direction separately through
`--style-requirements`. If the user delegates the visual decision entirely to
SceneLoop, use `standard`; never infer `live_action` without explicit user
intent.

Pass a user-specified total episode duration through
`--target-duration-seconds`. Do not invent a Skill-level duration. When the
user does not specify one, omit the option and let planning derive it.

For an existing project, reuse `styleProfile.aspectRatio`, visual direction,
`dialogueLanguage`, model aliases, `run_state.json` `videoResolution`,
canonical JSON, and completed assets. Do not ask again unless the user requests
a change. For an older project without `dialogueLanguage`, ask once before
replanning. For an older project without `videoResolution`, ask once before
planning or rendering video.

## Model Locking

Resolve one configured text-model alias, image-model alias, and video-model
alias for the episode. Use explicit run overrides when the user supplies them;
otherwise use the packaged defaults.

Keep those aliases fixed across stages, shots, retries, and resumed runs. Never
automatically switch model IDs, providers, resolution, or strategy after an
error. Stop and obtain explicit authorization before changing a locked model.
The live-action colored-pencil proxy uses the same locked image-model alias as
the character, location, and first-frame stages. The locked live-action video
model must support SceneLoop's reference-image mode; never switch models
automatically when it does not.

## Business Workflow

```text
ingest -> adapt -> plan -> characters -> locations -> render
```

- `ingest`: preserve the upload and normalize the episode script.
- `adapt`: use the configured text model to create a faithful,
  visually explicit Markdown working script at `script_adapted.md`. It may
  clarify visible actions, character appearance, costume, props, locations,
  and continuity, but must not change the core plot, relationships,
  motivations, setting, or ending.
- `plan`: create `storyboard.json`, `characters.json`, and `locations.json`.
- `characters`: generate only missing character reference images in the
  user-requested project style, including live-action character references.
- `locations`: generate only missing location reference images. Each location
  must produce one full-frame scene from one camera viewpoint. Never request a
  three-view sheet, collage, split panel, inset view, or environment design board.
- `render`: diagnose each shot, complete missing references, generate a
  canonical first frame, generate video, apply continuity, and write status
  back. In `live_action` mode, SceneLoop keeps the canonical first frame in the
  requested live-action style, automatically creates one colored-pencil proxy,
  and sends only that proxy as a single video reference image. The video prompt
  requires photorealistic live-action output. A returned live-action last frame
  is processed in the same way only when it becomes the next shot's video
  input.

`storyboard.json` is authoritative for `productionMode`, `dialogueLanguage`,
`styleProfile`, and `shots`. `dialogueLanguage` is written by SceneLoop code
from the confirmed user setting, not generated as a model decision. Shots
refer to definitions through `roleRefs` and `locationRef`. Do not duplicate
reference image paths into every shot.

Use each shot's dynamic `durationMs` for video generation.

Script adaptation runs by default before storyboard planning. Never let the
host Agent rewrite the script itself. Skip adaptation only when the user
explicitly requests planning directly from the normalized source. When
`script_adapted.md` exists and is not older than `script.md`, SceneLoop uses it
as the planning input. If the normalized source is newer, `adapt` regenerates
the working script before `plan` during a normal run.

For live-action video-reference preparation, SceneLoop makes at most two total
image-model attempts: the initial attempt and one retry for a transient
provider failure. It never sends the canonical live-action image directly to
the video model as a fallback.

Empty shots are still valid and must still be rendered. During planning, an
empty shot with no visible character, major environmental change, important
plot information, or essential reveal should receive only the shortest
reasonable duration needed to establish the location or transition. Do not
extend static empty shots merely to display scenery.

## Commands

Inspect every configured video model and its own resolution choices:

```bash
sceneloop models video
sceneloop models video --model <video_model>
```

The CLI option is spelled `--video-resolution`. Use only a value returned for
the selected model. Never write `--video-resoluction`.

Run a complete episode:

```bash
sceneloop run <script_path> \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --aspect-ratio <16:9|9:16|1:1> \
  --style-requirements <visual_direction> \
  --dialogue-language <source|language_code> \
  --video-resolution <model_supported_resolution> \
  --production-mode <standard|live_action>
```

Script adaptation is already included in a normal run. To bypass it only after
an explicit user request, add:

```bash
--skip-script-adaptation
```

The legacy `--adapt-script` option remains accepted for compatibility. An
explicit `--stages` list is exact, so include `adapt` whenever that selected
workflow should refresh the visual working script.

Add this only when the user specifies a total duration:

```bash
--target-duration-seconds <seconds>
```

Run selected stages:

```bash
sceneloop run <script_path> \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --aspect-ratio <16:9|9:16|1:1> \
  --style-requirements <visual_direction> \
  --dialogue-language <source|language_code> \
  --video-resolution <model_supported_resolution> \
  --production-mode <standard|live_action> \
  --stages ingest adapt plan characters locations
```

### Single-Step Generation

When the user asks for only one business artifact, pass exactly one stage:

```bash
sceneloop run <script_path> \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --aspect-ratio <16:9|9:16|1:1> \
  --style-requirements <visual_direction> \
  --dialogue-language <source|language_code> \
  --video-resolution <model_supported_resolution> \
  --production-mode <standard|live_action> \
  --stages <ingest|adapt|plan|characters|locations>
```

The stage boundaries are:

- `ingest`: normalize and preserve only the uploaded source script;
- `adapt`: generate only the faithful visual Markdown working script
  `script_adapted.md` from the existing normalized `script.md`;
- `plan`: generate only canonical `storyboard.json`, `characters.json`, and
  `locations.json`;
- `characters`: generate only missing character reference images from the
  existing `characters.json`;
- `locations`: generate only missing location reference images from the
  existing `locations.json`.

For a new upload that needs only adaptation, use `--stages ingest adapt`. For a
new upload with an explicit adaptation-and-planning stage list, use
`--stages ingest adapt plan`. A normal run already includes both. Use `adapt`, `plan`,
`characters`, or `locations` alone only when their required canonical inputs
already exist. Planning and adaptation still require the confirmed style,
production mode, and dialogue-language arguments shown above when those values
have been collected. Adaptation alone does not require aspect ratio or video
resolution; planning does. Do not use the internal generation modules directly.

Diagnose or render one shot:

```bash
sceneloop render-shot \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --shot <shot_number> \
  --video-resolution <model_supported_resolution> \
  --dry-run

sceneloop render-shot \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --shot <shot_number> \
  --video-resolution <model_supported_resolution> \
  --until <assets|keyframe|video>
```

The shot boundaries are:

- `assets`: diagnose the shot and generate only its missing character and
  location reference images;
- `keyframe`: ensure required assets exist, then generate or reuse the first
  frame and stop;
- `video`: ensure required assets and first frame exist, then generate the
  final shot video. This is the default.

`--until` means reach the requested boundary; it does not skip prerequisites.
Reuse valid existing output and automatically fill only missing prerequisites.
Use `--dry-run` for diagnosis without model calls. Add `--overwrite-keyframe`
or `--overwrite-video` only when the user explicitly requests regeneration.

Render an ordered range:

```bash
sceneloop render-episode \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --start-shot <first_shot> \
  --end-shot <last_shot> \
  --video-resolution <model_supported_resolution>
```

Inspect licensing:

```bash
sceneloop license status
sceneloop license verify
```

Do not place a License Key directly in a visible command. Activation uses the
secure prompt supplied by setup or `sceneloop license activate`.

## Execution Scope

Run the smallest supported scope:

- complete drama or episode: `sceneloop run`;
- one business stage: `sceneloop run --stages <stage>`;
- one shot up to a requested boundary: `sceneloop render-shot --until ...`;
- ordered shots: `sceneloop render-episode`;
- dependency inspection without model calls: `--dry-run`.

Before later stages, inspect real canonical files and assets. Resume the
smallest missing stage or shot. Do not call internal generation modules or
manually chain historical numbered steps.

## Output Contract

SceneLoop writes non-video production files under:

```text
<workspace_dir>/references/<project_id>/
  source/
  scripts_prompts/episode_NNN/
  character_prompts/episode_NNN/
  scene_prompts/episode_NNN/
  shot_prompts/episode_NNN/
  video_references/episode_NNN/
  runtime/episode_NNN/
```

The script directory contains preserved `script.md`, generated
`script_adapted.md`, and the canonical planning JSON files. The adapted file is
a model-generated working script, not a replacement for the original source.

Final videos are the only files under:

```text
<workspace_dir>/output/<project_id>/episodes/episode_NNN/shot_NNN.mp4
```

Apply this layout only to new runs. Never migrate an existing legacy project
unless the user explicitly requests it.

## Completion and Failure

Declare success only when requested files exist and canonical JSON write-back
is correct. On failure, report the stage, shot number, concise provider or
validation error, and the next executable SceneLoop action.

License handling:

- `LICENSE_NOT_ACTIVATED`: run automatic setup or secure activation;
- expired local lease: let SceneLoop verify and refresh automatically;
- `LICENSE_EXPIRED`, `LICENSE_DISABLED`, `DEVICE_REVOKED`, or
  `DEVICE_LIMIT_EXCEEDED`: stop production;
- temporary License Server outage with a valid local lease: allow SceneLoop's
  built-in policy to decide; never bypass it.

## Agent Memory

Store cross-session progress only in the host platform's Agent or Skill Memory.
Do not create project-side Agent memory files.

Use one record per project episode:

```text
sceneloop:<project_id>:episode_NNN
```

Store compact English fields only:

```json
{
  "sourceScript": "/absolute/path/to/script.docx",
  "workspaceDir": "/absolute/path/to/workspace",
  "projectId": "english_project_id",
  "episodeNumber": 1,
  "aspectRatio": "16:9",
  "visualDirection": "customer requirement or derive from script",
  "dialogueLanguage": "source_or_language_code",
  "videoResolution": "720p",
  "productionMode": "standard_or_live_action",
  "targetDurationSeconds": null,
  "scriptAdaptation": true,
  "status": "running",
  "currentStage": "render",
  "currentShot": 7,
  "completedStages": ["ingest", "adapt", "plan", "characters", "locations"],
  "completedShots": [1, 2, 3, 4, 5, 6],
  "failedShots": [],
  "models": {
    "text": "configured_alias",
    "image": "configured_alias",
    "video": "configured_alias"
  },
  "lastError": "",
  "nextAction": "render_shot_007",
  "updatedAt": "ISO-8601 timestamp"
}
```

Update host Memory before execution, after each visible stage or shot, when
waiting for user input, on failure, and on completion. Before resuming, verify
the actual files because Agent Memory may be stale.
Record `scriptAdaptation` as `false` only when the user explicitly skips the
default adaptation stage.
