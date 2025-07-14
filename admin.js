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

async function showLoginModal(msg) {
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

async function ensureLogin() {
  if (loginChecked) return true;
  document.getElementById('adminLoginModal').style.display = 'none';
  await new Promise(r => setTimeout(r, 180));
  if (!await verifyToken()) {
    await new Promise(r => setTimeout(r, 300));
    if (!await verifyToken()) {
      showLoginModal();
      return false;
    }
  }
  loginChecked = true;
  hideLoginModal();
  return true;
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
      setTimeout(() => { location.reload(); }, 600);
    } else {
      msgEl.textContent = data.msg || '登录失败';
    }
  };

  // 退出登录按钮弹窗
  document.getElementById('adminLogoutBtn').onclick = function () {
    document.getElementById('adminLogoutConfirmModal').style.display = 'flex';
  };

  document.getElementById('adminLogoutConfirmBtn').onclick = function () {
    if (isLoggingOut) return;
    isLoggingOut = true;
    document.getElementById('adminLogoutConfirmModal').style.display = 'none';
    localStorage.removeItem('adminToken');
    loginChecked = false;
    location.reload();
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
// 页面加载时强制登录验证，只弹一次弹窗
(async function () {
  if (!await ensureLogin()) return;
  document.getElementById('adminLogoutBtn').style.display = '';
  document.getElementById('adminChangePwdShowBtn').style.display = '';
  window.adminToken = localStorage.getItem('adminToken');
})();

// ===================== 分类管理 =====================
async function fetchCategories() {
  const res = await fetchWithAuth(CAT_API);
  const json = await res.json();
  allCategories = json.data || [];
  allCategories.sort((a, b) => (a.sort || 0) - (b.sort || 0));

  const catFilter = document.getElementById('nav-category-filter');
  if (catFilter) {
    catFilter.innerHTML = `<option value="">全部</option>` +
      allCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    catFilter.value = currentNavCategoryFilter;
  }
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
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="cat-tbody"></tbody>
      <tfoot>
        <tr>
          <td></td>
          <td><input type="text" id="add-cat-name" placeholder="分类名称" required /></td>
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
        name: document.getElementById(`name-${id}`).value
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
    if (!name.trim()) return;
    await fetchWithAuth(CAT_ADD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
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
  if (currentNavCategoryFilter) {
    links = links.filter(link => link.category === currentNavCategoryFilter);
  }
  renderNavTable(links);
}

document.addEventListener('DOMContentLoaded', () => {
  const catFilter = document.getElementById('nav-category-filter');
  if (catFilter) {
    catFilter.onchange = () => {
      currentNavCategoryFilter = catFilter.value;
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
              ${allCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
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
          ${allCategories.map(c => `<option value="${c.name}"${nav.category === c.name ? " selected" : ""}>${c.name}</option>`).join('')}
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
      const payload = {
        id,
        title: document.getElementById(`title-${id}`).value,
        url: document.getElementById(`url-${id}`).value,
        category: document.getElementById(`category-${id}`).value,
        description: document.getElementById(`desc-${id}`).value,
        icon: document.getElementById(`icon-${id}`).value
      };
      await fetchWithAuth(SAVE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      loadNavLinks();
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
  if (currentNavCategoryFilter && addCatSelect) {
    addCatSelect.value = currentNavCategoryFilter;
  }

  document.getElementById('add-btn').onclick = async () => {
    const payload = {
      title: document.getElementById('add-title').value,
      url: document.getElementById('add-url').value,
      category: document.getElementById('add-category').value,
      description: document.getElementById('add-description').value,
      icon: document.getElementById('add-icon').value
    };
    await fetchWithAuth(ADD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    document.getElementById('add-title').value = '';
    document.getElementById('add-url').value = '';
    document.getElementById('add-category').value = allCategories.length ? allCategories[0].name : '';
    document.getElementById('add-description').value = '';
    document.getElementById('add-icon').value = '';
    loadNavLinks();
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

// 页面初始化不激活tab，登录后左侧栏可点，但内容不显示，需点击
document.addEventListener('DOMContentLoaded', async () => {
  if (await ensureLogin()) {
    document.querySelectorAll('.admin-sidebar-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
  }
});
