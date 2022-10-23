const { open } = require('sqlite')
const { Database } = require('sqlite3').verbose()

async function connect (callback) {
  let result
  try {
    const db = await open({
      filename: './db/zyvo.db',
      driver: Database
    })
    result = await callback(db)
  } catch (error) {
    console.log(error)
  }

  return result
};

async function initDb () {
  return connect(async db => {
    await db.exec('CREATE TABLE IF NOT EXISTS extensions (id INTEGER PRIMARY KEY, name TEXT, extension NUMBER, secret TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS trunks (id INTEGER PRIMARY KEY, name TEXT, type TEXT, context TEXT, host TEXT, port TEXT, secret TEXT, qualify TEXT, canreinvite TEXT, insecure TEXT, codecs TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS queues (id INTEGER PRIMARY KEY, name TEXT, musicclass TEXT, strategy TEXT, timeout TEXT, wrapuptime TEXT, autopause TEXT, members TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS ivr (id INTEGER PRIMARY KEY, name TEXT, context TEXT, timeout TEXT, start_sound TEXT, prompt_sound TEXT, invalid_sound TEXT,default_extension TEXT, menumap TEXT, created_at datetime default current_timestamp)')
  })
}

module.exports = {
  initDb,
  connect
}
