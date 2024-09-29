import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private usuario: any = null;
  private perfilSeleccionado: any = null;
  private memorias: { [key: string]: any[] } = {}; // Almacenar memoria de conversación por perfil y usuario

  constructor() {
    this.cargarUsuarioDeSession();
    this.cargarPerfilDeSession();
  }

  cargarUsuarioDeSession() {
    const usuarioData = sessionStorage.getItem('usuario');
    if (usuarioData) {
      this.usuario = JSON.parse(usuarioData);
      console.log('Usuario cargado de sessionStorage:', this.usuario);
    }
  }

  cargarPerfilDeSession() {
    const perfilData = sessionStorage.getItem('perfilSeleccionado');
    if (perfilData) {
      this.perfilSeleccionado = JSON.parse(perfilData);
      console.log('Perfil cargado de sessionStorage:', this.perfilSeleccionado);
    }
  }

  iniciarSesion(usuario: any) {
    this.usuario = usuario;
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    console.log('Usuario iniciado sesión:', this.usuario);
  }

  finalizarSesion() {
    sessionStorage.clear();
    this.usuario = null;
    this.perfilSeleccionado = null;
    this.memorias = {}; // Limpiar todas las memorias al finalizar la sesión
    console.log('Sesión finalizada y datos limpiados.');
  }

  obtenerUsuario() {
    console.log('Usuario obtenido:', this.usuario);
    return this.usuario;
  }

  estaLogueado() {
    return !!this.usuario;
  }

  guardarPerfilSeleccionado(perfil: any) {
    this.perfilSeleccionado = perfil;
    sessionStorage.setItem('perfilSeleccionado', JSON.stringify(perfil));
    console.log('Perfil seleccionado y guardado:', this.perfilSeleccionado);
  }

  obtenerPerfilSeleccionado() {
    console.log('Perfil seleccionado obtenido:', this.perfilSeleccionado);
    return this.perfilSeleccionado;
  }

  guardarMemoria(perfilID: number, usuarioID: number, mensajes: any[]) {
    const key = `${perfilID}-${usuarioID}`;
    console.log('Guardando memoria:', key, mensajes); // Log de memoria guardada
    this.memorias[key] = mensajes;
  }

  obtenerMemoria(perfilID: number, usuarioID: number): any[] {
    const key = `${perfilID}-${usuarioID}`;
    console.log('Obteniendo memoria para:', key); // Log al obtener memoria
    return this.memorias[key] || [];
  }

  borrarMemoria(perfilID: number, usuarioID: number) {
    const key = `${perfilID}-${usuarioID}`;
    console.log('Borrando memoria para:', key); // Log al borrar memoria
    delete this.memorias[key];
  }
}
