import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css']
})
export class TurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    // Aquí puedes obtener los turnos desde un servicio, o utilizar datos simulados para pruebas
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userService.getTurnosEspecialista(parsedUser.email).subscribe((turnos: any[]) => {
        this.turnos = turnos;
        this.turnosFiltrados = [...turnos]; // Inicializamos la lista filtrada
      });
    }
  }

  // Función para filtrar turnos
  filtrarTurnos() {
    this.turnosFiltrados = this.turnos.filter(turno => {
      return (
        (this.filtroEspecialidad ? turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase()) : true) &&
        (this.filtroPaciente ? `${turno.paciente.nombre} ${turno.paciente.apellido}`.toLowerCase().includes(this.filtroPaciente.toLowerCase()) : true)
      );
    });
  }

  // Funciones para realizar acciones sobre los turnos
  cancelarTurno(id: string) {
    console.log('Cancelar turno', id);
  }

  rechazarTurno(id: string) {
    console.log('Rechazar turno', id);
  }

  aceptarTurno(id: string) {
    console.log('Aceptar turno', id);

    this.userService.updateEstadoTurno(id, 'aceptado').then(() => {
      console.log('Turno aceptado');
    }).catch((error) => {
      console.error('Error al aceptar turno', error);
    });
  }

  finalizarTurno(id: string) {
    console.log('Finalizar turno', id);
  }

  verResena(id: string) {
    console.log('Ver reseña para el turno', id);
  }
}
