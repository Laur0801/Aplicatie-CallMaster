/* global $, Swal, editExtension */

$(document).ready(async function () {
  /* On form submit */
  $('#edit-extension-form').submit(async function (e) {
    e.preventDefault()
    /* Get the current url */
    const url = new URL(window.location.href)
    const pathname = ((url.pathname).split('/'))
    const id = pathname[pathname.length - 1]
    const name = $('#name').val()
    const extension = $('#extension').val()
    const secret = $('#secret').val()
    const response = await editExtension(id, name, extension, secret)

    if (response.error === true) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not edit extension'
      })
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Extension edited'
      })

      window.location.href = '/extensions/edit'
    }
  })
})
