import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TurnoService } from '../../../services/turno.service';


@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule
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
  terminoBusqueda: string = '';
  
  modal: any;
  comentarioSeleccionado: String = '';
  comentarioCancelacion: string = ''; 
  comentarioRechazo: string = ''; 
  comentarioFinalizacion: string = '';
  comentarioCalificacion: string = '';

  page: number = 1;  // Página actual
  pageSize: number = 8;

  //historia clinica
  historiaClinicaForm!: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder, private turnoService: TurnoService) { }

  ngOnInit(): void {
    // Aquí puedes obtener los turnos desde un servicio, o utilizar datos simulados para pruebas
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userService.getTurnosEspecialista(parsedUser.email).subscribe((turnos: any[]) => {
        this.turnos = turnos;

        this.turnos = turnos.sort((a, b) => {
          // Combinar día y hora y convertirlas en objetos de fecha para comparación
          const dateA = this.convertToDate(a.dia, a.hora);
          const dateB = this.convertToDate(b.dia, b.hora);
          return dateA.getTime() - dateB.getTime(); // Orden ascendente
        });

        this.turnosFiltrados = [...this.turnos]; // Inicializamos la lista filtrada
      });

      this.historiaClinicaForm = this.fb.group({
        altura: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
        peso: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
        temperatura: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1})?$/)]],
        presion: ['', [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
        datosDinamicos: this.fb.array([this.createDatoDinamico()])
      });
    }
  }

  // Método para convertir 'dia' y 'hora' en un objeto Date
  convertToDate(dia: string, hora: string): Date {
    const [day, month] = dia.split('/').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    return new Date(new Date().getFullYear(), month - 1, day, hours, minutes);
  }

  // Función para filtrar turnos
  filtrarTurnos() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(turno => {
      const keys = ['especialidad', 'paciente.nombre', 'paciente.apellido', 'dia', 'hora', 'estado', 'historiaClinica.altura', 'historiaClinica.peso', 'historiaClinica.temperatura', 'historiaClinica.presion'];
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

  // Funciones para realizar acciones sobre los turnos
  confirmarCancelacion(): void {
    // Aquí se puede hacer un llamado al servicio para actualizar el estado del turno
    // y guardar el comentario de cancelación. Ejemplo:
    console.log('Cancelar turno', this.turnoSeleccionadoId, 'Comentario:', this.comentarioCancelacion);
    // const comentario = 'Cancelado por el especialista: ' + this.comentarioCancelacion;
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

    const buscarTurno = this.turnos.find(t => t.id === turnoId);
    console.log(buscarTurno.historiaClinica);
  }

  get datosDinamicos() {
    return this.historiaClinicaForm.get('datosDinamicos') as FormArray;
  }

  createDatoDinamico(): FormGroup {
    return this.fb.group({
      clave: ['', Validators.required],
      valor: ['', Validators.required]
    });
  }

  agregarDatoDinamico() {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(this.createDatoDinamico());
    } else {
      console.log('Máximo de datos dinámicos alcanzado');
    }
  }

  realizarHistoriaClinica(turnoId: string) {
    console.log('Realizar historia clínica', turnoId);
    this.turnoSeleccionadoId = turnoId;
    this.historiaClinicaForm.reset();
    this.datosDinamicos.clear();
    this.datosDinamicos.push(this.createDatoDinamico());
    const modalElement = document.getElementById('historiaClinicaModal');
    this.modal = new window.bootstrap.Modal(modalElement);
    this.modal.show();
  }

  guardarHistoriaClinica() {
    if (this.historiaClinicaForm.invalid) {
      console.log('Todos los campos son obligatorios');
      return;
    }

    const historiaClinica = {
      altura: this.historiaClinicaForm.get('altura')?.value,
      peso: this.historiaClinicaForm.get('peso')?.value,
      temperatura: this.historiaClinicaForm.get('temperatura')?.value,
      presion: this.historiaClinicaForm.get('presion')?.value,
      datosDinamicos: this.historiaClinicaForm.get('datosDinamicos')?.value
    }
    console.log('Guardar historia clínica', historiaClinica);

    this.turnoService.agregarHistoriaClinica(this.turnoSeleccionadoId, historiaClinica).then(() => {
      console.log('Historia clínica guardada');
    }).catch((error) => {
      console.error('Error al guardar historia clínica', error);
    });
    // Aquí puedes agregar la lógica para guardar la historia clínica
    this.modal.hide();
  }
}
