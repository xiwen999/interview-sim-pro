(function (global) {
  'use strict';

  var CFG_KEY = 'ivsim_ai_cfg';

  /* 常见厂商的 OpenAI 兼容端点预设，方便配置时一键填充 */
  var PRESETS = [
    { id: 'deepseek', name: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', temp: 0.7 },
    { id: 'qwen', name: '通义千问(兼容)', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', temp: 0.7 },
    { id: 'glm', name: '智谱 GLM', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', temp: 0.7 },
    { id: 'moonshot', name: '月之暗面 Kimi', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', temp: 0.7 },
    { id: 'openai', name: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', temp: 0.7 },
    { id: 'custom', name: '自定义(兼容)', base: '', model: '', temp: 0.7 }
  ];

  function getCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) { return {}; }
  }
  function setCfg(c) {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(c || {})); } catch (e) {}
  }
  function clearCfg() { try { localStorage.removeItem(CFG_KEY); } catch (e) {} }

  /* 已配置且可用：enabled 未关闭 + 三段信息齐全 */
  function isConfigured() {
    var c = getCfg();
    return c.enabled !== false && !!(c.apiKey && c.baseURL && c.model);
  }
  /* 兼容 interview.html 现有调用约定：CLOUD.isCloud() */
  function isCloud() { return isConfigured(); }

  function buildMessages(sys, messages) {
    var msgs = [];
    if (sys) msgs.push({ role: 'system', content: String(sys) });
    (messages || []).forEach(function (m) {
      if (m && m.role && m.content != null) msgs.push({ role: m.role, content: String(m.content) });
    });
    return msgs;
  }

  function reqHeaders(c) {
    var h = { 'Content-Type': 'application/json' };
    if (c.apiKey) h['Authorization'] = 'Bearer ' + c.apiKey;
    return h;
  }

  /* 原始请求：返回 fetch Response（调用方按需 json / stream）；失败 reject */
  function rawChat(messages, opts) {
    opts = opts || {};
    var c = getCfg();
    if (!isConfigured()) return Promise.reject({ noConfig: true });
    var url = String(c.baseURL).replace(/\/+$/, '') + '/chat/completions';
    var body = {
      model: c.model,
      messages: messages,
      stream: !!opts.stream,
      temperature: (typeof c.temperature === 'number') ? c.temperature : 0.7
    };
    if (opts.json) {
      /* 要求模型返回 JSON：OpenAI 系列支持 response_format；
         不支持的厂商会忽略该字段，调用方仍需 extractJson 容错。 */
      try { body.response_format = { type: 'json_object' }; } catch (e) {}
    }
    return fetch(url, { method: 'POST', headers: reqHeaders(c), body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) { throw { http: r.status, msg: t }; }, function () { throw { http: r.status }; });
        }
        return r;
      });
  }

  /* 非流式：返回完整文本 */
  function aiText(sys, messages) {
    return rawChat(buildMessages(sys, messages), {}).then(function (r) { return r.json(); })
      .then(function (j) {
        var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (!t) throw { empty: true };
        return String(t);
      });
  }

  /* 流式：onToken(delta, fullSoFar) 在每片到达时回调；resolve 完整文本 */
  function aiStream(sys, messages, onToken) {
    return rawChat(buildMessages(sys, messages), { stream: true }).then(function (r) {
      if (!r.body || !r.body.getReader) {
        /* 浏览器不支持流式读取，降级为整包文本 */
        return r.json().then(function (j) {
          var t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
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

  /* 从模型输出里抠出 JSON：去代码栅栏 → 找最外层 {} → 解析；失败返回 null */
  function extractJson(text) {
    if (!text) return null;
    var t = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
    var s = t.indexOf('{'), e = t.lastIndexOf('}');
    if (s >= 0 && e > s) {
      try { return JSON.parse(t.slice(s, e + 1)); } catch (err) {}
    }
    try { return JSON.parse(t); } catch (e) { return null; }
  }

  /* 强制 JSON：先尝试带 response_format 的请求，再 extractJson；
     解析失败 reject({badJson:true, text})，由调用方决定是否回退本地。 */
  function aiJson(sys, messages) {
    return rawChat(buildMessages(sys, messages), { json: true }).then(function (r) { return r.json(); })
      .then(function (j) {
        var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        var obj = extractJson(t);
        if (!obj) throw { badJson: true, text: t || '' };
        return obj;
      });
  }

  var CLOUD = {
    PRESETS: PRESETS,
    getCfg: getCfg,
    setCfg: setCfg,
    clearCfg: clearCfg,
    isConfigured: isConfigured,
    isCloud: isCloud,
    aiText: aiText,
    aiStream: aiStream,
    aiJson: aiJson,
    extractJson: extractJson
  };

  global.CLOUD = CLOUD;
})(typeof window !== 'undefined' ? window : this);
