---
name: sceneloop
description: Produce or continue an AI drama, animate one uploaded image, or create a grounded 15-second Fast UGC product ad. Route drama and image animation through the packaged sceneloop runtime, and product advertising through the packaged ai-ads runtime. After secure shared setup, preserve review gates, successful assets, locked models, and resumable project state.
---

# SceneLoop

SceneLoop is one packaged creative-production Skill with two business runtimes.
`sceneloop` creates drama episodes or animates one image; `ai-ads` creates a
grounded 15-second Fast UGC product ad. Hermes, OpenClaw, Feishu, and other host
Agents coordinate the user conversation, but the packaged runtimes perform
every production stage.

## Workflow Routing

Choose the runtime from user intent before collecting production settings:

1. Product advertising, UGC advertising, marketing creatives, product-selling
   videos, or a request to turn product materials into an ad selects **AI Ads
   Fast UGC** and the `ai-ads` runtime.
2. One uploaded image plus an explicit request to make that image move selects
   **Animate One Image** and the `sceneloop` runtime, even when the image shows
   a product.
3. A script, episode, character, location, storyboard, or drama continuation
   request selects **Drama** and the `sceneloop` runtime.

Do not create both project types for one request. Drama and Ads share setup,
License, and model configuration, but never share canonical project Artifacts.

## AI Ads Fast UGC

The first Ads release supports one 15-second ad, five 3-second shots, one to
five product images, `9:16` or supported `16:9`, and optional native Provider
audio with one global Voice Profile. It supports new projects and exact Resume.
Do not route Standard Ads, Product Visual, arbitrary durations, Variants, ad
publishing, or full post-production through this Skill.

For a new Ads project, accept product images and a short brief as the starting
input. Commerce-page screenshots with text, prices, buttons, variant thumbnails,
or a model wearing the product are valid sources; do not demand text-free images.
Let runtime Vision identify the product and read the evidence.
One screenshot by itself is sufficient. If the user supplies no brief, use
“根据商品截图制作真实自然的15秒UGC广告” internally; do not ask them to transcribe
the product title, price, specifications, or visible page content.

Reuse user preferences and configured default model aliases. For missing settings,
propose one compact default package: 9:16, the conversation language, its market
when clear, a neutral "learn more" CTA, natural everyday product demonstration,
and native speech with a natural adult Voice Profile if the configured model
supports it (otherwise no audio). Use CLI-supported Voice Profile values.
State defaults together in Request review; do not ask separate questions for each
parameter or offer model menus unless configuration is missing or the user asks.
Ask only for information that materially changes product selection or campaign.
Create
an internal lowercase ASCII project ID such as `ad_YYYYMMDD_HHMMSS`; do not ask
the user to invent one. Use `AI_ADS_WORKSPACE` when set, otherwise use
`${HERMES_SKILL_DIR}/workspace/ads`.

For exactly one Product screenshot, default to one-confirmation full-auto mode.
Treat an explicit instruction such as “直接生成”, “开始制作”, or “自动执行” as
that authorization. Otherwise ask one compact question before production that
states the defaults and the complete scope: one Vision call, one Text planning
call with at most one semantic repair only if its output is invalid, five Image
tasks, five paid Video tasks, and one 15-second Preview. Include aspect ratio and
audio mode in that same question. Never ask another approval question after the
user authorizes this unchanged scope.

After authorization, create with `ai-ads start --workflow-mode fast_ugc`, register
the screenshot with `add-image`, then run `auto-run --confirm-full-run` with the
configured Vision, Text, Image, and Video aliases. `auto-run` owns Evidence
selection, conflict exclusion, Request confirmation, Creative policy approval,
Frame approval, paid Video submission, task resume, and Preview assembly. Do not
replace it with `advance`, `confirm-fast-request`, `approve-fast-plan`,
`approve-assets`, or `generate-video`, and do not expose those internal gates as
questions to the user.

Use this command shape after `start` and `add-image`:

```bash
ai-ads auto-run --workspace-dir WORKSPACE --project-id PROJECT_ID \
  --confirm-full-run --vision-model VISION --text-model TEXT \
  --image-model IMAGE --video-model VIDEO --audio-mode muted
```

Use `--audio-mode native` plus the CLI Voice Profile options only when native
audio was included in the initial authorization.

The full-auto policy uses the sole screenshot as the authoritative Product
source, includes only directly observed Facts with `advertisingUse=allowed`, and
keeps claims, prices, sales counts, service promises, unresolved conflicts, and
unknowns out of advertising copy. It stops with a structured error if product
identity is ambiguous or deterministic Creative safety checks fail; report that
failure without asking the user to classify internal Sources, Facts, Frames, or
JSON.

If `auto-run` returns `complete=false` or `action=resume_required`, rerun the same
command automatically for the same project and options. Successful artifacts and
Provider task IDs are resumable and must not be regenerated. When it returns
`complete=true`, present the Preview from `agentState.media` and stop. Do not ask
for a final Preview confirmation unless the user requested iterative review.

`agent-state` now returns `contractVersion=ai_ads.agent.v3`,
`supportsAutonomousRun=true`, and `autonomousCommand=auto-run`. It remains the
read-only diagnostic contract. `projectStatus` and disk filenames are not gates;
a JSON file is authoritative only when registered by the manifest. Never compare
or repair disk hashes, hand-edit Ads JSON, substitute host models, or ask the user
to remove commerce-page text merely to bypass validation.

## Non-Negotiable Rules

1. Use the packaged runtimes for Ads, script adaptation, storyboard planning,
   character images, location images, first frames, videos, direct uploaded-
   image animation, episode rendering, and continuation of existing work.
2. Never replace a SceneLoop or AIAds text, image, video, or multimodal model
   call with the host Agent's own model capabilities.
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

At every activation, resolve three commands without hardcoding an absolute user
path.

Resolve the SceneLoop runtime in this order:

1. executable path from `SCENELOOP_EXECUTABLE`;
2. `sceneloop` or `sceneloop.exe` available through `PATH`;
3. `${HERMES_SKILL_DIR}/scripts/sceneloop` on macOS/Linux or
   `${HERMES_SKILL_DIR}/scripts/sceneloop.exe` on Windows.

Resolve the AI Ads runtime in this order:

1. executable path from `AI_ADS_EXECUTABLE`;
2. `ai-ads` or `ai-ads.exe` available through `PATH`;
3. `${HERMES_SKILL_DIR}/scripts/ai-ads` on macOS/Linux or
   `${HERMES_SKILL_DIR}/scripts/ai-ads.exe` on Windows.

Resolve setup in this order:

1. executable path from `SCENELOOP_SETUP_EXECUTABLE`;
2. `${HERMES_SKILL_DIR}/scripts/setup` on macOS/Linux or
   `${HERMES_SKILL_DIR}/scripts/setup.exe` on Windows.

Do not resolve a bare `setup` command through `PATH`; the name is intentionally
generic and must remain scoped to this installed Skill.

Hermes replaces `${HERMES_SKILL_DIR}` with the installed Skill directory.
Other hosts must resolve the directory containing their loaded `SKILL.md`.
Do not assume a home, download, repository, or operating-system-specific
absolute path.

Use the resolved runtime paths for every command shown below as `sceneloop`,
`ai-ads`, and `setup`.

## Automatic Setup

Credential readiness is a blocking gate and must run before collecting project
identifiers, episode numbers, or creative settings.

The current SceneLoop License authority is `http://114.66.54.147:8000` and its
health endpoint is `http://114.66.54.147:8000/sceneloop/health`. Treat any
persisted error or Agent Memory that mentions `http://211.101.234.146:8000` as
historical state from an obsolete release, not as the active endpoint. Never
infer the current License authority from an old project's saved stage error;
use the resolved packaged runtime and its readiness/status result.

1. Run `sceneloop --help` for Drama/Image work or `ai-ads --help` for Ads.
2. For Drama/Image, run `sceneloop license status`. For Ads, run
   `ai-ads readiness`.
3. If a required runtime is missing, License reports
   `LICENSE_NOT_ACTIVATED`, Ads reports `ready=false`, or Provider configuration
   is incomplete, tell the user that local authorization and model setup must
   be completed before production.
4. Execute the resolved `setup` automatically in a user-visible,
   interactive local session. Run the executable directly in the foreground;
   do not wrap it with shell-specific keep-open commands such as `read -p`.
   Do not ask the user to locate or launch it.
5. Tell the user to enter the License Key and the API Keys requested for the
   selected Vision, Text, Image, and Video Providers only inside the local setup
   prompt. Never ask the user to paste a secret into chat, Feishu, Hermes,
   OpenClaw, command arguments, or Agent Memory.
   If the user has already requested `minimax-h3-lightx2v-v5`, tell them to
   select that exact video-model alias in setup and enter the requested
   `minimax_h3_v5` only in the local setup prompt.
6. Wait for setup to finish. It selects the four default model aliases, saves
   the required provider credentials locally, and runs each configured
   provider's non-generating connection test when one is available. MiniMax H3
   v5 setup stores the token but does not submit a paid generation task as a
   credential test.
7. After setup, resolve the runtimes again. Run `sceneloop license status` and,
   for Ads, `ai-ads readiness`.
8. Continue to project questions only when the License is valid and setup has
   completed. If setup fails or the secure local prompt is unavailable, stop
   and report the setup failure; do not begin planning and do not substitute
   the host Agent's models.

Do not rerun setup when the runtime is healthy. An expired signed lease is not
an installation failure: SceneLoop automatically verifies its persisted device
binding and refreshes the lease. Request License activation only when the
runtime reports `LICENSE_NOT_ACTIVATED`.

When a later runtime command reports a missing Provider environment key,
treat it as incomplete setup: launch `setup` again and configure the
credential locally. Do not ask for the key in chat.

If a required runtime or bundled setup cannot be resolved, report that the
SceneLoop Skill package is incomplete. Never substitute host-Agent generation.

## Workflow Selection

For Drama or Animate One Image, after setup succeeds run `sceneloop workflows`
and identify the requested workflow before asking for project inputs. Ads uses
the AI Ads section above and must not run `sceneloop workflows`. If intent already
selects one workflow, use it without asking them to reconfirm. If the request
is ambiguous, present the returned SceneLoop workflows and wait for one
selection. The current workflows are:

1. **Script to episode** — upload a TXT, Markdown, or DOCX script; SceneLoop
   plans the storyboard and generates character, location, keyframe, and video
   assets.
2. **Continue an existing project** — diagnose or render selected shots from
   an existing SceneLoop storyboard.
3. **Animate one image** — use one uploaded image plus the user's motion text
   to generate one video directly, without script adaptation, storyboard,
   character generation, location generation, or keyframe generation.

An image accompanied by wording such as “让这张图动起来”, “生成动效视频”,
“animate this image”, or an equivalent explicit request selects **Animate one
image**. Do not route that request through the episode workflow merely because
the image contains people, products, or a recognizable environment.

### Animate One Image Inputs

For **Animate one image**, collect only:

- the uploaded local JPEG, PNG, or WebP image;
- the user's desired motion, action, local effect, and camera movement; do not
  ask them to redescribe subjects, composition, or visual style already visible
  in the uploaded image;
- one configured video model whose `supports_image_animation` value is `true`;
- one exact resolution returned for that model;
- duration in whole seconds, using the model default only when the user accepts
  it or did not request a different duration;
- aspect ratio only when it cannot be safely inferred from image orientation
  or the selected model requires a choice between supported orientations;
- optional integer seed and optional extra MP4 export path.

SceneLoop automatically creates a lightweight project ID when `--project-id`
is omitted. Do not ask the user for an English project ID. Pass
`--project-id` only when the user explicitly supplies a preferred project
name. The project permanently archives the uploaded source image, generated
video, and generation settings together so the upload-cache path is not the
only copy of the source.

Run `sceneloop models video` and consider only entries with
`supports_image_animation: true`. `minimax-h3-lightx2v-v5` is a supported
choice for this workflow: it uses `minimax_h3_v5`, accepts `9:16` or `16:9`,
supports 1–10 whole seconds, and accepts the uploaded image as its sole
reference. Match portrait images to a `竖` resolution and landscape images to
a `横` resolution. For a square image with this model, ask whether the user
wants `9:16` or `16:9`; never choose a crop orientation silently.

Do not ask for a script, English project ID, episode number, characters,
locations, visual style, dialogue language, production mode, or asset-review
approval for this workflow. Do not run `run`, `render-shot`, or
`render-episode`. Pass the user's image and motion text unchanged in meaning to
the direct command; do not invent motion or style changes that the user did not
request, create a surrogate storyboard, or manually author canonical JSON.
SceneLoop automatically expands the motion text into the provider prompt with
an image-reference contract: the upload is the authoritative opening frame,
its subjects, setting, composition, colors, lighting, materials, and visual
style remain consistent, and only explicitly requested motion or transformation
may change them. Do not duplicate that boilerplate in `--prompt`.

## Episode User Inputs

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
- video model selected from the configured SceneLoop video-model aliases;
- video resolution selected from the locked video model's configured choices;
- execution mode: the recommended asset-review checkpoint, or an explicitly
  confirmed direct full-episode run.

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
7. Run `sceneloop models video` and ask the user to choose one of the returned
   video-model aliases. When `minimax-h3-lightx2v-v5` is returned, present it
   as an available MiniMax H3 v5 multi-reference video model. Offer it only
   for `9:16` or `16:9` projects; it does not support `1:1`. Never claim that
   it uses the MiniMax API credential: it requires the locally configured
   `minimax_h3_v5`.
8. Wait for the user's video-model answer. Do not silently use the packaged
   default when the user is choosing production settings.
9. Lock the selected alias, then run
   `sceneloop models video --model <video_model>` and read that model's exact
   `supported_resolutions`. For `minimax-h3-lightx2v-v5`, valid values are
   `480p竖`, `480p横`, `768p竖`, `768p横`, `1080p竖`, and `1080p横`; the
   selected orientation must match the project aspect ratio.
10. Ask the user to choose one of those exact values. State clearly that higher
   resolution generally costs more and takes longer, while actual billing
   follows the model provider. Identify the configured default as the
   recommended starting point, but do not select it without the user's answer.
11. Wait for the user's resolution answer.
12. For a new episode request that is not limited to one explicit business
    artifact, ask the user to choose between the recommended review-first mode
    and direct full-episode generation. Explain that review-first mode generates
    the character and location reference images, presents them for approval,
    and pauses before any first-frame or video generation.
13. If the user requests direct full-episode generation, give this concise
    warning in Chinese, or a faithful translation without added detail when the
    conversation uses another language:

    > ⚠️ 直接生成完整一集费用较高，且中间效果未经确认，可能出现不满意和返工。建议先确认人物与场景设定图。是否仍要直接生成？
14. Wait for a separate, explicit confirmation after the warning. The user's
    original request to create a complete episode is not confirmation to skip
    review. Silence, an ambiguous reply, or confirmation given before the
    warning does not authorize direct full-episode generation.
15. Do not invoke the `plan` stage until aspect ratio, visual style, dialogue
   language, video model, and video resolution are all confirmed.
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

When the user selects `minimax-h3-lightx2v-v5`, lock that exact alias and pass
it through `--video-model` for planning and every render command. This model
uses SceneLoop's `multimodal_reference` path with an opening frame plus ordered
identity and environment references, accepts at most five reference images,
and supports whole-second shot durations from 1 through 10 seconds. Do not
route it through the official MiniMax video API or substitute another model.

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

The direct image-animation workflow is separate:

```text
uploaded image + motion text -> lightweight project -> archived image + one video
```

It performs no text-model or image-model generation and never enters
`ingest`, `adapt`, `plan`, `characters`, `locations`, `keyframe`, or episode
`render` stages.

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

Animate one uploaded image directly:

```bash
sceneloop animate-image <uploaded_image_path> \
  --prompt <user_motion_text> \
  --workspace-dir <workspace_dir> \
  --video-model <image_animation_model> \
  --video-resolution <model_supported_resolution> \
  --duration <whole_seconds>
```

Usually omit `--aspect-ratio` so SceneLoop infers portrait, landscape, or
square from the image. Pass `--aspect-ratio <16:9|9:16|1:1>` only after an
explicit user choice or when a square image must use a non-square model. Add
`--seed <integer>` only when supplied by the user. Add `--overwrite` only when
the user explicitly requests regeneration of the same deterministic request.
The command automatically creates a stable lightweight project ID. A repeated
identical request reuses that project and its video; a different image,
prompt, model, resolution, duration, or seed creates a different automatic
project. `--output-path` creates an extra MP4 export but never replaces the
canonical video stored inside the project.

Run a complete episode only after the direct full-episode risk warning and the
user's separate explicit confirmation:

```bash
sceneloop run <script_path> \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --aspect-ratio <16:9|9:16|1:1> \
  --style-requirements <visual_direction> \
  --dialogue-language <source|language_code> \
  --video-model <video_model> \
  --video-resolution <model_supported_resolution> \
  --production-mode <standard|live_action> \
  --stages ingest adapt plan characters locations render
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
  --video-model <video_model> \
  --video-resolution <model_supported_resolution> \
  --production-mode <standard|live_action> \
  --stages ingest adapt plan characters locations
```

Use that exact stage list for the default review-first pass. When it finishes,
send the actual generated character and location reference images to the user,
not only file paths or a text summary, and stop. Do not invoke `render`,
`render-shot`, or `render-episode` in the same turn.

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
  --video-model <video_model> \
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
  --video-model <video_model> \
  --video-resolution <model_supported_resolution> \
  --dry-run

sceneloop render-shot \
  --workspace-dir <workspace_dir> \
  --project-id <english_project_id> \
  --episode <episode_number> \
  --shot <shot_number> \
  --video-model <video_model> \
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
  --video-model <video_model> \
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

- one uploaded-image animation: `sceneloop animate-image` only;
- review-first episode preparation: `sceneloop run --stages ingest adapt plan characters locations`;
- explicitly confirmed direct full episode: `sceneloop run --stages ingest adapt plan characters locations render`;
- one business stage: `sceneloop run --stages <stage>`;
- one shot up to a requested boundary: `sceneloop render-shot --until ...`;
- ordered shots: `sceneloop render-episode`;
- dependency inspection without model calls: `--dry-run`.

For a normal new episode, always use the review-first path. After character and
location generation completes, inspect the real canonical assets, send every
current character and location reference image to the user, and pause. Resume
video generation only after the user explicitly approves those presented
assets. If the user rejects an image or requests a revision, regenerate only
the requested asset scope, present the updated images again, and continue to
wait; approval of older images does not approve replacements.

After asset approval, use `render-episode` for the requested episode or shot
range. The approval applies only to the presented project and episode assets;
do not reuse it for a different episode or materially changed assets.

The only way to bypass the asset-review checkpoint is the direct full-episode
path described in User Inputs: give the concise warning specified there, then
receive a separate explicit confirmation. Never call `sceneloop run` without an explicit
`--stages` list for an episode request, because its CLI default includes
`render` and would bypass the approval checkpoint.

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

Direct image animations create lightweight projects separately from episode
assets:

```text
<workspace_dir>/image_animation_projects/<project_id>/
  source/original.<jpg|jpeg|png|webp>
  output/animated_<request_hash>.mp4
  project.json
```

`project.json` records the archived source, motion prompt, locked model,
expanded model prompt and prompt-policy version, resolution, aspect ratio,
duration, seed, request hash, generation status, and canonical output path.
Treat the archived source path as authoritative after project creation; the
original host upload path may be temporary. Do not move these files into the
episode project layout.

Apply this layout only to new runs. Never migrate an existing legacy project
unless the user explicitly requests it.

## Completion and Failure

Declare success only when requested files exist and any applicable canonical
JSON write-back is correct. For direct image animation, verify the returned
`projectPath`, archived `inputImage`, `projectManifestPath`, and
`outputVideoPath` exist, then send that actual video to the user. On failure,
report the workflow, applicable stage or shot number, concise provider or
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
