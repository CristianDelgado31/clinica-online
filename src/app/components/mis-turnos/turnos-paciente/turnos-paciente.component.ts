import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos-paciente.component.html',
  styleUrl: './turnos-paciente.component.css'
})
export class TurnosPacienteComponent implements OnInit{
  modal: any;

  turnos: any[] = [];
  turnosFiltrados: any[] = []; // Lista de turnos filtrados
  filtroEspecialidad: string = ''; // Filtro por especialidad
  filtroEspecialista: string = ''; // Filtro por especialista

  // Datos para cancelar turno
  turnoSeleccionadoId: string = ''; // Id del turno seleccionado para cancelar
  comentarioCancelacion: string = ''; // Comentario de cancelación

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userService.getTurnos(parsedUser.email).subscribe((turnos: any[]) => {
        this.turnos = turnos;
        this.turnosFiltrados = turnos; // Inicialmente mostramos todos los turnos
        console.log('Turnos', this.turnos);
      });

    }
  }

  filtrarTurnos(): void {
    // Filtramos los turnos en base a los valores de los filtros
    this.turnosFiltrados = this.turnos.filter(turno => {
      const filtroPorEspecialidad = turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());
      const filtroPorEspecialista = turno.especialista.nombre.toLowerCase().includes(this.filtroEspecialista.toLowerCase()) || 
        turno.especialista.apellido.toLowerCase().includes(this.filtroEspecialista.toLowerCase());
      
      // Ambas condiciones deben ser verdaderas para mostrar el turno
      return filtroPorEspecialidad && filtroPorEspecialista;
    });
  }

  cancelarTurno(turnoId: string): void {
    // Seleccionamos el turno que será cancelado
    this.turnoSeleccionadoId = turnoId;
    // Obtenemos el modal y creamos la instancia de Bootstrap Modal
    const modalElement = document.getElementById('cancelarTurnoModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    // Mostramos el modal
    this.modal.show();
  }

  confirmarCancelacion(): void {
    // Aquí se puede hacer un llamado al servicio para actualizar el estado del turno
    // y guardar el comentario de cancelación. Ejemplo:
    console.log('Cancelar turno', this.turnoSeleccionadoId, 'Comentario:', this.comentarioCancelacion);

    // Cerrar el modal después de confirmar la cancelación
    this.modal.hide();

    // Resetear el comentario de cancelación
    this.comentarioCancelacion = '';
  }


  completarEncuesta(turnoId: string) {
    console.log('Completar encuesta', turnoId);
  }

  calificarAtencion(turnoId: string) {
    console.log('Calificar atención', turnoId);
  }

  verResena(turnoId: string) {
    console.log('Ver reseña', turnoId);
  }
}
