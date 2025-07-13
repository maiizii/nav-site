// 加载导航数据并渲染
async function loadNavLinks() {
  const resp = await fetch('/nav-links');
  const navLinks = await resp.json();

  const navList = document.getElementById('nav-list');
  navList.innerHTML = '';
  navLinks.forEach(link => {
    const el = document.createElement('div');
    el.className = 'nav-card';
    el.innerHTML = `
      <a href="${link.url}" target="_blank">
        ${link.icon ? `<img src="${link.icon}" alt="icon" class="nav-icon">` : ''}
        <strong>${link.title}</strong>
        ${link.category ? `<span class="nav-category">${link.category}</span>` : ''}
        <p>${link.description || ''}</p>
      </a>
    `;
    navList.appendChild(el);
  });
}

loadNavLinks();
