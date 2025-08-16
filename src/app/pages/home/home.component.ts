import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoComponent } from '../carrito/carrito.component';
import { ParticlesBackgroundComponent } from '../../shared/particles-background/particles-background.component';


const fetchComentarios = async () => {
  const response = await fetch('assets/data/comentarios.json'); 
  return await response.json();
};
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, ParticlesBackgroundComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  comentarios:any[]=[];

  constructor(private router: Router) {}

  ngOnInit(): void {

    fetchComentarios().then((comentarios: any[]) => {
      this.comentarios = comentarios;
      // console.log(this.comentarios);
    });
    
  }

  irALaCarta() {
    this.router.navigate(['/carta']);
  }
  
}
