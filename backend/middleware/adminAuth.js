module.exports = function(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'department_head')) {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied, admin privileges required' });
  }
};