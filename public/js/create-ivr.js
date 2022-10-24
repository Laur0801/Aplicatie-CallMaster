/* global $ Swal getAllSounds getExtensions getQueues */

$(document).ready(async function () {
  const sounds = await getAllSounds()
  const extensions = await getExtensions()
  const queues = await getQueues()

  const select2SoundArr = []
  const select2ActionArr = []
  let selectICount = 0

  for (let i = 0; i < sounds.length; i++) {
    select2SoundArr.push({ id: i, text: sounds[i] })
  }

  for (let i = 0; i < extensions.length; i++) {
    select2ActionArr.push({ id: selectICount, text: `${extensions[i].extension} - Extension (${extensions[i].name})` })
    selectICount++
  }

  for (let i = 0; i < queues.length; i++) {
    select2ActionArr.push({ id: selectICount, text: `${queues[i].name} - Queue` })
    selectICount++
  }

  const onlyExtensions = []

  for (let i = 0; i < select2ActionArr.length; i++) {
    if (select2ActionArr[i].text.includes('Extension')) {
      onlyExtensions.push(select2ActionArr[i])
    }
  }

  const select2ActionArrC = select2ActionArr

  $('.greeting-audio-select').select2({
    data: select2SoundArr
  })

  $('.prompt-audio-select').select2({
    data: select2SoundArr
  })

  $('.invalid-audio-select').select2({
    data: select2SoundArr
  })

  $('.timeout-audio-select').select2({
    data: select2SoundArr
  })

  $('[class^=ivr-handler-select-]').select2({
    data: select2ActionArrC
  })

  $('.default-extension-select').select2({
    data: onlyExtensions
  })

  $('#add-ivr-action').click(function () {
    const actionDivs = $('[id^=action-n-]')

    if (actionDivs.length >= select2ActionArr.length) {
      Swal.fire({
        icon: 'warning',
        text: 'You have assigned all queue and extension actions to this IVR. Please remove one to add another.'
      })
      return
    }

    const lastActionDiv = actionDivs[actionDivs.length - 1]
    const lastN = parseInt(((lastActionDiv.id).split('-')[2])) + 1

    $(`
        <div id="action-n-${lastN}">
            <br>
            <input class="input input-ivr-action-text" type="text" placeholder="#" id="pound-${lastN}">
            <select class="ivr-handler-select-${lastN}" name="ivrHandlerOptions[]" style="width:50%;"></select>
            <button type="button" class="button red" id="remove-ivr-opt-${lastN}"><span class="icon"><i class="mdi mdi-delete"></i></span></button>
        </div>
        `).insertAfter(lastActionDiv)

    $('[class^=ivr-handler-select-]').select2({
      data: select2ActionArrC
    })

    $('[id^=remove-ivr-opt-]').click(function () {
      const n = parseInt(((this.id).split('-')[3]))
      $(`#action-n-${n}`).remove()
    })
  })

  $('#create-ivr-form').submit(async function (e) {
    e.preventDefault()
    const name = $('#name').val()

    let greetingAudio = ($('.greeting-audio-select').select2('data')[0].text)
    greetingAudio = greetingAudio.split('.').slice(0, -1).join('.')
    greetingAudio = `${greetingAudio}-zyvo`

    let promptAudio = ($('.prompt-audio-select').select2('data')[0].text)
    promptAudio = promptAudio.split('.').slice(0, -1).join('.')
    promptAudio = `${promptAudio}-zyvo`

    let invalidAudio = ($('.invalid-audio-select').select2('data')[0].text)
    invalidAudio = invalidAudio.split('.').slice(0, -1).join('.')
    invalidAudio = `${invalidAudio}-zyvo`

    let timeoutAudio = ($('.timeout-audio-select').select2('data')[0].text)
    timeoutAudio = timeoutAudio.split('.').slice(0, -1).join('.')
    timeoutAudio = `${timeoutAudio}-zyvo`

    const defaultExtension = ($('.default-extension-select').select2('data')[0].text).split(' - ')[0]
    const timeout = $('#timeout').val()

    const actionDivs = $('[id^=action-n-]')
    const allActions = []

    for (let i = 0; i < actionDivs.length; i++) {
      /* Get input element inside div */
      const actionKey = $(`#pound-${i}`).val()

      const doAction = $(`.ivr-handler-select-${i}`).select2('data')[0].text.split(' - ')[0]
      let typeAction

      if ($(`.ivr-handler-select-${i}`).select2('data')[0].text.includes('Extension')) {
        typeAction = 'extension'
      }

      if ($(`.ivr-handler-select-${i}`).select2('data')[0].text.includes('Queue')) {
        typeAction = 'queue'
      }

      allActions.push({
        key: actionKey,
        do: doAction,
        type: typeAction
      })
    }

    for (let i = 0; i < allActions.length; i++) {
      if (allActions[i].key === '' || allActions[i].key === undefined) {
        Swal.fire({
          icon: 'warning',
          text: 'Please fill out all fields before submitting.'
        })
        return
      }
    }

    const toSend = {
      name,
      greetingAudio,
      promptAudio,
      invalidAudio,
      timeoutAudio,
      defaultExtension,
      timeout,
      actions: allActions
    }

    const response = await fetch('/ivr/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toSend)
    })

    const data = await response.json()
    console.log(data)
    if (data.error === false) {
      await Swal.fire({
        icon: 'success',
        text: 'Successfully created IVR Menu'
      })

      window.location.href = '/ivr/edit'
    } else {
      await Swal.fire({
        icon: 'error',
        text: 'There was an error creating the IVR. Please try again.'
      })
    }
  })
})
