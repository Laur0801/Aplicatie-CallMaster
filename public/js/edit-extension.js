/* global $, Swal, editExtension */

$(document).ready(function () {
  $('#edit-extension-form').submit(async function (e) {
    e.preventDefault();
    
    // Obține ID-ul din URL
    const url = new URL(window.location.href);
    const pathname = url.pathname.split('/');
    const id = pathname[pathname.length - 1];
    
    // Obține valorile din formular
    const nume = $('#nume').val();
    const extensie = $('#extensie').val();
    const parola = $('#parola').val();

    // Trimite datele către server
    const response = await editExtension(id, nume, extensie, parola);

    if (response.error) {
      await Swal.fire({
        icon: 'error',
        title: 'Eroare',
        text: 'Nu s-a putut edita extensia'
      });
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Succes',
        text: 'Extensie editată'
      });

      window.location.href = '/extensions/edit';
    }
  });
});

// Definim funcția `editExtension`
async function editExtension(id, nume, extensie, parola) {
  const response = await fetch('/api/extensions/update_extension', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, nume, extensie, parola })
  });

  return await response.json();
}
