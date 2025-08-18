import { Component } from '@angular/core';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-mobile-contacto',
  templateUrl: './mobile-contacto.component.html',
  styleUrls: ['./mobile-contacto.component.css']
})
export class MobileContactoComponent {
  nombre: string = '';
  email: string = '';
  mensaje: string = '';
  enviado: boolean = false;

  constructor(private contactoService: ContactoService) {}

  enviar() {
    const texto = `Hola, soy ${this.nombre} (${this.email}). ${this.mensaje}`;
    this.contactoService.abrirWhatsApp(texto);
    this.enviado = true;
  }
}
