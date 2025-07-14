// 用于初始化管理员账号（只需运行一次即可）
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./functions/db/db.sqlite');

// 初始化管理员账号
const username = 'admin';
const password = 'admin123'; // 初始密码，建议修改

(async () => {
  const password_hash = await bcrypt.hash(password, 10);
  db.run(
    'INSERT OR IGNORE INTO admin (username, password_hash) VALUES (?, ?)',
    [username, password_hash],
    function (err) {
      if (err) {
        console.error('初始化失败:', err.message);
      } else {
        console.log('管理员账号已初始化');
      }
      db.close();
    }
  );
})();
