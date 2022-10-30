/* global updateSipSettings, $, Swal, getTrunks, gatewayMapFrom */

$(document).ready(async function () {
  const trunks = await getTrunks()
  const parsedGwMap = (gatewayMapFrom === '') ? '' : JSON.parse(gatewayMapFrom)

  for (const trunk of trunks) {
    let gwDo = ''
    if (parsedGwMap !== '') {
      gwDo = JSON.parse(gatewayMapFrom)[trunk.name]
    }

    $('#trunk-settings').append(`
    <div class="field">
      <div class="field-body">
        <div class="field">
          <label class="label">Dialout prefix for ${trunk.name} <a class="required-field">*</a></label>
          <div class="control icons-left">
            <input class="input" type="text" placeholder="" id="${trunk.name}-gwdo" value="${gwDo}">
            <span class="icon left"><i class="mdi mdi-serial-port"></i></span>
          </div>
        </div>
      </div>
    </div><br>`)
  }

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
          title: 'Error',
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

    const res = await updateSipSettings(bindAddr, bindPort, gatewayMap)
    if (res.error !== true) {
      await Swal.fire({
        title: 'Success',
        text: 'SIP settings updated',
        icon: 'success'
      })
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'Error updating SIP settings',
        icon: 'error'
      })
    }
  })
})
