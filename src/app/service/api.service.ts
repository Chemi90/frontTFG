import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://josemiguelruizguevara.com:5000/app/process_request';

  constructor(private http: HttpClient, private sessionService: SessionService) {}

  predict(systemContent: string, userContent: string): Observable<any> {
    const usuario = this.sessionService.obtenerUsuario();
    const perfilSeleccionado = this.sessionService.obtenerPerfilSeleccionado();

    if (!usuario || !perfilSeleccionado) {
      console.error("No se encontró el usuario o el perfil seleccionado en la sesión.");
      return throwError(() => new Error("Usuario o perfil no definido"));
    }

    // Verificar que 'usuario_id' está definido
    if (!usuario.id_usuario) {
      console.error("El usuario no tiene la propiedad 'id_usuario'.");
      return throwError(() => new Error("Usuario no tiene 'id_usuario'"));
    }

    const payload = {
      perfil_id: perfilSeleccionado.id,       // Asegúrate de que el perfil tenga un campo `id`
      usuario_id: usuario.id_usuario,         // Corregido a id_usuario
      systemContent,
      userContent
    };

    console.log("Enviando payload:", payload); // Log para verificar los datos que se envían
    return this.http.post<any>(this.apiUrl, payload);
  }
}
