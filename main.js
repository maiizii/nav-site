let allLinks = [];
let allCategories = [];
let currentCategory = ''; // 当前选中的一级分类id
let currentSubCategory = ''; // 当前选中的二级分类id
let currentSearch = '';
let tooltipTimer = null;

// 加载所有分类
async function loadCategories() {
  const resp = await fetch('/api/nav-categories/list');
  const json = await resp.json();
  allCategories = json.data || [];
  renderCategoryList();
}

// 左栏只显示一级分类
function renderCategoryList() {
  const catBox = document.getElementById('category-list');
  catBox.innerHTML = '';

  // “全部”按钮
  const allBtn = document.createElement('button');
  allBtn.className = 'category-item' + (currentCategory === '' ? ' active' : '');
  allBtn.textContent = '全部';
  allBtn.onclick = function() {
    currentCategory = '';
    currentSubCategory = '';
    renderCategoryList();
    renderLinks(allLinks);
  };
  catBox.appendChild(allBtn);

  // 一级分类 (parent_id == null)
  const level1Cats = allCategories.filter(cat => !cat.parent_id)
    .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
  level1Cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-item' + (String(currentCategory) === String(cat.id) ? ' active' : '');
    btn.textContent = cat.name;
    btn.onclick = function() {
      currentCategory = String(cat.id);
      // 切换一级分类时，自动选中第一个子分类（如果有）
      const subCats = allCategories.filter(c => String(c.parent_id) === String(cat.id))
        .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
      currentSubCategory = subCats.length > 0 ? String(subCats[0].id) : '';
      renderCategoryList();
      renderLinks(allLinks);
    };
    catBox.appendChild(btn);
  });
}

// 加载导航
async function loadLinks() {
  const resp = await fetch('/api/nav-links/list');
  const json = await resp.json();
  allLinks = json.data || [];
  renderLinks(allLinks);
}

// 主内容区渲染
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
    currentCategory = '';
    currentSubCategory = '';
    renderSearchLinks(showLinks, main);
    return;
  }

  // “全部”时分组显示所有一级分类
  if (!currentCategory) {
    // 按一级分类分组
    const level1Cats = allCategories.filter(cat => !cat.parent_id)
      .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
    level1Cats.forEach(cat => {
      const items = showLinks.filter(l => String(l.category_id) === String(cat.id));
      if (items.length === 0) return;
      const section = document.createElement('section');
      section.className = 'group-section';
      section.innerHTML = `<h2 class="group-title">${cat.name}</h2><div class="nav-list"></div>`;
      const navList = section.querySelector('.nav-list');
      items.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
        .forEach(link => navList.appendChild(createNavCard(link)));
      main.appendChild(section);
    });
    // 未分组
    const ungrouped = showLinks.filter(l => !allCategories.some(c => String(c.id) === String(l.category_id)));
    if (ungrouped.length > 0) {
      const section = document.createElement('section');
      section.className = 'group-section';
      section.innerHTML = `<h2 class="group-title">未分组</h2><div class="nav-list"></div>`;
      const navList = section.querySelector('.nav-list');
      ungrouped.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
        .forEach(link => navList.appendChild(createNavCard(link)));
      main.appendChild(section);
    }
    return;
  }

  // 单一级分类时：是否有二级分类
  const subCats = allCategories.filter(c => String(c.parent_id) === String(currentCategory))
    .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));

  if (subCats.length > 0) {
    // 有二级分类，显示tab标签
    const tabsBar = document.createElement('div');
    tabsBar.className = 'subcat-tabs';
    subCats.forEach((subCat, idx) => {
      const tab = document.createElement('button');
      tab.className = 'subcat-tab' + (String(currentSubCategory) === String(subCat.id) ? ' active' : '');
      tab.textContent = subCat.name;
      tab.onclick = function() {
        currentSubCategory = String(subCat.id);
        renderLinks(allLinks);
      };
      tabsBar.appendChild(tab);
    });
    main.appendChild(tabsBar);

    // 当前二级分类
    const currentSubCat = subCats.find(c => String(c.id) === String(currentSubCategory)) || subCats[0];
    const items = showLinks.filter(l => String(l.category_id) === String(currentSubCat.id));
    const navList = document.createElement('div');
    navList.className = 'nav-list';
    items.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
      .forEach(link => navList.appendChild(createNavCard(link)));
    main.appendChild(navList);
    return;
  } else {
    // 没有二级分类，直接显示一级分类下的网站
    const items = showLinks.filter(l => String(l.category_id) === String(currentCategory));
    const navList = document.createElement('div');
    navList.className = 'nav-list';
    items.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
      .forEach(link => navList.appendChild(createNavCard(link)));
    main.appendChild(navList);
    return;
  }
}

// 搜索时平铺
function renderSearchLinks(links, main) {
  const navList = document.createElement('div');
  navList.className = 'nav-list';
  links.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
    .forEach(link => navList.appendChild(createNavCard(link)));
  main.appendChild(navList);
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
  if (currentSearch) {
    currentCategory = '';
    currentSubCategory = '';
  }
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

// 可在 style.css 增加如下样式让tab更美观
/*
.subcat-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 22px;
}
.subcat-tab {
  border: none;
  background: #f2f2f2;
  color: #88af8e;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.subcat-tab.active,
.subcat-tab:hover {
  background: #88af8e;
  color: #fff;
}
*/
