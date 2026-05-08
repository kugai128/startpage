// =========================================
// 搜索引擎切换模块 + 搜索建议
// =========================================

// ---------- 1. 引擎配置 ----------
const engines = [
    {
        key: 'baidu',
        name: '百度',
        icon: '🔍',
        url: 'https://www.baidu.com/s?wd=',
        placeholder: '用百度搜索...'
    },
    {
        key: 'google',
        name: '谷歌',
        icon: '🔎',
        url: 'https://www.google.com/search?q=',
        placeholder: '用谷歌搜索...'
    },
    {
        key: 'bing',
        name: '必应',
        icon: '🌐',
        url: 'https://www.bing.com/search?q=',
        placeholder: '用必应搜索...'
    },
    {
        key: 'duckduckgo',
        name: 'DuckDuckGo',
        icon: '🦆',
        url: 'https://duckduckgo.com/?q=',
        placeholder: '用 DuckDuckGo 搜索...'
    }
];

const STORAGE_KEY = 'preferred_engine';

// ---------- 2. DOM 元素 ----------
const searchInput = document.getElementById('search');
const suggestionsBox = document.getElementById('suggestions');
const engineSelector = document.getElementById('engineSelector');
const engineCurrent = document.getElementById('engineCurrent');
const engineIcon = document.getElementById('engineIcon');
const engineName = document.getElementById('engineName');
const engineDropdown = document.getElementById('engineDropdown');

// ---------- 3. 状态 ----------
let currentEngine = engines[0];
let currentIndex = -1;
let suggestionList = [];
let debounceTimer = null;
let isDropdownOpen = false;

// ---------- 4. 引擎持久化 ----------
function getSavedEngine() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const found = engines.find(e => e.key === saved);
            if (found) return found;
        }
    } catch (e) {
        // localStorage 不可用则忽略
    }
    return engines[0];
}

function saveEngine(key) {
    try {
        localStorage.setItem(STORAGE_KEY, key);
    } catch (e) {
        // 忽略
    }
}

// ---------- 5. 引擎切换 UI ----------
function setCurrentEngine(engine) {
    currentEngine = engine;
    saveEngine(engine.key);

    // 更新顶部按钮显示
    engineIcon.textContent = engine.icon;
    engineName.textContent = engine.name;

    // placeholder 温柔过渡（先淡出 → 换文字 → 再淡入）
    searchInput.classList.add('is-switching');
    setTimeout(() => {
        searchInput.placeholder = engine.placeholder;
        searchInput.classList.remove('is-switching');
    }, 150);

    // 重新渲染下拉列表以更新选中态
    renderEngineDropdown();
}

function renderEngineDropdown() {
    engineDropdown.innerHTML = '';

    engines.forEach(engine => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', engine.key === currentEngine.key);
        li.dataset.key = engine.key;

        if (engine.key === currentEngine.key) {
            li.classList.add('is-active');
        }

        li.innerHTML = `
            <span class="engine-dot" aria-hidden="true"></span>
            <span class="engine-icon">${engine.icon}</span>
            <span class="engine-label">${engine.name}</span>
        `;

        li.addEventListener('click', () => {
            setCurrentEngine(engine);
            closeDropdown();
            searchInput.focus();
        });

        engineDropdown.appendChild(li);
    });
}

function openDropdown() {
    isDropdownOpen = true;
    engineDropdown.classList.add('show');
    engineCurrent.classList.add('is-open');
    engineCurrent.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
    isDropdownOpen = false;
    engineDropdown.classList.remove('show');
    engineCurrent.classList.remove('is-open');
    engineCurrent.setAttribute('aria-expanded', 'false');
}

function toggleDropdown() {
    if (isDropdownOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

engineCurrent.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
});

// ---------- 6. 搜索跳转 ----------
function doSearch(keyword) {
    if (keyword) {
        window.location.href = currentEngine.url + encodeURIComponent(keyword);
    }
}

// ---------- 7. 搜索建议（百度 JSONP） ----------
function renderSuggestions(list) {
    suggestionList = list;
    currentIndex = -1;
    suggestionsBox.innerHTML = '';

    if (list.length === 0) {
        suggestionsBox.classList.remove('show');
        return;
    }

    list.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.dataset.index = index;
        li.addEventListener('click', () => {
            doSearch(item);
        });
        suggestionsBox.appendChild(li);
    });

    suggestionsBox.classList.add('show');
}

function updateActive() {
    const items = suggestionsBox.querySelectorAll('li');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function fetchSuggestions(keyword) {
    if (!keyword) {
        suggestionsBox.classList.remove('show');
        return;
    }

    const callbackName = 'baiduSuggestionCallback_' + Date.now();
    const script = document.createElement('script');
    script.src = 'https://suggestion.baidu.com/su?wd=' + encodeURIComponent(keyword) + '&cb=' + callbackName;

    window[callbackName] = function (data) {
        if (data && data.s) {
            renderSuggestions(data.s);
        } else {
            renderSuggestions([]);
        }
        delete window[callbackName];
        if (script.parentNode) {
            document.head.removeChild(script);
        }
    };

    script.onerror = function () {
        delete window[callbackName];
        if (script.parentNode) {
            document.head.removeChild(script);
        }
        renderSuggestions([]);
    };

    document.head.appendChild(script);
}

// ---------- 8. 输入框事件 ----------
searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    const keyword = this.value.trim();
    if (!keyword) {
        suggestionsBox.classList.remove('show');
        return;
    }
    debounceTimer = setTimeout(() => {
        fetchSuggestions(keyword);
    }, 150);
});

searchInput.addEventListener('keydown', function (event) {
    if (!suggestionsBox.classList.contains('show')) {
        if (event.key === 'Enter') {
            doSearch(this.value.trim());
        }
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        currentIndex++;
        if (currentIndex >= suggestionList.length) {
            currentIndex = 0;
        }
        updateActive();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = suggestionList.length - 1;
        }
        updateActive();
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < suggestionList.length) {
            doSearch(suggestionList[currentIndex]);
        } else {
            doSearch(this.value.trim());
        }
    } else if (event.key === 'Escape') {
        suggestionsBox.classList.remove('show');
        currentIndex = -1;
    }
});

searchInput.addEventListener('focus', function () {
    const keyword = this.value.trim();
    if (keyword && suggestionList.length > 0) {
        suggestionsBox.classList.add('show');
    } else if (keyword) {
        fetchSuggestions(keyword);
    }
});

// ---------- 9. 点击外部关闭 ----------
document.addEventListener('click', function (event) {
    const target = event.target;

    // 关闭搜索建议
    if (!searchInput.contains(target) && !suggestionsBox.contains(target)) {
        suggestionsBox.classList.remove('show');
        currentIndex = -1;
    }

    // 关闭引擎下拉
    if (!engineSelector.contains(target)) {
        closeDropdown();
    }
});

// ---------- 10. 初始化 ----------
(function init() {
    currentEngine = getSavedEngine();
    engineIcon.textContent = currentEngine.icon;
    engineName.textContent = currentEngine.name;
    searchInput.placeholder = currentEngine.placeholder;
    renderEngineDropdown();
})();
