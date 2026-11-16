(function (global) {
  'use strict';

  /* 服务器 AI 状态缓存 */
  var _status = { enabled: null, model: '' };

  function getToken() {
    /* 与 shared.js 的 */
    try {
      var v = localStorage.getItem('ivsim_token');
      if (!v) return null;
      try { return JSON.parse(v) || null; } catch (e) { return v; }
    } catch (e) { return null; }
  }

  /* 拉取服务器 AI 状态 */
  function refreshStatus() {
    return fetch('/api/ai/status').then(function (r) { return r.json(); }).then(function (j) {
      _status.enabled = !!(j && j.enabled);
      _status.model = (j && j.model) || '';
      return _status.enabled;
    })['catch'](function () { _status.enabled = false; return false; });
  }
  try { refreshStatus(); } catch (e) {}

  /* 已配置且可能可用 */
  function isConfigured() { return _status.enabled !== false; }
  /* 兼容 interview. */
  function isCloud() { return isConfigured(); }
  function serverModel() { return _status.model || ''; }

  function buildMessages(sys, messages) {
    var msgs = [];
    if (sys) msgs.push({ role: 'system', content: String(sys) });
    (messages || []).forEach(function (m) {
      if (m && m.role && m.content != null) msgs.push({ role: m.role, content: String(m.content) });
    });
    return msgs;
  }

  /* 原始请求 */
  function rawChat(messages, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    var body = { messages: messages, stream: !!opts.stream };
    if (opts.json) body.json = true; /* 后端据此向上游带 response_format */
    return fetch('/api/ai/chat', { method: 'POST', headers: headers, body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok) {
          return r.json()['catch'](function () { return {}; }).then(function (j) {
            throw { http: r.status, msg: (j && j.msg) || ('HTTP ' + r.status), aiDisabled: !!(j && j.aiDisabled), noConfig: !!(j && j.aiDisabled) };
          });
        }
        return r;
      });
  }

    function aiText(sys, messages) {
    return rawChat(buildMessages(sys, messages), {}).then(function (r) { return r.json(); })
      .then(function (j) {
        var t = j && j.ok && j.text;
        if (!t) throw { empty: true };
        return String(t);
      });
  }

    function aiStream(sys, messages, onToken) {
    return rawChat(buildMessages(sys, messages), { stream: true }).then(function (r) {
      if (!r.body || !r.body.getReader) {
        /* 浏览器不支持流式读取，降级为整包文本 */
        return r.json().then(function (j) {
          var t = (j && j.ok && j.text) || '';
          if (onToken && t) onToken(t, t);
          return t;
        });
      }
      var reader = r.body.getReader();
      var dec = new TextDecoder();
      var buf = '', full = '';
      function pump() {
        return reader.read().then(function (ch) {
          if (ch.done) { if (onToken) onToken(null, full); return full; }
          buf += dec.decode(ch.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop() || '';
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.indexOf('data:') !== 0) continue;
            var data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              var j = JSON.parse(data);
              var d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
              if (d) { full += d; if (onToken) onToken(d, full); }
            } catch (e) { /* 某些厂商会插入心跳行，忽略 */ }
          }
          return pump();
        });
      }
      return pump();
    });
  }

  /* 从模型输出里抠出 JSON */
  function extractJson(text) {
    if (!text) return null;
    var t = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
    var s = t.indexOf('{'), e = t.lastIndexOf('}');
    if (s >= 0 && e > s) {
      try { return JSON.parse(t.slice(s, e + 1)); } catch (err) {}
    }
    try { return JSON.parse(t); } catch (e) { return null; }
  }

  /* 强制 JSON */
  function aiJson(sys, messages) {
    return rawChat(buildMessages(sys, messages), { json: true }).then(function (r) { return r.json(); })
      .then(function (j) {
        var t = (j && j.ok && j.text) || '';
        var obj = extractJson(t);
        if (!obj) throw { badJson: true, text: t || '' };
        return obj;
      });
  }

  /* AI 训练教练 Agent */
  function aiAgent(messages) {
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    return fetch('/api/ai/agent', { method: 'POST', headers: headers, body: JSON.stringify({ messages: messages }) })
      .then(function (r) {
        if (!r.ok) {
          return r.json()['catch'](function () { return {}; }).then(function (j) {
            throw { http: r.status, msg: (j && j.msg) || ('HTTP ' + r.status), aiDisabled: !!(j && j.aiDisabled), noConfig: !!(j && j.aiDisabled), safety: !!(j && j.safety) };
          });
        }
        return r.json();
      })
      .then(function (j) {
        if (j && j.ok && j.text) return { text: String(j.text), steps: (j.steps || []).map(String) };
        throw { empty: true };
      });
  }

  /* Agent 流式版 */
  function aiAgentStream(messages, onStep, onDelta, onThink) {
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    return fetch('/api/ai/agent', { method: 'POST', headers: headers, body: JSON.stringify({ messages: messages, stream: true }) })
      .then(function (r) {
        if (!r.ok) {
          return r.json()['catch'](function () { return {}; }).then(function (j) {
            throw { http: r.status, msg: (j && j.msg) || ('HTTP ' + r.status), aiDisabled: !!(j && j.aiDisabled), safety: !!(j && j.safety) };
          });
        }
        if (!r.body || !r.body.getReader) return r.json().then(function (j) {
          return { text: (j && j.ok && j.text) || '', steps: (j && j.steps) || [] };
        });
        var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', steps = [], full = '';
        function pump() {
          return reader.read().then(function (ch) {
            if (ch.done) return { text: full, steps: steps, empty: !full };
            buf += dec.decode(ch.value, { stream: true });
            var parts = buf.split('\n\n'); buf = parts.pop() || '';
            var done = null;
            for (var i = 0; i < parts.length; i++) {
              var line = parts[i].trim();
              if (line.indexOf('data:') !== 0) continue;
              try {
                var ev = JSON.parse(line.slice(5).trim());
                if (ev.type === 'step') { steps.push(ev.tool); if (onStep) onStep(ev.label || ev.tool, ev.tool); }
                else if (ev.type === 'think') { if (onThink) onThink(String(ev.t || '')); }
                else if (ev.type === 'delta') { full += String(ev.t || ''); if (onDelta) onDelta(String(ev.t || ''), full); }
                else if (ev.type === 'reset') { full = ''; if (onDelta) onDelta(null, ''); }
                else if (ev.type === 'done') done = { text: String(ev.text || full || ''), steps: (ev.steps || steps).map(String) };
                else if (ev.type === 'error') throw { http: 502, msg: ev.msg || 'AI 服务异常' };
              } catch (e) { if (e && e.http) throw e; }
            }
            if (done) return done;
            return pump();
          });
        }
        return pump();
      })
      .then(function (res) {
        if (res && res.text) return res;
        throw { empty: true };
      });
  }

  /* 真 RAG 检索增强答题 */
  function aiAsk(question, history) {
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    return fetch('/api/ai/ask', {
      method: 'POST', headers: headers,
      body: JSON.stringify({ question: question, messages: (history || []).slice(-4) })
    }).then(function (r) {
      if (!r.ok) {
        return r.json()['catch'](function () { return {}; }).then(function (j) {
          throw { http: r.status, msg: (j && j.msg) || ('HTTP ' + r.status), aiDisabled: !!(j && j.aiDisabled), safety: !!(j && j.safety) };
        });
      }
      return r.json();
    }).then(function (j) {
      if (j && j.ok && j.text) {
        return { text: String(j.text), sources: (j.sources || []).map(function (s) {
          return { q: String(s.q || ''), scene: String(s.scene || ''), lv: Number(s.lv) || 1, score: Number(s.score) || 0 };
        }) };
      }
      throw { empty: true };
    });
  }

  var CLOUD = {
    isConfigured: isConfigured,
    isCloud: isCloud,
    serverModel: serverModel,
    refreshStatus: refreshStatus,
    aiText: aiText,
    aiStream: aiStream,
    aiJson: aiJson,
    aiAgent: aiAgent,
    aiAgentStream: aiAgentStream,
    aiAsk: aiAsk,
    extractJson: extractJson
  };

  global.CLOUD = CLOUD;
})(typeof window !== 'undefined' ? window : this);
