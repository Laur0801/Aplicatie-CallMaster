window.loadExts = async function () {
  const request = await fetch('/api/extensions/get_extensions')
  const response = await request.json()

  return response
}

window.removeExtension = async function (id) {
  const request = await fetch('/api/extensions/delete_extension', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id
    })
  })

  const response = await request.json()
  await window.commitChanges()
  return response
}

window.editExtension = async function (id, name, extension, secret) {
  const request = await fetch('/api/extensions/update_extension', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id,
      name,
      extension,
      secret
    })
  })

  const response = await request.json()
  await window.commitChanges()
  return response
}

window.commitChanges = async function () {
  const request = await fetch('/api/extensions/commit_changes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const response = await request.json()
  return response
}

window.runCLICommand = async function (cmd) {
  const request = await fetch('/advanced/cli', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      command: cmd
    })
  })

  const response = await request.json()
  return response
}

window.updateSipSettings = async function (bindAddr, bindPort, gatewayMap) {
  const request = await fetch('/advanced/sip/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bindAddr,
      bindPort,
      gatewayMap
    })
  })

  const response = await request.json()
  return response
}

window.getQueues = async function () {
  const request = await fetch('/api/queues/get_queues')
  const response = await request.json()

  return response
}

window.createQueue = async function (name, strategy, timeout, wrapuptime, autopause, membersStr) {
  const request = await fetch('/api/queues/create_queue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      strategy,
      timeout,
      wrapuptime,
      autopause,
      members: membersStr
    })
  })

  const response = await request.json()
  return response
}

window.deleteQueue = async function (id) {
  const request = await fetch('/api/queues/delete_queue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id
    })
  })

  const response = await request.json()
  return response
}

window.editQueue = async function (id, name, strategy, timeout, wrapuptime, autopause, members) {
  const request = await fetch('/api/queues/update_queue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id,
      name,
      strategy,
      timeout,
      wrapuptime,
      autopause,
      members
    })
  })

  const response = await request.json()
  return response
}
