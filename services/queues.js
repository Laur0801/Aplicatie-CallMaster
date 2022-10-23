const { commitChanges, getQueues } = require('./common')

const {
  connect
} = require('../db/db')

async function getMaxId () {
  return connect(async db => {
    return await db.get('SELECT MAX(id) as max FROM extensions')
  })
}

async function createQueue (id, name, musicclass, strategy, timeout, wrapuptime, autopause, members) {
  return connect(async db => {
    const exist = await db.get('SELECT * FROM queues WHERE name = ?', [name])

    if (exist === undefined) {
      await db.run('INSERT INTO queues (id, name, musicclass, strategy, timeout, wrapuptime, autopause, members) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id,
        name,
        musicclass,
        strategy,
        timeout,
        wrapuptime,
        autopause,
        members])
      await commitChanges()
      return { error: false, created: true }
    } else {
      return { error: true, message: 'Queue already exists' }
    }
  })
}

async function deleteQueue (id) {
  return connect(async db => {
    await db.run('DELETE FROM queues WHERE id = ?', [id])
    await reorder()
    await commitChanges()

    return { deleted: true }
  })
}

async function updateQueue (id, name, musicclass, strategy, timeout, wrapuptime, autopause, members) {
  return connect(async db => {
    await db.run(`UPDATE queues SET name = '${name}', musicclass = '${musicclass}', strategy = '${strategy}', timeout = ${timeout}, wrapuptime = ${wrapuptime}, autopause = '${autopause}', members = '${members}' WHERE ID = ${id};`)
    await commitChanges()
  })
}

async function reorder () {
  const queues = (await getQueues())
  await connect(async db => {
    await db.run('DELETE FROM queues')
    for (let i = 0; i < queues.length; i++) {
      await db.run('INSERT INTO queues (id, name, musicclass, strategy, timeout, wrapuptime, autopause, members) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [i,
        queues[i].name,
        queues[i].musicclass,
        queues[i].strategy,
        queues[i].timeout,
        queues[i].wrapuptime,
        queues[i].autopause,
        queues[i].members])
    }
    await commitChanges()
  })
}

async function getOneQueue (id) {
  return connect(async db => {
    return await db.get('SELECT * FROM queues WHERE id = ?', [id])
  })
}

module.exports = {
  getMaxId,
  getOneQueue,
  createQueue,
  deleteQueue,
  updateQueue
}
