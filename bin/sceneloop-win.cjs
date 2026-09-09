#!/usr/bin/env node

'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');

const SKILL_NAME = 'sceneloop';
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PLATFORM = process.env.SCENELOOP_INSTALL_TEST_PLATFORM || process.platform;
const ARCH = process.env.SCENELOOP_INSTALL_TEST_ARCH || process.arch;
const INSTALL_HOME = process.env.SCENELOOP_INSTALL_HOME || os.homedir();
const LOCAL_APP_DATA = process.env.SCENELOOP_INSTALL_LOCALAPPDATA ||
  process.env.LOCALAPPDATA || path.join(INSTALL_HOME, 'AppData', 'Local');

const SOURCE_FILES = [
  ['SKILL.md', 'SKILL.md'],
  ['README.md', 'README.md'],
  ['README_EN.md', 'README_EN.md'],
  [path.join('scripts', 'sceneloop.exe'), path.join('scripts', 'sceneloop.exe')],
  [path.join('scripts', 'sceneloop-setup.exe'), path.join('scripts', 'sceneloop-setup.exe')],
];

const CANONICAL_FILES = [
  'SKILL.md',
  'README.md',
  'README_EN.md',
  path.join('scripts', 'sceneloop.exe'),
  path.join('scripts', 'sceneloop-setup.exe'),
];

function hermesHome() {
  return process.env.HERMES_HOME || path.join(LOCAL_APP_DATA, 'hermes');
}

const AGENTS = {
  hermes: {
    label: 'Hermes Agent',
    command: 'hermes',
    detectPaths: () => [
      hermesHome(),
      path.join(LOCAL_APP_DATA, 'Programs', 'Hermes'),
    ],
    destination: () => path.join(hermesHome(), 'skills', SKILL_NAME),
  },
  openclaw: {
    label: 'OpenClaw',
    command: 'openclaw',
    detectPaths: () => [path.join(INSTALL_HOME, '.openclaw')],
    destination: () => path.join(INSTALL_HOME, '.openclaw', 'skills', SKILL_NAME),
  },
  claude: {
    label: 'Claude Code',
    command: 'claude',
    detectPaths: () => [path.join(INSTALL_HOME, '.claude')],
    destination: () => path.join(INSTALL_HOME, '.claude', 'skills', SKILL_NAME),
  },
  codex: {
    label: 'Codex',
    command: 'codex',
    detectPaths: () => [
      path.join(INSTALL_HOME, '.codex'),
      path.join(LOCAL_APP_DATA, 'Programs', 'Codex'),
    ],
    destination: () => path.join(INSTALL_HOME, '.agents', 'skills', SKILL_NAME),
  },
};

const AGENT_ORDER = ['hermes', 'openclaw', 'claude', 'codex'];

function usage() {
  console.log(`SceneLoop Windows Skill 安装器

用法：
  npx sceneloop-win
  npx sceneloop-win --agent hermes,codex
  npx sceneloop-win --all --yes

选项：
  --agent <名称>  安装到指定 Agent；可用逗号分隔多个名称
                  支持 hermes、openclaw、claude、codex
  --all           安装到检测到的全部 Agent
  --yes, -y       更新已有安装时不再询问
  --dry-run       只显示操作，不写入文件
  --list          只显示检测结果
  --help, -h      显示帮助`);
}

function parseArgs(argv) {
  const options = {
    requestedAgents: '',
    all: false,
    yes: false,
    dryRun: false,
    list: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--agent') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--agent 后需要 Agent 名称。');
      }
      options.requestedAgents = value;
      index += 1;
    } else if (argument.startsWith('--agent=')) {
      options.requestedAgents = argument.slice('--agent='.length);
    } else if (argument === '--all') {
      options.all = true;
    } else if (argument === '--yes' || argument === '-y') {
      options.yes = true;
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--list') {
      options.list = true;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else {
      throw new Error(`未知参数：${argument}`);
    }
  }

  if (options.requestedAgents && options.all) {
    throw new Error('--agent 和 --all 不能同时使用。');
  }
  return options;
}

function commandExists(command) {
  try {
    const result = childProcess.spawnSync('where.exe', [command], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function agentDetected(key) {
  const agent = AGENTS[key];
  return commandExists(agent.command) || agent.detectPaths().some((entry) => fs.existsSync(entry));
}

function printDetection() {
  console.log('SceneLoop 支持的 Agent：');
  for (const key of AGENT_ORDER) {
    const status = agentDetected(key) ? '已检测' : '未检测';
    const suffix = agentDetected(key) ? `  ${AGENTS[key].destination()}` : '';
    console.log(`  [${status}] ${AGENTS[key].label}${suffix}`);
  }
}

function normalizeAgent(value) {
  const normalized = value.trim().toLowerCase();
  const aliases = {
    hermes: 'hermes',
    'hermes-agent': 'hermes',
    openclaw: 'openclaw',
    'open-claw': 'openclaw',
    claude: 'claude',
    'claude-code': 'claude',
    claudecode: 'claude',
    codex: 'codex',
    'openai-codex': 'codex',
  };
  return aliases[normalized] || null;
}

function parseRequestedAgents(raw) {
  const selected = [];
  for (const item of raw.replaceAll('，', ',').split(',')) {
    if (!item.trim()) continue;
    const key = normalizeAgent(item);
    if (!key) throw new Error(`不支持的 Agent：${item.trim()}`);
    if (!selected.includes(key)) selected.push(key);
  }
  return selected;
}

function ask(question) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    terminal.question(question, (answer) => {
      terminal.close();
      resolve(answer.trim());
    });
  });
}

async function selectInteractively(detected) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('当前不是交互式终端，请使用 --agent 或 --all。');
  }
  console.log('\n请选择安装目标，可输入一个或多个编号（例如 1,3）：');
  detected.forEach((key, index) => console.log(`  ${index + 1}) ${AGENTS[key].label}`));
  console.log('  a) 全部');
  console.log('  q) 退出');
  const answer = (await ask('选择：')).replaceAll('，', ',').replaceAll(/\s/g, '');
  if (/^q$/i.test(answer)) return [];
  if (/^a$/i.test(answer)) return [...detected];

  const selected = [];
  for (const value of answer.split(',')) {
    if (!/^\d+$/.test(value)) throw new Error(`无效选项：${value}`);
    const index = Number(value) - 1;
    if (index < 0 || index >= detected.length) throw new Error(`无效选项：${value}`);
    if (!selected.includes(detected[index])) selected.push(detected[index]);
  }
  return selected;
}

function verifyPackage() {
  for (const [sourceRelative] of SOURCE_FILES) {
    const source = path.join(PACKAGE_ROOT, sourceRelative);
    if (!fs.statSync(source, { throwIfNoEntry: false })?.isFile()) {
      throw new Error(`npm 包不完整，缺少 ${sourceRelative}。`);
    }
  }
}

function installationExists(destination) {
  return CANONICAL_FILES.some((relative) => fs.existsSync(path.join(destination, relative)));
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${process.pid}`;
}

function backupExistingFiles(key, destination) {
  const backupRoot = path.join(
    LOCAL_APP_DATA,
    'SceneLoopInstaller',
    'backups',
    key,
    timestamp(),
  );
  let copied = 0;
  for (const relative of CANONICAL_FILES) {
    const source = path.join(destination, relative);
    if (!fs.existsSync(source)) continue;
    const target = path.join(backupRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    copied += 1;
  }
  if (copied > 0) console.log(`  旧版本已备份：${backupRoot}`);
  return backupRoot;
}

function atomicCopy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.sceneloop-new-${process.pid}`;
  const previous = `${destination}.sceneloop-old-${process.pid}`;
  fs.copyFileSync(source, temporary);

  let movedPrevious = false;
  try {
    if (fs.existsSync(destination)) {
      fs.renameSync(destination, previous);
      movedPrevious = true;
    }
    fs.renameSync(temporary, destination);
    if (movedPrevious) fs.rmSync(previous, { force: true });
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    if (movedPrevious && !fs.existsSync(destination) && fs.existsSync(previous)) {
      fs.renameSync(previous, destination);
    }
    if (error && ['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
      throw new Error(`无法更新 ${destination}；请关闭 SceneLoop 和对应 Agent 后重试。`);
    }
    throw error;
  }
}

async function installAgent(key, options) {
  const agent = AGENTS[key];
  const destination = agent.destination();
  console.log(`\n安装到 ${agent.label}：${destination}`);

  if (installationExists(destination) && !options.yes && !options.dryRun) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error('目标已存在；非交互模式更新请加 --yes。');
    }
    const answer = await ask('  已存在 SceneLoop，备份并更新？[y/N] ');
    if (!/^y$/i.test(answer)) {
      console.log('  已跳过。');
      return;
    }
  }

  if (options.dryRun) {
    console.log('  [dry-run] 将保留现有 .env 和项目数据，并更新 Skill 与可执行文件。');
    return;
  }

  if (installationExists(destination)) backupExistingFiles(key, destination);
  for (const [sourceRelative, destinationRelative] of SOURCE_FILES) {
    atomicCopy(
      path.join(PACKAGE_ROOT, sourceRelative),
      path.join(destination, destinationRelative),
    );
  }

  for (const executable of ['sceneloop.exe', 'sceneloop-setup.exe']) {
    if (!fs.statSync(path.join(destination, 'scripts', executable), { throwIfNoEntry: false })?.isFile()) {
      throw new Error(`可执行文件校验失败：${executable}`);
    }
  }
  console.log('  安装完成。现有配置和生成数据未被删除。');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  verifyPackage();
  if (PLATFORM !== 'win32' || ARCH !== 'x64') {
    throw new Error(`sceneloop-win 仅支持 Windows x64；当前系统为 ${PLATFORM} ${ARCH}。`);
  }

  const detected = AGENT_ORDER.filter(agentDetected);
  if (options.list) {
    printDetection();
    return;
  }

  let selected;
  if (options.requestedAgents) {
    selected = parseRequestedAgents(options.requestedAgents);
    for (const key of selected) {
      if (!agentDetected(key)) {
        console.error(`警告：未检测到 ${AGENTS[key].label}，仍按显式参数继续安装。`);
      }
    }
  } else if (options.all) {
    selected = [...detected];
  } else {
    printDetection();
    if (detected.length === 0) {
      throw new Error('没有检测到受支持的 Agent。安装 Agent 后重试，或使用 --agent 显式指定目标。');
    }
    selected = await selectInteractively(detected);
  }

  if (selected.length === 0) {
    if (!options.requestedAgents && !options.all) console.log('已取消。');
    else throw new Error('没有可安装的目标。');
    return;
  }

  for (const key of selected) await installAgent(key, options);
  console.log(options.dryRun
    ? '\ndry-run 完成，没有写入文件。'
    : '\nSceneLoop 安装完成。请在对应 Agent 中新建会话，让 Skill 清单重新加载。');
}

main().catch((error) => {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
});
