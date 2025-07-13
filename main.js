let allLinks = [];
let allCategories = [];
let currentCategory = '';
let currentSearch = '';
let tooltipTimer = null;

// 色块
const colorPalette = [
  "#88af8e", "#41e254", "#f8745c", "#fa6c8d", "#d4efd8", "#edf3ee"
];
function getColorByTitle(title) {
  if (!title) return colorPalette[0];
  const code = title.charCodeAt(0);
  return colorPalette[code % colorPalette.length];
}

// 分类名填充至4宽
function padCategoryName(cat) {
  if (!cat) return '';
  const len = Array.from(cat).length;
  if (len === 4) return cat;
  if (len === 3) return cat[0] + ' ' + cat[1] + ' ' + cat[2];
  if (len === 2) return cat[0] + '  ' + cat[1] + '  ';
  return cat.padEnd(4, ' ');
}

// 左侧分类栏渲染
function renderCategories() {
  const catBox = document.getElementById('category-list');
  catBox.innerHTML = '';
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-item' + (currentCategory === cat ? ' active' : '');
    btn.textContent = padCategoryName(cat);
    btn.onclick = () => {
      currentCategory = cat;
      currentSearch = '';
      document.getElementById('search').value = '';
      renderCategories();
      renderLinks(allLinks);
    };
    catBox.appendChild(btn);
  });
  // “全部”按钮
  if (currentCategory) {
    const allBtn = document.createElement('button');
    allBtn.className = 'category-item';
    allBtn.textContent = '全部';
    allBtn.onclick = () => {
      currentCategory = '';
      renderCategories();
      renderLinks(allLinks);
    };
    catBox.insertBefore(allBtn, catBox.firstChild);
  }
}

function renderLinks(links) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  let showLinks = links;
  if (currentSearch) {
    showLinks = links.filter(l =>
      (l.title && l.title.includes(currentSearch)) ||
      (l.description && l.description.includes(currentSearch)) ||
      (l.url && l.url.includes(currentSearch))
    );
  } else if (currentCategory) {
    showLinks = links.filter(l => l.category === currentCategory);
  }
  // 按分类分组
  const groups = {};
  showLinks.forEach(link => {
    const cat = link.category || '未分组';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(link);
  });
  Object.entries(groups).forEach(([cat, items]) => {
    const section = document.createElement('section');
    section.className = 'group-section';
    section.innerHTML = `<h2 class="group-title">${cat}</h2><div class="nav-list"></div>`;
    const navList = section.querySelector('.nav-list');
    items.forEach(link => {
      const card = document.createElement('div');
      card.className = 'nav-card';
      card.innerHTML = `
        <a href="${link.url}" target="_blank" rel="noopener">
          ${
            link.icon
              ? `<img src="${link.icon}" alt="icon" class="nav-icon" onerror="this.style.display='none';">`
              : `<span class="nav-icon-default" style="background:${getColorByTitle(link.title)};">${(link.title || '').charAt(0).toUpperCase()}</span>`
          }
          <div class="nav-card-content">
            <div class="nav-title">${link.title}</div>
            <div class="nav-desc">${link.description || ''}</div>
          </div>
        </a>
      `;
      navList.appendChild(card);
    });
    main.appendChild(section);
  });
}

// 分类、数据初始化
async function loadAllLinks() {
  // 你自己的接口，这里用静态json演示
  const resp = await fetch('/api/nav-links');
  allLinks = await resp.json();
  allCategories = Array.from(new Set(allLinks.map(l => l.category).filter(Boolean)));
}

async function loadAndRenderLinks() {
  await loadAllLinks();
  renderCategories();
  renderLinks(allLinks);
}

document.getElementById('search').oninput = e => {
  currentSearch = e.target.value.trim();
  currentCategory = '';
  renderCategories();
  renderLinks(allLinks);
};

loadAndRenderLinks();
