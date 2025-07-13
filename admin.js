// API基础路径
const API = '/api/nav-links';

// Tab切换
document.querySelectorAll('.admin-menu-link, .admin-sidebar-item').forEach(el => {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    let tab = el.getAttribute('data-tab');
    document.querySelectorAll('.admin-menu-link, .admin-sidebar-item').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.admin-menu-link[data-tab="'+tab+'"]').classList.add('active');
    document.querySelector('.admin-sidebar-item[data-tab="'+tab+'"]').classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

// 导航列表渲染
async function loadNavLinks() {
  const res = await fetch(API);
  const links = await res.json();
  renderNavLinks(links);
}

function renderNavLinks(list) {
  const navList = document.getElementById('nav-list');
  navList.innerHTML = '';
  list.forEach(nav => {
    let li = document.createElement('li');
    li.innerHTML = `
      <span>
        <img src="${nav.icon || 'https://cdn.tkcall.com/original/1X/e71ad477c92f1bb9b32ce24bdc8d57ad0dd4fa97.png'}"
          style="width:22px;height:22px;vertical-align:middle;margin-right:7px;border-radius:6px;border:1px solid #edf3ee;">
        ${nav.title} <a href="${nav.url}" target="_blank" style="color:#1ca57d;text-decoration:underline;margin-left:8px;">${nav.url}</a>
        <span style="color:#888;font-size:0.98em;margin-left:10px;">[${nav.category}]</span>
        <span style="color:#888;font-size:0.98em;margin-left:10px;">${nav.description || ''}</span>
      </span>
    `;
    let actions = document.createElement('span');
    actions.className = 'admin-list-actions';
    // 编辑
    let editBtn = document.createElement('button');
    editBtn.textContent = '编辑';
    editBtn.onclick = async function() {
      let title = prompt('名称', nav.title);
      let url = prompt('链接', nav.url);
      let category = prompt('分类', nav.category);
      let description = prompt('描述', nav.description || '');
      let icon = prompt('图标', nav.icon || '');
      if (title && url) {
        await fetch(API + '/' + nav.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, url, category, description, icon })
        });
        loadNavLinks();
      }
    };
    // 删除
    let delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.onclick = async function() {
      if (confirm('确定删除 "' + nav.title + '" ？')) {
        await fetch(API + '/' + nav.id, { method: 'DELETE' });
        loadNavLinks();
      }
    };
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);
    navList.appendChild(li);
  });
}

// 添加导航
document.getElementById('add-nav-form').addEventListener('submit', async function(e){
  e.preventDefault();
  let title = document.getElementById('nav-title').value.trim();
  let url = document.getElementById('nav-url').value.trim();
  let category = document.getElementById('nav-category').value.trim();
  let description = document.getElementById('nav-description').value.trim();
  let icon = document.getElementById('nav-icon').value.trim();
  if (title && url) {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, category, description, icon })
    });
    loadNavLinks();
    this.reset();
  }
});

// 初始化
loadNavLinks();
