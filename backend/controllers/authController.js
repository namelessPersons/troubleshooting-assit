const users = require('../data/users.json');

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false });
  }
  // セッション保存
  req.session.user = { userId: user.userId, email: user.email };
  return res.json({ success: true, user: { userId: user.userId, email: user.email } });
};
