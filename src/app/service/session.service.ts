import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private usuario: any = null;
  private perfilSeleccionado: any = null;

  constructor() {
    this.cargarUsuarioDeSession();
    this.cargarPerfilDeSession();
  }

  cargarUsuarioDeSession() {
    const usuarioData = sessionStorage.getItem('usuario');
    if (usuarioData) {
      this.usuario = JSON.parse(usuarioData);
    }
  }

  cargarPerfilDeSession() {
    const perfilData = sessionStorage.getItem('perfilSeleccionado');
    if (perfilData) {
      this.perfilSeleccionado = JSON.parse(perfilData);
    }
  }

  iniciarSesion(usuario: any) {
    this.usuario = usuario;
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  }

  finalizarSesion() {
    sessionStorage.clear();
    this.usuario = null;
    this.perfilSeleccionado = null;
  }

  obtenerUsuario() {
    return this.usuario;
  }

  estaLogueado() {
    return !!this.usuario;
  }

  guardarPerfilSeleccionado(perfil: any) {
    this.perfilSeleccionado = perfil;
    sessionStorage.setItem('perfilSeleccionado', JSON.stringify(perfil));
  }

  obtenerPerfilSeleccionado() {
    return this.perfilSeleccionado;
  }
}
