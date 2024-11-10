import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    NgxPaginationModule
  ],
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css']
})
export class TurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';
  turnoSeleccionadoId: string = ''; // Id del turno seleccionado para cancelar
  
  
  modal: any;
  comentarioSeleccionado: String = '';
  comentarioCancelacion: string = ''; // Comentario de cancelación
  comentarioRechazo: string = ''; // Comentario de rechazo
  comentarioFinalizacion: string = ''; // Comentario de finalización
  comentarioCalificacion: string = ''; // Comentario de calificación

  page: number = 1;  // Página actual
  pageSize: number = 8;  // Elementos por página

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
  confirmarCancelacion(): void {
    // Aquí se puede hacer un llamado al servicio para actualizar el estado del turno
    // y guardar el comentario de cancelación. Ejemplo:
    console.log('Cancelar turno', this.turnoSeleccionadoId, 'Comentario:', this.comentarioCancelacion);
    // const comentario = 'Cancelado por el especialista: ' + this.comentarioCancelacion;
    this.userService.cancelarTurno(this.turnoSeleccionadoId, this.comentarioRechazo).then(() => {
      console.log('Turno cancelado');
    }).catch((error) => {
      console.error('Error al cancelar turno', error);
    });

    // Cerrar el modal después de confirmar la cancelación
    this.modal.hide();

    // Resetear el comentario de cancelación
    this.comentarioCancelacion = '';
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

  confirmarRechazo(): void {
    // Aquí se puede hacer un llamado al servicio para actualizar el estado del turno
    // y guardar el comentario de rechazo. Ejemplo:
    console.log('Rechazar turno', this.turnoSeleccionadoId, 'Comentario:', this.comentarioRechazo);
    // const comentario = 'Rechazado por el especialista: ' + this.comentarioRechazo;
    this.userService.rechazarTurno(this.turnoSeleccionadoId, this.comentarioRechazo).then(() => {
      console.log('Turno rechazado');
    }).catch((error) => {
      console.error('Error al rechazar turno', error);
    });

    // Cerrar el modal después de confirmar el rechazo
    this.modal.hide();

    // Resetear el comentario de rechazo
    this.comentarioRechazo = '';
  }

  rechazarTurno(id: string) {
    console.log('Rechazar turno', id);
    // Seleccionamos el turno que será rechazado
    this.turnoSeleccionadoId = id;
    // Obtenemos el modal y creamos la instancia de Bootstrap Modal
    const modalElement = document.getElementById('rechazarTurnoModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    // Mostramos el modal
    this.modal.show();
  }

  aceptarTurno(id: string) {
    console.log('Aceptar turno', id);

    this.userService.updateEstadoTurno(id, 'aceptado').then(() => {
      console.log('Turno aceptado');
    }).catch((error) => {
      console.error('Error al aceptar turno', error);
    });
  }

  confirmarFinalizacion(): void {
    // Aquí se puede hacer un llamado al servicio para actualizar el estado del turno
    // y guardar el comentario de finalización. Ejemplo:
    console.log('Finalizar turno', this.turnoSeleccionadoId, 'Comentario:', this.comentarioFinalizacion);
    // const comentario = 'Finalizado por el especialista: ' + this.comentarioRechazo;
    this.userService.finalizarTurno(this.turnoSeleccionadoId, this.comentarioFinalizacion).then(() => {
      console.log('Turno finalizado');
    }).catch((error) => {
      console.error('Error al finalizar turno', error);
    });

    // Cerrar el modal después de confirmar la finalización
    this.modal.hide();

    // Resetear el comentario de finalización
    this.comentarioFinalizacion = '';
  }


  finalizarTurno(id: string) {
    console.log('Finalizar turno', id);
    // Seleccionamos el turno que será finalizado
    this.turnoSeleccionadoId = id;
    // Obtenemos el modal y creamos la instancia de Bootstrap Modal
    const modalElement = document.getElementById('finalizarTurnoModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    // Mostramos el modal
    this.modal.show();
  }

  verResena(turnoId: string) {
    console.log('Ver reseña', turnoId);
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno) {
      this.comentarioSeleccionado = turno.comentario;
      this.comentarioCalificacion = turno.calificacion;
      console.log('Reseña:', turno.comentario);
      const modalElement = document.getElementById('verComentarioModal');
      const modalComentario = new window.bootstrap.Modal(modalElement);
      modalComentario.show();
    }
  }
}
