const { exec } = require('child_process')
const { promisify } = require('util')
const { connect } = require('../db/db')

const process = require('process')
const pidusage = require('pidusage')
const execPromise = promisify(exec)
const puPromise = promisify(pidusage)

async function getAsteriskPid () {
  try {
    let { stdout } = await execPromise('ps -ef | grep asterisk | grep -v grep | grep -v rasterisk | awk \'{print $2}\'')
    stdout = stdout.replace(/\n/g, '')
    return parseInt(stdout)
  } catch (error) {
    return null
  }
}

async function getProcessPids () {
  const zyvoPid = process.pid
  const asteriskPid = await getAsteriskPid()

  return {
    zyvoPid,
    asteriskPid
  }
}

async function getProcessStats () {
  const pids = await getProcessPids()
  const asteriskPid = pids.asteriskPid
  const zyvoPid = pids.zyvoPid

  let [asteriskStats, zyvoStats] = await Promise.all([
    puPromise(asteriskPid),
    puPromise(zyvoPid)
  ])

  asteriskStats = {
    memory: asteriskStats.memory,
    timestamp: asteriskStats.timestamp
  }

  zyvoStats = {
    memory: zyvoStats.memory,
    timestamp: zyvoStats.timestamp
  }

  return {
    asteriskStats,
    zyvoStats
  }
}

async function storeStats () {
  const stats = await getProcessStats()
  return connect(async db => {
    await db.run('INSERT INTO stats (asterisk_stats, zyvo_stats) VALUES (?, ?)', [JSON.stringify(stats.asteriskStats), JSON.stringify(stats.zyvoStats)])
    await db.run('DELETE FROM stats WHERE id NOT IN (SELECT id FROM stats ORDER BY created_at DESC LIMIT 10)')
  })
}

async function getStats () {
  return connect(async db => {
    return await db.all('SELECT * FROM stats ORDER BY created_at ASC')
  })
}

module.exports = {
  storeStats,
  getStats
}
