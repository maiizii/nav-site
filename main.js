let allLinks = [];
let allCategories = [];
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
  allBtn.className = 'category-item active';
  allBtn.textContent = '全部';
  allBtn.onclick = function() {
    renderCategoryList();
    renderLinks(allLinks);
  };
  catBox.appendChild(allBtn);

  // 一级分类 (parent_id == null 或 parent_id == undefined)
  const level1Cats = allCategories.filter(cat => !cat.parent_id && cat.parent_id !== 0)
    .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
  level1Cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-item';
    btn.textContent = cat.name;
    btn.onclick = function() {
      renderCategoryList();
      // 首页模式不需要切换主内容区
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

// 首页主内容区渲染（全部）
function renderLinks(links) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  let showLinks = links;

  // 搜索时平铺
  if (currentSearch) {
    showLinks = links.filter(l =>
      (l.title && l.title.includes(currentSearch)) ||
      (l.description && l.description.includes(currentSearch)) ||
      (l.url && l.url.includes(currentSearch))
    );
    renderSearchLinks(showLinks, main);
    return;
  }

  // 按一级分类分组
  const level1Cats = allCategories.filter(cat => !cat.parent_id && cat.parent_id !== 0)
    .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));

  // 每个区块维护自己的“当前二级分类”选中id
  const subCatSelected = {};

  level1Cats.forEach(cat => {
    // 二级分类
    const subCats = allCategories.filter(c => String(c.parent_id) === String(cat.id))
      .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));

    // 一级分类区块
    const section = document.createElement('section');
    section.className = 'group-section';

    let sectionHTML = `<h2 class="group-title">${cat.name}</h2>`;

    if (subCats.length > 0) {
      // 有二级分类时，显示tab
      sectionHTML += `<div class="subcat-tabs">`;
      subCats.forEach((subCat, idx) => {
        sectionHTML += `<button class="subcat-tab${idx === 0 ? ' active' : ''}" data-subcat-id="${subCat.id}">${subCat.name}</button>`;
      });
      sectionHTML += `</div>`;
      sectionHTML += `<div class="nav-list subcat-nav-list"></div>`;
      // 默认选第一个
      subCatSelected[cat.id] = subCats[0].id;
    } else {
      // 无二级分类
      sectionHTML += `<div class="nav-list"></div>`;
    }
    section.innerHTML = sectionHTML;
    main.appendChild(section);

    // 内容渲染
    if (subCats.length > 0) {
      renderLinksForCategory(showLinks, subCatSelected[cat.id], section.querySelector('.nav-list'));
      // tab切换事件（只影响该区块的内容）
      const tabBtns = section.querySelectorAll('.subcat-tab');
      tabBtns.forEach((tabBtn, idx) => {
        tabBtn.onclick = function() {
          tabBtns.forEach(btn => btn.classList.remove('active'));
          tabBtn.classList.add('active');
          subCatSelected[cat.id] = subCats[idx].id;
          renderLinksForCategory(showLinks, subCats[idx].id, section.querySelector('.nav-list'));
        };
      });
    } else {
      // 只显示一级分类下的内容
      renderLinksForCategory(showLinks, cat.id, section.querySelector('.nav-list'));
    }
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
}

// 渲染某个分类下的导航项（防止类型问题）
function renderLinksForCategory(links, catId, navList) {
  navList.innerHTML = '';
  const items = links.filter(l => String(l.category_id) === String(catId));
  items.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
    .forEach(link => navList.appendChild(createNavCard(link)));
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
