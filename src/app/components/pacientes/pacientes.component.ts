import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimeFormatPipe } from '../../pipies/time-format.pipe';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule, TimeFormatPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit{
  turnos: any[] = [];
  user: any;
  page: number = 1;
  pageSize: number = 5;
  emailPacientes: string[] = [];
  pacientesFiltrados: any[] = [];
  turnosPaciente: any;
  pacientes: any[] = [];
  resenaConsulta: any;
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.user = localStorage.getItem('user');
    if(this.user) {
      this.user = JSON.parse(this.user);

      this.userService.getTurnosEspecialista(this.user.email).subscribe((turnos: any[]) => {
        this.turnos = turnos.filter(turno => turno.historiaClinica);
        
        this.pacientesFiltrados = turnos.filter(turno => {
          if(!this.emailPacientes.includes(turno.paciente.email)) {
            this.emailPacientes.push(turno.paciente.email);
            return turno;            
          }
        });
        // console.log(this.turnos);
        // console.log(this.pacientesFiltrados);
        console.log(this.emailPacientes);
      });

      this.userService.getPacientes().subscribe((pacientes: any[]) => {
        this.pacientes = pacientes.filter(paciente => this.emailPacientes.includes(paciente.email));
        console.log(this.pacientes);
      });
    }
  }

  mostrarHistoriaClinica(email: string) {
    const turnos = this.turnos.filter(turno => turno.paciente.email === email);
    this.turnosPaciente = turnos;
    console.log(this.turnosPaciente);
    // modal
    const modalElement = document.getElementById('modalHistoriaClinica');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();

  }

  mostrarResena(turno: any) {
    this.resenaConsulta = turno.comentario || 'No hay reseña disponible.';
    // Mostrar el modal de reseña
    const modalElement = document.getElementById('modalResena');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}
