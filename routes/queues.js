const express = require('express')
const router = express.Router()

const {
  getMaxId,
  createQueue,
  deleteQueue,
  updateQueue
} = require('../services/queues')

const {
  getQueues,
  commitChanges
} = require('../services/common')

const {
  defaultError
} = require('../utils/defaults')

const { ensureAuthenticated } = require('../services/auth')

router.get('/get_queues', ensureAuthenticated, async (req, res) => {
  try {
    const queues = await getQueues()
    res.send(queues)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/create_queue', ensureAuthenticated, async (req, res) => {
  try {
    const {
      name,
      strategy,
      timeout,
      wrapuptime,
      autopause,
      members
    } = req.body

    if (!name || !strategy || !timeout || !wrapuptime || !autopause || !members) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1)
    const result = await createQueue(newId, name, 'default', strategy, timeout, wrapuptime, autopause, members)

    await commitChanges()
    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/delete_queue', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.body
    const result = await deleteQueue(id)

    await commitChanges()
    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/update_queue', ensureAuthenticated, async (req, res) => {
  try {
    const {
      id,
      name,
      strategy,
      timeout,
      wrapuptime,
      autopause,
      members
    } = req.body

    await commitChanges()
    await updateQueue(id, name, 'default', strategy, timeout, wrapuptime, autopause, members)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }

  res.send({ error: false })
})

router.post('delete_queue', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.body
    const result = await deleteQueue(id)

    await commitChanges()
    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

module.exports = router
