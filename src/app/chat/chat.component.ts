import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../service/api.service';
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  providers: [DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  userInput: string = '';
  nombrePerfil: string = '';
  conversacion: any[] = [];
  response: any;
  systemInput: string;  // Asegúrate de que este tipo sea string
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService,
    private router: Router,
    private crudService: CrudService,
    private datePipe: DatePipe
  ) {}

  autoResizeTextarea(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Resetea la altura
    if (textarea.scrollHeight < 200) { // 200px es la altura máxima que deseas
      textarea.style.height = textarea.scrollHeight + 'px';
    } else {
      textarea.style.overflowY = 'auto'; // Asegura que el scroll aparece si se alcanza la altura máxima
      textarea.style.height = '200px';
    }
  }
  
  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  formatReceivedDate(date: string | Date): string {
    const adjustedDate = new Date(new Date(date).getTime() + 6 * 60 * 60 * 1000); // Suma 6 horas
    return this.datePipe.transform(adjustedDate, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  handleTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Evita el salto de línea
      this.sendInput(); // Llama a tu función para enviar el mensaje
    }
  }  

  ngOnInit(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
  
    // Comprobar si tanto el perfil como el usuario están definidos y el usuario tiene un id.
    if (perfil && usuario && usuario.id_usuario) {
      this.nombrePerfil = perfil.nombre; // Asignar el nombre del perfil a una variable para usar en la vista, por ejemplo.
      this.systemInput = perfil.promptSystem; // Asegúrate de que esto es correcto y coincide con el nombre de la propiedad en el perfil.
  
      // Llamar a cargarMensajes que internamente maneja todo lo necesario sin requerir parámetros.
      this.cargarMensajes();
    } else {
      console.error('Perfil o usuario no definido o id_usuario no disponible');
      this.router.navigate(['/perfiles']); // Redirecciona al usuario a seleccionar un perfil si no hay uno adecuado.
    }
  }
  
  sendInput(): void {
    if (!this.userInput.trim()) {
      console.log('El input del usuario está vacío.');
      return; // Evita enviar mensajes vacíos
    }
  
    this.isLoading = true; // Activar el overlay antes de la llamada API
    this.apiService.predict(this.systemInput, this.userInput).subscribe({
      next: (data) => {
        if (data && data.response) {
          this.response = data.response;
          this.guardarMensajeEnviado(this.userInput);
          this.guardarMensajeRecibido(this.response);
          this.userInput = ''; // Limpia el userInput para el próximo mensaje
        } else {
          console.error('Formato de respuesta inesperado:', data);
        }
        this.isLoading = false; // Desactivar el overlay cuando se recibe la respuesta
      },
      error: (error) => {
        console.error('Error al recibir respuesta:', error);
        this.isLoading = false; // Desactivar el overlay en caso de error
      }
    });
  }
  
  guardarMensajeEnviado(mensaje: string): void {
    const usuarioID = this.sessionService.obtenerUsuario().id_usuario;
    const perfilIAID = this.sessionService.obtenerPerfilSeleccionado().id;
    const datos = { cuerpoMensaje: mensaje, usuarioID, perfilIAID };
  
    this.crudService.create('guardarMensajeEnviado', datos).subscribe({
      next: (response) => {
        const fechaGuardado = new Date();
        // Agrega el mensaje al inicio del array
        this.conversacion.unshift({
          tipo: 'enviado',
          texto: mensaje,
          fecha: this.formatDate(fechaGuardado)
        });
        // Opcional: Ordena si es necesario por alguna razón
        this.conversacion.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      },
      error: (error) => {
        console.error('Error al guardar el mensaje enviado', error);
      }
    });
  }
  
  guardarMensajeRecibido(mensaje: string): void {
    const usuarioID = this.sessionService.obtenerUsuario().id_usuario;
    const perfilIAID = this.sessionService.obtenerPerfilSeleccionado().id;
    this.crudService.create('guardarMensajeRecibido', { cuerpoMensaje: mensaje, usuarioID, perfilIAID }).subscribe({
      next: (response) => {
        const fechaGuardado = new Date();
        // Agrega el mensaje al inicio del array
        this.conversacion.unshift({
          tipo: 'recibido',
          texto: mensaje,
          fecha: this.formatDate(fechaGuardado)
        });
        // Opcional: Ordena si es necesario por alguna razón
        this.conversacion.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      },
      error: (error) => {
        console.error('Error al guardar el mensaje recibido', error);
      }
    });
  }  

  agregarYMzclarMensajes(nuevosMensajes: any[]): void {
    this.conversacion = [...this.conversacion, ...nuevosMensajes]; // Añade nuevos mensajes a la conversación existente
    this.conversacion.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Ordena por fecha descendente
  }
  
  cargarMensajes(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
  
    if (!perfil || !usuario) {
      console.error('Perfil o usuario no seleccionado.');
      return;
    }
  
    forkJoin({
      enviados: this.crudService.create('mostrarMensajeEnviado', { perfilIAID: perfil.id, usuarioID: usuario.id_usuario }).pipe(
        map((response: any) => response.success && response.data ? response.data.map((mensaje: any) => ({
          id: mensaje.MensajeEnviadoID,
          tipo: 'enviado',
          texto: mensaje.CuerpoMensaje,
          fecha: this.formatDate(mensaje.FechaGuardado)
        })) : [])
      ),
      recibidos: this.crudService.create('mostrarMensajeRecibido', { perfilIAID: perfil.id, usuarioID: usuario.id_usuario }).pipe(
        map((response: any) => response.success && response.data ? response.data.map((mensaje: any) => ({
          id: mensaje.MensajeRecibidoID,
          tipo: 'recibido',
          texto: mensaje.CuerpoMensaje,
          fecha: this.formatReceivedDate(mensaje.FechaGuardado)
        })) : [])
      )
    }).subscribe(({ enviados, recibidos }) => {
      // Añade los mensajes recibidos y enviados al array temporal
      const mensajesTemporales = [...enviados, ...recibidos];
      // Ordena los mensajes por fecha
      mensajesTemporales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      // Asigna el array ordenado a la conversación que se muestra en el HTML
      this.conversacion = mensajesTemporales;
    });
  }
  
  borrarMensaje(mensaje: any): void {
    console.log('Intentando borrar mensaje:', mensaje);
  
    if (mensaje.tipo === 'enviado') {
      this.borrarMensajeEnviado(mensaje.id);
    } else if (mensaje.tipo === 'recibido') {
      this.borrarMensajeRecibido(mensaje.id);
    }
  }
  
  borrarMensajeEnviado(mensajeID: number): void {
    console.log('Intentando borrar el mensaje enviado con ID:', mensajeID);
    this.crudService.delete('borrarMensajeEnviado', mensajeID).subscribe({
      next: (response: any) => {
        console.log('Respuesta al borrar mensaje enviado:', response);
        if (response.success) {
          this.cargarMensajes();  // Recargar los mensajes para actualizar la UI
        } else {
          this.cargarMensajes();
          console.error('Error al borrar mensaje enviado:', response.error);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de borrado del mensaje enviado:', error);
      }
    });
  }
  
  borrarMensajeRecibido(mensajeID: number): void {
    console.log('Intentando borrar el mensaje recibido con ID:', mensajeID);
    this.crudService.delete('borrarMensajeRecibido', mensajeID).subscribe({
      next: (response: any) => {
        console.log('Respuesta al borrar mensaje recibido:', response);
        if (response.success) {
          this.cargarMensajes();  // Recargar los mensajes para actualizar la UI
        } else {
          this.cargarMensajes();
          console.error('Error al borrar mensaje recibido:', response.error);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de borrado del mensaje recibido:', error);
      }
    });
  }
  
  volverAPerfiles(): void {
    this.router.navigate(['/perfiles']);
  }
}
