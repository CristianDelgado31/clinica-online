import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TurnoService } from '../../services/turno.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf],
  providers: [DatePipe],
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.css']
})
export class InformesComponent implements OnInit {
  pacientes: any;
  especialistas: any;
  admins: any;
  logUser: any;
  turnos: any;
  usuariosIngresos: any[] = [];
  chart: any;

  constructor(
    private userService: UserService,
    private turnoService: TurnoService,
    private datePipe: DatePipe
  ) {}

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

    this.usuariosIngresos = Array.from(usuariosMap.values());
    setTimeout(() => this.createChart(), 0); // Asegúrate de que el DOM esté actualizado antes de crear el gráfico
  }

  createChart() {
    const labels = this.usuariosIngresos.map(usuario => usuario.email);
    const data = this.usuariosIngresos.map(usuario => usuario.count);

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Ingresos',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  convertTimestampToDate(timestamp: any): string {
    const date = new Date(timestamp.seconds * 1000); // Convertir segundos a milisegundos
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
}