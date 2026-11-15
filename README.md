# 模拟面试训练营 Pro · AI 模拟面试 Web 应用

> 面向求职者的 AI 模拟面试训练平台：覆盖模拟面试、题库训练、视频观摩、放松减压、反转面试、管理后台与桌面 AI 助手等模块。

---

## 一、项目介绍

「模拟面试训练营 Pro」帮助求职者以低成本进行高频、可复盘的结构化面试训练。核心特性：

- **模拟面试**：多场景（通用 / 技术 / 产品 / 非技术等）AI 面试官，支持文本与语音作答，实时点评与评分。
- **题库训练**：内置面试题库，支持收藏、薄弱点沉淀与针对性练习。
- **视频观摩大厅**：用户投稿的面试实录视频，跨设备点播（服务端代理 + Range 支持）。
- **反转面试**：角色反转，用户扮演面试官向 AI 考官提问，换位理解考察逻辑。
- **放松减压 / 管理后台**：配套页面完善产品闭环。
- **桌面 AI 助手（可选）**：Windows 悬浮球助手，本地常驻提供快捷答疑。

---

## 二、技术架构

| 层 | 技术选型 | 说明 |
|---|---|---|
| 前端 | 原生 HTML / CSS / JavaScript（无构建步骤） | Web Speech API 语音作答；统一状态机控制会话流程；`shared.js` 为公共逻辑 |
| 后端 | Node.js（内置 `http` 模块，零框架依赖）+ MySQL（`mysql2`） | `server/index.js` 提供静态托管、REST API、JWT 鉴权、视频流 |
| AI 层 | `cloud.js` 前端零配置代理 | 统一经服务端 `POST /api/ai/chat`（需登录 + 限速）调用大模型；失败自动回退本地智能模拟 |
| 桌面助手 | PowerShell 脚本 + 原生启动器（**未纳入本仓库**） | 本地 HTTP 设置接口（`127.0.0.1:47821`），悬浮球进程管理 |
| 存储 | MySQL（主）/ 浏览器 `localStorage`（离线回落） | 用户、会话、视频、题库、反馈存 MySQL；纯静态打开时回落本地存储 |

**架构要点**

- 前端永远不持有任何 API Key；大模型密钥仅存于服务端，经代理转发，杜绝泄露。
- LLM 仅生成语言与结构化数据，不控制系统流程（是否结束面试、是否采纳分数等由前端状态机 + 校验决定），异常一律回退本地估算。
- 静态资源经显式白名单托管，后端目录、密钥、备份、上传文件等一律禁止对外访问。

---

## 三、目录结构

```
模拟面试网页/
├── index.html            首页
├── interview.html        模拟面试
├── bank.html             题库训练
├── square.html           视频观摩大厅
├── relax.html            放松减压
├── reverse.html          反转面试
├── videos.html           视频管理
├── admin.html            管理后台
├── assistant.html        桌面助手内嵌页
├── shared.css            公共样式
├── shared.js             公共前端逻辑（导航 / 鉴权 / 状态机）
├── cloud.js              大模型接入层（前端代理）
├── architecture.png      架构图
├── assets/               图片等静态资源
├── server/               后端（Node.js + MySQL）
│   ├── index.js          服务入口（API / 静态托管 / 鉴权 / 视频流）
│   ├── package.json      后端依赖与脚本
│   ├── config.example.json  配置模板（真实 config.json 不入库）
│   └── .env.example         环境变量模板（真实 .env 不入库）
└── （桌面助手相关 .ps1 / .exe / .bat 已通过 .gitignore 排除，不纳入仓库）
```

---

## 四、环境要求

- **Node.js** ≥ 14
- **MySQL** ≥ 5.7（或 MariaDB）— 用于服务端模式；纯静态 `file://` 打开无需
- （可选）**大模型 API Key** — 不填则前端自动回退本地模拟

---

## 五、安装与运行

```bash
# 1. 克隆仓库
git clone <your-repo-url>
cd 模拟面试网页

# 2. 安装后端依赖
cd server
npm install

# 3. 配置环境变量（复制模板并填入真实值）
cp .env.example .env
#   编辑 .env，至少填写 DB_PASSWORD；可选填写 AI_API_KEY

# 4. 准备数据库（首次启动会自动建表，只需先建空库）
mysql -u root -p -e "CREATE DATABASE interview_sim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. 启动服务
node index.js
#   看到 "MySQL 连接成功" 即就绪

# 6. 浏览器访问
#   http://localhost:3000
```

> **纯静态体验（无需后端）**：直接双击 `index.html` 以 `file://` 方式打开，走浏览器 `localStorage` 模式，开箱即用（不含需要服务端的视频/账号功能）。

---

## 六、环境变量说明（`server/.env`）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_USER` | `root` | MySQL 用户 |
| `DB_PASSWORD` | 空 | MySQL 密码（**必填**） |
| `DB_NAME` | `interview_sim` | 数据库名 |
| `AI_API_KEY` | 空 | 大模型 Key（可选，留空则回退本地模拟） |
| `AI_BASE_URL` | `https://maas-api.cn-huabei-1.xf-yun.com/v2` | 大模型网关地址（讯飞 MaaS，OpenAI 兼容协议） |
| `AI_MODEL` | `spark-x2.6` | 模型名（更换网关时同步修改） |
| `PORT` | `3000` | 服务端口 |
| `BIND_HOST` | `0.0.0.0` | 监听地址（仅本机演示可改 `127.0.0.1`） |

> 全部变量均可用 `config.json` 的同名字段兜底；环境变量优先级更高。

---

## 七、依赖清单

- **运行时依赖（后端）**：`mysql2` `^3.24.6`
- **前端依赖**：无第三方依赖（原生 HTML/CSS/JS 实现）
- **运行环境**：Node.js ≥ 14、MySQL ≥ 5.7

`server/package.json` 已声明上述依赖，`npm install` 即可安装；`package-lock.json` 一并提交以保证可复现。

---

## 八、团队信息

**学校**：天津电子信息职业技术学院

| 角色 | 姓名 | 学号 | 职责 |
| --- | --- | --- | --- |
| 产品 / 前端 | 韩圳 | 202503030004 | 页面与交互 |
| 后端 | 陈景仁 | 202503030006 | 服务端 / 数据库 |
| AI 接入 | 王若飞 | 202503030016 | 大模型代理与提示工程 |
| 指导老师 | 张扬、宁阳 | —— | —— |

---

## 九、安全说明

- 所有密钥（数据库密码、AI Key、JWT 签名密钥）**绝不入库**：`server/.env`、`server/config.json`、`server/data/` 已被 `.gitignore` 排除。
- JWT 签名密钥在首次启动自动生成于 `server/data/secret.txt`，无需手动创建。
- 静态托管采用显式白名单，禁止访问 `server/`、`node_modules/`、`data/`、`deploy/`、密钥与备份文件。
- **提交前请确认**仓库内不包含任何真实密钥：
  ```bash
  git ls-files | grep -E '\.env$|config\.json|secret|AI-Assistant'
  # 应仅看到 server/.env.example 与 server/config.example.json，其余不应出现
  ```

---

## 十、许可证

本项目基于 **MIT License** 开源，详见 [LICENSE](./LICENSE)。允许他人在遵守许可条款的前提下自由使用、修改与再分发；本项目主要供学习与参赛演示使用。
