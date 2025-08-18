import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Producto } from '../../model/producto.model';

@Component({
  selector: 'app-mobile-carta',
  templateUrl: './mobile-carta.component.html',
  styleUrls: ['./mobile-carta.component.css']
})
export class MobileCartaComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.productsService.getProducts().subscribe((data) => {
      this.productos = data;
    });
  }
}
