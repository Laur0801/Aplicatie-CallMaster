/* global updateSipSettings, $, Swal */

$(document).ready(async function () {
  $('#sip-settings-form').submit(async function (e) {
    e.preventDefault()

    const bindAddr = $('#bindAddr').val()
    const bindPort = $('#bindPort').val()

    if (bindAddr === '' || bindPort === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields!'
      })
      return
    }

    if (!bindAddr.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid bind address',
        icon: 'error'
      })
      return
    }

    if (!bindPort.match(/^[0-9]+$/)) {
      await Swal.fire({
        title: 'Error',
        text: 'Invalid bind port',
        icon: 'error'
      })
      return
    }

    const res = await updateSipSettings(bindAddr, bindPort)
    console.log(res)
  })
})
