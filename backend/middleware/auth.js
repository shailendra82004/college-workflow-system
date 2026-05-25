module.exports = function(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = req.session.user;

  // reset the 30-min inactivity timer on every authenticated request
  if (typeof req.session.touch === 'function') {
    req.session.touch();
  }

  next();
};
