const express = require('express')
const router = express.Router()

const { getUptime } = require('../services/core')

const {
  getOneExtension
} = require('../services/extensions')

const {
  getOneTrunk
} = require('../services/trunks')

const {
  getOneQueue
} = require('../services/queues')

const {
  getExtensions,
  getTrunks
} = require('../services/common')

const {
  getStats
} = require('../services/stats')

const { ensureAuthenticated } = require('../services/auth')

router.get('/', ensureAuthenticated, async (req, res) => {
  res.render('index', {
    title: 'Dashboard',
    parent: 'General',
    extensionsCount: ((await getExtensions(true)).count),
    trunksCount: ((await getTrunks(true)).count),
    uptimeStats: await getUptime()
  })
})

router.get('/login', async (req, res) => {
  res.render('login', {
    title: 'Login'
  })
})

router.get('/stats', ensureAuthenticated, async (req, res) => {
  res.json(await getStats())
})

router.get('/extensions/create', ensureAuthenticated, async (req, res) => {
  res.render('create-extension', {
    title: 'Create extension',
    parent: 'Extensions'
  })
})

router.get('/extensions/edit', ensureAuthenticated, async (req, res) => {
  res.render('edit-extensions', {
    title: 'Edit extensions',
    parent: 'Extensions'
  })
})

router.get('/extensions/edit/:id', ensureAuthenticated, async (req, res) => {
  const editing = await getOneExtension(req.params.id)

  if (editing === undefined) {
    res.redirect('/?error=Extension+not+found')
    return
  }

  res.render('edit-extension', {
    title: 'Edit extension',
    parent: 'Extensions',
    extensionDetails: editing
  })
})

router.get('/trunks/create', ensureAuthenticated, async (req, res) => {
  res.render('create-trunk', {
    title: 'Create Trunk',
    parent: 'Trunk'
  })
})

router.get('/trunks/edit', ensureAuthenticated, async (req, res) => {
  res.render('edit-trunks', {
    title: 'Edit Trunk',
    parent: 'Trunk'
  })
})

router.get('/trunks/edit/:id', ensureAuthenticated, async (req, res) => {
  const editing = await getOneTrunk(req.params.id)

  if (editing === undefined) {
    res.redirect('/?error=Trunk+not+found')
    return
  }

  res.render('edit-trunk', {
    title: 'Edit Trunk',
    parent: 'Trunk',
    trunkDetails: editing
  })
})

router.get('/queues/create', ensureAuthenticated, async (req, res) => {
  res.render('create-queue', {
    title: 'Create Queue',
    parent: 'Queues'
  })
})

router.get('/queues/edit', ensureAuthenticated, async (req, res) => {
  res.render('edit-queues', {
    title: 'Edit Queue',
    parent: 'Queues'
  })
})

router.get('/queues/edit/:id', ensureAuthenticated, async (req, res) => {
  const queue = await getOneQueue(req.params.id)

  res.render('edit-queue', {
    title: 'Edit Queue',
    parent: 'Queues',
    queueDetails: queue
  })
})

router.get('/edit-manually', ensureAuthenticated, async (req, res) => {
  res.render('manual-edit', {
    title: 'Manual Edit',
    parent: 'Manage SIP Server'
  })
})

module.exports = router
