import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TurnoService } from '../../services/turno.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf],
  providers: [DatePipe],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent implements OnInit{

  pacientes: any;
  especialistas: any;
  admins: any;
  logUser: any;
  turnos: any;
  usuariosIngresos: any[] = [];

  constructor(private userService: UserService, private turnoService: TurnoService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.userService.getPacientes().subscribe((data: any) => {
      this.pacientes = data;
    });

    this.userService.getEspecialistas().subscribe((data: any) => {
      this.especialistas = data;
    });

    this.userService.getAdmins().subscribe((data: any) => {
      this.admins = data;
    });

    this.userService.getLogUsuarios().subscribe((data: any) => {
      this.logUser = data;
      this.obtenerUsuarioPorLogUsuarios();
    });

    this.turnoService.getTurnos().subscribe((data: any) => {
      this.turnos = data;
    });
  }

  obtenerUsuarioPorLogUsuarios() {
    const usuariosMap = new Map<string, any>();

    this.logUser.forEach((log: any) => {
      let usuarioFiltrado;
      const user = this.pacientes.find((paciente: any) => paciente.email === log.email);
      if (user) {
        usuarioFiltrado = user;
      }
      const especialista = this.especialistas.find((especialista: any) => especialista.email === log.email);
      if (especialista) {
        usuarioFiltrado = especialista;
      }
      const admin = this.admins.find((admin: any) => admin.email === log.email);
      if (admin) {
        usuarioFiltrado = admin;
      }

      if (usuarioFiltrado) {
        const email = usuarioFiltrado.email;
        if (usuariosMap.has(email)) {
          usuariosMap.get(email).count++;
        } else {
          usuariosMap.set(email, {
            nombre: usuarioFiltrado.nombre,
            apellido: usuarioFiltrado.apellido,
            email: usuarioFiltrado.email,
            count: 1
          });
        }
      }
    });
    // console.log(usuariosMap);

    this.usuariosIngresos = Array.from(usuariosMap.values());
    console.log(this.usuariosIngresos);
  }

  convertTimestampToDate(timestamp: any): string {
    const date = new Date(timestamp.seconds * 1000); // Convertir segundos a milisegundos
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }







}
