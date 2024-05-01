import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    correoElectronico: ['', [Validators.required, Validators.email]],
    clave: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.crudService.create('registroUsuario', this.registroForm.value).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Registro exitoso!');
            this.router.navigate(['/login']);
          } else {
            alert(response.error || 'Error al registrar');
          }
        },
        error: (error) => {
          console.error('Error al registrar el usuario:', error);
          alert('Error en la conexión al servidor');
        },
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }

  volverAlLogin(): void {
    this.router.navigate(['/login']);
  }
}
