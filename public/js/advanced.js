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
    const sipConf = window.atob(data.sipConf)
    const extenConf = window.atob(data.extensionsConf)

    sipQuill.setText(sipConf)
    extenQuill.setText(extenConf)
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
        }
      } else {
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
