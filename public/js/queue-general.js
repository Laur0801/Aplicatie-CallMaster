/* global $, Swal, loadExts, getQueues, tippy, createQueue, qAutoPause, qStrategy, qId, editQueue, deleteQueue */

$(document).ready(async function () {
  const [
    extensions,
    queues
  ] = await Promise.all([
    loadExts(),
    getQueues()
  ]);

  const isCreate = window.location.pathname.includes('create');

  if (extensions.length < 1) {
    Swal.fire({
      title: 'Nu s-au găsit extensii',
      text: 'Te rog adaugă o extensie înainte de a continua',
      icon: 'error',
      confirmButtonText: 'Adaugă extensie'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/extensions/create';
      } else {
        window.location.href = '/';
      }
    });
  }

  if (queues.length < 1 && !isCreate) {
    Swal.fire({
      title: 'Nu s-au găsit apeluri în așteptare',
      text: 'Te rog adaugă o intrare înainte de a continua',
      icon: 'error',
      confirmButtonText: 'Adaugă intrare'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/queues/create';
      } else {
        window.location.href = '/';
      }
    });
  } else {
    $('#editQueueTable').removeAttr('hidden');
  }

  const stratRadios = $('[id^=strat-]');
  stratRadios.each(async function (oneRadio) {
    const element = stratRadios[oneRadio];
    tippy(`#${element.id}`, {
      content: (stratRadios[oneRadio]).dataset.tippy
    });
  });

  if (isCreate) {
    $('#create-queue-form').submit(async function (e) {
      e.preventDefault();

      const nume = $('#name').val();
      const strategie = $('input[name="strat-radio"]:checked').val();
      const timeout = $('#timeout').val();
      const autopauza = $('input[name="autopause-radio"]:checked').val();

      const res = await createQueue(nume, strategie, timeout, autopauza);
      if (res.error === true) {
        Swal.fire({
          title: 'Eroare',
          text: 'Nu se poate crea intrarea!',
          icon: 'error'
        });
      } else {
        Swal.fire({
          title: 'Succes',
          text: 'Intrare creată',
          icon: 'success'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/';
          }
        });
      }
    });

    return;
  }

  if (window.location.pathname.includes('queues/edit/')) {
    const autopauseRadios = $('[name^=autopause-]');
    autopauseRadios.each(async function (oneRadio) {
      const element = autopauseRadios[oneRadio];
      if (element.value === qAutoPause) {
        element.checked = true;
      }
    });

    const stratRadios = $('[name^=strat-radio]');
    stratRadios.each(async function (oneRadio) {
      const element = stratRadios[oneRadio];
      if (element.value === qStrategy) {
        element.checked = true;
      }
    });

    $('#edit-queue-form').submit(async function (e) {
      e.preventDefault();

      const id = qId;
      const nume = $('#name').val();
      const strategie = $('input[name="strat-radio"]:checked').val();
      const timeout = $('#timeout').val();
      const autopauza = $('input[name="autopause-radio"]:checked').val();

      const res = await editQueue(id, nume, strategie, timeout, autopauza);

      if (res.error === true) {
        Swal.fire({
          title: 'Eroare',
          text: 'Nu se poate edita intrarea',
          icon: 'error'
        });
      } else {
        Swal.fire({
          title: 'Succes',
          text: 'Intrare editată',
          icon: 'success'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    });
  }

  if ($('#editQueueTable').length > 0) {
    for (let i = 0; i < queues.length; i++) {
      $('#editQueueList').append(`
            <tr>
                <td data-label="Nume">${queues[i].nume}</td>
                <td data-label="Strategie">${queues[i].strategie}</td>
                <td data-label="Creată">
                    <small class="text-gray-500" title="${queues[i].creat_la}">${queues[i].creat_la}</small>
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
            `);

      $('.que-act-button').click(async function () {
        const id = $(this).data('extid');
        if ($(this).hasClass('red')) {
          const isConfirmed = await Swal.fire({
            title: 'Ești sigur?',
            text: 'Această acțiune nu poate fi anulată',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Șterge',
            cancelButtonText: 'Anulează'
          });

          if (isConfirmed.isConfirmed) {
            const res = await deleteQueue(id);
            if (res.deleted === true) {
              await Swal.fire({
                title: 'Succes',
                text: 'Coadă ștearsă',
                icon: 'success'
              });

              window.location.href = '/';
            } else {
              await Swal.fire({
                title: 'Eroare',
                text: 'Nu se poate șterge intrarea',
                icon: 'error'
              });

              window.location.reload();
            }
          } else {
            window.location.reload();
          }
        } else {
          window.location.href = `/queues/edit/${id}`;
        }
      });
    }
  }
});
