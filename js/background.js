// =========================================
// 自定义背景更换模块
// =========================================

(function () {
  var BG_STORAGE_TYPE = 'bg_type';
  var BG_STORAGE_VALUE = 'bg_value';
  var BG_STORAGE_CONTROL = 'bg_control_theme';

  var PRESETS = [
    { id: '棉花糖', name: '棉花糖', bg: 'linear-gradient(135deg, #e0f0f8 0%, #fff0f3 100%)', controlTheme: 'light' },
    { id: '薄荷奶绿', name: '薄荷奶绿', bg: 'linear-gradient(135deg, #e0f8f0 0%, #f0f8ff 100%)', controlTheme: 'light' },
    { id: '日落橙粉', name: '日落橙粉', bg: 'linear-gradient(135deg, #ffe8d6 0%, #ffd6e0 100%)', controlTheme: 'light' },
    { id: '星空暗蓝', name: '星空暗蓝', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', controlTheme: 'dark' },
    { id: '深夜紫黑', name: '深夜紫黑', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)', controlTheme: 'dark' }
  ];

  function loadBgType() {
    try { return localStorage.getItem(BG_STORAGE_TYPE); } catch (e) { return null; }
  }

  function loadBgValue() {
    try { return localStorage.getItem(BG_STORAGE_VALUE); } catch (e) { return null; }
  }

  function loadControlTheme() {
    try { return localStorage.getItem(BG_STORAGE_CONTROL); } catch (e) { return null; }
  }

  function saveBg(type, value, controlTheme) {
    try {
      localStorage.setItem(BG_STORAGE_TYPE, type);
      localStorage.setItem(BG_STORAGE_VALUE, value);
      localStorage.setItem(BG_STORAGE_CONTROL, controlTheme);
    } catch (e) {}
  }

  function applyBackground(type, value, controlTheme) {
    document.body.style.background = value;
    if (type === 'custom') {
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = '';
    } else {
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = 'fixed';
    }
    document.body.setAttribute('data-control-theme', controlTheme);
    updateThumbnailSelection(type);
  }

  function initBackground() {
    var type = loadBgType();
    var value = loadBgValue();
    var controlTheme = loadControlTheme();

    if (type && value) {
      applyBackground(type, value, controlTheme || 'light');
    } else {
      var defaultPreset = PRESETS[0];
      applyBackground('preset:' + defaultPreset.id, defaultPreset.bg, defaultPreset.controlTheme);
    }
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.className = 'settings-panel';
    panel.id = 'settingsPanel';

    panel.innerHTML =
      '<div class="settings-panel-inner">' +
        '<h4 class="settings-title">外观设置</h4>' +
        '<div class="settings-section">' +
          '<div class="settings-label">深色模式</div>' +
          '<button class="settings-theme-btn" id="panelThemeToggle" onclick="toggleTheme()">🌙 浅色模式</button>' +
        '</div>' +
        '<div class="settings-section">' +
          '<div class="settings-label">背景</div>' +
          '<div class="bg-thumbnails" id="bgThumbnails"></div>' +
          '<input type="file" id="bgFileInput" accept="image/*" style="display:none">' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);
    renderThumbnails();
    syncThemeBtnText();

    var fileInput = document.getElementById('bgFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', onFileSelect);
    }
  }

  function syncThemeBtnText() {
    var panelBtn = document.getElementById('panelThemeToggle');
    if (!panelBtn) return;
    var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    panelBtn.textContent = currentTheme === 'dark' ? '☀️ 深色模式' : '🌙 浅色模式';
  }

  function renderThumbnails() {
    var grid = document.getElementById('bgThumbnails');
    if (!grid) return;

    PRESETS.forEach(function (p) {
      var thumb = document.createElement('div');
      thumb.className = 'bg-thumb';
      thumb.style.background = p.bg;
      thumb.title = p.name;
      thumb.dataset.type = 'preset:' + p.id;
      thumb.dataset.value = p.bg;
      thumb.dataset.control = p.controlTheme;
      thumb.addEventListener('click', function () {
        applyBackground(thumb.dataset.type, thumb.dataset.value, thumb.dataset.control);
        saveBg(thumb.dataset.type, thumb.dataset.value, thumb.dataset.control);
        // 深色背景自动建议切换深色模式（可选联动）
        if (thumb.dataset.control === 'dark') {
          var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          if (currentTheme === 'light') {
            // 静默提示用户可手动切换，不强制
          }
        }
      });
      grid.appendChild(thumb);
    });

    var addBtn = document.createElement('div');
    addBtn.className = 'bg-thumb bg-thumb-add';
    addBtn.textContent = '+';
    addBtn.title = '自定义背景';
    addBtn.addEventListener('click', function () {
      var input = document.getElementById('bgFileInput');
      if (input) input.click();
    });
    grid.appendChild(addBtn);
  }

  function onFileSelect(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (evt) {
      var base64 = evt.target.result;
      var bgValue = 'url(' + base64 + ')';
      applyBackground('custom', bgValue, 'light');
      saveBg('custom', bgValue, 'light');
    };
    reader.readAsDataURL(file);

    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  }

  function updateThumbnailSelection(type) {
    var thumbs = document.querySelectorAll('.bg-thumb');
    thumbs.forEach(function (t) {
      if (t.dataset.type === type) {
        t.classList.add('is-active');
      } else {
        t.classList.remove('is-active');
      }
    });
  }

  function bindSettingsBtn() {
    var btn = document.getElementById('settingsBtn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var panel = document.getElementById('settingsPanel');
      if (!panel) {
        createPanel();
        panel = document.getElementById('settingsPanel');
      }
      // 同步当前主题按钮文字
      syncThemeBtnText();
      panel.classList.toggle('is-open');
    });

    // 点击外部关闭
    document.addEventListener('click', function (e) {
      var panel = document.getElementById('settingsPanel');
      if (panel && panel.classList.contains('is-open')) {
        if (!panel.contains(e.target) && e.target.id !== 'settingsBtn') {
          panel.classList.remove('is-open');
        }
      }
    });
  }

  // 监听主题变化，同步面板按钮文字
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'data-theme') {
        syncThemeBtnText();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  // 暴露接口
  window.initBackground = initBackground;
  window.applyBackground = applyBackground;

  // 初始化
  initBackground();
  bindSettingsBtn();
})();
