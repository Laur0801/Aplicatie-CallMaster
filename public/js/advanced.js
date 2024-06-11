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
      title: 'Eroare',
      text: 'A apărut o eroare la obținerea configurației de bază',
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
            title: 'Eroare',
            text: 'A apărut o eroare la actualizarea configurației sip',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Succes',
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
            title: 'Eroare',
            text: 'A apărut o eroare la actualizarea configurației extensiilor',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Succes',
            text: 'Configurația extensiilor a fost actualizată cu succes',
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
            title: 'Eroare',
            text: 'A apărut o eroare la actualizarea configurației cozilor',
            icon: 'error'
          })
        } else {
          await Swal.fire({
            title: 'Succes',
            text: 'Configurația cozilor de așteptare a fost actualizată cu succes',
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

  $('#credential-change').submit(async function (e) {
    e.preventDefault()

    const userName = $('#username').val()
    const password = $('#password').val()
    const password2 = $('#password2').val()

    if (password !== password2) {
      await Swal.fire({
        title: 'Eroare',
        text: 'Parolele nu se potrivesc',
        icon: 'error'
      })

      return
    }

    const request = await fetch('/auth/change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: userName,
        password
      })
    })

    const data = await request.json()
    if (data.error !== false) {
      await Swal.fire({
        title: 'Eroare',
        text: 'Nu s-au putut schimba acreditările',
        icon: 'error'
      })
    } else {
      await Swal.fire({
        title: 'Succes',
        text: 'Credențialele au fost modificate cu succes',
        icon: 'success'
      })

      window.location.href = '/auth/logout'
    }
  })
})
