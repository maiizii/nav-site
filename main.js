let allLinks = [];
let allCategories = [];
let currentCategory = '';
let currentSearch = '';
let tooltipTimer = null;

// 加载分类数据
async function loadCategories() {
  const resp = await fetch('/api/nav-categories/list');
  const json = await resp.json();
  allCategories = json.data || [];
  renderCategoryList();
}

// 分类侧栏渲染（支持二级分类缩进树形结构）
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

  // 分类按 sort 排序
  const sortedCats = [...allCategories].sort((a, b) => {
    const sa = typeof a.sort === 'number' ? a.sort : 9999;
    const sb = typeof b.sort === 'number' ? b.sort : 9999;
    return sa - sb;
  });

  // 递归渲染树形分类
  function renderTree(cats, parentId = null, level = 0) {
    cats.filter(cat => cat.parent_id === parentId).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-item' + (currentCategory === cat.id ? ' active' : '');
      btn.textContent = (level > 0 ? '— '.repeat(level) : '') + cat.name;
      btn.style.paddingLeft = (level * 16 + 10) + 'px';
      btn.onclick = function() {
        currentCategory = cat.id;
        renderCategoryList();
        renderLinks(allLinks);
      };
      catBox.appendChild(btn);
      renderTree(cats, cat.id, level + 1);
    });
  }
  renderTree(sortedCats);
}

// 加载导航数据
async function loadLinks() {
  const resp = await fetch('/api/nav-links/list');
  const json = await resp.json();
  allLinks = json.data || [];
  renderLinks(allLinks);
}

// 内容区渲染（支持二级分类分组显示）
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
    showLinks = links.filter(l => l.category_id === Number(currentCategory));
  }

  // 分类排序
  const sortedCats = [...allCategories].sort((a, b) => {
    const sa = typeof a.sort === 'number' ? a.sort : 9999;
    const sb = typeof b.sort === 'number' ? b.sort : 9999;
    return sa - sb;
  });

  // “全部”或搜索为空时，分组显示（一级分类及其子分类分组递归）
  if (!currentSearch && !currentCategory) {
    function renderGroup(catId, level = 0) {
      const cat = allCategories.find(c => c.id === catId);
      const items = showLinks.filter(l => l.category_id === catId);
      if (items.length === 0) return;
      const sortedItems = [...items].sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 9999;
        const sb = typeof b.sort === 'number' ? b.sort : 9999;
        return sa - sb;
      });
      const section = document.createElement('section');
      section.className = 'group-section';
      section.innerHTML = `<h2 class="group-title">${cat ? cat.name : '未分组'}</h2><div class="nav-list"></div>`;
      const navList = section.querySelector('.nav-list');
      sortedItems.forEach(link => {
        navList.appendChild(createNavCard(link));
      });
      main.appendChild(section);
      // 递归渲染子分类
      allCategories.filter(c => c.parent_id === catId).forEach(childCat => {
        renderGroup(childCat.id, level + 1);
      });
    }
    // 渲染所有一级分类及其子分类
    sortedCats.filter(c => !c.parent_id).forEach(cat => renderGroup(cat.id));

    // 处理未分组
    const ungrouped = showLinks.filter(l => !l.category_id);
    if (ungrouped.length > 0) {
      const sortedItems = [...ungrouped].sort((a, b) => {
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
    // 当前分类或搜索，直接平铺
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
  if (currentSearch) currentCategory = '';
  renderCategoryList();
  renderLinks(allLinks);
};

// 初始化与TOP/设置按钮事件
document.addEventListener('DOMContentLoaded', () => {
  initPage();

  const topBtn = document.getElementById('sidebar-top-btn');
  if (topBtn) {
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

// 浮动注释卡片
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
