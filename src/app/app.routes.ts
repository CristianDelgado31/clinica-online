import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { TurnosAdministradorComponent } from './components/turnos-administrador/turnos-administrador.component';

export const routes: Routes = [
    { path: 'home', title: 'Home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'register', title: 'Register', component: RegisterComponent},
    { path: 'login', title: 'Login', component: LoginComponent},
    { path: 'perfil', title: 'Perfil', component: PerfilComponent},
    { path: 'usuarios', title: 'Usuarios', component: UsuariosComponent},
    { path: 'solicitar-turno', title: 'Solicitar Turno', component: SolicitarTurnoComponent},
    // {
    //     path: 'mis-turnos', title: 'Mis Turnos', component: MisTurnosComponent
    // },
    {
        path: 'mis-turnos', title: 'Mis Turnos', component: MisTurnosComponent,
    },
    {
        path: 'turnos', title: 'Turnos', component: TurnosAdministradorComponent,
    }
    
];
