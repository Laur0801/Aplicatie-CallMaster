/* global $, Swal, commitChanges, tippy, getExtensions, getQueues, getIVRs */

$(document).ready(async function () {
  /* on form submit */
  const gatewayExtenDeets = $('[id^=gw-id-]')
  gatewayExtenDeets.each(async function (oneDeet) {
    const element = gatewayExtenDeets[oneDeet]
    tippy(`#${element.id}`, {
      content: (gatewayExtenDeets[oneDeet]).dataset.tippy
    })
  })

  const extensions = await getExtensions()
  if (extensions.length === 0) {
    await Swal.fire({
      title: 'No extensions found',
      text: 'Please create an extension before creating a trunk',
      icon: 'error',
      confirmButtonText: 'OK'
    })
    window.location.href = '/extensions/create'
  }

  const [
    queues,
    ivr
  ] = await Promise.all([
    getQueues(),
    getIVRs()
  ])

  const [
    extensionsActions,
    queuesActions,
    ivrActions
  ] = [
    [],
    [],
    []
  ]

  for (let i = 0; i < extensions.length; i++) {
    extensionsActions.push({
      text: `Extension/${extensions[i].name}`,
      id: extensions[i].id
    })
  }

  for (let i = 0; i < queues.length; i++) {
    queuesActions.push({
      text: `Queue/${queues[i].name}`,
      id: queues[i].id
    })
  }

  for (let i = 0; i < ivr.length; i++) {
    ivrActions.push({
      text: `IVR/${ivr[i].name}`,
      id: ivr[i].id
    })
  }

  /* Join 3 arrays into one */
  const actions = extensionsActions.concat(queuesActions, ivrActions)

  /* Have 3 sections in select2 */
  $('.gw-default-action').select2({
    data: actions
  })

  $('#create-trunk-form').submit(async function (e) {
    e.preventDefault()
    const host = $('#host').val()
    const port = $('#port').val()
    const secret = $('#secret').val()
    const user = $('#user').val()
    const gatewayExten = $('#gatewayExten').val()
    const gatewayExtenPass = $('#gatewayExtenPass').val()
    const defaultActionStr = $('.gw-default-action').select2('data')[0].text
    let defaultActionDo = ''

    if (defaultActionStr.includes('Extension')) {
      defaultActionDo = 'Extension'
    } else if (defaultActionStr.includes('Queue')) {
      defaultActionDo = 'Queue'
    } else if (defaultActionStr.includes('IVR')) {
      defaultActionDo = 'IVR'
    }

    let defaultAction = {
      do: defaultActionDo,
      id: ($('.gw-default-action').select2('data')[0].text).split('/')[1]
    }

    defaultAction = JSON.stringify(defaultAction)

    if (!host.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid host address',
        icon: 'error'
      })
      return
    }

    /* Get all elements starting with id cb- */
    const checked = $("input[id^='cb-']:checked")
    const checkedArr = []
    for (let i = 0; i < checked.length; i++) {
      checkedArr.push(checked[i].value)
    }

    const codecs = checkedArr.join(',')

    const sendObj = {
      host,
      port,
      secret,
      user,
      codecs,
      gatewayExten,
      gatewayExtenPass,
      defaultAction
    }

    const response = await fetch('/api/trunks/create_trunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendObj)
    })

    const data = await response.json()
    if (data.error) {
      await Swal.fire({
        title: 'Error',
        text: data.message,
        icon: 'error'
      })
    } else {
      await Swal.fire({
        title: 'Success',
        text: 'Trunk created successfully',
        icon: 'success'
      })

      await commitChanges()

      window.location.href = '/trunks/edit'
    }
  })
})
