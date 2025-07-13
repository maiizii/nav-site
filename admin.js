const API = '/api/nav-links';

// 渲染导航列表（表格+编辑）
async function loadNavLinks() {
  const res = await fetch(API);
  const links = await res.json();
  renderNavTable(links);
}

// 渲染表格
function renderNavTable(list) {
  const navList = document.getElementById('nav-list');
  navList.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>链接</th>
          <th>分类</th>
          <th>描述</th>
          <th>图标</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="nav-tbody"></tbody>
      <tfoot>
        <tr>
          <td></td>
          <td><input type="text" id="add-title" placeholder="网站名称" required /></td>
          <td><input type="url" id="add-url" placeholder="链接" required /></td>
          <td><input type="text" id="add-category" placeholder="分类" required /></td>
          <td><input type="text" id="add-description" placeholder="描述" /></td>
          <td><input type="text" id="add-icon" placeholder="图标链接" /></td>
          <td>
            <button id="add-btn">新增</button>
          </td>
        </tr>
      </tfoot>
    </table>
  `;
  const tbody = document.getElementById('nav-tbody');
  list.forEach(nav => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${nav.id}</td>
      <td><input type="text" value="${nav.title}" id="title-${nav.id}" /></td>
      <td><input type="url" value="${nav.url}" id="url-${nav.id}" /></td>
      <td><input type="text" value="${nav.category || ''}" id="category-${nav.id}" /></td>
      <td><input type="text" value="${nav.description || ''}" id="desc-${nav.id}" /></td>
      <td><input type="text" value="${nav.icon || ''}" id="icon-${nav.id}" /></td>
      <td>
        <button class="save-btn" data-id="${nav.id}">保存</button>
        <button class="del-btn" data-id="${nav.id}">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // 行编辑保存
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = async function() {
      const id = btn.dataset.id;
      const title = document.getElementById(`title-${id}`).value.trim();
      const url = document.getElementById(`url-${id}`).value.trim();
      const category = document.getElementById(`category-${id}`).value.trim();
      const description = document.getElementById(`desc-${id}`).value.trim();
      const icon = document.getElementById(`icon-${id}`).value.trim();
      if (!title || !url) return alert('名称和链接必填');
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, category, description, icon })
      });
      loadNavLinks();
    };
  });

  // 删除
  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.onclick = async function() {
      const id = btn.dataset.id;
      if (confirm('确定删除？')) {
        await fetch(`${API}/${id}`, { method: 'DELETE' });
        loadNavLinks();
      }
    };
  });

  // 新增
  document.getElementById('add-btn').onclick = async function() {
    const title = document.getElementById('add-title').value.trim();
    const url = document.getElementById('add-url').value.trim();
    const category = document.getElementById('add-category').value.trim();
    const description = document.getElementById('add-description').value.trim();
    const icon = document.getElementById('add-icon').value.trim();
    if (!title || !url) return alert('名称和链接必填');
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, category, description, icon })
    });
    // 清空输入
    document.getElementById('add-title').value = '';
    document.getElementById('add-url').value = '';
    document.getElementById('add-category').value = '';
    document.getElementById('add-description').value = '';
    document.getElementById('add-icon').value = '';
    loadNavLinks();
  };
}

// 初始化
loadNavLinks();
