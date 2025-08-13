import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  form!: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email], []],
      asunto: ['', [Validators.required],[]],
      mensaje: ['',[Validators.required], []],
    });
  }


  onEnviar(event: Event): void {
    event.preventDefault;
    if (this.form.valid) {
      // Formulario válido - procesando
    } else {
      this.form.markAllAsTouched();
      // Error en validación del formulario
    }
  }
  enviarMensaje() {
    // Enviando mensaje de contacto
  }

  get Nombre()
  {
  return this.form.get("nombre");
  }

  get Email()
  {
  return this.form.get("email");
  }

  get Asunto()
  {
  return this.form.get("asunto");
  }

  get Mensaje()
  {
  return this.form.get("mensaje");
  }




}
