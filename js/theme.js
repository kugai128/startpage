// =========================================
// 主题切换模块
// =========================================

(function () {
  var STORAGE_KEY = 'theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function updateButtonIcon(theme) {
    // 兼容旧的外部按钮（如果存在）
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    }
    // 更新设置面板内的按钮
    var panelBtn = document.getElementById('panelThemeToggle');
    if (panelBtn) {
      panelBtn.textContent = theme === 'dark' ? '☀️ 深色模式' : '🌙 浅色模式';
    }
  }

  function initTheme() {
    var saved = getSavedTheme();
    var theme = saved || getSystemTheme();
    setTheme(theme);
    updateButtonIcon(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updateButtonIcon(next);
  }

  window.initTheme = initTheme;
  window.toggleTheme = toggleTheme;

  // 监听系统主题变化（仅当用户未手动选择时）
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!getSavedTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
      updateButtonIcon(e.matches ? 'dark' : 'light');
    }
  });

  // 页面加载时立即初始化
  initTheme();
})();
