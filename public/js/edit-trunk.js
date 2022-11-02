/* global $, Swal, codecsSrc, editTrunk, defaultAction, tippy, getExtensions, getQueues, getIVRs */

$(document).ready(async function () {
  const gatewayExtenDeets = $('[id^=gw-id-]')
  gatewayExtenDeets.each(async function (oneDeet) {
    const element = gatewayExtenDeets[oneDeet]
    tippy(`#${element.id}`, {
      content: (gatewayExtenDeets[oneDeet]).dataset.tippy
    })
  })

  const [extensions, queues, ivrs] = await Promise.all([
    getExtensions(),
    getQueues(),
    getIVRs()
  ])

  const [extensionsActions, queuesActions, ivrActions] = [
    [],
    [],
    []
  ]

  for (let i = 0; i < extensions.length; i++) {
    extensionsActions.push({
      text: `Extension/${extensions[i].extension}`,
      id: `exten-${extensions[i].id}`
    })
  }

  for (let i = 0; i < queues.length; i++) {
    queuesActions.push({
      text: `Queue/${queues[i].name}`,
      id: `q-${queues[i].id}`
    })
  }

  for (let i = 0; i < ivrs.length; i++) {
    ivrActions.push({
      text: `IVR/${ivrs[i].name}`,
      id: `ivr-${ivrs[i].id}`
    })
  }

  const actions = []

  for (let i = 0; i < extensionsActions.length; i++) {
    actions.push(extensionsActions[i])
  }

  for (let i = 0; i < queuesActions.length; i++) {
    actions.push(queuesActions[i])
  }

  for (let i = 0; i < ivrActions.length; i++) {
    actions.push(ivrActions[i])
  }

  await $('.gw-default-action').select2({
    data: actions
  })

  const defaultActionStr = `${defaultAction.do}/${defaultAction.id}`

  $('.gw-default-action').each(function (index, element) {
    const action = $(element)
    const options = action.find('option')
    for (const option of options) {
      if (option.firstChild.data === defaultActionStr) {
        action.val(option.value).trigger('change')
        break
      }
    }
  })

  const codecsArr = codecsSrc.split(',')

  $("input[id^='cb-']").each(async function () {
    if (codecsArr.includes(this.value)) {
      $(this).prop('checked', true)
    }
  })

  $('#edit-trunk-form').submit(async function (e) {
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

    let selectedAction = {
      do: defaultActionDo,
      id: ($('.gw-default-action').select2('data')[0].text).split('/')[1]
    }

    selectedAction = JSON.stringify(selectedAction)

    const url = new URL(window.location.href)
    const pathname = ((url.pathname).split('/'))
    const id = pathname[pathname.length - 1]

    if (!host.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid host address',
        icon: 'error'
      })
      return
    }

    const checked = $("input[id^='cb-']:checked")
    const checkedArr = []
    for (let i = 0; i < checked.length; i++) {
      checkedArr.push(checked[i].value)
    }

    const codecs = checkedArr.join(',')
    const response = await editTrunk(id, host, port, secret, user, codecs, gatewayExten, gatewayExtenPass, selectedAction)

    if (response.error === false) {
      await Swal.fire({
        title: 'Success',
        text: 'Trunk updated',
        icon: 'success'
      })
      window.location.href = '/trunks/edit'
    } else {
      await Swal.fire({
        title: 'Error',
        text: response.error,
        icon: 'error'
      })
    }
  })
})
