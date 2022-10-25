const LocalStrategy = require('passport-local').Strategy

const { connect } = require('../db/db')
const { sha256 } = require('../utils/utils')

async function findUser (user) {
  return connect(async db => {
    const foundOne = await db.get('SELECT * FROM users WHERE user = ?', user)
    return foundOne
  })
}

module.exports = async function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'user' }, async (user, password, done) => {
      const foundOne = await findUser(user)
      if (foundOne.length === 0 && foundOne === undefined && foundOne === null && foundOne === []) {
        return done(null, false, { message: 'That user is not registered' })
      }
      const passHash = await sha256(password)
      const isMatch = (passHash === foundOne.password)
      if (!isMatch) {
        return done(null, false, { message: 'Password incorrect' })
      } else {
        return done(null, foundOne)
      }
    })
  )

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(async function (id, done) {
    const foundOne = findUser(id)
    done(null, foundOne)
  })
}
