/**
 * 背景氛围层 —— 漂浮微粒（阳光尘埃）
 * 子系统 B：z-index 2，位于光斑之上、内容之下
 */
(function () {
  const container = document.getElementById('ambientParticles');
  if (!container) return;

  const PARTICLE_COUNT = 50; // 保持 40~60 之间

  const SHAPE_SVGS = {
    // 四角星 ✦（实心四芒，稍大）
    star4:
      '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 1.5l2.8 7.7 7.7 2.8-7.7 2.8-2.8 7.7-2.8-7.7L1.5 12l7.7-2.8z"/></svg>',
    // 圆泡泡 ○（空心圈 + 中心点）
    bubble:
      '<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
    // 小十字星 ✧（细线空心四角星，更精致小巧）
    cross:
      '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/></svg>'
  };

  const SHAPES = Object.keys(SHAPE_SVGS);

  // 最终视觉透明度统一控制在 30% ~ 55%
  // 不同形状视觉重量不同：实心星偏大、空心圈适中、细线星偏小
  // 用 alpha 池微调，让三者肉眼亮度接近
  const COLORS = {
    star4: [
      'rgba(255, 255, 250, 0.30)',
      'rgba(255, 255, 250, 0.40)',
      'rgba(255, 183, 165, 0.35)',
      'rgba(255, 230, 220, 0.38)'
    ],
    bubble: [
      'rgba(255, 255, 250, 0.40)',
      'rgba(255, 255, 250, 0.55)',
      'rgba(255, 183, 165, 0.45)',
      'rgba(255, 230, 220, 0.48)'
    ],
    cross: [
      'rgba(255, 255, 250, 0.42)',
      'rgba(255, 255, 250, 0.55)',
      'rgba(255, 183, 165, 0.50)',
      'rgba(255, 230, 220, 0.52)'
    ]
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  class Particle {
    constructor() {
      this.el = document.createElement('div');
      this.el.className = 'ambient-particle';
      this.reset(true);
      container.appendChild(this.el);
    }

    reset(initial) {
      const shape = pick(SHAPES);
      this.el.innerHTML = SHAPE_SVGS[shape];

      // 大小 6px ~ 18px
      const size = rand(6, 18);
      this.el.style.width = size + 'px';
      this.el.style.height = size + 'px';
      this.el.style.color = pick(COLORS[shape]);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 40;
      const diagonal = Math.sqrt(vw * vw + vh * vh);

      // 方向类型：四边 + 四角对角线，共 8 种
      const dir = randInt(0, 7);

      // 根据方向设定起点与方向向量，同时计算该方向的真实穿越距离
      let travelDistance;
      switch (dir) {
        case 0: // 左 → 右（略偏上下）
          this.x = -margin;
          this.y = rand(0, vh);
          this.vx = rand(0.8, 1.2);
          this.vy = rand(-0.3, 0.3);
          travelDistance = vw + margin * 2;
          break;
        case 1: // 右 → 左
          this.x = vw + margin;
          this.y = rand(0, vh);
          this.vx = -rand(0.8, 1.2);
          this.vy = rand(-0.3, 0.3);
          travelDistance = vw + margin * 2;
          break;
        case 2: // 上 → 下
          this.x = rand(0, vw);
          this.y = -margin;
          this.vx = rand(-0.3, 0.3);
          this.vy = rand(0.8, 1.2);
          travelDistance = vh + margin * 2;
          break;
        case 3: // 下 → 上
          this.x = rand(0, vw);
          this.y = vh + margin;
          this.vx = rand(-0.3, 0.3);
          this.vy = -rand(0.8, 1.2);
          travelDistance = vh + margin * 2;
          break;
        case 4: // 左下 → 右上（对角线）
          this.x = -margin;
          this.y = vh + margin;
          this.vx = rand(0.8, 1.2);
          this.vy = -rand(0.8, 1.2);
          travelDistance = diagonal + margin * 2;
          break;
        case 5: // 左上 → 右下（对角线）
          this.x = -margin;
          this.y = -margin;
          this.vx = rand(0.8, 1.2);
          this.vy = rand(0.8, 1.2);
          travelDistance = diagonal + margin * 2;
          break;
        case 6: // 右下 → 左上（对角线）
          this.x = vw + margin;
          this.y = vh + margin;
          this.vx = -rand(0.8, 1.2);
          this.vy = -rand(0.8, 1.2);
          travelDistance = diagonal + margin * 2;
          break;
        case 7: // 右上 → 左下（对角线）
          this.x = vw + margin;
          this.y = -margin;
          this.vx = -rand(0.8, 1.2);
          this.vy = rand(0.8, 1.2);
          travelDistance = diagonal + margin * 2;
          break;
      }

      // 速度标量：按真实穿越距离计算，确保 30~60 秒完成一次穿越
      this.speed = travelDistance / rand(30, 60);

      // 正弦波摆动参数（垂直于运动方向的微风偏移）
      this.sineAmp = rand(12, 32);      // 摆动幅度（px）
      this.sineFreq = rand(0.6, 1.8);   // 生命周期内震荡几圈
      this.sinePhase = rand(0, Math.PI * 2);
      this.time = 0;
      this.life = rand(60, 100);        // 生命周期足够长，避免中途凭空消失

      if (initial) {
        // 初始时随机散布在屏幕内，并赋予已流逝的时间
        this.x = rand(0, vw);
        this.y = rand(0, vh);
        this.time = rand(0, this.life * 0.6);
      }

      this.updateTransform();
    }

    update(dt) {
      this.time += dt;

      const vLen = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
      const dist = this.speed * dt;
      this.x += (this.vx / vLen) * dist;
      this.y += (this.vy / vLen) * dist;

      // 垂直于运动方向的正弦波偏移
      const progress = this.time / this.life;
      const sine = Math.sin(progress * Math.PI * 2 * this.sineFreq + this.sinePhase) * this.sineAmp;
      const perpX = -this.vy / vLen;
      const perpY = this.vx / vLen;

      const drawX = this.x + perpX * sine;
      const drawY = this.y + perpY * sine;

      this.el.style.transform = 'translate3d(' + drawX.toFixed(1) + 'px, ' + drawY.toFixed(1) + 'px, 0)';

      // 边界与寿命检查
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const boundMargin = 80;
      if (
        drawX < -boundMargin ||
        drawX > vw + boundMargin ||
        drawY < -boundMargin ||
        drawY > vh + boundMargin ||
        this.time > this.life
      ) {
        this.reset();
      }
    }

    updateTransform() {
      this.el.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px, ' + this.y.toFixed(1) + 'px, 0)';
    }
  }

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    particles.forEach(function (p) {
      p.update(dt);
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
