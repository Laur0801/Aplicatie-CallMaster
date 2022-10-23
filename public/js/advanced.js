/* global $, Swal, Quill, runCLICommand */
const sipQuill = new Quill('#sipQuill', {
  theme: 'snow',
  modules: {
    toolbar: false,
    syntax: true
  }
})

const extenQuill = new Quill('#extenQuill', {
  theme: 'snow',
  modules: {
    toolbar: false,
    syntax: true
  }
})

const queQuill = new Quill('#queQuill', {
  theme: 'snow',
  modules: {
    toolbar: false,
    syntax: true
  }
})

$(document).ready(async function () {
  const request = await fetch('/api/core/get_core_config')
  const data = await request.json()

  if (data.error) {
    await Swal.fire({
      title: 'Error',
      text: 'There was an error getting the core config',
      icon: 'error'
    })

    window.location.href = '/'
  } else {
    console.log(data)
    const sipConf = window.atob(data.sipConf)
    const extenConf = window.atob(data.extensionsConf)
    const queConf = window.atob(data.queuesConf)

    sipQuill.setText(sipConf)
    extenQuill.setText(extenConf)
    queQuill.setText(queConf)
  }

  /* Get all ids starting with manual-edit- in jqeury */
  const manualEditIds = $("[id^='manual-edit-']").map(function () {
    return this.id
  }).get()

  manualEditIds.forEach(id => {
    $(`#${id}`).submit(async function (e) {
      e.preventDefault()

      const configType = this.dataset.type
      console.log(configType)
      if (configType === 'sipConf') {
        let sipConf = sipQuill.getText()
        sipConf = window.btoa(sipConf)

        const request = await fetch('/api/core/update_sip_config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sipConf
          })
        })

        const data = await request.json()
        if (data.error) {
          await Swal.fire({
            title: 'Error',
            text: 'There was an error updating the sip config',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Success',
            text: 'Sip config updated successfully',
            icon: 'success'
          })

          window.location.reload()
        }
      } else if (configType === 'extConf') {
        let extenConf = extenQuill.getText()
        extenConf = window.btoa(extenConf)

        const request = await fetch('/api/core/update_extensions_config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            extensionsConf: extenConf
          })
        })

        const data = await request.json()
        if (data.error) {
          await Swal.fire({
            title: 'Error',
            text: 'There was an error updating the extensions config',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Success',
            text: 'Extensions config updated successfully',
            icon: 'success'
          })
          window.location.reload()
        }
      } else if (configType === 'queConf') {
        let queConf = queQuill.getText()
        queConf = window.btoa(queConf)

        const request = await fetch('/api/core/update_queues_config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            queuesConf: queConf
          })
        })

        const data = await request.json()
        if (data.error) {
          await Swal.fire({
            title: 'Error',
            text: 'There was an error updating the queues config',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Success',
            text: 'Queues config updated successfully',
            icon: 'success'
          })
          window.location.reload()
        }
      }
    })
  })

  $('#manual-cli-command').submit(async function (e) {
    e.preventDefault()

    /* Remove hidden attribute from the output div */
    $('#cliOutput').removeAttr('hidden')

    const command = $('#cli-input').val()
    const res = await runCLICommand(command)

    /* output to textarea cliOutput */
    $('#cliOutput').val(res.result)
  })
})
