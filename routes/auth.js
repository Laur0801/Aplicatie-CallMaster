const express = require('express')
const router = express.Router()
const passport = require('passport')

const { connectMariaDB } = require('../db/db') // Schimbă importul pentru a folosi connectMariaDB
const { forwardAuthenticated, ensureAuthenticated } = require('../services/auth')
const { sha256 } = require('../utils/utils')

router.get('/login', forwardAuthenticated, (req, res) => res.render('login'))
router.post('/login', (req, res, next) => {
  console.log('Cerere de autentificare primită:', req.body); // Log pentru cererea de autentificare
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=Utilizator+invalid+sau+parolă+incorectă'
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logout(req.user, err => {
    if (err) return next(err)
    res.redirect('/login?success=Te-ai+deconectat+cu+succes')
  })
})

router.post('/change', ensureAuthenticated, async (req, res) => {
  const { user, password } = req.body
  try {
    if (user != null && password != null) {
      const hashedPassword = await sha256(password)
      console.log(`Actualizare parolă pentru utilizatorul: ${user}`) // Log pentru actualizare parolă
      await connectMariaDB('UPDATE utilizatori SET parola = ? WHERE utilizator = ?', [hashedPassword, user]) // Modificat tabela și interogarea
      res.json({ error: false })
    } else {
      console.log('Utilizator sau parolă null') // Log pentru utilizator sau parolă null
      res.json({ error: true })
    }
  } catch (e) {
    console.error('Eroare la actualizarea parolei:', e) // Log pentru eroare
    res.json({ error: true })
  }
})

module.exports = router
