let allLinks = [];
let allCategories = [];
let currentCategory = '';
let currentSearch = '';
let tooltipTimer = null;

// 侧栏分类菜单：从接口读取
async function loadCategories() {
  const resp = await fetch('/api/nav-categories/list');
  const json = await resp.json();
  allCategories = json.data || [];
  renderCategoryList();
}

// 侧栏分类渲染，按 sort 字段升序排序
function renderCategoryList() {
  const catBox = document.getElementById('category-list');
  catBox.innerHTML = '';
  // “全部”按钮
  const allBtn = document.createElement('button');
  allBtn.className = 'category-item' + (currentCategory === '' ? ' active' : '');
  allBtn.textContent = '全部';
  allBtn.onclick = function() {
    currentCategory = '';
    renderCategoryList();
    renderLinks(allLinks);
  };
  catBox.appendChild(allBtn);

  // 按 sort 字段升序排序
  const sortedCats = [...allCategories].sort((a, b) => {
    const sa = typeof a.sort === 'number' ? a.sort : 9999;
    const sb = typeof b.sort === 'number' ? b.sort : 9999;
    return sa - sb;
  });

  sortedCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-item' + (currentCategory === cat.name ? ' active' : '');
    btn.textContent = cat.name;
    btn.onclick = function() {
      currentCategory = cat.name;
      renderCategoryList();
      renderLinks(allLinks);
    };
    catBox.appendChild(btn);
  });
}

// 导航项列表读取
async function loadLinks() {
  const resp = await fetch('/api/nav-links/list');
  const json = await resp.json();
  allLinks = json.data || [];
  renderLinks(allLinks);
}

// 内容区渲染（分组且排序）
function renderLinks(links) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  let showLinks = links;
  // 搜索优先
  if (currentSearch) {
    showLinks = links.filter(l =>
      (l.title && l.title.includes(currentSearch)) ||
      (l.description && l.description.includes(currentSearch)) ||
      (l.url && l.url.includes(currentSearch))
    );
  } else if (currentCategory) {
    showLinks = links.filter(l => l.category === currentCategory);
  }

  // 获取分类排序后的列表
  const sortedCats = [...allCategories].sort((a, b) => {
    const sa = typeof a.sort === 'number' ? a.sort : 9999;
    const sb = typeof b.sort === 'number' ? b.sort : 9999;
    return sa - sb;
  });

  // “全部”或搜索为空时，分组显示
  if (!currentSearch && !currentCategory) {
    // 先分组：分类名->导航项[]
    const groups = {};
    showLinks.forEach(link => {
      const cat = link.category || '未分组';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(link);
    });

    // 按分类排序分组显示
    sortedCats.forEach(cat => {
      const catName = cat.name;
      const items = groups[catName];
      if (!items || items.length === 0) return;
      // 分类内导航项按 sort 排序
      const sortedItems = [...items].sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 9999;
        const sb = typeof b.sort === 'number' ? b.sort : 9999;
        return sa - sb;
      });
      const section = document.createElement('section');
      section.className = 'group-section';
      section.innerHTML = `<h2 class="group-title">${catName}</h2><div class="nav-list"></div>`;
      const navList = section.querySelector('.nav-list');
      sortedItems.forEach(link => {
        navList.appendChild(createNavCard(link));
      });
      main.appendChild(section);
    });

    // 处理未分组
    if (groups['未分组'] && groups['未分组'].length > 0) {
      const sortedItems = [...groups['未分组']].sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 9999;
        const sb = typeof b.sort === 'number' ? b.sort : 9999;
        return sa - sb;
      });
      const section = document.createElement('section');
      section.className = 'group-section';
      section.innerHTML = `<h2 class="group-title">未分组</h2><div class="nav-list"></div>`;
      const navList = section.querySelector('.nav-list');
      sortedItems.forEach(link => {
        navList.appendChild(createNavCard(link));
      });
      main.appendChild(section);
    }
  } else {
    // 当前分类或搜索，直接平铺（分类内也按导航项sort排序）
    const sortedItems = [...showLinks].sort((a, b) => {
      const sa = typeof a.sort === 'number' ? a.sort : 9999;
      const sb = typeof b.sort === 'number' ? b.sort : 9999;
      return sa - sb;
    });
    const navList = document.createElement('div');
    navList.className = 'nav-list';
    sortedItems.forEach(link => {
      navList.appendChild(createNavCard(link));
    });
    main.appendChild(navList);
  }
}

// 导航项卡片
function createNavCard(link) {
  const card = document.createElement('div');
  card.className = 'nav-card';
  card.innerHTML = `
    <a href="${link.url}" target="_blank" rel="noopener">
      ${
        link.icon
          ? `<img src="${link.icon}" alt="icon" class="nav-icon" onerror="this.style.display='none';">`
          : `<span class="nav-icon-default">${(link.title || '').charAt(0).toUpperCase()}</span>`
      }
      <div class="nav-card-content">
        <div class="nav-title">${link.title}</div>
        <div class="nav-desc">${link.description || ''}</div>
      </div>
    </a>
  `;
  card.onmouseenter = function() {
    if (link.description) {
      clearTimeout(tooltipTimer);
      showTooltip(link.description, card);
    }
  };
  card.onmouseleave = function() {
    tooltipTimer = setTimeout(hideTooltip, 80);
  };
  return card;
}

// 搜索框监听
document.getElementById('search').oninput = e => {
  currentSearch = e.target.value.trim();
  // 搜索时取消分类高亮
  if (currentSearch) currentCategory = '';
  renderCategoryList();
  renderLinks(allLinks);
};

// 初始化与TOP/设置按钮事件
document.addEventListener('DOMContentLoaded', () => {
  initPage();

  // TOP按钮滚动到顶部
  const topBtn = document.getElementById('sidebar-top-btn');
  if (topBtn) {
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 设置按钮直接跳转到 admin 页面
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.onclick = () => {
      window.location.href = 'admin';
    };
  }
});

async function initPage() {
  await loadCategories();
  await loadLinks();
}

// 浮动注释卡片（浅底深色文字）
function createTooltip() {
  let tooltip = document.getElementById('nav-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'nav-tooltip';
    tooltip.className = 'nav-tooltip';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}
function showTooltip(text, card) {
  const tooltip = createTooltip();
  tooltip.innerHTML = `
    <div class="nav-tooltip-arrow"></div>
    <div class="nav-tooltip-content">${text.replace(/\n/g, '<br>')}</div>
  `;
  tooltip.style.display = 'block';

  setTimeout(() => {
    const cardRect = card.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    let top, left;
    const spaceBelow = window.innerHeight - cardRect.bottom;
    if (spaceBelow > tooltipRect.height + 18) {
      top = cardRect.bottom + 8 + scrollY;
      tooltip.classList.remove('nav-tooltip-up');
      tooltip.classList.add('nav-tooltip-down');
    } else {
      top = cardRect.top - tooltipRect.height - 8 + scrollY;
      tooltip.classList.remove('nav-tooltip-down');
      tooltip.classList.add('nav-tooltip-up');
    }
    left = cardRect.left + cardRect.width / 2 - tooltipRect.width / 2 + scrollX;
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, 0);
}
function hideTooltip() {
  const tooltip = document.getElementById('nav-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}
