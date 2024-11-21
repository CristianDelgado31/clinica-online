import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { TurnosAdministradorComponent } from './components/turnos-administrador/turnos-administrador.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { InformesComponent } from './components/informes/informes.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'home', title: 'Home', component: HomeComponent, data: { animation: 'home' } },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'register', title: 'Register', component: RegisterComponent, data: { animation: 'register' } },
    { path: 'login', title: 'Login', component: LoginComponent, data: { animation: 'login' } },
    { 
        path: 'perfil', title: 'Perfil', component: PerfilComponent, data: { animation: 'perfil' },
        canActivate: [authGuard]
    },
    { 
        path: 'usuarios', title: 'Usuarios', component: UsuariosComponent, data: { animation: 'usuarios' },
        canActivate: [authGuard]
    },
    { 
        path: 'solicitar-turno', title: 'Solicitar Turno', component: SolicitarTurnoComponent, data: { animation: 'solicitar-turno' },
        canActivate: [authGuard]
    },
    {
        path: 'mis-turnos', title: 'Mis Turnos', component: MisTurnosComponent, data: { animation: 'mis-turnos' },
        canActivate: [authGuard]
    },
    {
        path: 'turnos', title: 'Turnos', component: TurnosAdministradorComponent, data: { animation: 'turnos' },
        canActivate: [authGuard]
    },
    {
        path: 'pacientes', title: 'Pacientes', component: PacientesComponent, data: { animation: 'pacientes' },
        canActivate: [authGuard]
    },
    {
        path: 'informes', title: 'Informes', component: InformesComponent, data: { animation: 'informes' },
        canActivate: [authGuard]
    },
    
    { path: '**', redirectTo: 'home' }
    
];
