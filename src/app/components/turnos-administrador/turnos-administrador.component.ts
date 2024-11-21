import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { TurnoService } from '../../services/turno.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-turnos-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './turnos-administrador.component.html',
  styleUrl: './turnos-administrador.component.css'
})
export class TurnosAdministradorComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtroCombinado: string = ''; // Nuevo filtro combinado
  modal: any;
  turnoSeleccionadoId: string = '';
  comentarioCancelacion: string = '';

  page: number = 1;  // Página de paginación
  pageSize: number = 5;  // Número de turnos por página

  constructor(private userService: UserService, private turnoService: TurnoService) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.isAdmin) {
        this.turnoService.getTurnos().subscribe((turnos: any[]) => {
          this.turnos = turnos;

          this.turnos = turnos.sort((a, b) => {
            // Combinar día y hora y convertirlas en objetos de fecha para comparación
            const dateA = this.convertToDate(a.dia, a.hora);
            const dateB = this.convertToDate(b.dia, b.hora);
            return dateA.getTime() - dateB.getTime(); // Orden ascendente
          });

          this.turnosFiltrados = this.turnos;  // Muestra todos los turnos al inicio
          console.log('Turnos', this.turnos);
        });
      } else {
        // Si el usuario no es administrador, redirigir o mostrar un mensaje de error
        console.log('Acceso denegado: El usuario no tiene permisos de administrador');
      }
    }
  }

  // Método para convertir 'dia' y 'hora' en un objeto Date
  convertToDate(dia: string, hora: string): Date {
    const [day, month] = dia.split('/').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    return new Date(new Date().getFullYear(), month - 1, day, hours, minutes);
  }

  // Filtrar por especialidad o especialista
  filtrarTurnos(): void {
    this.turnosFiltrados = this.turnos.filter(turno => {
      const filtroCombinadoLower = this.filtroCombinado.toLowerCase();
      const filtroEspecialidad = turno.especialidad.toLowerCase().includes(filtroCombinadoLower);
      const filtroEspecialista = (turno.especialista.nombre.toLowerCase() + ' ' + turno.especialista.apellido.toLowerCase()).includes(filtroCombinadoLower);

      return filtroEspecialidad || filtroEspecialista;  // Buscar en cualquiera de los dos campos
    });
  }

  cancelarTurno(turnoId: string): void {
    this.comentarioCancelacion = '';
    this.turnoSeleccionadoId = turnoId;
    const modalElement = document.getElementById('cancelarTurnoModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    this.modal.show();
  }

  confirmarCancelacion(): void {
    this.userService.cancelarTurno(this.turnoSeleccionadoId, this.comentarioCancelacion).then(() => {
      console.log('Turno cancelado');
      this.modal.hide();
      this.comentarioCancelacion = '';
      this.turnosFiltrados = this.turnosFiltrados.filter(turno => turno.id !== this.turnoSeleccionadoId);
    }).catch((error) => {
      console.error('Error al cancelar turno', error);
    });
  }
}
