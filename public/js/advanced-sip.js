/* global updateSipSettings, $, Swal, loadTrunks, gatewayMapFrom */
/*
$(document).ready(async function () {
*/
  $('#sip-settings-form').submit(async function (e) {
    e.preventDefault()

    const bindAddr = $('#bindAddr').val()
    const bindPort = $('#bindPort').val()
    const gwdo = $('*[id$="-gwdo"]')

    let gatewayMap = {}

    for (const gw of gwdo) {
      if (gw.value !== '' && !isNaN(gw.value)) {
        gatewayMap[gw.id.split('-')[0]] = gw.value
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Eroare',
          text: 'Please enter a valid dialout prefix, only numbers are allowed'
        })
        return
      }
    }

    gatewayMap = JSON.stringify(gatewayMap)

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
        title: 'Eroare',
        text: 'Invalid bind address',
        icon: 'error'
      })
      return
    }

    if (!bindPort.match(/^[0-9]+$/)) {
      await Swal.fire({
        title: 'Eroare',
        text: 'Invalid bind port',
        icon: 'error'
      })
      return
    }

    const res = await updateSipSettings(bindAddr, bindPort, gatewayMap)
    if (res.error !== true) {
      await Swal.fire({
        title: 'Succes',
        text: 'Setările SIP actualizate',
        icon: 'success'
      })
    } else {
      await Swal.fire({
        title: 'Eroare',
        text: 'Eroare în actualizarea setărilor SIP',
        icon: 'error'
      })
    }
  })
// })