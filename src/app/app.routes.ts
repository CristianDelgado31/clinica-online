import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

export const routes: Routes = [
    { path: 'home', title: 'Home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'register', title: 'Register', component: RegisterComponent},
    { path: 'login', title: 'Login', component: LoginComponent},
    { path: 'perfil', title: 'Perfil', component: PerfilComponent},
    { path: 'usuarios', title: 'Usuarios', component: UsuariosComponent}
];
