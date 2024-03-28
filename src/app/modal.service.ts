import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor() {}

  openModal() {
    const modal = document.getElementById('myModal');

    modal!.classList.add('show');

    modal!.style.display = 'block';

    document.body.classList.add('modal-open');
  }

  closeModal() {
    const modal = document.getElementById('myModal');

    modal!.classList.remove('show');

    modal!.style.display = 'none';

    document.body.classList.remove('modal-open');

    window.location.reload();
  }

  preventClose(event: any) {
    event.stopPropagation();
  }
}
