/* global $, Swal, loadExts, removeExtension */

$(document).ready(async function () {
  const extensions = await loadExts()

  if (extensions.length < 1) {
    $('#editExtTable').html(`
            <tr>
                <td colspan="8" class="text-center">Nu există extensii de listat</td>
            </tr>
        `)
  }

  const tableBody = $('#editExtList')

  extensions.forEach(extension => {
    const extensionRow = $(`
            <tr>
                <td class="image-cell">
                    <div class="image">
                        <img src="https://avatars.dicebear.com/v2/initials/${extension.nume}.svg" class="rounded-full">
                    </div>
                </td>
                <td data-label="Nume">${extension.nume}</td>
                <td data-label="Extensie">${extension.extensie}</td>
                <td data-label="Creată">
                    <small class="text-gray-500" title="${extension.creat_la}">${extension.creat_la}</small>
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
        title: 'Ești sigur?',
        text: 'Această acțiune nu poate fi anulată, extensia va fi eliminată',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Da, șterge',
        cancelButtonText: 'Nu, anulează'
      })

      if (result.isConfirmed) {
        const ret = await removeExtension(extId)
        if (ret.deleted === true) {
          await Swal.fire({
            title: 'Succes',
            text: 'Extensie ștearsă',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          window.location.reload()
        } else {
          await Swal.fire({
            title: 'Eroare',
            text: 'A apărut o eroare la ștergerea acestei extensii',
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
