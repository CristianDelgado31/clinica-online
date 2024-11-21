import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

interface Encuesta {
  atencion: number;
  puntualidad: number;
  administracion: number;
  recomendacion: number;
}

@Component({
  selector: 'app-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
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
  comentarioPacienteSeleccionado: string = ''; // Comentario del paciente seleccionado
  comentarioCalificacion: string = ''; // Comentario de calificación

  //encuesta
  encuesta: Encuesta = { 
    atencion: 0,
    puntualidad: 0,
    administracion: 0,
    recomendacion: 0
  };

  //paginacion
  page: number = 1;  // Página de paginación
  pageSize: number = 5;  // Número de turnos por página
  terminoBusqueda: string = ''; // Término de búsqueda

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userService.getTurnos(parsedUser.email).subscribe((turnos: any[]) => {
        this.turnos = turnos;

        this.turnos = turnos.sort((a, b) => {
          // Combinar día y hora y convertirlas en objetos de fecha para comparación
          const dateA = this.convertToDate(a.dia, a.hora);
          const dateB = this.convertToDate(b.dia, b.hora);
          return dateA.getTime() - dateB.getTime(); // Orden ascendente
        });

        this.turnosFiltrados = this.turnos; // Inicialmente mostramos todos los turnos
        console.log('Turnos', this.turnos);
      });

    }
  }

  // Método para convertir 'dia' y 'hora' en un objeto Date
  convertToDate(dia: string, hora: string): Date {
    const [day, month] = dia.split('/').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    return new Date(new Date().getFullYear(), month - 1, day, hours, minutes);
  }

  filtrarTurnos() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(turno => {
      const keys = ['especialidad', 'especialista.nombre', 'especialista.apellido', 'dia', 'hora', 'estado', 'historiaClinica.altura', 'historiaClinica.peso', 'historiaClinica.temperatura', 'historiaClinica.presion'];
      for (const key of keys) {
        const value = key.split('.').reduce((o, i) => (o ? o[i] : null), turno);
        if (value && value.toString().toLowerCase().includes(termino)) {
          return true;
        }
      }
      if (turno.historiaClinica && turno.historiaClinica.datosDinamicos) {
        for (const dato of turno.historiaClinica.datosDinamicos) {
          if (dato.clave.toLowerCase().includes(termino) || dato.valor.toLowerCase().includes(termino)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  cancelarTurno(turnoId: string): void {
    // Seleccionamos el turno que será cancelado
    this.comentarioCancelacion = '';
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
    // const comentario = 'Cancelado por el paciente: ' + this.comentarioCancelacion;
    this.userService.cancelarTurno(this.turnoSeleccionadoId, this.comentarioCancelacion).then(() => {
      console.log('Turno cancelado');
    }).catch((error) => {
      console.error('Error al cancelar turno', error);
    });

    // Cerrar el modal después de confirmar la cancelación
    this.modal.hide();

    // Resetear el comentario de cancelación
    this.comentarioCancelacion = '';
  }

  confirmarEncuesta(): void {
    // console.log('Encuesta', this.encuesta);
    // parsear los valores a number
    this.encuesta.atencion = Number(this.encuesta.atencion);
    this.encuesta.puntualidad = Number(this.encuesta.puntualidad);
    this.encuesta.administracion = Number(this.encuesta.administracion);
    this.encuesta.recomendacion = Number(this.encuesta.recomendacion);
    console.log('Encuesta parseada', this.encuesta);

    this.userService.completarEncuesta(this.turnoSeleccionadoId, this.encuesta).then(() => {
      console.log('Encuesta completada');
    }).catch((error: any) => {
      console.error('Error al completar encuesta', error);
    });

    this.modal.hide();
  }

  completarEncuesta(turnoId: string) {
    console.log('Completar encuesta', turnoId);
    this.encuesta = {
      atencion: 0,
      puntualidad: 0,
      administracion: 0,
      recomendacion: 0
    };

    this.turnoSeleccionadoId = turnoId;

    const modalElement = document.getElementById('completarEncuestaModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    this.modal.show();
  }

  confirmarCalificacion() {
    console.log('Calificar atención');
    this.userService.calificarAtencion(this.turnoSeleccionadoId, this.comentarioCalificacion).then(() => {
      console.log('Atención calificada');
    }).catch((error) => {
      console.error('Error al calificar atención', error);
    });

    this.modal.hide();

    this.comentarioCalificacion = '';
  }

  calificarAtencion(turnoId: string) {
    console.log('Calificar atención', turnoId);
    this.comentarioCalificacion = '';
    this.turnoSeleccionadoId = turnoId;

    const modalElement = document.getElementById('calificarTurnoModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    this.modal.show();
  }

  verResena(turnoId: string) {
    console.log('Ver reseña', turnoId);
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno) {
      this.comentarioPacienteSeleccionado = turno.comentario;
      this.comentarioCalificacion = turno.calificacion;
      console.log('Reseña:', turno.comentario);
      const modalElement = document.getElementById('verComentarioModal');
      const modalComentario = new window.bootstrap.Modal(modalElement);
      modalComentario.show();
    }
  }
}
