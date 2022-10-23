/* global $, Swal, FilePond, FilePondPluginFileValidateType, getAllSounds, removeSound */

$(document).ready(async function () {
  FilePond.registerPlugin(FilePondPluginFileValidateType)

  $('.sound-pond').filepond({
    allowMultiple: false,
    allowReorder: false,
    acceptedFileTypes: ['audio/mpeg'],
    server: '/ivr/sounds/upload'
  })

  const allSounds = await getAllSounds()
  if (allSounds.length > 0) {
    $('#sounds-list-section').removeAttr('hidden')

    allSounds.forEach(async (sound) => {
      const cleanedName = sound.replace('.wav', '')
      $('#editSoundsList').append(`
            <tr>
                <td>
                <a class="card-header-title">${cleanedName}</a>
                </td>
                <td class="actions-cell">
                    <div class="buttons right nowrap">
                        <button class="button small red --jb-modal sound-rm-button" data-name="${sound}" type="button">
                            <span class="icon"><i class="mdi mdi-trash-can"></i></span>
                        </button>
                    </div>
                </td>
            </tr>
            `)
    })
  }

  $('#add-sounds-form').submit(async function (e) {
    e.preventDefault()
    if ($('.sound-pond').filepond('getFiles').length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Please select a file to upload'
      })
      return
    }

    const file = $('.sound-pond').filepond('getFiles')[0]
    const serverRes = (JSON.parse(file.serverId))

    if (Object.prototype.hasOwnProperty.call(serverRes, 'error')) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Server upload or file validation error'
      })

      window.location.reload()
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'File uploaded successfully'
      })
      window.location.reload()
    }
  })

  $('.sound-rm-button').click(async function () {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone, this sound will be removed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'No, cancel'
    })

    if (confirm.isConfirmed) {
      let soundName = $(this).data('name')
      soundName = soundName.replace('.wav', '-zyvo.wav')
      const removed = await removeSound(soundName)
      if (removed.error === true) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not delete file'
        })
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'File deleted successfully'
        })
        window.location.reload()
      }
    }
  })
})
