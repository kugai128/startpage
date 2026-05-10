// =========================================
// 时间问候语模块
// =========================================

(function () {
  // 问候文案配置（集中管理，方便修改）
  var RULES = [
    { from: 5,  to: 10, text: '早安，今天也要加油哦~' },
    { from: 11, to: 13, text: '午安，记得好好吃饭' },
    { from: 14, to: 17, text: '下午好，休息一下眼睛吧' },
    { from: 18, to: 21, text: '晚上好呀，今天过得怎么样~' },
    { from: 22, to: 4,  text: '已经很晚了，早点休息吧' }
  ];

  function getGreeting() {
    var h = new Date().getHours();
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      if (r.from <= r.to) {
        if (h >= r.from && h <= r.to) return r.text;
      } else {
        // 跨午夜：22:00 - 04:59
        if (h >= r.from || h <= r.to) return r.text;
      }
    }
    return RULES[0].text;
  }

  var el = document.getElementById('greetingText');
  if (!el) return;

  // 立即显示
  el.textContent = getGreeting();

  // 每小时自动刷新（带淡入淡出过渡）
  var greetingTimeout = null;
  var greetingInterval = setInterval(function () {
    el.style.opacity = '0';
    greetingTimeout = setTimeout(function () {
      el.textContent = getGreeting();
      el.style.opacity = '1';
      greetingTimeout = null;
    }, 200);
  }, 3600000);

  window.addEventListener('beforeunload', function () {
    clearInterval(greetingInterval);
    if (greetingTimeout) clearTimeout(greetingTimeout);
  });
})();
