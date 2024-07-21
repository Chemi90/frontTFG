import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CrudService } from '../service/crud.service';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css'],
})
export class PerfilesComponent implements OnInit {
  perfiles: any[] = [];
  perfilSeleccionado: any;

  constructor(
    private crudService: CrudService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(): void {
    this.crudService.read('perfilIA').subscribe({
      next: (response: any) => {
        console.log('Respuesta recibida:', response); // Ver qué estás recibiendo exactamente
        if (response && response.success) {
          this.perfiles = response.data.map((perfil: any) => ({
            id: perfil[0],
            nombre: perfil[1],
            promptSystem: perfil[2],
            descripcion: perfil[3]
          }));
        } else {
          console.error('Error o no hay datos:', response ? response.error : 'Respuesta vacía o no estructurada');
          this.perfiles = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar perfiles:', error);
        this.perfiles = [];
      }
    });
  }

  irAlChat(perfil: any): void {
    console.log('Perfil seleccionado antes de guardar:', perfil);
    this.sessionService.guardarPerfilSeleccionado(perfil);
    console.log('Perfil guardado:', this.sessionService.obtenerPerfilSeleccionado());
    this.router.navigate(['/chat']);
  }

  guardarPerfilSeleccionado(perfil: any) {
    console.log('Guardando perfil seleccionado:', perfil);
    this.perfilSeleccionado = perfil;
    sessionStorage.setItem('perfilSeleccionado', JSON.stringify(perfil));
  }

  finalizarSesion(): void {
    this.sessionService.finalizarSesion();
    this.router.navigate(['/login']);  // Asegúrate de que el router está configurado correctamente para esta ruta
  }
}


/*
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CrudService } from '../service/crud.service';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css'],
})
export class PerfilesComponent implements OnInit {
  perfiles: any[] = [];
  perfilSeleccionado: any;

  constructor(
    private crudService: CrudService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(): void {
    this.crudService.read('perfilIA').subscribe({
      next: (response: any) => {
        console.log('Respuesta recibida:', response); // Ver qué estás recibiendo exactamente
        if (response && response.success) {
          this.perfiles = response.data;
        } else {
          console.error('Error o no hay datos:', response ? response.error : 'Respuesta vacía o no estructurada');
          this.perfiles = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar perfiles:', error);
        this.perfiles = [];
      }
    });
  }
  
  irAlChat(perfil: any): void {
    console.log('Perfil seleccionado antes de guardar:', perfil);
    this.sessionService.guardarPerfilSeleccionado(perfil);
    console.log('Perfil guardado:', this.sessionService.obtenerPerfilSeleccionado());
    this.router.navigate(['/chat']);
  }
  
  guardarPerfilSeleccionado(perfil: any) {
    console.log('Guardando perfil seleccionado:', perfil);
    this.perfilSeleccionado = perfil;
    sessionStorage.setItem('perfilSeleccionado', JSON.stringify(perfil));
  }
  
  finalizarSesion(): void {
    this.sessionService.finalizarSesion();
    this.router.navigate(['/login']);  // Asegúrate de que el router está configurado correctamente para esta ruta
  }
}
*/
