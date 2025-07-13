const API = "/api/nav-links/list";
const SAVE_API = "/api/nav-links/update";
const DEL_API = "/api/nav-links/delete";
const ADD_API = "/api/nav-links/add";
const SORT_API = "/api/nav-links/sort";

// 渲染导航列表为表格
async function loadNavLinks() {
  const res = await fetch(API);
  const links = (await res.json()).data || [];
  renderNavTable(links);
}

function renderNavTable(list) {
  const navList = document.getElementById('nav-list');
  navList.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width:48px;">排序</th>
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
    tr.setAttribute('data-id', nav.id); // 用于排序
    tr.innerHTML = `
      <td>
        <span class="drag-handle" style="cursor:grab;">&#9776;</span>
        ${nav.sort || ""}
      </td>
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

  // 拖拽排序
  Sortable.create(tbody, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: function () {
      const newOrder = [];
      tbody.querySelectorAll('tr').forEach((tr, idx) => {
        const id = tr.getAttribute('data-id');
        if (id) newOrder.push({ id: Number(id), sort: idx + 1 });
      });
      fetch(SORT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).then(res => res.json()).then(data => {
        // 排序保存成功后刷新
        loadNavLinks();
      });
    }
  });

  // 保存（编辑导航项）
  tbody.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute('data-id');
      const payload = {
        id,
        title: document.getElementById(`title-${id}`).value,
        url: document.getElementById(`url-${id}`).value,
        category: document.getElementById(`category-${id}`).value,
        description: document.getElementById(`desc-${id}`).value,
        icon: document.getElementById(`icon-${id}`).value
        // sort 字段不在编辑时提交
      };
      await fetch(SAVE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      loadNavLinks();
    };
  });

  // 删除
  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute('data-id');
      if (!confirm('确定要删除吗？')) return;
      await fetch(DEL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      loadNavLinks();
    };
  });

  // 新增
  document.getElementById('add-btn').onclick = async () => {
    const payload = {
      title: document.getElementById('add-title').value,
      url: document.getElementById('add-url').value,
      category: document.getElementById('add-category').value,
      description: document.getElementById('add-description').value,
      icon: document.getElementById('add-icon').value
    };
    await fetch(ADD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    document.getElementById('add-title').value = '';
    document.getElementById('add-url').value = '';
    document.getElementById('add-category').value = '';
    document.getElementById('add-description').value = '';
    document.getElementById('add-icon').value = '';
    loadNavLinks();
  };
}

document.addEventListener('DOMContentLoaded', loadNavLinks);
