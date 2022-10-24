/* global $, Swal, codecsSrc, editTrunk, isDefault */

$(document).ready(async function () {
  const codecsArr = codecsSrc.split(',')

  $("input[id^='cb-']").each(async function () {
    if (codecsArr.includes(this.value)) {
      $(this).prop('checked', true)
    }
  })

  $('#edit-trunk-form').submit(async function (e) {
    e.preventDefault()

    const host = $('#host').val()
    const port = $('#port').val()
    const secret = $('#secret').val()
    const user = $('#user').val()

    const url = new URL(window.location.href)
    const pathname = ((url.pathname).split('/'))
    const id = pathname[pathname.length - 1]

    if (!host.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid host address',
        icon: 'error'
      })
      return
    }

    const checked = $("input[id^='cb-']:checked")
    const checkedArr = []
    for (let i = 0; i < checked.length; i++) {
      checkedArr.push(checked[i].value)
    }

    const codecs = checkedArr.join(',')
    const response = await editTrunk(id, host, port, secret, user, codecs, isDefault)

    if (response.error === false) {
      await Swal.fire({
        title: 'Success',
        text: 'Trunk updated',
        icon: 'success'
      })
      window.location.href = '/trunks/edit'
    } else {
      await Swal.fire({
        title: 'Error',
        text: response.error,
        icon: 'error'
      })
    }
  })
})
