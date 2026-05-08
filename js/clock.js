// =========================================
// 时钟模块 —— 冒号呼吸 + 秒脉冲 + 数字质感
// =========================================

(function () {
  var el = document.getElementById('clock');
  if (!el) return;

  var colon1, colon2;

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function build() {
    var now = new Date();
    var h = pad(now.getHours());
    var m = pad(now.getMinutes());
    var s = pad(now.getSeconds());
    el.innerHTML =
      '<span class="clock-digits">' + h + '</span>' +
      '<span class="clock-colon">:</span>' +
      '<span class="clock-digits">' + m + '</span>' +
      '<span class="clock-colon">:</span>' +
      '<span class="clock-digits">' + s + '</span>';
    colon1 = el.querySelectorAll('.clock-colon')[0];
    colon2 = el.querySelectorAll('.clock-colon')[1];
  }

  var prevSec = -1;

  function tick() {
    var now = new Date();
    var sec = now.getSeconds();
    var h = pad(now.getHours());
    var m = pad(now.getMinutes());
    var s = pad(sec);

    var digits = el.querySelectorAll('.clock-digits');
    digits[0].textContent = h;
    digits[1].textContent = m;
    digits[2].textContent = s;

    // 秒变化时触发冒号脉冲
    if (sec !== prevSec) {
      prevSec = sec;
      triggerPulse();
    }
  }

  function triggerPulse() {
    if (!colon1 || !colon2) return;
    // 移除再添加 class 以重启动画
    colon1.classList.remove('pulse');
    colon2.classList.remove('pulse');
    // 强制 reflow 让动画重新触发
    void colon1.offsetWidth;
    colon1.classList.add('pulse');
    colon2.classList.add('pulse');
  }

  build();
  setInterval(tick, 1000);
})();
