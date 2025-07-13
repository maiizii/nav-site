document.addEventListener('DOMContentLoaded', function() {
  // 切换tab
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

  // 分类管理
  let categories = ['日常', '运营', '技术'];
  let categoryListEl = document.getElementById('category-list');
  function renderCategories() {
    categoryListEl.innerHTML = '';
    categories.forEach((cat, idx) => {
      let li = document.createElement('li');
      li.textContent = cat;
      let actions = document.createElement('span');
      actions.className = 'admin-list-actions';
      let editBtn = document.createElement('button');
      editBtn.textContent = '编辑';
      editBtn.onclick = function() {
        let newName = prompt('修改分类名', cat);
        if(newName) {
          categories[idx] = newName;
          renderCategories();
        }
      };
      let delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.onclick = function() {
        if(confirm('删除分类 "'+cat+'"？')) {
          categories.splice(idx,1);
          renderCategories();
          renderWebsiteCategories();
        }
      };
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(actions);
      categoryListEl.appendChild(li);
    });
    renderWebsiteCategories();
  }
  renderCategories();
  document.getElementById('add-category-form').addEventListener('submit', function(e){
    e.preventDefault();
    let name = document.getElementById('category-name').value.trim();
    if(name && !categories.includes(name)){
      categories.push(name);
      renderCategories();
      this.reset();
    }
  });

  // 网址管理
  let websites = [
    {title:'百度', url:'https://www.baidu.com', category:'日常'},
    {title:'阿里云', url:'https://www.aliyun.com', category:'技术'}
  ];
  let websiteListEl = document.getElementById('website-list');
  function renderWebsites() {
    websiteListEl.innerHTML = '';
    websites.forEach((site, idx) => {
      let li = document.createElement('li');
      li.innerHTML = `<span><img src="https://cdn.tkcall.com/original/1X/e71ad477c92f1bb9b32ce24bdc8d57ad0dd4fa97.png" style="width:22px;height:22px;vertical-align:middle;margin-right:7px;border-radius:6px;border:1px solid #edf3ee;">${site.title} <a href="${site.url}" target="_blank" style="color:#1ca57d;text-decoration:underline;margin-left:8px;">${site.url}</a> <span style="color:#888;font-size:0.98em;margin-left:10px;">[${site.category}]</span></span>`;
      let actions = document.createElement('span');
      actions.className = 'admin-list-actions';
      let editBtn = document.createElement('button');
      editBtn.textContent = '编辑';
      editBtn.onclick = function() {
        let newTitle = prompt('网站名', site.title);
        let newUrl = prompt('网址', site.url);
        let newCat = prompt('分类', site.category);
        if(newTitle && newUrl && newCat){
          websites[idx] = {title:newTitle, url:newUrl, category:newCat};
          renderWebsites();
        }
      };
      let delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.onclick = function() {
        if(confirm('删除网址 "'+site.title+'"？')) {
          websites.splice(idx,1);
          renderWebsites();
        }
      };
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(actions);
      websiteListEl.appendChild(li);
    });
  }
  renderWebsites();
  function renderWebsiteCategories() {
    let select = document.getElementById('website-category');
    select.innerHTML = '<option value="">选择分类</option>';
    categories.forEach(cat=>{
      let opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  }
  document.getElementById('add-website-form').addEventListener('submit', function(e){
    e.preventDefault();
    let title = document.getElementById('website-title').value.trim();
    let url = document.getElementById('website-url').value.trim();
    let cat = document.getElementById('website-category').value;
    if(title && url && cat){
      websites.push({title, url, category:cat});
      renderWebsites();
      this.reset();
    }
  });

  // 退出按钮
  document.querySelector('.admin-logout-btn').onclick = function(){
    alert('已退出后台管理（请实现实际登出逻辑）');
  };
});
