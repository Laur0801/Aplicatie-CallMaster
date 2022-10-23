/* global $, Swal, getExtensions, getQueues, tippy, createQueue, qMembers, qAutoPause, qStrategy, qId, editQueue, deleteQueue  */

$(document).ready(async function () {
  const [
    extensions,
    queues
  ] = await Promise.all([
    getExtensions(),
    getQueues()
  ])

  const isCreate = window.location.pathname.includes('create')

  if (extensions.length < 1) {
    Swal.fire({
      title: 'No extensions found',
      text: 'Please add an extension before continuing',
      icon: 'error',
      confirmButtonText: 'Add extension'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/extensions/create'
      } else {
        window.location.href = '/'
      }
    })
  }

  if (queues.length < 1 && !isCreate) {
    Swal.fire({
      title: 'No queues found',
      text: 'Please add a queue before continuing',
      icon: 'error',
      confirmButtonText: 'Add queue'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/queues/create'
      } else {
        window.location.href = '/'
      }
    })
  } else {
    $('#editQueueTable').removeAttr('hidden')
  }

  const stratRadios = $('[id^=strat-]')
  stratRadios.each(async function (oneRadio) {
    const element = stratRadios[oneRadio]
    tippy(`#${element.id}`, {
      content: (stratRadios[oneRadio]).dataset.tippy
    })
  })

  const select2Arr = []
  for (let i = 0; i < extensions.length; i++) {
    select2Arr.push({
      id: extensions[i].extension,
      text: `${extensions[i].name}/${extensions[i].extension}`
    })
  }

  if (isCreate) {
    $('.queue-member-select').select2({
      data: select2Arr
    })

    $('#create-queue-form').submit(async function (e) {
      e.preventDefault()

      const name = $('#name').val()
      const strategy = $('input[name="strat-radio"]:checked').val()
      const timeout = $('#timeout').val()
      const wrapuptime = $('#wrapuptime').val()
      const autopause = $('input[name="autopause-radio"]:checked').val()
      const members = $('.queue-member-select').select2('data')

      const membersArr = []
      for (let i = 0; i < members.length; i++) {
        membersArr.push(members[i].id)
      }

      const membersStr = membersArr.join(',')

      const res = await createQueue(name, strategy, timeout, wrapuptime, autopause, membersStr)
      if (res.error === true) {
        Swal.fire({
          title: 'Error',
          text: 'Could not create queue',
          icon: 'error'
        })
      } else {
        Swal.fire({
          title: 'Success',
          text: 'Queue created',
          icon: 'success'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/'
          }
        })
      }
    })

    return
  }

  if (window.location.pathname.includes('queues/edit/')) {
    const splitMembers = (qMembers).split(',')

    for (let i = 0; i < splitMembers.length; i++) {
      for (let j = 0; j < select2Arr.length; j++) {
        if (select2Arr[j].id === splitMembers[i]) {
          select2Arr[j].selected = true
        }
      }
    }

    $('.queue-member-select').select2({
      data: select2Arr
    })

    const autopauseRadios = $('[name^=autopause-]')
    autopauseRadios.each(async function (oneRadio) {
      const element = autopauseRadios[oneRadio]
      if (element.value === qAutoPause) {
        element.checked = true
      }
    })

    const stratRadios = $('[name^=strat-radio]')
    stratRadios.each(async function (oneRadio) {
      const element = stratRadios[oneRadio]
      if (element.value === qStrategy) {
        element.checked = true
      }
    })

    $('#edit-queue-form').submit(async function (e) {
      e.preventDefault()

      const id = qId
      const name = $('#name').val()
      const strategy = $('input[name="strat-radio"]:checked').val()
      const timeout = $('#timeout').val()
      const wrapuptime = $('#wrapuptime').val()
      const autopause = $('input[name="autopause-radio"]:checked').val()
      const members = $('.queue-member-select').select2('data')
      const membersArr = []
      for (let i = 0; i < members.length; i++) {
        membersArr.push(members[i].id)
      }

      const membersStr = membersArr.join(',')
      const res = await editQueue(id, name, strategy, timeout, wrapuptime, autopause, membersStr)

      if (res.error === true) {
        Swal.fire({
          title: 'Error',
          text: 'Could not edit queue',
          icon: 'error'
        })
      } else {
        Swal.fire({
          title: 'Success',
          text: 'Queue edited',
          icon: 'success'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload()
          }
        })
      }
    })
  }

  if ($('#editQueueTable').length > 0) {
    for (let i = 0; i < queues.length; i++) {
      $('#editQueueList').append(`
            <tr>
                <td data-label="Name">${queues[i].name}</td>
                <td data-label="Strategy">${queues[i].strategy}</td>
                <td data-label="Members">${queues[i].members}</td>
                <td data-label="Created">
                    <small class="text-gray-500" title="${queues[i].created_at}">${queues[i].created_at}</small>
                </td>
                <td class="actions-cell">
                    <div class="buttons right nowrap">
                        <button class="button small green --jb-modal que-act-button" data-extid="${queues[i].id}" type="button">
                            <span class="icon"><i class="mdi mdi-eye"></i></span>
                        </button>
                        <button class="button small red --jb-modal que-act-button" data-extid="${queues[i].id}" type="button">
                            <span class="icon"><i class="mdi mdi-trash-can"></i></span>
                        </button>
                    </div>
                </td>
            </tr>
            `)

      $('.que-act-button').click(async function () {
        const id = $(this).data('extid')
        if ($(this).hasClass('red')) {
          const isConfirmed = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
          })

          if (isConfirmed.isConfirmed) {
            const res = await deleteQueue(id)
            if (res.deleted === true) {
              await Swal.fire({
                title: 'Success',
                text: 'Queue deleted',
                icon: 'success'
              })

              window.location.href = '/'
            } else {
              await Swal.fire({
                title: 'Error',
                text: 'Could not delete queue',
                icon: 'error'
              })

              window.location.reload()
            }
          } else {
            window.location.reload()
          }
        } else {
          window.location.href = `/queues/edit/${id}`
        }
      })
    }
  }
})
