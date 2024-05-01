import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { RegistroComponent } from './registro/registro.component';
import { LoginComponent } from './login/login.component';
import { PerfilesComponent } from './perfiles/perfiles.component';

export const routes: Routes = [
    {path: 'login', component:LoginComponent},
    {path: 'registro', component:RegistroComponent},
    {path: 'perfiles', component:PerfilesComponent},
    {path: 'chat', component:ChatComponent},
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: '**', redirectTo: 'login', pathMatch: 'full'}
];
