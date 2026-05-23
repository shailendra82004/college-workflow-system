 
module.exports = function(req, res, next) {
  const role = req.user && req.user.role;

  if (role === 'DIRECTOR' || role === 'STUDENT') {
    return next();
  }

  if (role === 'COORDINATOR' || role === 'HOD') {
    if (req.requestDept !== req.user.department) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
};
