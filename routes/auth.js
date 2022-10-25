const express = require('express')
const router = express.Router()
const passport = require('passport')

const { connect } = require('../db/db')
const { forwardAuthenticated, ensureAuthenticated } = require('../services/auth')
const { sha256 } = require('../utils/utils')

router.get('/login', forwardAuthenticated, (req, res) => res.render('login'))
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=Invalid+username+or+password'
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logout(req.user, err => {
    if (err) return next(err)
    res.redirect('/login?success=You+are+logged+out')
  })
})

router.post('/change', ensureAuthenticated, async (req, res) => {
  const { user, password } = req.body
  try {
    if (user != null && password != null) {
      const hashedPassword = await sha256(password)
      connect(async db => {
        await db.run('UPDATE users SET password = ? WHERE user = ?', hashedPassword, user)
        res.json({ error: false })
      })
    } else {
      res.json({ error: true })
    }
  } catch (e) {
    res.json({ error: true })
  }
})

module.exports = router
