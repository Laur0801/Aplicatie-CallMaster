/* global $, Swal, commitChanges */

$(document).ready(async function () {
  /* on form submit */
  $('#create-trunk-form').submit(async function (e) {
    e.preventDefault()
    const host = $('#host').val()
    const port = $('#port').val()
    const secret = $('#secret').val()

    if (!host.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid host address',
        icon: 'error'
      })
      return
    }

    /* Get all elements starting with id cb- */
    const checked = $("input[id^='cb-']:checked")
    const checkedArr = []
    for (let i = 0; i < checked.length; i++) {
      checkedArr.push(checked[i].value)
    }

    const codecs = checkedArr.join(',')

    const sendObj = {
      host,
      port,
      secret,
      codecs
    }

    const response = await fetch('/api/trunks/create_trunk', {
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
        text: 'Trunk created successfully',
        icon: 'success'
      })

      await commitChanges()

      window.location.href = '/'
    }
  })
})
