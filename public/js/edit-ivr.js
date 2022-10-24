/* global $, Swal, getAllSounds, getExtensions, getQueues, ivrDetails */

$(document).ready(async function () {
  const sounds = await getAllSounds()
  const extensions = await getExtensions()
  const queues = await getQueues()

  console.log(ivrDetails)

  const greetingAudio = ivrDetails.greeting_audio
  const promptAudio = ivrDetails.prompt_audio
  const timeoutAudio = ivrDetails.timeout_audio

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

  $('[class$=audio-select]').select2({
    data: select2SoundArr
  })

  $('.default-extension-select').select2({
    data: onlyExtensions
  })

  for (let i = 0; i < select2SoundArr.length; i++) {
    let changedText = select2SoundArr[i].text
    changedText = changedText.replace('.wav', '')
    changedText = `${changedText}-zyvo`

    if (changedText === greetingAudio) {
      $('.greeting-audio-select').val(i).trigger('change')
    }

    if (changedText === promptAudio) {
      $('.prompt-audio-select').val(i).trigger('change')
    }

    if (changedText === timeoutAudio) {
      $('.timeout-audio-select').val(i).trigger('change')
    }
  }

  for (let i = 0; i < onlyExtensions.length; i++) {
    let changedText = onlyExtensions[i].text
    changedText = changedText.split(' - ')[0]

    if (changedText === ivrDetails.default_extension) {
      $('.default-extension-select').val(i).trigger('change')
    }
  }

  $('#timeout').val(ivrDetails.timeout)

  const actions = JSON.parse(ivrDetails.menumap)

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

  $('[class^=ivr-handler-select-]').select2({
    data: select2ActionArrC
  })

  for (let i = 0; i < actions.length - 1; i++) {
    $('#add-ivr-action').click()
  }

  for (let i = 0; i < actions.length; i++) {
    $(`#pound-${i}`).val(actions[i].key)
    for (let j = 0; j < select2ActionArrC.length; j++) {
      if ((select2ActionArrC[j].text).includes('Extension')) {
        if (actions[i].do === select2ActionArrC[j].text.split(' - ')[0]) {
          $(`.ivr-handler-select-${i}`).val(j).trigger('change')
        }
      } else {
        if (actions[i].do === select2ActionArrC[j].text.split(' - ')[0]) {
          $(`.ivr-handler-select-${i}`).val(j).trigger('change')
        }
      }
    }
  }

  $('#edit-ivr-form').submit(async function (e) {
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

    const timeout = $('#timeout').val()

    let defaultExtension = ($('.default-extension-select').select2('data')[0].text)
    defaultExtension = defaultExtension.split(' - ')[0]

    const actionDivs = $('[id^=action-n-]')
    const allActions = []

    for (let i = 0; i < actionDivs.length; i++) {
      const actionKey = $(`#pound-${i}`).val()

      let typeAction
      const doAction = $(`.ivr-handler-select-${i}`).select2('data')[0].text.split(' - ')[0]

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
      id: ivrDetails.id,
      name,
      greetingAudio,
      promptAudio,
      invalidAudio,
      timeoutAudio,
      defaultExtension,
      timeout,
      actions: allActions
    }

    const response = await fetch('/ivr/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toSend)
    })

    const data = await response.json()
    if (data.error === false) {
      await Swal.fire({
        icon: 'success',
        text: 'Successfully edited IVR'
      })
      window.location.href = '/ivr/edit'
    } else {
      await Swal.fire({
        icon: 'error',
        text: 'Error editing IVR'
      })
      window.location.reload()
    }
  })
})
