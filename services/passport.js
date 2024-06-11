const LocalStrategy = require('passport-local').Strategy;
const { connectMariaDB } = require('../db/db');
const { sha256 } = require('../utils/utils');

async function findUser(utilizator) {
  try {
    const result = await connectMariaDB('SELECT * FROM utilizatori WHERE utilizator = ?', [utilizator]);
    console.log('Utilizator găsit:', result); // Log pentru utilizatorul găsit
    return result[0];
  } catch (error) {
    console.error('Eroare la găsirea utilizatorului:', error);
    return null;
  }
}

async function findUserById(id) {
  try {
    const result = await connectMariaDB('SELECT * FROM utilizatori WHERE id = ?', [id]);
    console.log('Utilizator găsit după ID:', result); // Log pentru utilizatorul găsit după ID
    return result[0];
  } catch (error) {
    console.error('Eroare la găsirea utilizatorului după ID:', error);
    return null;
  }
}

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'utilizator' }, async (user, password, done) => {
      try {
        console.log(`Autentificare pentru utilizator: ${user}`); // Log pentru începutul autentificării
        const foundOne = await findUser(user);
        if (!foundOne) {
          console.log('Utilizatorul nu este înregistrat'); // Log pentru utilizatorul neînregistrat
          return done(null, false, { message: "Utilizatorul nu este înregistrat" });
        }
        const passHash = await sha256(password);
        console.log('Hash-ul parolei introduse:', passHash); // Log pentru hash-ul parolei introduse
        console.log('Hash-ul parolei din baza de date:', foundOne.parola); // Log pentru hash-ul parolei din baza de date
        const isMatch = (passHash === foundOne.parola);
        if (!isMatch) {
          console.log('Parolă incorectă'); // Log pentru parolă incorectă
          return done(null, false, { message: 'Parolă incorectă' });
        } else {
          console.log('Autentificare reușită'); // Log pentru autentificare reușită
          return done(null, foundOne);
        }
      } catch (error) {
        console.error('Eroare la autentificare:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function(id, done) {
    try {
      const foundOne = await findUserById(id);
      done(null, foundOne);
    } catch (error) {
      done(error, null);
    }
  });
};
