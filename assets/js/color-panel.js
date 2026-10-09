(function () {
  'use strict';

  var STORAGE_KEY = 'chirpy-color-panel';
  var root = document.documentElement;

  // 默认配色预设
  var PRESETS = {
    claude_green: {
      name: 'Claude 绿',
      dark: { accent: '#9cc98f', accentDim: '#5e8a52', accentBright: '#bfe0b4', mainBg: '#000000', textColor: '#e8e8e8' },
      light: { accent: '#4a7c3f', accentDim: '#3a6230', accentBright: '#6ba85c', mainBg: '#ffffff', textColor: '#1a1a1a' }
    },
    chirpy_default: {
      name: 'Chirpy 默认',
      dark: { accent: 'rgb(138 180 248)', accentDim: 'rgb(82 108 150)', accentBright: 'rgb(138 180 248)', mainBg: 'rgb(27 27 30)', textColor: 'rgb(175 176 177)' },
      light: { accent: '#0056b2', accentDim: '#dee2e6', accentBright: '#0d6efd', mainBg: '#ffffff', textColor: '#34343c' }
    },
    geek_blue: {
      name: '极客蓝',
      dark: { accent: '#58a6ff', accentDim: '#388bfd', accentBright: '#79c0ff', mainBg: '#0d1117', textColor: '#c9d1d9' },
      light: { accent: '#0969da', accentDim: '#0550ae', accentBright: '#218bff', mainBg: '#ffffff', textColor: '#1f2328' }
    },
    mono_gray: {
      name: '极简灰',
      dark: { accent: '#a0a0a0', accentDim: '#707070', accentBright: '#c0c0c0', mainBg: '#1a1a1a', textColor: '#d0d0d0' },
      light: { accent: '#505050', accentDim: '#404040', accentBright: '#707070', mainBg: '#ffffff', textColor: '#1a1a1a' }
    }
  };

  // 当前模式
  function currentMode() {
    return root.getAttribute('data-bs-theme') || 'light';
  }

  // 应用颜色到 CSS 变量
  function applyColors(colors) {
    var mode = currentMode();
    var vals = colors[mode] || colors.light;
    root.style.setProperty('--accent', vals.accent);
    root.style.setProperty('--accent-dim', vals.accentDim);
    root.style.setProperty('--accent-bright', vals.accentBright);
    root.style.setProperty('--main-bg', vals.mainBg);
    root.style.setProperty('--text-color', vals.textColor);
    root.style.setProperty('--link-color', 'var(--accent)');
    root.style.setProperty('--link-underline-color', 'var(--accent-dim)');
    root.style.setProperty('--btn-backtotop-color', 'var(--accent)');
    root.style.setProperty('--btn-backtotop-border-color', 'var(--accent-dim)');
    root.style.setProperty('--sidebar-btn-color', 'var(--accent)');
    root.style.setProperty('--toc-highlight', 'var(--accent)');
    root.style.setProperty('--checkbox-checked-color', 'var(--accent)');
    root.style.setProperty('--tag-border', 'var(--accent-dim)');
    root.style.setProperty('--clipboard-checked-color', 'var(--accent)');
    root.style.setProperty('--btn-share-hover-color', 'var(--accent)');
    root.style.setProperty('--bs-primary', 'var(--accent)');
    root.style.setProperty('--bs-link-color', 'var(--accent)');
  }

  // 清除自定义颜色，恢复 CSS 默认
  function clearColors() {
    var props = [
      '--accent', '--accent-dim', '--accent-bright',
      '--main-bg', '--text-color',
      '--link-color', '--link-underline-color',
      '--btn-backtotop-color', '--btn-backtotop-border-color',
      '--sidebar-btn-color', '--toc-highlight',
      '--checkbox-checked-color', '--tag-border',
      '--clipboard-checked-color', '--btn-share-hover-color',
      '--bs-primary', '--bs-link-color'
    ];
    props.forEach(function (p) { root.style.removeProperty(p); });
  }

  // 保存 / 加载
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return null;
    }
  }

  // 创建面板 HTML
  function createPanel() {
    var overlay = document.createElement('div');
    overlay.id = 'color-panel-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.4);transition:opacity .2s';

    var panel = document.createElement('div');
    panel.id = 'color-panel';
    panel.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;width:360px;max-width:90vw;max-height:80vh;overflow-y:auto;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);background:var(--card-bg,#1e1e1e);border:1px solid var(--main-border-color,#333);color:var(--text-color,#e8e8e8);font-family:system-ui,sans-serif;font-size:14px';

    panel.innerHTML = '\
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--main-border-color,#333)">\
        <span style="font-weight:600;font-size:16px">配色面板</span>\
        <button id="color-panel-close" style="background:none;border:none;color:inherit;font-size:22px;cursor:pointer;line-height:1;padding:0">x</button>\
      </div>\
      <div style="padding:16px 20px">\
        <div style="font-weight:600;margin-bottom:10px">预设方案</div>\
        <div id="color-presets" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px"></div>\
        \
        <div style="font-weight:600;margin-bottom:10px">自定义颜色</div>\
        <div id="color-inputs" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px"></div>\
        \
        <div style="display:flex;gap:8px">\
          <button id="color-reset" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--main-border-color,#333);background:transparent;color:inherit;cursor:pointer">重置默认</button>\
          <button id="color-save" style="flex:1;padding:8px;border-radius:8px;border:none;background:var(--accent,#9cc98f);color:#000;cursor:pointer;font-weight:600">保存</button>\
        </div>\
      </div>';

    // 浮动按钮
    var fab = document.createElement('button');
    fab.id = 'color-panel-fab';
    fab.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9997;width:44px;height:44px;border-radius:50%;border:1px solid var(--main-border-color,#333);background:var(--card-bg,#1e1e1e);color:var(--text-color,#e8e8e8);cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:18px;transition:transform .15s';
    fab.innerHTML = '&#9881;';
    fab.title = '配色面板';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    return { overlay: overlay, panel: panel, fab: fab };
  }

  // 填充预设
  function fillPresets(container) {
    Object.keys(PRESETS).forEach(function (key) {
      var preset = PRESETS[key];
      var btn = document.createElement('button');
      btn.dataset.preset = key;
      var mode = currentMode();
      var c = preset[mode] || preset.light;
      btn.style.cssText = 'padding:6px 12px;border-radius:8px;border:1px solid ' + (c.accentDim || c.accent) + ';background:' + c.mainBg + ';color:' + c.accent + ';cursor:pointer;font-size:13px';
      btn.textContent = preset.name;
      container.appendChild(btn);
    });
  }

  // 填充自定义颜色输入
  function fillInputs(container) {
    var fields = [
      { key: 'accent', label: '强调色' },
      { key: 'mainBg', label: '背景色' },
      { key: 'textColor', label: '文字色' }
    ];
    fields.forEach(function (f) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between';
      row.innerHTML = '<label style="flex:1">' + f.label + '</label>';
      var input = document.createElement('input');
      input.type = 'color';
      input.dataset.field = f.key;
      input.style.cssText = 'width:50px;height:30px;border:1px solid var(--main-border-color,#333);border-radius:6px;cursor:pointer;background:none';
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  // 获取当前输入的颜色
  function getInputColors() {
    var inputs = document.querySelectorAll('#color-inputs input[type=color]');
    var mode = currentMode();
    var colors = {};
    colors[mode] = {};
    inputs.forEach(function (inp) {
      colors[mode][inp.dataset.field] = inp.value;
    });
    // 自动推算 accentDim 和 accentBright
    colors[mode].accentDim = shadeColor(colors[mode].accent, -20);
    colors[mode].accentBright = shadeColor(colors[mode].accent, 20);
    return colors;
  }

  // 颜色加深/变浅
  function shadeColor(hex, percent) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    r = Math.max(0, Math.min(255, r + Math.round(255 * percent / 100)));
    g = Math.max(0, Math.min(255, g + Math.round(255 * percent / 100)));
    b = Math.max(0, Math.min(255, b + Math.round(255 * percent / 100)));
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }

  // 初始化
  function init() {
    var ui = createPanel();
    fillPresets(document.getElementById('color-presets'));
    fillInputs(document.getElementById('color-inputs'));

    // 加载已保存的状态
    var saved = loadState();
    if (saved && saved.preset) {
      applyColors(PRESETS[saved.preset]);
      highlightPreset(saved.preset);
    } else if (saved && saved.custom) {
      applyColors(saved.custom);
      syncInputs(saved.custom);
    }

    // 浮动按钮点击
    ui.fab.addEventListener('click', function () {
      ui.overlay.style.display = 'block';
      ui.panel.style.display = 'block';
    });

    // 关闭
    document.getElementById('color-panel-close').addEventListener('click', closePanel);
    ui.overlay.addEventListener('click', closePanel);

    function closePanel() {
      ui.overlay.style.display = 'none';
      ui.panel.style.display = 'none';
    }

    // 预设点击
    document.querySelectorAll('#color-presets button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.preset;
        applyColors(PRESETS[key]);
        highlightPreset(key);
        syncInputs(PRESETS[key]);
      });
    });

    // 自定义颜色实时预览
    document.querySelectorAll('#color-inputs input[type=color]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        applyColors(getInputColors());
      });
    });

    // 保存
    document.getElementById('color-save').addEventListener('click', function () {
      // 检查是否选了预设
      var activePreset = document.querySelector('#color-presets button.active');
      if (activePreset) {
        saveState({ preset: activePreset.dataset.preset, custom: null });
      } else {
        saveState({ preset: null, custom: getInputColors() });
      }
      closePanel();
    });

    // 重置
    document.getElementById('color-reset').addEventListener('click', function () {
      clearColors();
      localStorage.removeItem(STORAGE_KEY);
      highlightPreset(null);
      // 恢复输入框为默认值
      var mode = currentMode();
      var defaults = PRESETS.claude_green[mode] || PRESETS.claude_green.light;
      syncInputs({ light: defaults, dark: defaults });
    });

    // FAB hover 效果
    ui.fab.addEventListener('mouseenter', function () {
      ui.fab.style.transform = 'scale(1.1)';
    });
    ui.fab.addEventListener('mouseleave', function () {
      ui.fab.style.transform = 'scale(1)';
    });
  }

  function highlightPreset(key) {
    document.querySelectorAll('#color-presets button').forEach(function (btn) {
      if (btn.dataset.preset === key) {
        btn.classList.add('active');
        btn.style.outline = '2px solid var(--accent)';
        btn.style.outlineOffset = '2px';
      } else {
        btn.classList.remove('active');
        btn.style.outline = 'none';
      }
    });
  }

  function syncInputs(colors) {
    var mode = currentMode();
    var vals = colors[mode] || colors.light || colors;
    if (vals) {
      document.querySelectorAll('#color-inputs input[type=color]').forEach(function (inp) {
        if (vals[inp.dataset.field]) {
          inp.value = vals[inp.dataset.field];
        }
      });
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
