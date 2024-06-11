/* global $, Swal */

async function performAction(action) {
  if (action === 'toggle-theme') {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    return true; // Presupunem schimbarea temei ca reușită
  } else {
    const request = await fetch(`/api/core/action/${action}`);
    const response = await request.json();
    return response.status === true;
  }
}

$(document).ready(function () {
  $('.action-item').click(async function () {
    const action = $(this).data('action');
    const result = await performAction(action);

    let swalTitle = 'Succes';
    let swalText = 'Acțiune completată cu succes';

    if (action === 'restart') {
      swalText = 'Restart completat cu succes';
    } else if (action === 'reload') {
      swalText = 'Reîncărcare completată cu succes';
    } else if (action === 'toggle-theme') {
      swalText = 'Tema a fost schimbată cu succes';
    }

    if (result) {
      Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: 'Eroare',
        text: 'A apărut o eroare în timpul efectuării acestei acțiuni.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
});
