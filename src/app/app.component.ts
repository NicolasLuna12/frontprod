import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/nav/nav.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactoService } from './services/contacto.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    RouterOutlet,
    CarritoComponent,
    CommonModule,
    FooterComponent
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ISPC Food';
  vistaUsuario = false;
  estaAutenticado = false;
  esAdmin = false;

  constructor(public contactoService: ContactoService) {
    const email = localStorage.getItem('emailUser');
    this.estaAutenticado = !!localStorage.getItem('authToken');
    this.esAdmin = email === 'admin@admin.com';
  }

  setVistaUsuario(valor: boolean) {
    this.vistaUsuario = valor;
  }
}
