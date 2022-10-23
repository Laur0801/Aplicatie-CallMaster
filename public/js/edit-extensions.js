/* global $, Swal, getExtensions, removeExtension */

$(document).ready(async function () {
  const extensions = await getExtensions()

  if (extensions.length < 1) {
    $('#editExtTable').html(`
            <tr>
                <td colspan="8" class="text-center">No extensions to list</td>
            </tr>
        `)
  }

  const tableBody = $('#editExtList')

  extensions.forEach(extension => {
    const extensionRow = $(`
            <tr>
                <td class="image-cell">
                    <div class="image">
                        <img src="https://avatars.dicebear.com/v2/initials/${extension.name}.svg" class="rounded-full">
                    </div>
                </td>
                <td data-label="Name">${extension.name}</td>
                <td data-label="Extension">${extension.extension}</td>
                <td data-label="Created">
                    <small class="text-gray-500" title="${extension.created_at}">${extension.created_at}</small>
                </td>
                <td class="actions-cell">
                    <div class="buttons right nowrap">
                        <button class="button small green --jb-modal ext-act-button" data-extid="${extension.id}" type="button">
                            <span class="icon"><i class="mdi mdi-eye"></i></span>
                        </button>
                        <button class="button small red --jb-modal ext-act-button" data-extid="${extension.id}" type="button">
                            <span class="icon"><i class="mdi mdi-trash-can"></i></span>
                        </button>
                    </div>
                </td>
            </tr>
        `)

    tableBody.append(extensionRow)
  })

  $('.ext-act-button').click(async function () {
    const extId = $(this).data('extid')
    console.log(extId)
    const actionType = $(this).find('i').hasClass('mdi-eye') ? 'view' : 'remove'
    if (actionType === 'remove') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone, this extension will be removed',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'No, cancel'
      })

      if (result.isConfirmed) {
        const ret = await removeExtension(extId)
        if (ret.deleted === true) {
          await Swal.fire({
            title: 'Success',
            text: 'Extension removed',
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
    } else {
      window.location.href = `/extensions/edit/${extId}`
    }
  })
})
