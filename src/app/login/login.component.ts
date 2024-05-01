import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CrudService } from '../service/crud.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private crudService: CrudService, private router: Router,  private sessionService: SessionService) {
    this.loginForm = this.fb.group({
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
    if(this.sessionService.estaLogueado()){
      this.router.navigate(['/perfiles']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const datosLogin = {
        correoElectronico: this.loginForm.value.correoElectronico,
        contrasena: this.loginForm.value.contrasena,
      };
      this.crudService.create('login', datosLogin).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.sessionService.iniciarSesion(response.data);
            this.router.navigate(['/perfiles']);
          } else {
            // Mostrar un mensaje de error dependiendo del error recibido
            alert(`Error al iniciar sesión: ${response.error}`);
          }
        },
        error: (error) => {
          alert('Error al conectar con el backend: ' + error.message);
          console.error('Error al conectar con el backend:', error);
        }
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }
  
  registro() {
    this.router.navigate(['/registro']);
  }
}
