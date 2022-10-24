/* global $, Swal, getIVRs, setDefaultIVR, deleteIVR */

$(document).ready(async function () {
  const IVRs = await getIVRs()
  $('#editIVRtable').removeAttr('hidden')

  if (IVRs.length < 1) {
    $('#editIVRtable').html(`
            <tr>
                <td colspan="8" class="text-center">No IVRs to list</td>
            </tr>
    `)
  }

  const tableBody = $('#editIVRList')

  for (let i = 0; i < IVRs.length; i++) {
    const IVR = IVRs[i]

    let defaultTd = ''

    if (IVR.isDefault !== 0 && IVR.isDefault !== null && IVR.isDefault !== 'NULL' && IVR.isDefault !== '0') {
      defaultTd = '<span><i class="mdi mdi-check-circle" titls="Default"></i></span>'
    } else {
      defaultTd = '<span><i class="mdi mdi-alert-octagram" title="Not default"></i></span>'
    }

    const IVRRow = $(`
            <tr>
                <td data-label="Default">
                  ${defaultTd}
                </td>
                <td data-label="Name">${IVR.name}</td>
                <td data-label="Default Extension">${IVR.default_extension}</td>
                <td data-label="Created">${IVR.created_at}</td>
                <td class="actions-cell">
                <div class="buttons right nowrap">
                    <button class="button small green --jb-modal ivr-act-button" data-ivrid="${IVR.id}" type="button" title="Select Default">
                      <span class="icon"><i class="mdi mdi-check-circle"></i></span>
                    </button>
                    <button class="button small yellow --jb-modal ivr-act-button" data-ivrid="${IVR.id}" type="button" title="Edit IVR">
                        <span class="icon"><i class="mdi mdi-eye"></i></span>
                    </button>
                    <button class="button small red --jb-modal ivr-act-button" data-ivrid="${IVR.id}" type="button" title="Delete IVR">
                        <span class="icon"><i class="mdi mdi-trash-can"></i></span>
                    </button>
                </div>
            </td>
            </tr>
        `)

    tableBody.append(IVRRow)
  }

  $('.ivr-act-button').click(async function () {
    const title = $(this).attr('title')
    let action = ''

    if (title === 'Select Default') {
      action = 'set_default'
    } else if (title === 'Edit IVR') {
      action = 'edit'
    } else if (title === 'Delete IVR') {
      action = 'delete'
    }

    const IVRId = $(this).attr('data-ivrid')

    if (action === 'set_default') {
      const res = await setDefaultIVR(IVRId)
      if (res.error === false) {
        await Swal.fire({
          title: 'Success',
          text: 'IVR menu set as default',
          icon: 'success',
          confirmButtonText: 'Ok'
        })
        window.location.reload()
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Error setting IVR menu as default',
          icon: 'error',
          confirmButtonText: 'Ok'
        })
      }
    } else if (action === 'edit') {
      window.location.href = `/ivr/edit/${IVRId}`
    } else if (action === 'delete') {
      const res = await deleteIVR(IVRId)
      if (res.error === false) {
        await Swal.fire({
          title: 'Success',
          text: 'IVR menu deleted',
          icon: 'success',
          confirmButtonText: 'Ok'
        })
        window.location.reload()
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Error deleting IVR menu',
          icon: 'error',
          confirmButtonText: 'Ok'
        })
      }
    }
  })
})
