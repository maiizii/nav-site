let allLinks = [];
let allCategories = [];
let currentTag = '';
let currentSearch = '';
let tooltipTimer = null;

// TKCall主题9主色系循环
const colors = ["#3a6cf6", "#ff9800", "#4caf50", "#8f5ad5", "#ff5b5b", "#00bcd4"];
function getColorByTitle(title) {
  if (!title) return colors[0];
  const code = title.charCodeAt(0);
  return colors[code % colors.length];
}

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

function renderTags() {
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
              ? `<img src="${link.icon}" alt="icon" class="nav-icon" onerror="this.style.display='none';">`
              : `<span class="nav-icon-default" style="background:${getColorByTitle(link.title)};">${(link.title || '').charAt(0).toUpperCase()}</span>`
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
        tooltipTimer = setTimeout(hideTooltip, 50);
      };
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
  allCategories = Array.from(new Set(allLinks.map(l => l.category).filter(Boolean)));
}

async function loadAndRenderLinks() {
  await loadAllLinks();
  renderTags();
  renderLinks(allLinks);
}

document.getElementById('search').oninput = e => {
  currentSearch = e.target.value.trim();
  currentTag = '';
  loadAndRenderLinks();
};

loadAndRenderLinks();
