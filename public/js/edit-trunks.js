/* global $, Swal, getTrunks, removeTrunk */

$(document).ready(async function () {
  const trunks = await getTrunks()

  if (trunks.length < 1) {
    $('#editTrunkTable').html(`
            <tr>
                <td colspan="8" class="text-center">No trunks to list</td>
            </tr>
        `)
  }

  const tableBody = $('#editTrunkList')

  trunks.forEach(trunk => {
    let defaultTd = ''

    const defaultAction = (JSON.parse(trunk.default_action))
    defaultTd = `<span>${defaultAction.do}/${defaultAction.id}</span>`

    const trunkRow = $(`
            <tr>
                <td data-label="name">${trunk.name}</td>
                <td data-label="host">${trunk.host}</td>
                <td data-label="codecs">${trunk.codecs}</td>
                <td data-label="created">
                    <small class="text-gray-500" title="${trunk.created_at}">${trunk.created_at}</small>
                </td>
                <td> 
                    ${defaultTd}
                </td>
                <td class="actions-cell">
                    <div class="buttons right nowrap">
                        <button class="button small yellow --jb-modal ext-act-button" data-trunkid="${trunk.id}" type="button" title="Edit">
                            <span class="icon"><i class="mdi mdi-eye"></i></span>
                        </button>
                        <button class="button small red --jb-modal ext-act-button" data-trunkid="${trunk.id}" type="button" title="Delete">
                            <span class="icon"><i class="mdi mdi-trash-can"></i></span>
                        </button>
                    </div>
                </td>
            </tr>
        `)

    tableBody.append(trunkRow)
  })

  $('.ext-act-button').click(async function () {
    const trunkId = $(this).data('trunkid')
    console.log(trunkId)
    let actionType = ''

    if ($(this).find('i').hasClass('mdi-eye')) {
      actionType = 'view'
    } else if ($(this).find('i').hasClass('mdi-trash-can')) {
      actionType = 'remove'
    } else if ($(this).find('i').hasClass('mdi-check-circle')) {
      actionType = 'select-default'
    }

    if (actionType === 'remove') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone, this trunk will be removed',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'No, cancel'
      })

      if (result.isConfirmed) {
        const ret = await removeTrunk(trunkId)
        if (ret.deleted === true) {
          await Swal.fire({
            title: 'Success',
            text: 'Trunk removed',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          window.location.reload()
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'An error occurred while removing this extension',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
          })

          window.location.reload()
        }
      }
    } else if (actionType === 'view') {
      window.location.href = `/trunks/edit/${trunkId}`
    } else if (actionType === 'select-default') {
      const res = await window.selectDefaultTrunk(trunkId)
      if (res.updated === true) {
        await Swal.fire({
          title: 'Success',
          text: 'Default trunk updated',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })

        window.location.reload()
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'An error occurred while updating default trunk',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        })

        window.location.reload()
      }
    }
  })
})
