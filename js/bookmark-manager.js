// =========================================
// 书签网格管理模块
// =========================================

(function () {
  var STORAGE_KEY = 'bookmarks';

  var PRESETS = [
    { id: 'p1', name: 'B站', url: 'https://bilibili.com', iconUrl: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=128' },
    { id: 'p2', name: 'Google', url: 'https://google.com', iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128' },
    { id: 'p3', name: 'ChatGPT', url: 'https://chat.openai.com', iconUrl: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=128' },
    { id: 'p4', name: 'GitHub', url: 'https://github.com', iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128' }
  ];

  var FALLBACK_SOURCES = [
    function (domain) { return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=128'; },
    function (domain) { return 'https://icons.duckduckgo.com/ip3/' + domain + '.ico'; }
  ];

  var siteNameMap = {
    'github.com': 'GitHub',
    'bilibili.com': 'B站',
    'google.com': 'Google',
    'youtube.com': 'YouTube',
    'zhihu.com': '知乎',
    'baidu.com': '百度',
    'bing.com': 'Bing',
    'douban.com': '豆瓣',
    'taobao.com': '淘宝',
    'jd.com': '京东',
    'weibo.com': '微博',
    'x.com': 'X',
    'twitter.com': 'Twitter',
    'reddit.com': 'Reddit',
    'stackoverflow.com': 'StackOverflow'
  };

  var grid = document.getElementById('bookmarkGrid');
  var modal = null;
  var editingId = null;

  // ---------- 工具函数 ----------

  function genId() {
    return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function extractDomain(url) {
    try {
      var u = new URL(url);
      var hostname = u.hostname;
      if (hostname.indexOf('www.') === 0) hostname = hostname.slice(4);
      return hostname;
    } catch (e) {
      var s = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      var slash = s.indexOf('/');
      if (slash !== -1) s = s.slice(0, slash);
      var colon = s.indexOf(':');
      if (colon !== -1) s = s.slice(0, colon);
      return s;
    }
  }

  var URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

  function normalizeUrl(url) {
    return url.trim().replace(/\n/g, '');
  }

  function isValidUrl(url) {
    return URL_REGEX.test(normalizeUrl(url));
  }

  function getDomain(url) {
    try { return new URL(url).hostname; } catch (e) { return ''; }
  }

  /* === favicon 圆形适配：B站检测 === */
  function isBilibili(url) {
    var d = getDomain(url);
    return /bilibili|b23\.tv/i.test(d);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  // ---------- favicon 探测 ----------

  function probeFavicon(domain, idx, cb) {
    if (!domain || idx >= FALLBACK_SOURCES.length) { cb(''); return; }
    var src = FALLBACK_SOURCES[idx](domain);
    var img = new Image();
    img.onload = function () { cb(src); };
    img.onerror = function () { probeFavicon(domain, idx + 1, cb); };
    img.src = src;
  }

  function autoFavicon(url, cb) {
    var domain = getDomain(url);
    if (!domain) { cb(''); return; }
    probeFavicon(domain, 0, cb);
  }

  // ---------- 渲染 ----------

  function render(data, animate) {
    grid.innerHTML = '';

    if (data.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'bookmark-empty';
      empty.textContent = '这里空空的呢，点 + 号添加一个吧~';
      grid.appendChild(empty);
    }

    data.forEach(function (bm, i) {
      var card = createCard(bm, animate ? i : -1);
      grid.appendChild(card);
    });

    var addBtn = createAddBtn();
    grid.appendChild(addBtn);
  }

  function createCard(bm, animIdx) {
    var card = document.createElement('div');
    card.className = 'bookmark-card';
    card.dataset.id = bm.id;

    if (animIdx >= 0) {
      card.classList.add('entering');
      card.style.animationDelay = (animIdx * 0.1) + 's';
      card.addEventListener('animationend', function () {
        card.classList.remove('entering');
        card.style.animationDelay = '';
      }, { once: true });
    }

    // 圆形图标容器
    var wrap = document.createElement('a');
    wrap.className = 'bookmark-icon-wrap';
    wrap.href = bm.url;
    wrap.setAttribute('aria-label', bm.name);

    /* === favicon 圆形适配：圆形遮罩 + B站首字母兜底 === */
    if (bm.iconUrl && !isBilibili(bm.url)) {
      var mask = document.createElement('div');
      mask.className = 'bookmark-favicon-wrap';
      var img = document.createElement('img');
      img.className = 'bookmark-favicon';
      img.src = bm.iconUrl;
      img.alt = '';
      img.onerror = function () {
        showInitial(wrap, bm.name);
      };
      mask.appendChild(img);
      wrap.appendChild(mask);
    } else {
      showInitial(wrap, bm.name);
    }

    // 编辑按钮
    var editBtn = document.createElement('button');
    editBtn.className = 'bookmark-action bookmark-edit';
    editBtn.setAttribute('aria-label', '编辑');
    editBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="#5A4A42" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3z"/></svg>';
    editBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal(bm);
    });
    wrap.appendChild(editBtn);

    // 删除按钮
    var delBtn = document.createElement('button');
    delBtn.className = 'bookmark-action bookmark-delete';
    delBtn.setAttribute('aria-label', '删除');
    delBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="#5A4A42" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>';
    delBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeBookmark(bm.id, card);
    });
    wrap.appendChild(delBtn);

    card.appendChild(wrap);

    // 名称
    var name = document.createElement('span');
    name.className = 'bookmark-name';
    name.textContent = bm.name;
    name.title = bm.name;
    card.appendChild(name);

    return card;
  }

  /* === favicon 圆形适配：fallback 时移除整个遮罩层 === */
  function showInitial(wrap, name) {
    // 移除可能已有的 favicon 遮罩层
    var oldMask = wrap.querySelector('.bookmark-favicon-wrap');
    if (oldMask) oldMask.remove();
    var old = wrap.querySelector('.bookmark-initial');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'bookmark-initial';
    div.textContent = (name || '?')[0].toUpperCase();
    wrap.insertBefore(div, wrap.firstChild);
  }

  function createAddBtn() {
    var wrapper = document.createElement('div');
    wrapper.className = 'bookmark-add';

    var btn = document.createElement('button');
    btn.className = 'bookmark-add-btn';
    btn.setAttribute('aria-label', '添加书签');
    btn.innerHTML = '<span>+</span>';
    btn.addEventListener('click', function () { openModal(); });

    var label = document.createElement('span');
    label.className = 'bookmark-add-label';
    label.textContent = '添加';

    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    return wrapper;
  }

  // ---------- 增删改 ----------

  function addBookmark(data, bm) {
    data.push(bm);
    save(data);
    render(data, true);
  }

  function updateBookmark(data, bm) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === bm.id) {
        data[i] = bm;
        break;
      }
    }
    save(data);
    render(data, false);
  }

  function removeBookmark(id, cardEl) {
    cardEl.classList.add('removing');
    cardEl.addEventListener('animationend', function () {
      var data = load() || [];
      data = data.filter(function (b) { return b.id !== id; });
      save(data);
      render(data, false);
    }, { once: true });
  }

  // ---------- 弹窗 ----------

  function createModal() {
    var overlay = document.createElement('div');
    overlay.className = 'bm-overlay';

    overlay.innerHTML =
      '<div class="bm-modal">' +
        '<h3 id="bmTitle">添加书签</h3>' +
        '<div class="bm-preview" id="bmPreview">' +
          '<div class="bookmark-initial" id="bmPreviewInitial">?</div>' +
        '</div>' +
        '<input class="bm-field" id="bmName" placeholder="网站名称（可不填）" maxlength="30">' +
        '<input class="bm-field" id="bmUrl" placeholder="网址  https://...">' +
        '<div class="bm-url-error" id="bmUrlError">请输入正确的网址哦~</div>' +
        '<button class="bm-submit" id="bmSubmit">保存</button>' +
        '<button class="bm-cancel" id="bmCancel">取消</button>' +
      '</div>';

    document.body.appendChild(overlay);
    modal = overlay;

    // 点击遮罩关闭
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // 网址输入 → 自动预览
    var urlInput = document.getElementById('bmUrl');
    var urlError = document.getElementById('bmUrlError');
    var previewTimer = null;
    urlInput.addEventListener('input', function () {
      clearTimeout(previewTimer);
      // 实时校验
      var val = normalizeUrl(urlInput.value);
      if (val && !isValidUrl(val)) {
        urlInput.classList.add('is-invalid');
        urlError.classList.add('show');
      } else {
        urlInput.classList.remove('is-invalid');
        urlError.classList.remove('show');
      }
      previewTimer = setTimeout(function () {
        updatePreview(urlInput.value.trim());
      }, 500);
    });

    // 网址失焦 → 自动补全协议、填充名称并立即刷新预览
    urlInput.addEventListener('blur', function () {
      var nameInput = document.getElementById('bmName');
      var val = normalizeUrl(urlInput.value);
      // 自动补全协议
      if (val && !/^https?:\/\//i.test(val)) {
        urlInput.value = 'https://' + val;
        val = urlInput.value;
      }
      if (!nameInput.value.trim()) {
        var domain = extractDomain(val);
        if (domain) {
          nameInput.value = siteNameMap[domain] || (domain.charAt(0).toUpperCase() + domain.slice(1));
        }
      }
      updatePreview(val);
      // 校验
      if (val && !isValidUrl(val)) {
        urlInput.classList.add('is-invalid');
        urlError.classList.add('show');
      } else {
        urlInput.classList.remove('is-invalid');
        urlError.classList.remove('show');
      }
    });

    // 预览区点击刷新
    document.getElementById('bmPreview').addEventListener('click', function () {
      updatePreview(urlInput.value.trim());
    });

    // 提交
    document.getElementById('bmSubmit').addEventListener('click', function () {
      var nameInput = document.getElementById('bmName');
      var urlInputEl = document.getElementById('bmUrl');
      var url = normalizeUrl(urlInputEl.value);
      var name = nameInput.value.trim();

      // 强制前缀 https://
      if (url && !/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
        urlInputEl.value = url;
      }

      // 校验阻断
      if (!url || !isValidUrl(url)) {
        urlInputEl.classList.add('is-shaking');
        setTimeout(function () { urlInputEl.classList.remove('is-shaking'); }, 300);
        urlError.textContent = '这个地址看起来不对呢，检查一下再试试吧~';
        urlError.classList.add('show');
        urlInputEl.classList.add('is-invalid');
        return;
      }

      urlError.classList.remove('show');
      urlInputEl.classList.remove('is-invalid');

      // 名称为空时自动填充
      if (!name) {
        var domain = extractDomain(url);
        if (domain) {
          name = siteNameMap[domain] || (domain.charAt(0).toUpperCase() + domain.slice(1));
          nameInput.value = name;
        } else {
          return;
        }
      }

      var data = load() || [];
      var previewImg = document.getElementById('bmPreview').querySelector('img');
      var iconUrl = previewImg ? previewImg.src : '';

      if (editingId) {
        var bm = { id: editingId, name: name, url: url, iconUrl: iconUrl };
        updateBookmark(data, bm);
      } else {
        var bm2 = { id: genId(), name: name, url: url, iconUrl: iconUrl };
        addBookmark(data, bm2);
      }
      closeModal();
    });

    // 取消
    document.getElementById('bmCancel').addEventListener('click', closeModal);

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  function openModal(bm) {
    if (!modal) createModal();

    editingId = bm ? bm.id : null;
    document.getElementById('bmTitle').textContent = bm ? '编辑书签' : '添加书签';
    document.getElementById('bmName').value = bm ? bm.name : '';
    document.getElementById('bmUrl').value = bm ? bm.url : '';
    document.getElementById('bmSubmit').textContent = bm ? '更新' : '添加';

    // 设置预览
    var preview = document.getElementById('bmPreview');
    preview.innerHTML = '';
    if (bm && bm.iconUrl) {
      var img = document.createElement('img');
      img.src = bm.iconUrl;
      img.onerror = function () {
        preview.innerHTML = '<div class="bookmark-initial">' + (bm.name || '?')[0].toUpperCase() + '</div>';
      };
      preview.appendChild(img);
    } else {
      preview.innerHTML = '<div class="bookmark-initial">' + (bm ? (bm.name || '?')[0].toUpperCase() : '?') + '</div>';
    }

    // 打开
    requestAnimationFrame(function () {
      modal.classList.add('open');
      document.getElementById('bmName').focus();
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    editingId = null;
  }

  function updatePreview(url) {
    var preview = document.getElementById('bmPreview');
    var nameVal = document.getElementById('bmName').value.trim();

    if (!url) {
      preview.innerHTML = '<div class="bookmark-initial">' + (nameVal ? nameVal[0].toUpperCase() : '?') + '</div>';
      return;
    }

    autoFavicon(url, function (src) {
      if (src) {
        preview.innerHTML = '';
        var img = document.createElement('img');
        img.src = src;
        img.onerror = function () {
          preview.innerHTML = '<div class="bookmark-initial">' + (nameVal ? nameVal[0].toUpperCase() : '?') + '</div>';
        };
        preview.appendChild(img);
      } else {
        preview.innerHTML = '<div class="bookmark-initial">' + (nameVal ? nameVal[0].toUpperCase() : '?') + '</div>';
      }
    });
  }

  // ---------- 初始化 ----------

  var data = load();
  if (!data) {
    data = PRESETS.slice();
    save(data);
  }
  render(data, true);
})();
