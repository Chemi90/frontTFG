import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  public server = 'https://josemiguelruizguevara.com:5000/api/'; // Nueva URL para Flask

  constructor(private http: HttpClient) {}

  create(endpoint: string, data: any) {
    return this.http.post(this.server + endpoint, data); // Elimina '.POST.php'
  }

  read(endpoint: string, id: any = null) {
    return this.http.get(
      this.server + endpoint + (id ? '?id=' + id : '') // Elimina '.GET.php'
    );
  }

  update(endpoint: string, id: number, data: any) {
    return this.http.put(
      this.server + endpoint + '?id=' + id, // Elimina '.PUT.php'
      data
    );
  }

  delete(endpoint: string, id: number) {
    return this.http.delete(
      this.server + endpoint + '?id=' + id // Elimina '.DELETE.php'
    );
  }
}


/*
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  public server = 'https://josemiguelruizguevara.com/ia/API/';

  constructor(private http: HttpClient) {}

  create(endpoint: string, data: any) {
    return this.http.post(this.server + endpoint + '.POST.php', data);
  }

  read(endpoint: string, id: any = null) {
    return this.http.get(
      this.server + endpoint + '.GET.php' + (id ? '?id=' + id : '')
    );
  }

  update(endpoint: string, id: number, data: any) {
    return this.http.put(
      this.server + endpoint + '.PUT.php' + '?id=' + id,
      data
    );
  }

  delete(endpoint: string, id: number) {
    return this.http.delete(
      this.server + endpoint + '.DELETE.php' + '?id=' + id
    );
  }
}
*/
