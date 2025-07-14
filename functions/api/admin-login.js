const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = function (req, res) {
  const db = new sqlite3.Database('./functions/db/db.sqlite');
  const { username, password } = req.body;
  db.get('SELECT * FROM admin WHERE username = ?', [username], async (err, admin) => {
    if (err || !admin) {
      db.close();
      return res.status(401).json({ msg: '用户名或密码错误' });
    }
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      db.close();
      return res.status(401).json({ msg: '用户名或密码错误' });
    }
    const token = jwt.sign({ adminId: admin.id, username }, SECRET, { expiresIn: '2h' });
    db.close();
    res.json({ token });
  });
};
