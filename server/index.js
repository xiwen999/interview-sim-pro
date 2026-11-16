'use strict';
/* 模拟面试训练营 Pro · */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

(function loadDotEnv() {
  try {
    const txt = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    txt.split(/\r?\n/).forEach(function (line) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    });
  } catch (e) {}
})();

const ROOT = path.resolve(__dirname, '..');           // 前端项目根目录（index.html 所在）
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');    // 投稿视频文件（供观摩大厅跨设备播放）
const SECRET_FILE = path.join(DATA_DIR, 'secret.txt');// 签名密钥
const LEGACY_DB_FILE = path.join(DATA_DIR, 'db.json');    // 旧 JSON 数据
const LEGACY_ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

/* 在线判定窗口 */
const ONLINE_TTL = 60 * 1000;

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) || {}; }
  catch (e) { return {}; }
}
const CONFIG = loadConfig();
const PORT = process.env.PORT || CONFIG.port || 3000;
const M = CONFIG.mysql || {};
const MYSQL = {
  host: process.env.DB_HOST || M.host || '127.0.0.1',
  port: Number(process.env.DB_PORT || M.port || 3306),
  user: process.env.DB_USER || M.user || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD
    : (M.password !== undefined ? M.password : ''),
  database: process.env.DB_NAME || M.database || 'interview_sim'
};

/* SMTP 邮件服务 */
const S = CONFIG.smtp || {};
const SMTP = {
  host: process.env.SMTP_HOST || S.host || '',
  port: Number(process.env.SMTP_PORT || S.port || 587),
  secure: (process.env.SMTP_SSL || String(S.secure) || '') === '1' || S.secure === true,
  user: process.env.SMTP_USER || S.user || '',
  pass: process.env.SMTP_PASS || S.pass || '',
  from: process.env.SMTP_FROM || S.from || ''
};
function smtpConfigured() { return !!(SMTP.host && SMTP.user && SMTP.pass); }
let _transport = null;
function mailTransport() {
  if (!_transport) {
    const nodemailer = require('nodemailer');   // 惰性加载：未安装也不影响其余功能启动
    _transport = nodemailer.createTransport({
      host: SMTP.host, port: SMTP.port, secure: SMTP.secure,
      auth: { user: SMTP.user, pass: SMTP.pass }
    });
  }
  return _transport;
}

/* 注册邮箱验证码 */
const MAIL_CODES = new Map();
const MAIL_CODE_TTL = 5 * 60 * 1000;      // 5 分钟有效
const MAIL_CODE_COOLDOWN = 60 * 1000;     // 同一邮箱 60 秒内不可重发
const MAIL_CODE_MAX_TRIES = 5;            // 单个验证码最多校验 5 次
function genMailCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
function mailCodeCleanup() {
  const now = Date.now();
  for (const [k, v] of MAIL_CODES) if (now > v.expires) MAIL_CODES.delete(k);
}
function mailCodeSendTemplate(code) {
  return '<div style="max-width:520px;margin:0 auto;font-family:PingFang SC,Microsoft YaHei,Arial,sans-serif;">'
    + '<h2 style="color:#1d4ed8;margin-bottom:4px;">模拟面试训练营 Pro</h2>'
    + '<p style="color:#475569;margin-top:0;">你正在注册账号，本次邮箱验证码为：</p>'
    + '<div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#0f172a;background:#f1f5f9;'
    + 'border-radius:12px;padding:18px 0;text-align:center;">' + code + '</div>'
    + '<p style="color:#94a3b8;font-size:13px;">验证码 5 分钟内有效，请勿泄露给他人。若非本人操作，请忽略本邮件。</p>'
    + '</div>';
}
async function sendVerificationMail(to, code) {
  const from = SMTP.from || SMTP.user;
  await mailTransport().sendMail({
    from: '"模拟面试训练营 Pro" <' + from + '>',
    to: to,
    subject: '【模拟面试训练营 Pro】注册验证码：' + code,
    html: mailCodeSendTemplate(code)
  });
}

const A = CONFIG.ai || {};
const AI = {
  apiKey: process.env.AI_API_KEY || A.apiKey || '',
  baseURL: (process.env.AI_BASE_URL || A.baseURL || 'https://api.deepseek.com/v1').replace(/\/+$/, ''),
  model: process.env.AI_MODEL || A.model || 'deepseek-chat',
  temperature: Number(A.temperature != null ? A.temperature : 0.7),
  maxTokens: Number(A.maxTokens != null ? A.maxTokens : 2048),
  timeoutMs: Number(A.timeoutMs != null ? A.timeoutMs : 90000),
  /* 思考链开关 */
  thinking: A.thinking === 'enabled' ? 'enabled' : 'disabled',
  perUser: { max: Number((A.rateLimit && A.rateLimit.max) != null ? A.rateLimit.max : 60),
             windowMs: Number((A.rateLimit && A.rateLimit.windowMs) != null ? A.rateLimit.windowMs : 10 * 60 * 1000) }
};
function aiEnabled() { return !!AI.apiKey; }
/* 关闭思考链时给上游附加的参数 */
const AI_THINK_EXTRA = AI.thinking === 'enabled' ? {} : { thinking: { type: 'disabled' } };

function loadSecret() {
  try { const s = fs.readFileSync(SECRET_FILE, 'utf8').trim(); if (s) { try { fs.chmodSync(SECRET_FILE, 0o600); } catch (e) {} return s; } } catch (e) {}
  const s = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SECRET_FILE, s);
  try { fs.chmodSync(SECRET_FILE, 0o600); } catch (e) {} /* Linux 下仅属主可读；Windows 忽略 */
  return s;
}
const SECRET = loadSecret();

function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function randToken(n) { return crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n); }

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(pw), salt, 64);
  return salt.toString('hex') + '$' + hash.toString('hex');
}
function verifyPassword(pw, stored) {
  if (!stored || stored.indexOf('$') < 0) return false;
  const [salt, hash] = stored.split('$');
  const h = crypto.scryptSync(String(pw), Buffer.from(salt, 'hex'), 64);
  try { return crypto.timingSafeEqual(h, Buffer.from(hash, 'hex')); }
  catch (e) { return false; }
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function signToken(payload) {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
  return body + '.' + sig;
}
function verifyToken(token) {
  if (!token) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expect = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
  try { if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null; }
  catch (e) { return null; }
  try {
    const p = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    if (p.exp && p.exp < Date.now()) return null;
    return p;
  } catch (e) { return null; }
}

let pool = null;
async function q(sql, params) {
  const [rows] = await pool.query(sql, params || []);
  return rows;
}
async function q1(sql, params) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

/* 建库建表 */
async function initDatabase() {
  const boot = await mysql.createPool({
    host: MYSQL.host, port: MYSQL.port, user: MYSQL.user, password: MYSQL.password,
    charset: 'utf8mb4_unicode_ci', waitForConnections: true, connectionLimit: 2,
    connectTimeout: 5000
  });
  await boot.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [MYSQL.database]);
  await boot.end();

  pool = mysql.createPool({
    host: MYSQL.host, port: MYSQL.port, user: MYSQL.user, password: MYSQL.password,
    database: MYSQL.database, charset: 'utf8mb4_unicode_ci',
    waitForConnections: true, connectionLimit: 8, decimalNumbers: true
  });

  const DDL = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      uid VARCHAR(64) NOT NULL,
      account VARCHAR(32) NOT NULL,
      name VARCHAR(64) NOT NULL,
      avatar VARCHAR(32) NOT NULL,
      bg LONGTEXT NULL,
      joined BIGINT NOT NULL DEFAULT 0,
      last BIGINT NOT NULL DEFAULT 0,
      status VARCHAR(16) NOT NULL DEFAULT 'active',
      demo TINYINT(1) NOT NULL DEFAULT 0,
      goal INT NOT NULL DEFAULT 0,
      checkin INT NOT NULL DEFAULT 0,
      pass_hash VARCHAR(255) NOT NULL,
      online_at BIGINT NULL,
      page VARCHAR(32) NULL,
      bank_favs LONGTEXT NULL,
      bank_practice INT NOT NULL DEFAULT 0,
      UNIQUE KEY uk_users_account (account),
      UNIQUE KEY uk_users_uid (uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      ts BIGINT NOT NULL DEFAULT 0,
      type VARCHAR(16) NOT NULL,
      scene VARCHAR(16) NOT NULL DEFAULT 'general',
      cnt INT NOT NULL DEFAULT 0,
      avg_score DECIMAL(4,1) NOT NULL DEFAULT 0,
      used_sec INT NOT NULL DEFAULT 0,
      ans_len INT NOT NULL DEFAULT 0,
      ai TEXT NULL,
      KEY idx_sessions_user (user_id),
      KEY idx_sessions_ts (ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS videos (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      ts BIGINT NOT NULL DEFAULT 0,
      title VARCHAR(255) NOT NULL,
      scene VARCHAR(16) NOT NULL DEFAULT 'general',
      dur INT NOT NULL DEFAULT 0,
      status VARCHAR(16) NOT NULL DEFAULT 'pending',
      plays INT NOT NULL DEFAULT 0,
      reports INT NOT NULL DEFAULT 0,
      reason VARCHAR(255) NULL,
      at_time BIGINT NULL,
      KEY idx_videos_user (user_id),
      KEY idx_videos_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      scene VARCHAR(16) NOT NULL DEFAULT 'general',
      lv TINYINT NOT NULL DEFAULT 1,
      q VARCHAR(500) NOT NULL,
      point VARCHAR(1000) NULL,
      tips LONGTEXT NULL,
      ans LONGTEXT NULL,
      sort INT NOT NULL DEFAULT 0,
      KEY idx_questions_scene (scene)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS admin_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ts BIGINT NOT NULL DEFAULT 0,
      action VARCHAR(64) NOT NULL,
      target VARCHAR(255) NULL,
      extra VARCHAR(255) NULL,
      actor VARCHAR(32) NOT NULL DEFAULT '管理员',
      KEY idx_logs_ts (ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS admin_account (
      account VARCHAR(64) NOT NULL PRIMARY KEY,
      pass_hash VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS feedback (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ts BIGINT NOT NULL DEFAULT 0,
      name VARCHAR(64) NOT NULL DEFAULT '',
      contact VARCHAR(128) NOT NULL DEFAULT '',
      msg VARCHAR(1200) NOT NULL DEFAULT '',
      uid VARCHAR(64) NULL,
      uname VARCHAR(64) NULL,
      page VARCHAR(32) NULL,
      done TINYINT NOT NULL DEFAULT 0,
      KEY idx_feedback_ts (ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS desktop_settings (
      id TINYINT NOT NULL PRIMARY KEY,
      autoHide TINYINT NOT NULL DEFAULT 1,
      autoStart TINYINT NOT NULL DEFAULT 1,
      enabled TINYINT NOT NULL DEFAULT 1,
      updatedAt BIGINT NOT NULL DEFAULT 0,
      lastSeen BIGINT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];
  for (const s of DDL) await pool.query(s);

  /* 桌面助手设置表增量迁移：updatedAt（网页开关时间戳）/ lastSeen（桌面助手服务心跳） */
  try { await pool.query('ALTER TABLE desktop_settings ADD COLUMN updatedAt BIGINT NOT NULL DEFAULT 0'); }
  catch (e) { if (e && e.code !== 'ER_DUP_FIELDNAME') throw e; }
  try { await pool.query('ALTER TABLE desktop_settings ADD COLUMN lastSeen BIGINT NOT NULL DEFAULT 0'); }
  catch (e) { if (e && e.code !== 'ER_DUP_FIELDNAME') throw e; }
  try { await pool.query('INSERT IGNORE INTO desktop_settings (id) VALUES (1)'); } catch (e) {}

  /* 增量迁移 */
  const EXTRA_COLUMNS = [
    'ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT \'user\'',
    'ADD COLUMN signature VARCHAR(255) NULL',
    'ADD COLUMN gender VARCHAR(16) NULL',
    'ADD COLUMN birthday VARCHAR(32) NULL',
    'ADD COLUMN goal_date VARCHAR(32) NULL',
    'ADD COLUMN goal_name VARCHAR(64) NULL',
    'ADD COLUMN avatar_ext LONGTEXT NULL',
    'ADD COLUMN email VARCHAR(128) NULL'
  ];
  for (const ddl of EXTRA_COLUMNS) {
    try { await pool.query('ALTER TABLE users ' + ddl); }
    catch (e) { if (e && e.code !== 'ER_DUP_FIELDNAME') throw e; }
  }
  /* 邮箱唯一索引 */
  try { await pool.query('ALTER TABLE users ADD UNIQUE KEY uk_users_email (email)'); }
  catch (e) {
    if (e && e.code !== 'ER_DUP_KEYNAME' && e.code !== 'ER_DUP_ENTRY') {
      if (!(e && /Duplicate key name|Duplicate entry/.test(e.message || ''))) throw e;
    }
  }
}

/* 行 → 业务对象映射 */
function parseJsonSafe(v, def) {
  if (v == null) return def;
  if (typeof v === 'object') return v;          // 若为 JSON 列类型，mysql2 已自动解析
  try { return JSON.parse(v); } catch (e) { return def; }
}
function rowUser(r) {
  return {
    id: r.id, uid: r.uid, account: r.account, name: r.name, avatar: r.avatar,
    bg: parseJsonSafe(r.bg, null),
    joined: Number(r.joined), last: Number(r.last),
    status: r.status, role: r.role || 'user', demo: !!r.demo, goal: Number(r.goal), checkin: Number(r.checkin),
    passHash: r.pass_hash,
    onlineAt: r.online_at == null ? 0 : Number(r.online_at),
    page: r.page || '',
    avatarData: r.avatar_ext || null,
    profile: {
      signature: r.signature || '', gender: r.gender || '', birthday: r.birthday || '',
      goalDate: r.goal_date || '', goalName: r.goal_name || ''
    },
    bank: { favs: parseJsonSafe(r.bank_favs, []), practice: Number(r.bank_practice || 0) }
  };
}
function rowSession(r) {
  return {
    id: r.id, ts: Number(r.ts), type: r.type, scene: r.scene,
    count: Number(r.cnt), avg: Number(r.avg_score), used: Number(r.used_sec),
    ansLen: Number(r.ans_len), ai: r.ai || ''
  };
}
function rowVideo(r) {
  return {
    id: r.id, ts: Number(r.ts), title: r.title, scene: r.scene, dur: Number(r.dur),
    status: r.status, plays: Number(r.plays), reports: Number(r.reports),
    reason: r.reason || '', at: r.at_time ? Number(r.at_time) : 0, uid: r.user_id,
    file: hasVideoFile(r.id) /* 管理员预览用：服务器上是否有视频文件本体 */
  };
}

function publicUser(u) {
  const now = Date.now();
  const { passHash, onlineAt, ...rest } = u;
  rest.online = !!(onlineAt && now - onlineAt < ONLINE_TTL);
  if (!rest.sessions) rest.sessions = [];
  if (!rest.videos) rest.videos = [];
  return rest;
}

async function findUserByAccount(acc) {
  const r = await q1('SELECT * FROM users WHERE LOWER(account)=LOWER(?) LIMIT 1', [String(acc || '')]);
  return r ? rowUser(r) : null;
}
async function findUserByUid(uid) {
  const r = await q1('SELECT * FROM users WHERE uid=? LIMIT 1', [uid]);
  return r ? rowUser(r) : null;
}
async function findUserById(id) {
  const r = await q1('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
  return r ? rowUser(r) : null;
}
async function userSessions(uid) {
  const rows = await q('SELECT * FROM sessions WHERE user_id=? ORDER BY ts DESC LIMIT 200', [uid]);
  return rows.map(rowSession);
}
async function userVideos(uid) {
  const rows = await q('SELECT * FROM videos WHERE user_id=? ORDER BY ts DESC', [uid]);
  return rows.map(rowVideo);
}
async function userFull(u) {
  u.sessions = await userSessions(u.uid);
  u.videos = await userVideos(u.uid);
  return u;
}

/* 投稿视频文件---- */
const VIDEO_FILE_MAX = 500 * 1024 * 1024; // 500MB
function videoFilePath(id) {
  if (!/^[\w-]{1,128}$/.test(String(id || ''))) return null; // 防目录穿越
  return path.join(UPLOAD_DIR, String(id));
}
function readRawBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > maxBytes) { req.destroy(); reject(new Error('文件过大（上限 ' + Math.round(maxBytes / 1048576) + 'MB）')); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
/* 大文件流式写盘 */
function saveStreamToFile(req, filePath, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0, done = false;
    const out = fs.createWriteStream(filePath);
    const cleanup = () => { try { fs.unlinkSync(filePath); } catch (e) {} };
    req.on('data', c => {
      size += c.length;
      if (size > maxBytes && !done) {
        done = true;
        req.destroy(); out.destroy(); cleanup();
        reject(new Error('文件过大（上限 ' + Math.round(maxBytes / 1048576) + 'MB）'));
      }
    });
    req.on('error', () => { if (!done) { done = true; cleanup(); reject(new Error('上传中断')); } });
    out.on('error', () => { if (!done) { done = true; cleanup(); reject(new Error('磁盘写入失败')); } });
    req.pipe(out);
    out.on('finish', () => { if (!done) { done = true; resolve(size); } });
  });
}
function hasVideoFile(id) {
  const p = videoFilePath(id);
  if (!p) return false;
  try { return fs.statSync(p).size > 0; } catch (e) { return false; }
}
function delVideoFile(id) {
  const p = videoFilePath(id);
  if (!p) return;
  try { fs.unlinkSync(p); } catch (e) {}
}
async function getAdmin() { return q1('SELECT * FROM admin_account LIMIT 1'); }

async function addLog(action, target, extra) {
  await q('INSERT INTO admin_logs (ts, action, target, extra, actor) VALUES (?,?,?,?,?)',
    [Date.now(), action || '', target || '', extra || '', '管理员']);
  /* 只保留最近 60 条 */
  await q('DELETE FROM admin_logs WHERE id NOT IN (SELECT id FROM (SELECT id FROM admin_logs ORDER BY id DESC LIMIT 60) x)');
}
async function getLogs() {
  const rows = await q('SELECT * FROM admin_logs ORDER BY id DESC LIMIT 60');
  return rows.map(r => ({ ts: Number(r.ts), action: r.action, target: r.target || '', extra: r.extra || '', by: r.actor }));
}

async function computeStats() {
  const now = Date.now();
  const r = await q1(`SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM users WHERE status='banned') AS banned,
    (SELECT COUNT(*) FROM users WHERE online_at IS NOT NULL AND online_at>=?) AS online,
    (SELECT COUNT(*) FROM sessions) AS sessions,
    (SELECT COALESCE(SUM(cnt),0) FROM sessions) AS questions,
    (SELECT COALESCE(AVG(avg_score),0) FROM sessions) AS avgScore,
    (SELECT COALESCE(AVG(used_sec),0) FROM sessions) AS avgUsed,
    (SELECT COUNT(*) FROM sessions WHERE ts>=?) AS today,
    (SELECT COUNT(*) FROM sessions WHERE ts>=?) AS week,
    (SELECT COUNT(*) FROM videos) AS videos,
    (SELECT COALESCE(SUM(plays),0) FROM videos) AS plays,
    (SELECT COALESCE(SUM(reports),0) FROM videos) AS reports,
    (SELECT COUNT(*) FROM videos WHERE status='pending') AS pend,
    (SELECT COUNT(*) FROM videos WHERE status='approved') AS approved,
    (SELECT COUNT(*) FROM videos WHERE status='rejected') AS rejected`,
    [now - ONLINE_TTL, now - 86400000, now - 7 * 86400000]);
  return {
    users: Number(r.users), banned: Number(r.banned), online: Number(r.online),
    sessions: Number(r.sessions), questions: Number(r.questions),
    avgScore: Math.round(Number(r.avgScore) * 10) / 10,
    avgUsed: Math.round(Number(r.avgUsed)),
    today: Number(r.today), week: Number(r.week),
    videos: Number(r.videos), plays: Number(r.plays), reports: Number(r.reports),
    pend: Number(r.pend), approved: Number(r.approved), rejected: Number(r.rejected)
  };
}
async function computeDay7() {
  const rows = await q('SELECT ts FROM sessions WHERE ts>=?', [Date.now() - 7 * 86400000]);
  const byDay = {};
  rows.forEach(r => {
    const d = new Date(Number(r.ts));
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const out = [];
  const base = new Date(); base.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const t0 = base.getTime() - i * 86400000;
    const d = new Date(t0);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    out.push({ ts: t0, n: byDay[key] || 0 });
  }
  return out;
}

function getBearer(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

const RATE = new Map(); // ip -> { count, reset }
function rateLimit(req, res, max, windowMs, bucket) {
  const ip = String((req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?'))
    .split(',')[0].trim();
  const key = (bucket || 'global') + '|' + ip;   // 每个接口独立计数，避免互相挤占额度
  const now = Date.now();
  let e = RATE.get(key);
  if (!e || now > e.reset) { e = { count: 0, reset: now + windowMs }; RATE.set(key, e); }
  e.count++;
  if (RATE.size > 10000) { for (const [k, v] of RATE) if (now > v.reset) RATE.delete(k); }
  if (e.count > max) {
    send(res, 429, { ok: false, msg: '尝试过于频繁，请 ' + Math.ceil((e.reset - now) / 1000) + ' 秒后再试' });
    return false;
  }
  return true;
}
/* 反解 token 得到用户 */
async function resolveUser(req) {
  const p = verifyToken(getBearer(req));
  if (!p || p.sub) return null;
  return findUserByUid(p.uid);
}
/* 严格的用户鉴权 */
async function authUser(req) {
  const u = await resolveUser(req);
  if (!u || u.status === 'banned') return null;
  return u;
}
function authAdmin(req) {
  const p = verifyToken(getBearer(req));
  return !!(p && p.sub === 'admin');
}

async function findUserByEmail(email) {
  if (!email) return null;
  const r = await q1('SELECT * FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [String(email)]);
  return r ? rowUser(r) : null;
}

/* POST /api/mail */
async function apiMailSendCode(req, res, body) {
  if (!rateLimit(req, res, 10, 10 * 60 * 1000, 'mail')) return; // 单 IP 10 分钟最多 10 次
  const email = String(body.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { ok: false, msg: '邮箱格式不正确' });
  if (await findUserByEmail(email)) return send(res, 400, { ok: false, msg: '该邮箱已注册，请直接登录' });
  mailCodeCleanup();
  const key = email.toLowerCase();
  const prev = MAIL_CODES.get(key);
  const now = Date.now();
  if (prev && now - prev.lastSend < MAIL_CODE_COOLDOWN) {
    return send(res, 429, { ok: false, msg: '发送太频繁，请 ' + Math.ceil((MAIL_CODE_COOLDOWN - (now - prev.lastSend)) / 1000) + ' 秒后再试' });
  }
  const code = genMailCode();
  MAIL_CODES.set(key, { code, expires: now + MAIL_CODE_TTL, lastSend: now, tries: 0 });
  if (!smtpConfigured()) {
    /* 开发模式 */
    console.warn('[mail] SMTP 未配置，开发模式返回 devCode：' + code);
    return send(res, 200, { ok: true, msg: '开发模式：SMTP 未配置，验证码已生成', devCode: code });
  }
  try {
    await sendVerificationMail(email, code);
    return send(res, 200, { ok: true, msg: '验证码已发送至邮箱' });
  } catch (e) {
    MAIL_CODES.delete(key);
    console.error('[mail] 发送失败:', e && e.message);
    return send(res, 500, { ok: false, msg: '邮件发送失败，请稍后重试（' + ((e && e.code) || e && e.message || 'SMTP 错误') + '）' });
  }
}

async function apiRegister(req, res, body) {
  if (!rateLimit(req, res, 5, 10 * 60 * 1000, 'register')) return; // 10 分钟最多注册 5 次
  const acc = String(body.account || '').trim();
  const pw = String(body.password || '');
  const name = String(body.name || acc).trim() || acc;
  const avatar = body.avatar || '🦊';
  const email = String(body.email || '').trim();
  const mailCode = String(body.mailCode || '').trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(acc)) return send(res, 400, { ok: false, msg: '账号需为 3-20 位字母、数字或下划线' });
  if (pw.length < 6) return send(res, 400, { ok: false, msg: '密码至少 6 位' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { ok: false, msg: '请输入有效邮箱' });
  /* 校验邮箱验证码 */
  const rec = MAIL_CODES.get(email.toLowerCase());
  if (!rec) return send(res, 400, { ok: false, msg: '请先获取邮箱验证码' });
  if (Date.now() > rec.expires) { MAIL_CODES.delete(email.toLowerCase()); return send(res, 400, { ok: false, msg: '验证码已过期，请重新获取' }); }
  if (rec.tries >= MAIL_CODE_MAX_TRIES) { MAIL_CODES.delete(email.toLowerCase()); return send(res, 400, { ok: false, msg: '验证码错误次数过多，请重新获取' }); }
  if (rec.code !== mailCode) { rec.tries++; return send(res, 400, { ok: false, msg: '验证码不正确' }); }
  MAIL_CODES.delete(email.toLowerCase());
  const adminRow = await getAdmin();
  if (adminRow && acc.toLowerCase() === String(adminRow.account).toLowerCase()) return send(res, 400, { ok: false, msg: '该账号为管理员保留账号' });
  if (await findUserByAccount(acc)) return send(res, 400, { ok: false, msg: '该账号已注册，请直接登录' });
  if (await findUserByEmail(email)) return send(res, 400, { ok: false, msg: '该邮箱已注册，请直接登录' });
  const uid = 'u_' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
  const now = Date.now();
  await q('INSERT INTO users (id,uid,account,name,avatar,bg,joined,last,status,demo,goal,checkin,pass_hash,bank_favs,bank_practice,email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [uid, uid, acc, name, avatar, null, now, now, 'active', 0, 0, 0, hashPassword(pw), JSON.stringify([]), 0, email]);
  const u = await userFull(await findUserByUid(uid));
  const token = signToken({ uid, exp: now + 30 * 86400000 });
  return send(res, 200, { ok: true, token, user: publicUser(u) });
}
/* POST /api/ */
async function apiQuickRegister(req, res, body) {
  if (!rateLimit(req, res, 3, 10 * 60 * 1000, 'quickreg')) return; // 单 IP 10 分钟最多 3 个游客号
  const acc = String(body.account || '').trim();
  const pw = String(body.password || '');
  const name = String(body.name || acc).trim() || acc;
  const avatar = body.avatar || '🦊';
  if (!/^[A-Za-z0-9_]{3,20}$/.test(acc)) return send(res, 400, { ok: false, msg: '账号需为 3-20 位字母、数字或下划线' });
  if (pw.length < 6) return send(res, 400, { ok: false, msg: '密码至少 6 位' });
  if (await findUserByAccount(acc)) return send(res, 400, { ok: false, msg: '该账号已存在，请重试' });
  const uid = 'u_' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
  const now = Date.now();
  await q('INSERT INTO users (id,uid,account,name,avatar,bg,joined,last,status,demo,goal,checkin,pass_hash,bank_favs,bank_practice) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [uid, uid, acc, name, avatar, null, now, now, 'active', 0, 0, 0, hashPassword(pw), JSON.stringify([]), 0]);
  const u = await userFull(await findUserByUid(uid));
  const token = signToken({ uid, exp: now + 30 * 86400000 });
  return send(res, 200, { ok: true, token, user: publicUser(u) });
}

async function apiLogin(req, res, body) {
  if (!rateLimit(req, res, 10, 10 * 60 * 1000, 'login')) return; // 10 分钟最多尝试登录 10 次
  const acc = String(body.account || '').trim();
  const pw = String(body.password || '');
  const u = await findUserByAccount(acc);
  if (!u || !verifyPassword(pw, u.passHash)) return send(res, 400, { ok: false, msg: '账号或密码不正确' });
  if (u.status === 'banned') return send(res, 400, { ok: false, msg: '该账号已被封禁，无法登录' });
  const now = Date.now();
  await q('UPDATE users SET last=?, online_at=?, page=NULL WHERE id=?', [now, now, u.id]);
  u.last = now; u.onlineAt = now;
  const token = signToken({ uid: u.uid, exp: now + 30 * 86400000 });
  return send(res, 200, { ok: true, token, user: publicUser(await userFull(u)) });
}
async function apiMe(req, res) {
  const u = await resolveUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  return send(res, 200, { ok: true, user: publicUser(await userFull(u)) });
}
async function apiAddInterview(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const ts = body.ts || Date.now();
  async function insert(id) {
    await q('INSERT INTO sessions (id,user_id,ts,type,scene,cnt,avg_score,used_sec,ans_len,ai) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, u.uid, ts, body.type || '综合', body.scene || 'general',
        body.count || 0, Number(body.avg || 0), body.used || 0, body.ansLen || 0, body.ai || '']);
  }
  try { await insert('s_' + ts); }
  catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') await insert('s_' + ts + '_' + crypto.randomBytes(3).toString('hex'));
    else throw e;
  }
  await q('UPDATE users SET last=? WHERE id=?', [Date.now(), u.id]);
  return send(res, 200, { ok: true });
}
async function apiAddVideo(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  await q(`INSERT INTO videos (id,user_id,ts,title,scene,dur,status,plays,reports,reason)
    VALUES (?,?,?,?,?,?,?,0,0,'')
    ON DUPLICATE KEY UPDATE title=VALUES(title), scene=VALUES(scene), dur=VALUES(dur), status=VALUES(status)`,
    [body.id || ('v_' + Date.now() + '_' + randInt(0, 9999)), u.uid, body.ts || Date.now(),
      body.title || '未命名回放', body.scene || 'general', body.dur || 0, body.status || 'pending']);
  await q('UPDATE users SET last=? WHERE id=?', [Date.now(), u.id]);
  return send(res, 200, { ok: true });
}
/* 已登录用户上报心跳 */
async function apiHeartbeat(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const now = Date.now();
  await q('UPDATE users SET online_at=?, last=?, page=? WHERE id=?',
    [now, now, body && body.page ? String(body.page).slice(0, 24) : null, u.id]);
  return send(res, 200, { ok: true, online: true, ttl: ONLINE_TTL });
}
/* 已登录用户同步题库数据 */
async function apiBank(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const favs = Array.isArray(body && body.favs)
    ? body.favs.filter(x => typeof x === 'string').slice(0, 500)
    : (u.bank ? u.bank.favs : []);
  const practice = (body && typeof body.practice === 'number')
    ? body.practice : (u.bank ? u.bank.practice : 0);
  await q('UPDATE users SET bank_favs=?, bank_practice=? WHERE id=?', [JSON.stringify(favs), practice, u.id]);
  return send(res, 200, { ok: true, bank: { favs, practice } });
}

/* 个人资料同步 */
async function apiProfile(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const sets = [], params = [];
  if (typeof body.name === 'string' && body.name.trim()) {
    sets.push('name=?'); params.push(body.name.trim().slice(0, 12));
  }
  if (typeof body.avatar === 'string' && body.avatar) {
    if (body.avatar.indexOf('data:') === 0) {          // 上传的图片头像（base64）
      sets.push('avatar_ext=?'); params.push(body.avatar.slice(0, 300000));
    } else {                                            // 内置 emoji 头像
      sets.push('avatar=?'); params.push(body.avatar.slice(0, 32));
      sets.push('avatar_ext=NULL');
    }
  }
  if (typeof body.signature === 'string') { sets.push('signature=?'); params.push(body.signature.slice(0, 50)); }
  if (typeof body.gender === 'string') { sets.push('gender=?'); params.push(body.gender.slice(0, 16)); }
  if (typeof body.birthday === 'string') { sets.push('birthday=?'); params.push(body.birthday.slice(0, 32)); }
  if (body.goal !== undefined) {
    if (body.goal && typeof body.goal === 'object') {
      sets.push('goal_date=?'); params.push(String(body.goal.date || '').slice(0, 32));
      sets.push('goal_name=?'); params.push(String(body.goal.name || '').slice(0, 64));
    } else { sets.push('goal_date=NULL'); sets.push('goal_name=NULL'); }
  }
  if (body.checkin && typeof body.checkin === 'object') {
    sets.push('checkin=?'); params.push(Math.max(0, Number(body.checkin.days) || 0));
  }
  if (!sets.length) return send(res, 200, { ok: true, msg: '没有需要更新的字段' });
  params.push(u.id);
  await q('UPDATE users SET ' + sets.join(', ') + ' WHERE id=?', params);
  await q('UPDATE users SET last=? WHERE id=?', [Date.now(), u.id]);
  return send(res, 200, { ok: true });
}
/* 题库列表 */
async function apiQuestions(req, res) {
  const rows = await q('SELECT * FROM questions ORDER BY sort ASC, id ASC');
  const questions = rows.map(r => ({
    id: r.id, scene: r.scene, lv: Number(r.lv), q: r.q,
    point: r.point || '',
    tips: parseJsonSafe(r.tips, []),
    ans: parseJsonSafe(r.ans, []),
    ...(r.role ? { role: r.role } : {}),
    ...(r.round ? { round: r.round } : {})
  }));
  return send(res, 200, { ok: true, questions, source: 'mysql' });
}
/* 观摩大厅 */
async function apiVideoHall(req, res) {
  const rows = await q(`SELECT v.*, u.name AS uname, u.avatar AS uavatar
    FROM videos v JOIN users u ON u.uid=v.user_id
    WHERE v.status='approved'
    ORDER BY v.at_time DESC, v.ts DESC`);
  const hall = rows.map(r => ({
    id: r.id, ts: Number(r.ts), title: r.title, scene: r.scene, dur: Number(r.dur),
    plays: Number(r.plays), owner: r.uname || '面试同学', avatar: r.uavatar || '🙂',
    ownerUid: r.user_id, at: r.at_time ? Number(r.at_time) : 0,
    file: hasVideoFile(r.id)
  }));
  return send(res, 200, { ok: true, videos: hall });
}
/* 投稿视频文件上传 */
async function apiVideoFileUpload(req, res, body, m) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const p = videoFilePath(m[1]);
  if (!p) return send(res, 400, { ok: false, msg: '非法的视频 ID' });
  const v = await q1('SELECT id FROM videos WHERE id=? AND user_id=?', [m[1], u.uid]);
  if (!v) {
        await q(`INSERT INTO videos (id,user_id,ts,title,scene,status,plays,reports,reason)
      VALUES (?,?,?,?,?,?,0,0,'') ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`,
      [m[1], u.uid, Date.now(), '未命名回放', 'general', 'pending']);
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  let size;
  try { size = await saveStreamToFile(req, p, VIDEO_FILE_MAX); }
  catch (e) { return send(res, 413, { ok: false, msg: e && e.message ? e.message : '上传失败' }); }
  if (!size) return send(res, 400, { ok: false, msg: '上传内容为空' });
  await q('UPDATE users SET last=? WHERE id=?', [Date.now(), u.id]);
  return send(res, 200, { ok: true, size });
}
/* 投稿视频文件下载 */
function sniffVideoMime(p) {
  try {
    const fd = fs.openSync(p, 'r');
    const b = Buffer.alloc(12);
    fs.readSync(fd, b, 0, 12, 0); fs.closeSync(fd);
    if (b.slice(4, 8).toString('latin1') === 'ftyp') return 'video/mp4';
    if (b.slice(0, 4).toString('latin1') === '\x1aE\xdf\xa3') return 'video/webm';
  } catch (e) {}
  return 'video/webm';
}
async function apiVideoFileGet(req, res, body, m) {
  const p = videoFilePath(m[1]);
  if (!p || !hasVideoFile(m[1])) return send(res, 404, { ok: false, msg: '视频文件不存在' });
  const total = fs.statSync(p).size;
  const type = sniffVideoMime(p);
  const head = { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', 'Accept-Ranges': 'bytes' };
  const range = String(req.headers['range'] || '');
  const mm = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (mm && (mm[1] || mm[2])) {
    let start = mm[1] ? parseInt(mm[1], 10) : 0;
    let end = mm[2] ? parseInt(mm[2], 10) : total - 1;
    if (isNaN(start) || start > end || start >= total) { start = 0; end = total - 1; }
    if (end >= total) end = total - 1;
    head['Content-Range'] = 'bytes ' + start + '-' + end + '/' + total;
    head['Content-Length'] = end - start + 1;
    res.writeHead(206, head);
    fs.createReadStream(p, { start, end }).pipe(res);
    return;
  }
  head['Content-Length'] = total;
  res.writeHead(200, head);
  fs.createReadStream(p).pipe(res);
}
/* 投稿者撤回 / */
async function apiVideoDelete(req, res, body, m) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '未登录或登录已过期' });
  const v = await q1('SELECT * FROM videos WHERE id=? AND user_id=?', [m[1], u.uid]);
  if (!v) return send(res, 404, { ok: false, msg: '视频不存在或不是你的投稿' });
  await q('DELETE FROM videos WHERE id=?', [m[1]]);
  delVideoFile(m[1]);
  return send(res, 200, { ok: true });
}
/* 从 shared.js */
function extractQuestionsFromSharedJs() {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'shared.js'), 'utf8');
    const m = src.match(/var QUESTIONS\s*=\s*(\[[\s\S]*?\n\]);/);
    if (!m) return null;
    const arr = eval(m[1]);
    return (Array.isArray(arr) && arr.length) ? arr : null;
  } catch (e) { console.error('[题库] 提取内置题库失败：' + (e && e.message ? e.message : e)); return null; }
}
/* questions 表为空时 */
async function seedQuestionsIfEmpty() {
  const c = await q1('SELECT COUNT(*) AS c FROM questions');
  if (Number(c.c) > 0) return 0;
  const list = extractQuestionsFromSharedJs();
  if (!list) return 0;
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    await q(`INSERT INTO questions (id,scene,lv,q,point,tips,ans,sort,role,\`round\`) VALUES (?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE scene=VALUES(scene), lv=VALUES(lv), q=VALUES(q),
        point=VALUES(point), tips=VALUES(tips), ans=VALUES(ans), sort=VALUES(sort),
        role=VALUES(role), \`round\`=VALUES(\`round\`)`,
      [t.id, t.scene || 'general', t.lv || 1, t.q, t.point || '',
        JSON.stringify(t.tips || []), JSON.stringify(t.ans || []), i, t.role || null, t.round || null]);
  }
  return list.length;
}
/* 每次启动补齐 shared. */
async function syncBuiltInQuestions() {
  const list = extractQuestionsFromSharedJs();
  if (!list) return 0;
  let added = 0;
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    const r = await q(`INSERT IGNORE INTO questions (id,scene,lv,q,point,tips,ans,sort,role,\`round\`) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [t.id, t.scene || 'general', t.lv || 1, t.q, t.point || '',
        JSON.stringify(t.tips || []), JSON.stringify(t.ans || []), i, t.role || null, t.round || null]);
    if (r && r.affectedRows) added++;
  }
  return added;
}
function desktopRow(r) {
  return r
    ? { autoHide: !!Number(r.autoHide), autoStart: !!Number(r.autoStart), enabled: !!Number(r.enabled) }
    : { autoHide: true, autoStart: true, enabled: true };
}
/* 桌面助手服务是否在线：心跳 12 秒内有更新 */
function desktopOnline(r) {
  return !!(r && Number(r.lastSeen) && (Date.now() - Number(r.lastSeen)) < 12000);
}
async function apiDesktopGet(req, res) {
  const rows = await q('SELECT * FROM desktop_settings WHERE id=1');
  const r = rows[0];
  return send(res, 200, Object.assign({ ok: true, online: desktopOnline(r), updatedAt: r ? Number(r.updatedAt) || 0 : 0 }, desktopRow(r)));
}
async function apiDesktopSet(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '请先登录后再设置桌面助手' });
  const cur = (await q('SELECT * FROM desktop_settings WHERE id=1'))[0];
  const st = desktopRow(cur);
  if (body && body.autoHide !== undefined) st.autoHide = !!body.autoHide;
  if (body && body.autoStart !== undefined) st.autoStart = !!body.autoStart;
  if (body && body.enabled !== undefined) st.enabled = !!body.enabled;
  await q('REPLACE INTO desktop_settings (id,autoHide,autoStart,enabled,updatedAt) VALUES (1,?,?,?,?)',
    [st.autoHide ? 1 : 0, st.autoStart ? 1 : 0, st.enabled ? 1 : 0, Date.now()]);
  const rows = await q('SELECT * FROM desktop_settings WHERE id=1');
  return send(res, 200, Object.assign({ ok: true, online: desktopOnline(rows[0]), updatedAt: Number(rows[0].updatedAt) || 0 }, desktopRow(rows[0])));
}
/* 桌面助手服务心跳：上报本地状态，只更新 lastSeen，不动设置本身 */
async function apiDesktopPing(req, res, body) {
  const cur = (await q('SELECT * FROM desktop_settings WHERE id=1'))[0];
  if (!cur) await q('REPLACE INTO desktop_settings (id) VALUES (1)');
  await q('UPDATE desktop_settings SET lastSeen=? WHERE id=1', [Date.now()]);
  const rows = await q('SELECT * FROM desktop_settings WHERE id=1');
  const r = rows[0];
  return send(res, 200, Object.assign({ ok: true, online: true, updatedAt: r ? Number(r.updatedAt) || 0 : 0 }, desktopRow(r)));
}
async function apiFeedbackAdd(req, res, body) {
  if (!rateLimit(req, res, 5, 10 * 60 * 1000, 'feedback')) return; // 10 分钟最多 5 条
  const name = String(body.name || '').trim().slice(0, 64);
  const contact = String(body.contact || '').trim().slice(0, 128);
  const msg = String(body.msg || '').trim().slice(0, 1200);
  const page = String(body.page || '').trim().slice(0, 32);
  if (!name || !contact || !msg) return send(res, 400, { ok: false, msg: '称呼、联系方式和反馈内容都不能为空' });
  let uid = null, uname = null;
  try { const u = await authUser(req); if (u) { uid = u.uid; uname = u.name; } } catch (e) {}
  await q('INSERT INTO feedback (ts,name,contact,msg,uid,uname,page,done) VALUES (?,?,?,?,?,?,?,0)',
    [Date.now(), name, contact, msg, uid, uname, page || null]);
  addLog('收到用户反馈', name + '：' + msg.slice(0, 40) + (msg.length > 40 ? '…' : ''), uname || name);
  return send(res, 200, { ok: true, msg: '反馈已送达，感谢你的建议！' });
}
async function apiAdminFeedbackList(req, res) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const rows = await q('SELECT * FROM feedback ORDER BY done ASC, ts DESC LIMIT 500');
  return send(res, 200, { ok: true, feedback: rows.map(r => ({
    id: r.id, ts: Number(r.ts), name: r.name, contact: r.contact, msg: r.msg,
    uid: r.uid || null, uname: r.uname || null, page: r.page || null, done: !!r.done
  })) });
}
async function apiAdminFeedbackPut(req, res, body, mm) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const id = mm[1];
  const done = body && body.done !== undefined ? (body.done ? 1 : 0) : null;
  if (done === null) return send(res, 400, { ok: false, msg: '缺少 done 字段' });
  const r = await q('UPDATE feedback SET done=? WHERE id=?', [done, id]);
  if (!r.affectedRows) return send(res, 404, { ok: false, msg: '反馈不存在' });
  return send(res, 200, { ok: true });
}
async function apiAdminFeedbackDel(req, res, body, mm) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const r = await q('DELETE FROM feedback WHERE id=?', [mm[1]]);
  if (!r.affectedRows) return send(res, 404, { ok: false, msg: '反馈不存在' });
  return send(res, 200, { ok: true });
}

/* 管理员登录失败计数 */
const ADMIN_FAILS = new Map(); // ip -> {count, lockUntil}
async function apiAdminLogin(req, res, body) {
  const ip = String((req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?')).split(',')[0].trim();
  const now = Date.now();
  const f = ADMIN_FAILS.get(ip) || { count: 0, lockUntil: 0 };
  if (f.lockUntil > now) {
    return send(res, 429, { ok: false, msg: '密码错误次数过多，已临时锁定，请 ' + Math.ceil((f.lockUntil - now) / 60000) + ' 分钟后再试' });
  }
  if (f.lockUntil && f.lockUntil <= now) { f.count = 0; f.lockUntil = 0; } // 锁定期满自动解锁
  const acc = String(body.account || '').trim();
  const pw = String(body.password || '');
  /* 仅超级管理员可登录 */
  const row = await getAdmin();
  const fail = (msg) => {
    f.count++;
    if (f.count >= 5) { f.lockUntil = now + 15 * 60 * 1000; msg += '（错误次数过多，已锁定 15 分钟）'; }
    else msg += '（再错 ' + (5 - f.count) + ' 次将临时锁定 15 分钟）';
    ADMIN_FAILS.set(ip, f);
    return send(res, 400, { ok: false, msg });
  };
  if (row && acc === row.account) {
    if (!verifyPassword(pw, row.pass_hash)) return fail('管理员密码错误');
    ADMIN_FAILS.delete(ip); /* 登录成功清零失败计数 */
    const token = signToken({ sub: 'admin', exp: Date.now() + 7 * 86400000 });
    return send(res, 200, { ok: true, token, name: '超级管理员' });
  }
  return fail('管理员账号不存在');
}
async function apiAdminDb(req, res) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const urows = (await q('SELECT * FROM users ORDER BY joined ASC, id ASC')).map(rowUser);
  const srows = await q('SELECT * FROM sessions ORDER BY ts DESC');
  const vrows = await q('SELECT * FROM videos ORDER BY ts DESC');
  const sMap = {}, vMap = {};
  srows.forEach(r => { const k = r.user_id; (sMap[k] = sMap[k] || []).push(rowSession(r)); });
  vrows.forEach(r => { const k = r.user_id; (vMap[k] = vMap[k] || []).push(rowVideo(r)); });
  const users = urows.map(u => {
    u.sessions = sMap[u.uid] || [];
    u.videos = vMap[u.uid] || [];
    return publicUser(u);
  });
  return send(res, 200, { ok: true, users, stats: await computeStats(), day7: await computeDay7(), logs: await getLogs() });
}
/* 管理后台：返回当前在线的用户清单（实时） */
async function apiAdminOnline(req, res) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const now = Date.now();
  const rows = await q(`SELECT u.*,
      (SELECT COUNT(*) FROM sessions s WHERE s.user_id=u.uid) AS sc,
      (SELECT COUNT(*) FROM videos v WHERE v.user_id=u.uid) AS vc,
      COALESCE(JSON_LENGTH(u.bank_favs),0) AS fv
    FROM users u
    WHERE u.online_at IS NOT NULL AND u.online_at>=?
    ORDER BY u.online_at DESC`, [now - ONLINE_TTL]);
  const list = rows.map(r => ({
    uid: r.uid, id: r.id, name: r.name, avatar: r.avatar || '🙂', account: r.account,
    status: r.status, page: r.page || '', onlineAt: Number(r.online_at), last: Number(r.last),
    sessions: Number(r.sc), videos: Number(r.vc), favs: Number(r.fv)
  }));
  return send(res, 200, { ok: true, online: list, count: list.length, ts: now, ttl: ONLINE_TTL });
}
async function apiAdminVideoPut(req, res, body, m) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const v = await q1('SELECT v.*, u.name AS uname FROM videos v JOIN users u ON u.uid=v.user_id WHERE v.id=?', [m[1]]);
  if (!v) return send(res, 404, { ok: false, msg: '视频不存在' });
  await q('UPDATE videos SET status=?, reason=?, at_time=? WHERE id=?',
    [body.status || v.status, body.reason || '', Date.now(), m[1]]);
  const label = body.status === 'approved' ? '通过视频' : (body.status === 'rejected' ? '拒绝视频' : '重置视频状态');
  await addLog(label, v.title + '（' + v.uname + '）', body.reason || '');
  return send(res, 200, { ok: true });
}
async function apiAdminVideoDel(req, res, body, m) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const v = await q1('SELECT v.*, u.name AS uname FROM videos v JOIN users u ON u.uid=v.user_id WHERE v.id=?', [m[1]]);
  if (!v) return send(res, 404, { ok: false, msg: '视频不存在' });
  await q('DELETE FROM videos WHERE id=?', [m[1]]);
  delVideoFile(m[1]);
  await addLog('删除视频', v.title + '（' + v.uname + '）', '');
  return send(res, 200, { ok: true });
}
async function apiAdminUserPut(req, res, body, m) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const u = await findUserById(m[1]);
  if (!u) return send(res, 404, { ok: false, msg: '用户不存在' });
  await q('UPDATE users SET status=? WHERE id=?', [body.status === 'banned' ? 'banned' : 'active', u.id]);
  await addLog(body.status === 'banned' ? '封禁用户' : '解除封禁', u.name + '（' + u.account + '）', '');
  return send(res, 200, { ok: true });
}
async function apiAdminUserDel(req, res, body, m) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  const u = await findUserById(m[1]);
  if (!u) return send(res, 404, { ok: false, msg: '用户不存在' });
  const vids = await q('SELECT id FROM videos WHERE user_id=?', [u.uid]);
  for (const vv of vids) delVideoFile(vv.id);
  await q('DELETE FROM sessions WHERE user_id=?', [u.uid]);
  await q('DELETE FROM videos WHERE user_id=?', [u.uid]);
  await q('DELETE FROM users WHERE id=?', [u.id]);
  await addLog('删除用户', u.name + '（' + u.account + '）', '');
  return send(res, 200, { ok: true });
}
async function apiAdminLogsDel(req, res) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  await q('DELETE FROM admin_logs');
  return send(res, 200, { ok: true });
}
async function apiAdminReset(req, res) {
  if (!authAdmin(req)) return send(res, 401, { ok: false, msg: '管理员未登录' });
  try { fs.readdirSync(UPLOAD_DIR).forEach(f => delVideoFile(f)); } catch (e) {}
  await q('DELETE FROM sessions');
  await q('DELETE FROM videos');
  await q('DELETE FROM admin_logs');
  await q('DELETE FROM users');
  await seedDemo();
  await addLog('重置后台数据', '已恢复内置示例数据集', '');
  return send(res, 200, { ok: true });
}

function mkSessionData() {
  const types = ['综合', '技术', 'HR', '压力'];
  const scenes = ['job', 'tech', 'data', 'product', 'general'];
  const ts = Date.now() - randInt(1, 26) * 86400000 - randInt(0, 23) * 3600000;
  const avg = Math.round((2.5 + Math.random() * 2.5) * 10) / 10;
  return {
    id: 's_demo_' + ts + '_' + randInt(0, 9999), ts,
    type: types[randInt(0, 3)], scene: scenes[randInt(0, 4)],
    count: randInt(3, 8), avg, used: randInt(120, 880),
    ansLen: randInt(30, 140),
    ai: avg >= 4 ? '表达流畅、要点覆盖较全，建议补充量化结果。' : '框架基本成型，建议用"总-分-总"结构并增加案例。'
  };
}
async function seedDemo() {
  const names = ['林小满', '陈知远', '苏叶', '周牧', '何一诺', '赵珩'];
  const avas = ['🦊', '🐼', '🐯', '🦁', '🐨', '🐵'];
  const fbPool = ['q_intro', 'q_project', 'q_conflict', 'q_sql', 'q_stress', 'q_lead', 'q_fail'];
  for (let i = 0; i < names.length; i++) {
    const id = 'u' + i;
    const acc = 'user' + (1001 + i);
    /* 题库演示数据：约一半示例用户有收藏与练习记录 */
    let fb = [];
    if (i % 2 === 0) {
      const pool2 = fbPool.slice();
      const nf = randInt(1, 4);
      for (let k = 0; k < nf && pool2.length; k++) fb.push(pool2.splice(randInt(0, pool2.length - 1), 1)[0]);
    }
    await q('INSERT INTO users (id,uid,account,name,avatar,bg,joined,last,status,demo,goal,checkin,pass_hash,bank_favs,bank_practice) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, id, acc, names[i], avas[i], null,
        Date.now() - randInt(3, 90) * 86400000, Date.now() - randInt(0, 6) * 86400000,
        i === 5 ? 'banned' : 'active', 1, randInt(1, 5), randInt(0, 30),
        hashPassword('demo123'), JSON.stringify(fb), randInt(0, 18)]);
    const ns = randInt(2, 9);
    for (let s = 0; s < ns; s++) {
      const S = mkSessionData();
      await q('INSERT INTO sessions (id,user_id,ts,type,scene,cnt,avg_score,used_sec,ans_len,ai) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [S.id, id, S.ts, S.type, S.scene, S.count, S.avg, S.used, S.ansLen, S.ai]);
    }
    /* 不再生成示例视频：观摩大厅只展示用户真实投稿 */
  }
}
/* 把旧 JSON 数据导入 */
async function importLegacyJson() {
  let d;
  try { d = JSON.parse(fs.readFileSync(LEGACY_DB_FILE, 'utf8')); }
  catch (e) { return false; }
  if (!d || !Array.isArray(d.users) || !d.users.length) return false;
  for (const u of d.users) {
    await q('INSERT INTO users (id,uid,account,name,avatar,bg,joined,last,status,demo,goal,checkin,pass_hash,online_at,page,bank_favs,bank_practice) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [u.id, u.uid || u.id, u.account, u.name || u.account, u.avatar || '🙂',
        u.bg ? JSON.stringify(u.bg) : null,
        u.joined || Date.now(), u.last || Date.now(), u.status || 'active',
        u.demo ? 1 : 0, u.goal || 0, u.checkin || 0, u.passHash || hashPassword('demo123'),
        u.onlineAt || null, u.page || null,
        JSON.stringify((u.bank && u.bank.favs) || []), (u.bank && u.bank.practice) || 0]);
    for (const s of (u.sessions || [])) {
      await q(`INSERT INTO sessions (id,user_id,ts,type,scene,cnt,avg_score,used_sec,ans_len,ai)
        VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`,
        [s.id, u.uid || u.id, s.ts || Date.now(), s.type || '综合', s.scene || 'general',
          s.count || 0, Number(s.avg || 0), s.used || 0, s.ansLen || 0, s.ai || '']);
    }
    for (const v of (u.videos || [])) {
      await q(`INSERT INTO videos (id,user_id,ts,title,scene,dur,status,plays,reports,reason,at_time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`,
        [v.id, u.uid || u.id, v.ts || Date.now(), v.title || '未命名回放', v.scene || 'general',
          v.dur || 0, v.status || 'pending', v.plays || 0, v.reports || 0, v.reason || '', v.at || null]);
    }
  }
  if (Array.isArray(d.logs)) {
    for (const l of d.logs) {
      await q('INSERT INTO admin_logs (ts,action,target,extra,actor) VALUES (?,?,?,?,?)',
        [l.ts || Date.now(), l.action || '', l.target || '', l.extra || '', l.by || '管理员']);
    }
  }
  return d.users.length;
}
async function initAdmin() {
  const row = await getAdmin();
  if (row) return;
  /* 尝试从旧 admin. */
  try {
    const a = JSON.parse(fs.readFileSync(LEGACY_ADMIN_FILE, 'utf8'));
    if (a && a.account && a.passHash) {
      await q('INSERT INTO admin_account (account,pass_hash) VALUES (?,?)', [a.account, a.passHash]);
      console.log('[管理后台] 已从旧 admin.json 导入管理员凭据，原密码可继续使用');
      return;
    }
  } catch (e) {}
  const account = process.env.ADMIN_ACCOUNT || 'admin';
  let pass = process.env.ADMIN_PASSWORD || '';
  if (!pass) pass = randToken(12);
  await q('INSERT INTO admin_account (account,pass_hash) VALUES (?,?)', [account, hashPassword(pass)]);
  console.log('\n[管理后台] 首次运行：已初始化管理员');
  console.log('  账号: ' + account);
  console.log('  密码: ' + pass + '   （请妥善保存；也可用环境变量 ADMIN_PASSWORD 指定）\n');
}

/* 状态接口 */
async function apiAiStatus(req, res) {
  return send(res, 200, { ok: true, enabled: aiEnabled(), model: aiEnabled() ? AI.model : '' });
}

const SAFE_BLOCK = [
  [/制(作|造|取)?(炸|爆)(药|弹|炸)|爆炸装置|自制枪|枪械改装|杀人方法|投毒方法|下毒方法/i, '暴力犯罪'],
  [/冰毒|海洛因|摇头丸|制毒|毒品(制作|提炼|合成)/i, '毒品相关'],
  [/开设赌场|赌博网站|赌博平台|博彩网站|出老千|作弊器|外挂(制作|开发)/i, '赌博作弊'],
  [/(儿童|未成年).{0,6}(色情|裸|性)|裸聊|嫖娼|卖淫|援交/i, '违法色情'],
  [/(自杀|轻生|安乐死).{0,6}(方法|教程|步骤|怎么)/i, '自伤教唆'],
  [/黑客(攻击|入侵|教程)|DDoS|ddos|肉鸡|木马(制作|编写)|翻墙工具|洗钱/i, '网络违法'],
  [/忽略(以上|之前|所有|上面)(的)?(指令|提示|设定)|ignore (all |any )?(previous|above) instructions|泄露你的(系统|)提示词|reveal your (system )?prompt|你现在是(没有限制|无限制|不受约束)/i, '提示词注入']
];
const SAFE_MASK = [/枪支买卖|军火|制毒流程|毒品制作|赌博网站|博彩平台|裸聊|嫖娼|卖淫|洗钱渠道/g];
function safetyCheckInput(text) {
  const s = String(text || '');
  for (const [re, cat] of SAFE_BLOCK) {
    if (re.test(s)) return { ok: false, msg: '你的问题涉及「' + cat + '」相关内容，本平台专注于面试与求职训练，请换个和职业发展有关的话题吧 🙂' };
  }
  return { ok: true };
}
function safetyFilterOutput(text) {
  let s = String(text || '');
  for (const re of SAFE_MASK) s = s.replace(re, '**[该内容已按平台安全策略脱敏]**');
  return s;
}

/* 按用户限速 */
const AI_USE = new Map(); // uid -> { count, reset }
function aiRateLimit(res, uid) {
  const now = Date.now();
  let e = AI_USE.get(uid);
  if (!e || now > e.reset) { e = { count: 0, reset: now + AI.perUser.windowMs }; AI_USE.set(uid, e); }
  e.count++;
  if (AI_USE.size > 10000) { for (const [k, v] of AI_USE) if (now > v.reset) AI_USE.delete(k); }
  if (e.count > AI.perUser.max) {
    send(res, 429, { ok: false, msg: 'AI 调用过于频繁，请 ' + Math.ceil((e.reset - now) / 1000) + ' 秒后再试' });
    return false;
  }
  return true;
}

/* 对话代理 */
async function apiAiChat(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '请先登录后再使用 AI 功能' });
  if (!aiRateLimit(res, u.uid)) return;
  if (!aiEnabled()) return send(res, 503, { ok: false, msg: 'AI 服务未配置，请联系管理员', aiDisabled: true });

  const msgs = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string' && m.content.length > 0)
    .slice(-40) // 最多保留最近 40 条
    .map(m => ({ role: (m.role === 'assistant' || m.role === 'user' || m.role === 'system') ? m.role : 'user', content: m.content.slice(0, 16000) }));
  if (!msgs.length) return send(res, 400, { ok: false, msg: 'messages 不能为空' });
  /* 输入安全 */
  for (const m of msgs) {
    if (m.role === 'user') {
      const sc = safetyCheckInput(m.content);
      if (!sc.ok) return send(res, 400, { ok: false, msg: sc.msg, safety: true });
    }
  }

  const stream = !!body.stream;
  const payload = { model: AI.model, messages: msgs, stream, temperature: AI.temperature, max_tokens: AI.maxTokens, ...AI_THINK_EXTRA };
  if (body.json) { try { payload.response_format = { type: 'json_object' }; } catch (e) {} }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), AI.timeoutMs);
    res.on('close', () => { if (!res.writableEnded) ac.abort(); });
  let up;
  try {
    up = await fetch(AI.baseURL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AI.apiKey },
      body: JSON.stringify(payload),
      signal: ac.signal
    });
  } catch (e) {
    clearTimeout(timer);
    console.error('[AI] 上游请求失败：' + (e && e.message ? e.message : e));
    if (!res.headersSent) return send(res, 502, { ok: false, msg: 'AI 服务暂时不可用，请稍后再试' });
    try { res.end(); } catch (_) {}
    return;
  }
  if (!up.ok) {
    clearTimeout(timer);
    const t = await up.text().catch(() => '');
    console.error('[AI] 上游错误 ' + up.status + '：' + String(t).slice(0, 300));
    if (!res.headersSent) return send(res, 502, { ok: false, msg: 'AI 调用失败（上游 ' + up.status + '）' });
    try { res.end(); } catch (_) {}
    return;
  }

  if (!stream) {
    clearTimeout(timer);
    const j = await up.json().catch(() => null);
    const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!text) return send(res, 502, { ok: false, msg: 'AI 返回为空' });
    return send(res, 200, { ok: true, text: safetyFilterOutput(String(text)) });
  }

    res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  const reader = up.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } catch (e) { /* 客户端断开或上游中断，静默收尾 */ }
  clearTimeout(timer);
  try { res.end(); } catch (_) {}
}

const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description: '查询当前用户的训练画像：累计面试场次、答题总数、平均分、各场景平均分、最近场次、视频投稿、签到天数等真实数据',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_weak_points',
      description: '分析当前用户的薄弱点：对比各场景平均分找出最弱的场景，并给出最近场次的成绩趋势',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_questions',
      description: '检索题库真实题目。可按场景（job=求职实习, tech=技术开发, data=数据分析, product=产品运营, general=通用行为）和关键词过滤',
      parameters: {
        type: 'object',
        properties: {
          scene: { type: 'string', enum: ['job', 'tech', 'data', 'product', 'general'], description: '场景代码，可选' },
          keyword: { type: 'string', description: '题目关键词，可选' },
          limit: { type: 'integer', description: '返回条数，默认 3，最多 5' }
        },
        required: []
      }
    }
  }
];
const AGENT_SYS =
  '你是"模拟面试训练营 Pro"的 AI 训练教练，背后接有真实工具，可以查询当前用户的训练数据与题库。\n' +
  '【工具使用原则】\n' +
  '1. 用户问"我的水平/我的数据/我的弱点/我练得怎么样"→ 调用 get_user_profile 或 get_weak_points；\n' +
  '2. 用户问"该练什么/出几道题/这题怎么答"→ 调用 search_questions 查真实题库，严禁编造题目；\n' +
  '3. 制定训练计划必须引用工具返回的真实数据（平均分、薄弱场景、最近场次），具体到"每天练什么、练几道"；\n' +
  '4. 普通面试技巧问题直接回答，不要滥用工具。\n' +
  '【输出要求】简洁中文，重点突出，300 字以内；计划类回答用短列表。\n' +
  '【网站模块】模拟面试（多轮对话+语音作答+AI 评分复盘）、题库（收藏与练习）、观摩大厅（审核通过的视频）、个人中心（薄弱点本）、首页（签到/成就/每日挑战）。';

/* Agent 专属限速 */
const AI_AGENT_USE = new Map();
function aiAgentLimit(res, uid) {
  const now = Date.now(), max = 20, win = 10 * 60 * 1000;
  let e = AI_AGENT_USE.get(uid);
  if (!e || now > e.reset) { e = { count: 0, reset: now + win }; AI_AGENT_USE.set(uid, e); }
  e.count++;
  if (AI_AGENT_USE.size > 10000) { for (const [k, v] of AI_AGENT_USE) if (now > v.reset) AI_AGENT_USE.delete(k); }
  if (e.count > max) {
    send(res, 429, { ok: false, msg: '教练调用过于频繁，请 ' + Math.ceil((e.reset - now) / 1000) + ' 秒后再试' });
    return false;
  }
  return true;
}

/* 执行一个工具调用 */
async function agentToolRun(uid, name, rawArgs) {
  let args = {};
  try { args = rawArgs ? JSON.parse(rawArgs) : {}; } catch (e) { args = {}; }
  if (name === 'get_user_profile') {
    const u = await q1('SELECT name, goal, checkin, bank_practice, joined FROM users WHERE uid=?', [uid]);
    const s = await q1(`SELECT COUNT(*) AS n, COALESCE(AVG(avg_score),0) AS avg_score, COALESCE(SUM(cnt),0) AS qn,
      COALESCE(SUM(used_sec),0) AS secs FROM sessions WHERE user_id=?`, [uid]);
    const byScene = await q(`SELECT scene, COUNT(*) AS n, COALESCE(AVG(avg_score),0) AS avg_score
      FROM sessions WHERE user_id=? GROUP BY scene`, [uid]);
    const recent = await q('SELECT ts, scene, cnt, avg_score FROM sessions WHERE user_id=? ORDER BY ts DESC LIMIT 5', [uid]);
    const v = await q1(`SELECT COUNT(*) AS n, SUM(status='approved') AS approved, SUM(status='pending') AS pending
      FROM videos WHERE user_id=?`, [uid]);
    return {
      name: u && u.name, joined: u ? Number(u.joined) : null, checkinDays: u ? Number(u.checkin) : 0,
      goal: u ? Number(u.goal) : 0, practiceCount: u ? Number(u.bank_practice) : 0,
      sessions: Number(s.n), totalQuestions: Number(s.qn), avgScore: Math.round(Number(s.avg_score) * 10) / 10,
      totalSec: Number(s.secs),
      byScene: byScene.map(r => ({ scene: r.scene, n: Number(r.n), avg: Math.round(Number(r.avg_score) * 10) / 10 })),
      recent: recent.map(r => ({ date: new Date(Number(r.ts)).toISOString().slice(0, 10), scene: r.scene, n: Number(r.cnt), avg: Math.round(Number(r.avg_score) * 10) / 10 })),
      videos: { total: Number(v.n), approved: Number(v.approved || 0), pending: Number(v.pending || 0) }
    };
  }
  if (name === 'get_weak_points') {
    const byScene = await q(`SELECT scene, COUNT(*) AS n, COALESCE(AVG(avg_score),0) AS avg_score
      FROM sessions WHERE user_id=? GROUP BY scene ORDER BY avg_score ASC`, [uid]);
    const rows = byScene.map(r => ({ scene: r.scene, n: Number(r.n), avg: Math.round(Number(r.avg_score) * 10) / 10 }));
    const weak = rows.filter(r => r.n >= 1 && r.avg < 3.5).map(r => r.scene);
    const trend = await q(`SELECT ts, avg_score FROM sessions WHERE user_id=? ORDER BY ts DESC LIMIT 6`, [uid]);
    return {
      sceneRank: rows, weakScenes: weak,
      trend: trend.map(r => Math.round(Number(r.avg_score) * 10) / 10).reverse(),
      advice: weak.length ? '薄弱场景见 weakScenes（平均分低于 3.5）' : (rows.length ? '各场景表现均衡' : '该用户还没有面试记录')
    };
  }
  if (name === 'search_questions') {
    const limit = Math.max(1, Math.min(5, Number(args.limit) || 3));
    const where = ['1=1'], vals = [];
    if (args.scene && ['job', 'tech', 'data', 'product', 'general'].includes(String(args.scene))) { where.push('scene=?'); vals.push(args.scene); }
    if (args.keyword) { where.push('(q LIKE ? OR point LIKE ?)'); const kw = '%' + String(args.keyword).slice(0, 50) + '%'; vals.push(kw, kw); }
    const rows = await q(`SELECT scene, lv, q, point, tips, ans FROM questions WHERE ${where.join(' AND ')}
      ORDER BY sort ASC, RAND() LIMIT ${limit}`, vals);
    const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
    return { count: rows.length, questions: rows.map(r => ({
      scene: r.scene, lv: Number(r.lv), q: r.q, point: clip(r.point, 120),
      tips: clip(typeof r.tips === 'string' ? r.tips.replace(/^\[|\]$/g, '') : '', 150),
      ans: clip(r.ans, 300)
    })) };
  }
  return { error: '未知工具' };
}

/* 工具名 → 友好步骤文案（前端「思考过程可视化」直接展示） */
const AGENT_TOOL_LABEL = {
  get_user_profile: '📊 正在查询你的训练数据…',
  get_weak_points: '📉 正在分析薄弱点…',
  search_questions: '🔍 正在检索真实题库…'
};

/* 上游对话调用（Agent 专用）：非流式返回完整 message；
   客户端要求流式时，上游也走流式，正文/思考增量经 onEv 实时回调，
   最终拼装出完整 message 返回（tool_calls 按 index 增量拼装）。 */
async function agentUpstreamChat(msgs, useTools, clientStream, onEv, ac) {
  const payload = { model: AI.model, messages: msgs, temperature: AI.temperature, max_tokens: 1024, ...AI_THINK_EXTRA };
  if (useTools) { payload.tools = AGENT_TOOLS; payload.tool_choice = 'auto'; }
  if (clientStream) payload.stream = true;
  const r = await fetch(AI.baseURL + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AI.apiKey },
    body: JSON.stringify(payload),
    signal: ac.signal
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    const err = new Error('upstream ' + r.status);
    err.status = r.status;
    console.error('[Agent] 上游错误 ' + r.status + '：' + String(t).slice(0, 300));
    throw err;
  }
  if (!clientStream) {
    const j = await r.json().catch(() => null);
    const msg = j && j.choices && j.choices[0] && j.choices[0].message;
    if (!msg) { const e = new Error('empty'); e.empty = true; throw e; }
    return msg;
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '', content = '', toolCalls = null, sawContent = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop() || '';
    for (const line of lines) {
      const s = line.trim();
      if (!s || s.indexOf('data:') !== 0) continue;
      const data = s.slice(5).trim();
      if (data === '[DONE]') continue;
      let j; try { j = JSON.parse(data); } catch (e) { continue; }
      const d = j.choices && j.choices[0] && j.choices[0].delta;
      if (!d) continue;
      if (d.reasoning_content && onEv) onEv({ kind: 'think', t: String(d.reasoning_content) });
      if (d.content) {
        content += d.content; sawContent = true;
        if (onEv) onEv({ kind: 'delta', t: String(d.content) });
      }
      if (Array.isArray(d.tool_calls) && d.tool_calls.length) {
        /* 本轮实际是工具调用：清掉前端已显示的少量正文，避免误导 */
        if (sawContent && onEv) { onEv({ kind: 'reset' }); sawContent = false; content = ''; }
        if (!toolCalls) toolCalls = [];
        for (const tc of d.tool_calls) {
          const idx = Number(tc.index) || 0;
          if (!toolCalls[idx]) toolCalls[idx] = { id: '', type: 'function', function: { name: '', arguments: '' } };
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function && tc.function.name) toolCalls[idx].function.name += tc.function.name;
          if (tc.function && tc.function.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
        }
      }
    }
  }
  const msg = { content: content || '' };
  if (toolCalls && toolCalls.length) msg.tool_calls = toolCalls.filter(Boolean);
  return msg;
}

async function apiAiAgent(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '请先登录后再使用 AI 功能' });
  if (!aiAgentLimit(res, u.uid)) return;
  if (!aiEnabled()) return send(res, 503, { ok: false, msg: 'AI 服务未配置，请联系管理员', aiDisabled: true });

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!history.length) return send(res, 400, { ok: false, msg: 'messages 不能为空' });
  /* 输入安全：拦截违法/危险内容与提示词注入 */
  for (const m of history) {
    if (m.role === 'user') {
      const sc = safetyCheckInput(m.content);
      if (!sc.ok) return send(res, 400, { ok: false, msg: sc.msg, safety: true });
    }
  }

  /* stream=true 时走 SSE：先逐步推送「工具执行步骤」（思考过程可视化），最后推 done 事件 */
  const stream = !!body.stream;
  const steps = [];
  function sse(obj) { try { res.write('data: ' + JSON.stringify(obj) + '\n\n'); } catch (e) {} }
  function pushStep(fn) {
    steps.push(fn);
    if (stream) sse({ type: 'step', tool: fn, label: AGENT_TOOL_LABEL[fn] || ('🛠 正在执行 ' + fn + '…') });
  }
  if (stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
  }

  const msgs = [{ role: 'system', content: AGENT_SYS }].concat(history);
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 120000);
  res.on('close', () => { if (!res.writableEnded) ac.abort(); });

  try {
    /* 流式客户端时把上游增量实时转发：正文 delta / 思考链 think / 重置 reset */
    const onEv = stream ? function (ev) {
      if (ev.kind === 'delta') sse({ type: 'delta', t: ev.t });
      else if (ev.kind === 'think') sse({ type: 'think', t: ev.t });
      else if (ev.kind === 'reset') sse({ type: 'reset' });
    } : null;
    function upstreamErr(e) {
      if (e && e.status) return { msg: 'AI 调用失败（上游 ' + e.status + '）' };
      if (e && e.empty) return { msg: 'AI 返回为空' };
      return null;
    }
    for (let round = 0; round < 4; round++) {
      let msg;
      try {
        msg = await agentUpstreamChat(msgs, true, stream, onEv, ac);
      } catch (e) {
        const m = upstreamErr(e);
        if (m) {
          if (stream) { sse({ type: 'error', msg: m.msg }); try { res.end(); } catch (_) {} return; }
          return send(res, 502, { ok: false, msg: m.msg });
        }
        throw e;
      }

      if (!msg.tool_calls || !msg.tool_calls.length) {
        clearTimeout(timer);
        const text = safetyFilterOutput(String(msg.content || ''));
        if (stream) { sse({ type: 'done', text, steps, rounds: round + 1 }); try { res.end(); } catch (_) {} return; }
        return send(res, 200, { ok: true, text, steps, rounds: round + 1 });
      }
      /* 模型决定调用工具：记录步骤 → 服务端执行 → 结果喂回模型继续决策 */
      msgs.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls) {
        const fn = tc.function && tc.function.name;
        let result;
        try { result = await agentToolRun(u.uid, fn, tc.function && tc.function.arguments); }
        catch (e) { result = { error: '工具执行失败' }; }
        pushStep(fn);
        msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
    /* 4 轮仍在调用工具：强制收尾，再给模型最后一次无工具作答的机会 */
    let msg2;
    try {
      msg2 = await agentUpstreamChat(msgs, false, stream, onEv, ac);
    } catch (e) {
      const m = upstreamErr(e);
      if (m) {
        if (stream) { sse({ type: 'error', msg: m.msg }); try { res.end(); } catch (_) {} return; }
        return send(res, 502, { ok: false, msg: m.msg });
      }
      throw e;
    }
    const text = safetyFilterOutput(String(msg2.content || ''));
    clearTimeout(timer);
    if (stream) { sse({ type: 'done', text, steps, rounds: 4 }); try { res.end(); } catch (_) {} return; }
    return send(res, 200, { ok: true, text, steps, rounds: 4 });
  } catch (e) {
    clearTimeout(timer);
    console.error('[Agent] ' + (e && e.message ? e.message : e));
    if (stream) { sse({ type: 'error', msg: 'AI 服务暂时不可用，请稍后再试' }); try { res.end(); } catch (_) {} return; }
    if (!res.headersSent) return send(res, 502, { ok: false, msg: 'AI 服务暂时不可用，请稍后再试' });
    try { res.end(); } catch (_) {}
  }
}

const RAG = { docs: null, idf: null, builtAt: 0 };
const RAG_SCENE_NAME = { job: '求职实习', tech: '技术开发', data: '数据分析', product: '产品运营', general: '通用行为' };
function ragTokenize(s) {
  s = String(s || '').toLowerCase();
  const toks = [];
  (s.match(/[a-z0-9+#.]+/g) || []).forEach(w => { if (w.length > 1) toks.push(w); });
  (s.match(/[\u4e00-\u9fa5]+/g) || []).forEach(seg => {
    if (seg.length === 1) { toks.push(seg); return; }
    for (let i = 0; i < seg.length - 1; i++) toks.push(seg.slice(i, i + 2)); // 中文二元组
  });
  return toks;
}
async function ragEnsureIndex() {
  if (RAG.docs && Date.now() - RAG.builtAt < 10 * 60 * 1000) return;
  const rows = await q(`SELECT id, scene, lv, q, point, tips, LEFT(ans,500) AS ans FROM questions`);
  const docs = rows.map(r => {
    const text = (r.q || '') + ' ' + (r.point || '') + ' ' +
      (typeof r.tips === 'string' ? r.tips.replace(/[\[\]"',]/g, ' ') : '') + ' ' + (r.ans || '');
    const tf = {};
    ragTokenize(text).forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    return { id: r.id, scene: r.scene, lv: Number(r.lv), q: r.q, point: r.point || '',
      tips: String(r.tips || ''), ans: String(r.ans || ''), tf, len: Object.values(tf).reduce((a, b) => a + b, 0) || 1 };
  });
  const df = {};
  docs.forEach(d => { Object.keys(d.tf).forEach(t => { df[t] = (df[t] || 0) + 1; }); });
  const N = docs.length, idf = {};
  Object.keys(df).forEach(t => { idf[t] = Math.log(1 + N / df[t]); });
  RAG.docs = docs; RAG.idf = idf; RAG.builtAt = Date.now();
  console.log('[RAG] 题库检索索引已构建：' + N + ' 道题，' + Object.keys(df).length + ' 个词项');
}
function ragSearch(query, topK) {
  if (!RAG.docs || !RAG.docs.length) return [];
  const qtf = {};
  ragTokenize(query).forEach(t => { qtf[t] = (qtf[t] || 0) + 1; });
  if (!Object.keys(qtf).length) return [];
  const core = query.trim().slice(0, 20);
  const scored = [];
  for (const d of RAG.docs) {
    let s = 0;
    for (const t in qtf) if (d.tf[t]) s += (1 + Math.log(qtf[t])) * d.tf[t] * (RAG.idf[t] || 0);
    if (core && (d.q.indexOf(core) >= 0 || d.point.indexOf(core) >= 0)) s += 4; // 原文整串命中加权
    if (s > 0) scored.push({ d, score: s / d.len });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
async function apiAiAsk(req, res, body) {
  const u = await authUser(req);
  if (!u) return send(res, 401, { ok: false, msg: '请先登录后再使用 AI 功能' });
  if (!aiRateLimit(res, u.uid)) return;
  if (!aiEnabled()) return send(res, 503, { ok: false, msg: 'AI 服务未配置，请联系管理员', aiDisabled: true });
  const question = String(body.question || '').trim().slice(0, 500);
  if (!question) return send(res, 400, { ok: false, msg: 'question 不能为空' });
  const sc = safetyCheckInput(question);
  if (!sc.ok) return send(res, 400, { ok: false, msg: sc.msg, safety: true });

  await ragEnsureIndex();
  const hits = ragSearch(question, 3);
  let sys =
    '你是资深面试官与求职教练，正在回答求职者的提问。\n' +
    '【检索增强】下面是从题库检索到的真实题目（TF-IDF 相似度 Top-3），回答时必须优先依据这些内容：';
  if (hits.length) {
    hits.forEach((h, i) => {
      sys += '\n\n【参考题目' + (i + 1) + '】(' + (RAG_SCENE_NAME[h.d.scene] || h.d.scene) + ' · ' + h.d.lv + ' 星) ' + h.d.q +
        '\n考察点：' + h.d.point +
        (h.d.tips ? '\n答题要点：' + h.d.tips.slice(0, 220) : '') +
        (h.d.ans ? '\n参考答案节选：' + h.d.ans.slice(0, 320) : '');
    });
    sys += '\n\n【要求】结合参考题目给出结构化回答（要点 + 示例）；若参考题目与提问无关，按你的知识回答，并在末尾注明「题库中暂无高度相关题目」。';
  } else {
    sys += '\n（未检索到相关题目）按你的知识正常回答，并在末尾注明「题库中暂无相关题目」。';
  }
  sys += '\n【输出】中文，400 字以内，重点用短列表。';

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), AI.timeoutMs);
  res.on('close', () => { if (!res.writableEnded) ac.abort(); });
  let up;
  try {
    up = await fetch(AI.baseURL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AI.apiKey },
      body: JSON.stringify({ model: AI.model, messages: [
        { role: 'system', content: sys },
        { role: 'user', content: question }
      ], stream: false, temperature: AI.temperature, max_tokens: AI.maxTokens, ...AI_THINK_EXTRA }),
      signal: ac.signal
    });
  } catch (e) {
    clearTimeout(timer);
    return send(res, 502, { ok: false, msg: 'AI 服务暂时不可用，请稍后再试' });
  }
  clearTimeout(timer);
  if (!up.ok) {
    const t = await up.text().catch(() => '');
    console.error('[RAG] 上游错误 ' + up.status + '：' + String(t).slice(0, 200));
    return send(res, 502, { ok: false, msg: 'AI 调用失败（上游 ' + up.status + '）' });
  }
  const j = await up.json().catch(() => null);
  const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!text) return send(res, 502, { ok: false, msg: 'AI 返回为空' });
  return send(res, 200, {
    ok: true,
    text: safetyFilterOutput(String(text)),
    sources: hits.map(h => ({ q: h.d.q, scene: h.d.scene, lv: h.d.lv, score: Math.round(h.score * 100) / 100 }))
  });
}

const ROUTES = [
  ['POST', /^\/api\/register$/, apiRegister],
  ['POST', /^\/api\/quick-register$/, apiQuickRegister],
  ['POST', /^\/api\/mail\/send-code$/, apiMailSendCode],
  ['POST', /^\/api\/login$/, apiLogin],
  ['GET', /^\/api\/me$/, apiMe],
  ['POST', /^\/api\/interviews$/, apiAddInterview],
  ['POST', /^\/api\/videos$/, apiAddVideo],
  ['GET', /^\/api\/videos\/hall$/, apiVideoHall],
  ['POST', /^\/api\/videos\/file\/([\w-]+)$/, apiVideoFileUpload],
  ['GET', /^\/api\/videos\/file\/([\w-]+)$/, apiVideoFileGet],
  ['DELETE', /^\/api\/videos\/([\w-]+)$/, apiVideoDelete],
  ['POST', /^\/api\/heartbeat$/, apiHeartbeat],
  ['POST', /^\/api\/bank$/, apiBank],
  ['POST', /^\/api\/profile$/, apiProfile],
  ['GET', /^\/api\/questions$/, apiQuestions],
  ['POST', /^\/api\/feedback$/, apiFeedbackAdd],
  ['GET', /^\/api\/desktop\/settings$/, apiDesktopGet],
  ['POST', /^\/api\/desktop\/settings$/, apiDesktopSet],
  ['POST', /^\/api\/desktop\/heartbeat$/, apiDesktopPing],
  ['GET', /^\/api\/admin\/feedback$/, apiAdminFeedbackList],
  ['PUT', /^\/api\/admin\/feedback\/(\d+)$/, apiAdminFeedbackPut],
  ['DELETE', /^\/api\/admin\/feedback\/(\d+)$/, apiAdminFeedbackDel],
  ['GET', /^\/api\/ai\/status$/, apiAiStatus],
  ['POST', /^\/api\/ai\/chat$/, apiAiChat],
  ['POST', /^\/api\/ai\/ask$/, apiAiAsk],
  ['POST', /^\/api\/ai\/agent$/, apiAiAgent],
  ['POST', /^\/api\/admin\/login$/, apiAdminLogin],
  ['GET', /^\/api\/admin\/db$/, apiAdminDb],
  ['GET', /^\/api\/admin\/online$/, apiAdminOnline],
  ['PUT', /^\/api\/admin\/video\/([\w-]+)$/, apiAdminVideoPut],
  ['DELETE', /^\/api\/admin\/video\/([\w-]+)$/, apiAdminVideoDel],
  ['PUT', /^\/api\/admin\/user\/([\w-]+)$/, apiAdminUserPut],
  ['DELETE', /^\/api\/admin\/user\/([\w-]+)$/, apiAdminUserDel],
  ['DELETE', /^\/api\/admin\/logs$/, apiAdminLogsDel],
  ['POST', /^\/api\/admin\/reset$/, apiAdminReset]
];

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve) => {
    if (!(req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) { resolve({}); return; }
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => {
      if (!data) { resolve({}); return; }
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
  });
}
function handleApi(req, res, pathname) {
  /* 视频文件上传走原始二进制流，不经过 JSON readBody（其 1MB 上限会截断大文件） */
  const mmFile = req.method === 'POST' ? pathname.match(/^\/api\/videos\/file\/([\w-]+)$/) : null;
  if (mmFile) {
    apiVideoFileUpload(req, res, null, mmFile).catch(e => {
      console.error('[API 错误]', pathname, e && e.message ? e.message : e);
      if (!res.headersSent) send(res, 500, { ok: false, msg: '服务器内部错误' });
    });
    return;
  }
  readBody(req).then(async body => {
    for (const [m, re, fn] of ROUTES) {
      if (req.method !== m) continue;
      const mm = pathname.match(re);
      if (mm) {
        try { return await fn(req, res, body, mm); }
        catch (e) {
          console.error('[API 错误]', pathname, e && e.message ? e.message : e);
          if (!res.headersSent) return send(res, 500, { ok: false, msg: '服务器内部错误' });
          return;
        }
      }
    }
    send(res, 404, { ok: false, msg: '接口不存在' });
  }).catch(() => { if (!res.headersSent) send(res, 400, { ok: false, msg: '请求体解析失败' }); });
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};
/* 仅允许白名单内的前端资源对外提供，杜绝把 server/、node_modules/、data/、deploy/、密钥、备份、配置文件等暴露出去。
   投稿视频走独立 /api/videos/file/:id 路由（带 Range 与 id 校验），不经过此处。 */
const PUBLIC_FILES = new Set([
  'index.html', 'interview.html', 'bank.html', 'square.html', 'relax.html',
  'videos.html', 'admin.html', 'assistant.html', 'reverse.html',
  'shared.css', 'shared.js', 'cloud.js', 'architecture.png', 'favicon.ico', 'robots.txt'
]);
const PUBLIC_DIRS = new Set(['assets']);
function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  try { rel = decodeURIComponent(rel); } catch (e) {}
  /* 白名单：根目录只允许已知前端文件；子目录只允许 assets/。其余一律 403。 */
  const segs = rel.replace(/^\/+/, '').split('/').filter(Boolean);
  const top = segs[0] || '';
  const allowed = segs.length === 1 ? PUBLIC_FILES.has(top) : PUBLIC_DIRS.has(top);
  if (!allowed) return send(res, 403, { ok: false, msg: 'forbidden' });
  let filePath;
  try { filePath = path.resolve(ROOT, '.' + rel); } catch (e) { return send(res, 403, { ok: false, msg: 'bad path' }); }
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) return send(res, 403, { ok: false, msg: 'forbidden' });
  try {
    let st = fs.statSync(filePath);
    if (st.isDirectory()) filePath = path.join(filePath, 'index.html');
    const ext = path.extname(filePath).toLowerCase();
    if (!MIME[ext]) return send(res, 403, { ok: false, msg: 'forbidden' });
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] });
    res.end(data);
  } catch (e) { send(res, 404, { ok: false, msg: 'not found' }); }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const u = new URL(req.url, 'http://localhost');
  const pathname = u.pathname;
  if (pathname.startsWith('/api/')) handleApi(req, res, pathname);
  else serveStatic(req, res, pathname);
});

async function main() {
  console.log('正在连接 MySQL ' + MYSQL.host + ':' + MYSQL.port + '（账号 ' + MYSQL.user + '，目标库 ' + MYSQL.database + '）…');
  try { await initDatabase(); }
  catch (e) {
    console.error('\n[错误] 无法连接 / 初始化 MySQL：' + (e && e.message ? e.message : e));
    console.error('  请检查：');
    console.error('  1. MySQL 服务是否已启动（本机服务名 MySQL57，端口 ' + MYSQL.port + '）');
    console.error('  2. 数据库连接账号/密码：优先读 server/.env（DB_USER / DB_PASSWORD），或用环境变量 DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME 覆盖；');
    console.error('     config.json 的 mysql.password 留空即表示使用上述环境变量。');
    process.exit(1);
  }
  console.log('MySQL 连接成功，数据库 ' + MYSQL.database + ' 就绪');
  /* 只保留超级管理员：历史遗留的普通管理员角色统一降级为普通用户 */
  await q('UPDATE users SET role=\'user\' WHERE role<>\'user\'');
  await initAdmin();
  /* 清理历史遗留的示例视频（示例用户名下、服务器上无文件本体的占位假视频） */
  try {
    const dv = await q('SELECT v.id FROM videos v JOIN users u ON v.user_id=u.id WHERE u.demo=1');
    let removed = 0;
    for (const row of dv) {
      if (!hasVideoFile(row.id)) { await q('DELETE FROM videos WHERE id=?', [row.id]); removed++; }
    }
    if (removed) console.log('已清理历史示例视频 ' + removed + ' 条（观摩大厅只保留真实投稿）');
  } catch (e) { console.log('清理示例视频跳过：' + e.message); }
  const c = await q1('SELECT COUNT(*) AS c FROM users');
  if (Number(c.c) === 0) {
    const n = await importLegacyJson();
    if (n) console.log('已从旧 server/data/db.json 导入 ' + n + ' 个用户的数据（原文件保留作备份）');
    else { await seedDemo(); console.log('已生成内置示例数据'); }
  }
  /* questions 表补齐 role/round 双轴列（老库平滑迁移） */
  try {
    const cols = await q(`SELECT COLUMN_NAME AS n FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='questions'`);
    const names = cols.map(c => String(c.n || c.COLUMN_NAME || '').toLowerCase());
    if (!names.includes('role')) await q(`ALTER TABLE questions ADD COLUMN role VARCHAR(20) NULL`);
    if (!names.includes('round')) await q(`ALTER TABLE questions ADD COLUMN round VARCHAR(20) NULL`);
  } catch (e) { console.log('questions 表列迁移跳过：' + e.message); }
  const qn = await seedQuestionsIfEmpty();
  if (qn) console.log('题库已导入 MySQL：' + qn + ' 道题（questions 表）');
  const sn = await syncBuiltInQuestions();
  if (sn) console.log('题库同步：本次从 shared.js 补充内置题 ' + sn + ' 道（INSERT IGNORE，不动已有数据）');
  const BIND = process.env.BIND_HOST || CONFIG.bindHost || '0.0.0.0';
  server.listen(PORT, BIND, () => {
    console.log('模拟面试训练营 Pro · 本地后端已启动（MySQL 存储版）');
    console.log('  访问地址 : http://localhost:' + PORT + (BIND === '127.0.0.1' ? '（仅本机可访问，经 Nginx 反代对外）' : ''));
    console.log('  监听地址 : ' + BIND + ':' + PORT);
    console.log('  前端页面由本服务静态托管，/api 与页面同域');
    console.log('  数据库   : MySQL ' + MYSQL.host + ':' + MYSQL.port + '/' + MYSQL.database);
    console.log('  按 Ctrl+C 停止');
  });
}
main();
