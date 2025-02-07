/* global $, Swal, loadExts, removeExtension */

$(document).ready(async function () {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  if (urlParams.has('error')) {
    await Swal.fire({
      title: 'Eroare',
      text: urlParams.get('error'),
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    })

    window.history.pushState({}, document.title, '/')
  }

  const extensions = await loadExts()

  if (extensions.length < 1) {
    $('#dashExtTable').html(`
            <tr>
                <td colspan="8" class="text-center">No extensions to list</td>
            </tr>
        `)
  }

  const tableBody = $('#dashExtList')

  extensions.forEach(extension => {
    const extensionRow = $(`
            <tr>
                <td class="image-cell">
                    <div class="image">
                        <img src="https://avatars.dicebear.com/v2/initials/${extension.name}.svg" class="rounded-full">
                    </div>
                </td>
                <td data-label="Nume">${extension.name}</td>
                <td data-label="Extensie">${extension.extension}</td>
                <td data-label="Creată">
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
        title: 'Ești sigur?',
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
            title: 'Succes',
            text: 'Extension removed',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          window.location.reload()
        } else {
          await Swal.fire({
            title: 'Eroare',
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
