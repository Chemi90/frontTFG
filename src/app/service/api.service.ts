import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://josemiguelruizguevara.com/IA/app.php'; // Asegúrate de que la URL es correcta

  constructor(private http: HttpClient) { }

  predict(systemContent: string, userContent: string) {
    return this.http.post<any>(this.apiUrl, { systemContent, userContent });
  }
}
