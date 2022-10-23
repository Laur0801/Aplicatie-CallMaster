/* global $, Swal, commitChanges */

$(document).ready(async function () {
  /* on form submit */
  $('#create-extension-form').submit(async function (e) {
    e.preventDefault()

    const sendObj = {
      name: $('#name').val(),
      extension: $('#extension').val(),
      secret: $('#secret').val()
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
        title: 'Error',
        text: data.message,
        icon: 'error'
      })
    } else {
      await Swal.fire({
        title: 'Success',
        text: 'Extension created successfully',
        icon: 'success'
      })

      await commitChanges()

      window.location.href = '/'
    }
  })
})
