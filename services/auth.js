module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login?error=You+must+be+logged+in+to+view+that+resource')
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
}
