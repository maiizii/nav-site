// ===================== 公共配置 =====================
const API = "/api/nav-links/list";
const SAVE_API = "/api/nav-links/update";
const DEL_API = "/api/nav-links/delete";
const ADD_API = "/api/nav-links/add";
const SORT_API = "/api/nav-links/sort";

const CAT_API = "/api/nav-categories/list";
const CAT_ADD_API = "/api/nav-categories/add";
const CAT_SAVE_API = "/api/nav-categories/update";
const CAT_DEL_API = "/api/nav-categories/delete";
const CAT_SORT_API = "/api/nav-categories/sort";

let allCategories = [];
let currentNavCategoryFilter = "";
let currentNavSubCategoryFilter = "";

// ===================== 工具函数 =====================
function getAdminToken() {
  return localStorage.getItem('adminToken');
}
async function fetchWithAuth(url, options = {}) {
  options.headers = options.headers || {};
  options.headers['Authorization'] = 'Bearer ' + getAdminToken();
  return fetch(url, options);
}

// ========== 登录/密码修改 ==========
let loginChecked = false;
let isLoggingOut = false;
let loginModalShown = false;

function showLoginModal(msg) {
  if (loginModalShown) return;
  loginModalShown = true;
  document.getElementById('adminLoginModal').style.display = 'flex';
  document.getElementById('adminLoginMsg').textContent = msg || '';
  document.getElementById('adminLogoutBtn').style.display = 'none';
  document.getElementById('adminChangePwdShowBtn').style.display = 'none';
}
function hideLoginModal() {
  document.getElementById('adminLoginModal').style.display = 'none';
  document.getElementById('adminLogoutBtn').style.display = '';
  document.getElementById('adminChangePwdShowBtn').style.display = '';
  loginModalShown = false;
}
async function verifyToken() {
  const token = localStorage.getItem('adminToken');
  if (!token) return false;
  try {
    const resp = await fetch('/api/admin-verify-token', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (resp.status === 401) return false;
    return true;
  } catch (e) { return false; }
}

// 自动重试ensureLogin
async function ensureLogin(maxRetry = 3, retryInterval = 500) {
  if (loginChecked) return true;
  for (let i = 0; i < maxRetry; i++) {
    if (await verifyToken()) {
      loginChecked = true;
      hideLoginModal();
      return true;
    }
    await new Promise(r => setTimeout(r, retryInterval));
  }
  showLoginModal();
  return false;
}

// ========== 登录弹窗事件 ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminLoginBtn').onclick = async function () {
    const username = document.getElementById('adminLoginUser').value.trim();
    const password = document.getElementById('adminLoginPwd').value;
    const msgEl = document.getElementById('adminLoginMsg');
    msgEl.textContent = '';
    if (!username || !password) {
      msgEl.textContent = '请输入用户名和密码';
      return;
    }
    const resp = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (resp.ok && data.token) {
      localStorage.setItem('adminToken', data.token);
      loginChecked = false;
      hideLoginModal();
      setTimeout(() => { location.reload(); }, 1200);
    } else {
      msgEl.textContent = data.msg || '登录失败';
    }
  };

  document.getElementById('adminLogoutBtn').onclick = function () {
    document.getElementById('adminLogoutConfirmModal').style.display = 'flex';
  };

  document.getElementById('adminLogoutConfirmBtn').onclick = function () {
    if (isLoggingOut) return;
    isLoggingOut = true;
    document.getElementById('adminLogoutConfirmModal').style.display = 'none';
    localStorage.removeItem('adminToken');
    loginChecked = false;
    setTimeout(() => location.reload(), 500);
  };

  document.getElementById('adminLogoutCancelBtn').onclick = function () {
    document.getElementById('adminLogoutConfirmModal').style.display = 'none';
  };

  document.getElementById('adminChangePwdShowBtn').onclick = function () {
    document.getElementById('adminChangePwdModal').style.display = 'flex';
    document.getElementById('adminChangePwdMsg').textContent = '';
    document.getElementById('changeOldPwd').value = '';
    document.getElementById('changeNewPwd').value = '';
    document.getElementById('changeNewPwd2').value = '';
  };

  document.getElementById('adminChangePwdCancelBtn').onclick = function () {
    document.getElementById('adminChangePwdModal').style.display = 'none';
  };

  document.getElementById('adminChangePwdBtn').onclick = async function () {
    const oldPwd = document.getElementById('changeOldPwd').value;
    const newPwd = document.getElementById('changeNewPwd').value;
    const newPwd2 = document.getElementById('changeNewPwd2').value;
    const msgEl = document.getElementById('adminChangePwdMsg');
    msgEl.textContent = '';
    if (!oldPwd || !newPwd || !newPwd2) {
      msgEl.textContent = '请输入原密码和新密码';
      return;
    }
    if (newPwd.length < 6) {
      msgEl.textContent = '新密码长度不能少于6位';
      return;
    }
    if (newPwd !== newPwd2) {
      msgEl.textContent = '两次输入的新密码不一致';
      return;
    }
    const token = localStorage.getItem('adminToken');
    const resp = await fetch('/api/admin-change-password', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
    });
    const data = await resp.json();
    if (resp.ok) {
      msgEl.textContent = '密码修改成功，请重新登录！';
      setTimeout(() => {
        localStorage.removeItem('adminToken');
        loginChecked = false;
        window.location.reload();
      }, 1200);
    } else {
      msgEl.textContent = data.msg || '密码修改失败';
    }
  };
});

// ========== 登录验证 ==========
document.addEventListener('DOMContentLoaded', async () => {
  if (!await ensureLogin(3, 500)) return;
  document.getElementById('adminLogoutBtn').style.display = '';
  document.getElementById('adminChangePwdShowBtn').style.display = '';
  window.adminToken = localStorage.getItem('adminToken');
  document.querySelectorAll('.admin-sidebar-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
});

// ===================== 分类管理 =====================
async function fetchCategories() {
  const res = await fetchWithAuth(CAT_API);
  const json = await res.json();
  allCategories = json.data || [];
  allCategories.sort((a, b) => (a.sort || 0) - (b.sort || 0));

  // 构建两级下拉
  const catFilter = document.getElementById('nav-category-filter');
  const subCatFilter = document.getElementById('nav-subcategory-filter');
  if (catFilter) {
    // 一级分类
    const level1 = allCategories.filter(c => !c.parent_id);
    catFilter.innerHTML = `<option value="">全部</option>` +
      level1.map(c =>
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
    catFilter.value = currentNavCategoryFilter || "";
    // 处理二级下拉
    renderSubCategoryFilter();
  }
}

function renderSubCategoryFilter() {
  const catFilter = document.getElementById('nav-category-filter');
  const subCatFilter = document.getElementById('nav-subcategory-filter');
  const selectedCatId = catFilter.value;
  if (!selectedCatId) {
    subCatFilter.style.display = "none";
    subCatFilter.innerHTML = "";
    currentNavSubCategoryFilter = "";
    return;
  }
  // 找出所有二级分类
  const subCategories = allCategories.filter(c => String(c.parent_id) === String(selectedCatId));
  if (subCategories.length === 0) {
    subCatFilter.style.display = "none";
    subCatFilter.innerHTML = "";
    currentNavSubCategoryFilter = "";
    return;
  }
  subCatFilter.style.display = "";
  subCatFilter.innerHTML = `<option value="">全部</option>` +
    subCategories.map(sc => `<option value="${sc.id}">${sc.name}</option>`).join('');
  subCatFilter.value = currentNavSubCategoryFilter || "";
}

async function loadCategories() {
  const res = await fetchWithAuth(CAT_API);
  const json = await res.json();
  const cats = json.data || [];
  cats.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  renderCategoryTable(cats);
}

function renderCategoryTable(list) {
  const catList = document.getElementById('cat-list');
  catList.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width:48px;">排序</th>
          <th>分类名称</th>
          <th>父分类</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="cat-tbody"></tbody>
      <tfoot>
        <tr>
          <td></td>
          <td><input type="text" id="add-cat-name" placeholder="分类名称" required /></td>
          <td>
            <select id="add-cat-parent">
              <option value="">无</option>
              ${list.filter(c => !c.parent_id).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </td>
          <td>
            <button id="add-cat-btn">新增</button>
          </td>
        </tr>
      </tfoot>
    </table>
  `;
  const tbody = document.getElementById('cat-tbody');
  list.forEach(cat => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', cat.id);
    tr.innerHTML = `
      <td>
        <span class="drag-handle" style="cursor:grab;">&#9776;</span>
        ${cat.sort || ""}
      </td>
      <td><input type="text" value="${cat.name}" id="name-${cat.id}" /></td>
      <td>
        <select id="parent-${cat.id}">
          <option value="">无</option>
          ${list.filter(c => c.id !== cat.id && !c.parent_id).map(c =>
            `<option value="${c.id}"${cat.parent_id === c.id ? " selected" : ""}>${c.name}</option>`
          ).join('')}
        </select>
      </td>
      <td>
        <button class="save-cat-btn" data-id="${cat.id}">保存</button>
        <button class="del-cat-btn danger" data-id="${cat.id}">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  Sortable.create(tbody, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: function () {
      const newOrder = [];
      tbody.querySelectorAll('tr').forEach((tr, idx) => {
        const id = tr.getAttribute('data-id');
        if (id) newOrder.push({ id: Number(id), sort: idx + 1 });
      });
      fetchWithAuth(CAT_SORT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).then(() => loadCategories());
    }
  });

  tbody.querySelectorAll('.save-cat-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const payload = {
        id,
        name: document.getElementById(`name-${id}`).value,
        parent_id: document.getElementById(`parent-${id}`).value || null
      };
      await fetchWithAuth(CAT_SAVE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      loadCategories();
    };
  });

  tbody.querySelectorAll('.del-cat-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('确定要删除该分类吗？')) return;
      await fetchWithAuth(CAT_DEL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      loadCategories();
    };
  });

  document.getElementById('add-cat-btn').onclick = async () => {
    const name = document.getElementById('add-cat-name').value;
    const parent_id = document.getElementById('add-cat-parent').value || null;
    if (!name.trim()) return;
    await fetchWithAuth(CAT_ADD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id })
    });
    document.getElementById('add-cat-name').value = '';
    loadCategories();
  };
}

// ===================== 导航管理 =====================
async function loadNavLinks() {
  const res = await fetchWithAuth(API);
  if (res.status === 401) {
    showLoginModal && showLoginModal('请重新登录');
    return;
  }
  const json = await res.json();
  let links = json.data || [];
  
  // 按排序字段排序
  links.sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

  // 筛选
  if (currentNavSubCategoryFilter) {
    links = links.filter(link => String(link.category_id) === String(currentNavSubCategoryFilter));
  } else if (currentNavCategoryFilter) {
    // 选了一级但没选二级时，显示一级及其所有二级分类下的内容
    const subCats = allCategories.filter(c => String(c.parent_id) === String(currentNavCategoryFilter));
    if (subCats.length === 0) {
      links = links.filter(link => String(link.category_id) === String(currentNavCategoryFilter));
    } else {
      const ids = subCats.map(c => String(c.id));
      links = links.filter(link =>
        String(link.category_id) === String(currentNavCategoryFilter) ||
        ids.includes(String(link.category_id))
      );
    }
  }
  renderNavTable(links);
}

document.addEventListener('DOMContentLoaded', () => {
  // 一级分类筛选
  const catFilter = document.getElementById('nav-category-filter');
  const subCatFilter = document.getElementById('nav-subcategory-filter');
  if (catFilter) {
    catFilter.onchange = () => {
      currentNavCategoryFilter = catFilter.value;
      currentNavSubCategoryFilter = "";
      renderSubCategoryFilter();
      loadNavLinks();
    };
  }
  if (subCatFilter) {
    subCatFilter.onchange = () => {
      currentNavSubCategoryFilter = subCatFilter.value;
      loadNavLinks();
    };
  }
});

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
          <td>
            <select id="add-category">
              ${allCategories.map(c =>
                `<option value="${c.id}">${c.parent_id ? '— ' : ''}${c.name}</option>`
              ).join('')}
            </select>
          </td>
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
    tr.setAttribute('data-id', nav.id);
    tr.innerHTML = `
      <td>
        <span class="drag-handle" style="cursor:grab;">&#9776;</span>
        ${nav.sort || ""}
      </td>
      <td><input type="text" value="${nav.title}" id="title-${nav.id}" /></td>
      <td><input type="url" value="${nav.url}" id="url-${nav.id}" /></td>
      <td>
        <select id="category-${nav.id}">
          ${allCategories.map(c =>
            `<option value="${c.id}"${nav.category_id === c.id ? " selected" : ""}>${c.parent_id ? '— ' : ''}${c.name}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="text" value="${nav.description || ''}" id="desc-${nav.id}" /></td>
      <td><input type="text" value="${nav.icon || ''}" id="icon-${nav.id}" /></td>
      <td>
        <button class="save-btn" data-id="${nav.id}">保存</button>
        <button class="del-btn danger" data-id="${nav.id}">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  Sortable.create(tbody, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: function () {
      const newOrder = [];
      tbody.querySelectorAll('tr').forEach((tr, idx) => {
        const id = tr.getAttribute('data-id');
        if (id) newOrder.push({ id: Number(id), sort: idx + 1 });
      });
      fetchWithAuth(SORT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).then(() => loadNavLinks());
    }
  });

  tbody.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const tr = btn.closest('tr');
      const currentPosition = Array.from(tr.parentNode.children).indexOf(tr);
      
      const payload = {
        id,
        title: document.getElementById(`title-${id}`).value,
        url: document.getElementById(`url-${id}`).value,
        category_id: document.getElementById(`category-${id}`).value,
        description: document.getElementById(`desc-${id}`).value,
        icon: document.getElementById(`icon-${id}`).value,
        sort: currentPosition + 1 // 保持当前位置的排序
      };
      await fetchWithAuth(SAVE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // 不重新加载整个列表，保持位置
    };
  });

  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('确定要删除吗？')) return;
      await fetchWithAuth(DEL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      loadNavLinks();
    };
  });

  const addCatSelect = document.getElementById('add-category');
  if (currentNavSubCategoryFilter) {
    addCatSelect.value = currentNavSubCategoryFilter;
  } else if (currentNavCategoryFilter && addCatSelect) {
    addCatSelect.value = currentNavCategoryFilter;
  }

  document.getElementById('add-btn').onclick = async () => {
    // 获取当前列表的最大排序值
    const currentItems = document.querySelectorAll('#nav-tbody tr');
    const maxSort = currentItems.length > 0 ? currentItems.length : 0;
    
    const payload = {
      title: document.getElementById('add-title').value,
      url: document.getElementById('add-url').value,
      category_id: document.getElementById('add-category').value,
      description: document.getElementById('add-description').value,
      icon: document.getElementById('add-icon').value,
      sort: maxSort + 1 // 排在最下面
    };
    await fetchWithAuth(ADD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    document.getElementById('add-title').value = '';
    document.getElementById('add-url').value = '';
    document.getElementById('add-category').value = allCategories.length ? allCategories[0].id : '';
    document.getElementById('add-description').value = '';
    document.getElementById('add-icon').value = '';
    loadNavLinks(); // 新增后需要重新加载以显示新项目
  };
}

// ===================== Tab切换 =====================
let tabEverActivated = {};
document.querySelectorAll('.admin-sidebar-item').forEach(btn => {
  btn.onclick = async function () {
    document.querySelectorAll('.admin-sidebar-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    document.getElementById('tab-' + tab).classList.add('active');
    if (tab === 'nav') {
      await fetchCategories();
      await loadNavLinks();
    }
    if (tab === 'cat') loadCategories();
    tabEverActivated[tab] = true;
  };
});
