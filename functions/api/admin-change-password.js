const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = function (req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: '未登录' });

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (e) {
    return res.status(401).json({ msg: '登录已过期，请重新登录' });
  }

  const db = new sqlite3.Database('./functions/db/db.sqlite');
  const { oldPassword, newPassword } = req.body;
  db.get('SELECT * FROM admin WHERE id = ?', [payload.adminId], async (err, admin) => {
    if (err || !admin) {
      db.close();
      return res.status(401).json({ msg: '未找到用户' });
    }
    const match = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!match) {
      db.close();
      return res.status(400).json({ msg: '原密码错误' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE admin SET password_hash = ? WHERE id = ?', [newHash, payload.adminId], function (err) {
      db.close();
      if (err) return res.status(500).json({ msg: '修改失败' });
      res.json({ msg: '密码修改成功' });
    });
  });
};
