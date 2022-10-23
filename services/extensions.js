const { commitChanges, getExtensions } = require('./common')

const {
  connect
} = require('../db/db')

async function getMaxId () {
  return connect(async db => {
    return await db.get('SELECT MAX(id) as max FROM extensions')
  })
}

async function createExtension (id, name, extension, secret) {
  return connect(async db => {
    const [
      existOne,
      existTwo
    ] = await Promise.all([
      db.get('SELECT * FROM extensions WHERE extension = ?', [extension]),
      db.get('SELECT * FROM extensions WHERE name = ?', [name])
    ])

    if (existOne === undefined && existTwo === undefined) {
      await db.run('INSERT INTO extensions (id, name, extension, secret) VALUES (?, ?, ?, ?)', [id, name, extension, secret])
      await commitChanges()
      return { error: false, created: true }
    } else {
      return { error: true, message: 'Extension or name already exists' }
    }
  })
}

async function deleteExtension (id) {
  return connect(async db => {
    await db.run('DELETE FROM extensions WHERE id = ?', [id])
    await reorder()
    await commitChanges()

    return { deleted: true }
  })
}

async function updateExtension (id, name, extension, secret) {
  return connect(async db => {
    await db.run(`UPDATE extensions SET name = '${name}', extension = ${extension}, secret = '${secret}' WHERE ID = ${id};`)
    await commitChanges()
  })
}

async function reorder () {
  const extensions = (await getExtensions())
  await connect(async db => {
    await db.run('DELETE FROM extensions')
    for (let i = 0; i < extensions.length; i++) {
      await db.run('INSERT INTO extensions (id, name, extension, secret) VALUES (?, ?, ?, ?)', [i, extensions[i].name, extensions[i].extension, extensions[i].secret])
    }
    await commitChanges()
  })
}

async function getOneExtension (id) {
  return connect(async db => {
    return await db.get('SELECT * FROM extensions WHERE id = ?', [id])
  })
}

module.exports = {
  getMaxId,
  getOneExtension,
  createExtension,
  deleteExtension,
  updateExtension
}
