/* global $, Swal */

$(document).ready(async function () {
  /* on form submit */
  $('#create-extension-form').submit(async function (e) {
    e.preventDefault()

    const sendObj = {
      nume: $('#nume').val(),
      extensie: $('#extensie').val(),
      parola: $('#parola').val()
    }

    const response = await fetch('/api/extensions/create_extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendObj)
    })

    const data = await response.json()
    if (data.error) {
      await Swal.fire({
        title: 'Eroare',
        text: data.message,
        icon: 'error'
      })
    } else {
      await Swal.fire({
        title: 'Succes',
        text: 'Extensia a fost creată cu succes',
        icon: 'success'
      })

      window.location.href = '/extensions/edit'
    }
  })
})
