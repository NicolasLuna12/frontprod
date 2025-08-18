import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MobileHomeComponent } from './mobile-home.component';
import { MobileCartaComponent } from './mobile-carta.component';
import { MobileCarritoComponent } from './mobile-carrito.component';
import { MobilePerfilComponent } from './mobile-perfil.component';
import { MobileContactoComponent } from './mobile-contacto.component';
import { MobileDashboardComponent } from './mobile-dashboard.component';
import { MobileLoginComponent } from './mobile-login.component';
import { MobileRegistroComponent } from './mobile-registro.component';
import { MobileExitoComponent } from './mobile-exito.component';
import { MobileErrorComponent } from './mobile-error.component';
import { RouterModule, Routes } from '@angular/router';
import { MobileNavComponent } from './mobile-nav.component';
import { Mobile404Component } from './mobile-404.component';

const routes: Routes = [
  { path: '', component: MobileHomeComponent },
  { path: 'carta', component: MobileCartaComponent },
  { path: 'carrito', component: MobileCarritoComponent },
  { path: 'perfil', component: MobilePerfilComponent },
  { path: 'contacto', component: MobileContactoComponent },
  { path: 'dashboard', component: MobileDashboardComponent },
  { path: 'login', component: MobileLoginComponent },
  { path: 'registro', component: MobileRegistroComponent },
  { path: 'exito', component: MobileExitoComponent },
  { path: 'error', component: MobileErrorComponent },
  { path: '**', component: Mobile404Component },
];

@NgModule({
  declarations: [
    MobileHomeComponent,
    MobileCartaComponent,
    MobileCarritoComponent,
    MobilePerfilComponent,
    MobileContactoComponent,
    MobileDashboardComponent,
    MobileLoginComponent,
    MobileRegistroComponent,
    MobileExitoComponent,
    MobileErrorComponent,
    MobileNavComponent,
    Mobile404Component
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  exports: [
    MobileHomeComponent,
    MobileCartaComponent,
    MobileCarritoComponent,
    MobilePerfilComponent,
    MobileContactoComponent,
    MobileDashboardComponent,
    MobileLoginComponent,
    MobileRegistroComponent,
    MobileExitoComponent,
    MobileErrorComponent,
    MobileNavComponent,
    Mobile404Component
  ]
})
export class MobileModule {}
