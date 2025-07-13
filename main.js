let allLinks = [];
let allCategories = [];
let allTags = [];
let currentTag = '';
let currentSearch = '';

function renderTags() {
  // 标签区，实际用 category 实现（如有 tags 字段可提取 tags）
  const tagsBar = document.getElementById('tags');
  tagsBar.innerHTML = '';
  allCategories.forEach(cate => {
    const tagBtn = document.createElement('button');
    tagBtn.className = 'tag-btn' + (currentTag === cate ? ' active' : '');
    tagBtn.textContent = cate;
    tagBtn.onclick = () => {
      currentTag = cate;
      currentSearch = '';
      document.getElementById('search').value = '';
      loadAndRenderLinks();
    };
    tagsBar.appendChild(tagBtn);
  });
  if (currentTag) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'tag-btn clear';
    clearBtn.textContent = '全部';
    clearBtn.onclick = () => {
      currentTag = '';
      loadAndRenderLinks();
    };
    tagsBar.insertBefore(clearBtn, tagsBar.firstChild);
  }
}

function renderLinks(links) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  // 按 category 分组
  const groups = {};
  links.forEach(link => {
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
              ? `<img src="${link.icon}" alt="icon" class="nav-icon" onerror="this.style.display='none'">`
              : `<span class="nav-icon-default">${(link.title || '').charAt(0).toUpperCase()}</span>`
          }
          <strong>${link.title}</strong>
          <p>${link.description || ''}</p>
        </a>
      `;
      navList.appendChild(card);
    });
    main.appendChild(section);
  });
}

async function loadAllLinks() {
  let url = '/api/nav-links';
  if (currentSearch) {
    url += '?search=' + encodeURIComponent(currentSearch);
  } else if (currentTag) {
    url += '?tag=' + encodeURIComponent(currentTag);
  }
  const resp = await fetch(url);
  allLinks = await resp.json();
  // 提取所有分类
  allCategories = Array.from(new Set(allLinks.map(l => l.category).filter(Boolean)));
}

async function loadAndRenderLinks() {
  await loadAllLinks();
  renderTags();
  renderLinks(allLinks);
}

// 搜索事件
document.getElementById('search').oninput = e => {
  currentSearch = e.target.value.trim();
  currentTag = '';
  loadAndRenderLinks();
};

// 初始加载
loadAndRenderLinks();
