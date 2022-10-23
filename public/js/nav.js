/* global $, Swal */

async function performAction (action) {
  const request = await fetch(`/api/core/action/${action}`)
  const response = await request.json()

  if (response.status === true) {
    return true
  }

  return false
}

$(document).ready(async function () {
  $('.action-item').click(async function () {
    const action = $(this).data('action')
    const result = await performAction(action)

    if (result === true) {
      const swalText = (action === 'restart' && action !== 'logout') ? 'Restart Complete' : 'Reload Complete'
      Swal.fire({
        title: 'Success',
        text: swalText,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while performing this action',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      })
    }
  })
})
