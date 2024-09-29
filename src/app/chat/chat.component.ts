import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../service/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

interface Mensaje {
  id: number;
  tipo: 'enviado' | 'recibido';
  texto: string;
  fecha: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
}

interface Perfil {
  id: number;
  nombre: string;
  promptSystem: string;
}

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
export class ChatComponent implements OnInit, AfterViewChecked {
  userInput: string = ''; // Inicializar como cadena vacía
  nombrePerfil: string = '';
  conversacion: any[] = [];
  response: any;
  systemInput: string = ''; // Inicializar como cadena vacía
  isLoading: boolean = false;

  @ViewChild('messagesContainer')
  private messagesContainer!: ElementRef;

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService,
    private router: Router,
    private crudService: CrudService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
    
    console.log('Perfil obtenido:', perfil);
    console.log('Usuario obtenido:', usuario);

    if (perfil && usuario && usuario.id_usuario) {
      this.nombrePerfil = perfil.nombre;
      this.systemInput = perfil.promptSystem;
      console.log('Perfil seleccionado:', perfil);
      console.log('System input asignado:', this.systemInput);

      this.cargarMensajes();
    } else {
      console.error('Perfil o usuario no definido o id_usuario no disponible');
      this.router.navigate(['/perfiles']);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendInput(): void {
    if (!this.userInput.trim()) {
      console.log('El input del usuario está vacío.');
      return;
    }

    this.isLoading = true;
    console.log('Enviando datos:', { systemContent: this.systemInput, userContent: this.userInput });
    console.log('System content que se enviará:', this.systemInput);
    console.log('User content que se enviará:', this.userInput);

    // Ya no es necesario usar aserciones `!`
    this.apiService.predict(this.systemInput, this.userInput).subscribe({
      next: (data) => {
        if (data && data.response) {
          this.response = data.response;
          this.guardarMensajeEnviado(this.userInput);
          this.guardarMensajeRecibido(this.response);
          this.userInput = '';
        } else {
          console.error('Formato de respuesta inesperado:', data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al recibir respuesta:', error);
        this.isLoading = false;
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
        const nuevoMensaje = {
          tipo: 'enviado',
          texto: mensaje,
          fecha: this.formatDate(fechaGuardado)
        };
        this.conversacion.push(nuevoMensaje);
        this.actualizarMemoria();
        this.scrollToBottom();
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
        const nuevoMensaje = {
          tipo: 'recibido',
          texto: mensaje,
          fecha: this.formatDate(fechaGuardado)
        };
        this.conversacion.push(nuevoMensaje);
        this.actualizarMemoria();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error al guardar el mensaje recibido', error);
      }
    });
  }  

  agregarYMzclarMensajes(nuevosMensajes: any[]): void {
    console.log('Agregando y mezclando mensajes:', nuevosMensajes); // Log al agregar y mezclar mensajes
    this.conversacion = [...this.conversacion, ...nuevosMensajes];
    this.ordenarMensajes();
    this.actualizarMemoria();
  }
  
  cargarMensajes(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
  
    if (!perfil || !usuario) {
      console.error('Perfil o usuario no seleccionado.');
      return;
    }

    const memoria = this.sessionService.obtenerMemoria(perfil.id, usuario.id_usuario);
    console.log('Memoria cargada:', memoria); // Log de la memoria cargada
    if (memoria.length > 0) {
      this.conversacion = memoria;
      this.scrollToBottom();
    } else {
      forkJoin({
        enviados: this.crudService.create('mostrarMensajeEnviado', { perfilIAID: perfil.id, usuarioID: usuario.id_usuario }).pipe(
          map((response: any) => response.success && response.data ? response.data.map((mensaje: any) => ({
            id: mensaje.MensajeEnviadoID,
            tipo: 'enviado',
            texto: mensaje.CuerpoMensaje,
            fecha: this.formatDateFromServer(mensaje.FechaGuardado, -8) // Restar 8 horas
          })) : [])
        ),
        recibidos: this.crudService.create('mostrarMensajeRecibido', { perfilIAID: perfil.id, usuarioID: usuario.id_usuario }).pipe(
          map((response: any) => response.success && response.data ? response.data.map((mensaje: any) => ({
            id: mensaje.MensajeRecibidoID,
            tipo: 'recibido',
            texto: mensaje.CuerpoMensaje,
            fecha: this.formatDateFromServer(mensaje.FechaGuardado, -2) // Restar 2 horas
          })) : [])
        )
      }).subscribe(({ enviados, recibidos }: { enviados: Mensaje[], recibidos: Mensaje[] }) => {
        const mensajesTemporales = [...enviados, ...recibidos];
        this.agregarYMzclarMensajes(mensajesTemporales);
        this.scrollToBottom();
      });
    }
  }

  actualizarMemoria(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
    if (perfil && usuario) {
      this.sessionService.guardarMemoria(perfil.id, usuario.id_usuario, this.conversacion);
    }
  }

  ordenarMensajes(): void {
    this.conversacion.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      if (fechaA === fechaB) {
        return a.tipo === 'enviado' ? -1 : 1; // Si las fechas son iguales, "recibido" va primero
      }
      return fechaA - fechaB;
    });
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  formatDateFromServer(date: string, offsetHours: number): string {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + offsetHours);
    return this.datePipe.transform(adjustedDate, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al desplazar al final:', err);
    }
  }

  autoResizeTextarea(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  handleTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendInput();
    }
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
          this.conversacion = this.conversacion.filter(msg => msg.id !== mensajeID);
          this.ordenarMensajes();
          this.actualizarMemoria();
          this.scrollToBottom();
        } else {
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
          this.conversacion = this.conversacion.filter(msg => msg.id !== mensajeID);
          this.ordenarMensajes();
          this.actualizarMemoria();
          this.scrollToBottom();
        } else {
          console.error('Error al borrar mensaje recibido:', response.error);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de borrado del mensaje recibido:', error);
      }
    });
  }
  
  volverAPerfiles(): void {
    const perfil = this.sessionService.obtenerPerfilSeleccionado();
    const usuario = this.sessionService.obtenerUsuario();
    if (perfil && usuario) {
      this.sessionService.borrarMemoria(perfil.id, usuario.id_usuario);
    }
    this.router.navigate(['/perfiles']);
  }
}
