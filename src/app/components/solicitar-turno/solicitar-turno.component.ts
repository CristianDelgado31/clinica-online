import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoService } from '../../services/turno.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DatePipe, TitleCasePipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {
  arrEspecialistas: any[] = [];
  especialidades: string[] = [];
  selectedEspecialidad: string = '';
  selectedEspecialista: string = '';
  selectedDia: string = '';
  selectedHora: string = '';
  diasDeLaSemana: string[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  disponibilidadDias: any = {}; // Disponibilidad de los días
  horariosDisponibles: string[] = []; // Lista de horarios disponibles
  diasDisponibles: any[] = []; // Array de días disponibles para elegir
  fechaLimite: Date = new Date();
  fechaMaxima: Date = new Date(this.fechaLimite.getTime() + 15 * 24 * 60 * 60 * 1000); // Fecha límite + 15 días

  constructor(private userService: UserService, private turnoService: TurnoService) {}

  ngOnInit(): void {
    this.loadEspecialidades();
  }

  loadEspecialidades() {
    this.userService.getEspecialistas().subscribe((especialistas: any[]) => {
      const especialidadesSet = new Set<string>();
      for (let especialista of especialistas) {
        if (especialista.especialidades) {
          especialista.especialidades.forEach((especialidad: string) => {
            especialidadesSet.add(especialidad);
          });
        }
      }
      this.especialidades = Array.from(especialidadesSet);
    });
  }

  onEspecialidadChange() {
    if (this.selectedEspecialidad) {
      this.userService.getEspecialistasPorEspecialidad(this.selectedEspecialidad).subscribe((especialistas: any[]) => {
        this.arrEspecialistas = especialistas;
      });
    } else {
      this.arrEspecialistas = [];
    }
  }

  onEspecialistaChange() {
    if (this.selectedEspecialista) {
      const especialista = this.arrEspecialistas.find((e) => e.id === this.selectedEspecialista);
      if(especialista?.disponibilidades) {
        const disponibilidadSeleccionada = especialista?.disponibilidades.find((d:any) => d.especialidad === this.selectedEspecialidad);

        if (disponibilidadSeleccionada) {
          // Obtener los días disponibles
          this.disponibilidadDias = disponibilidadSeleccionada.diasDisponibles;

          // Filtrar los días disponibles dentro de los próximos 15 días
          this.diasDisponibles = this.getDiasDisponibles(this.disponibilidadDias);
          
          // Generar la lista de horarios disponibles
          this.generateHorarios(disponibilidadSeleccionada.horaInicio, disponibilidadSeleccionada.horaFin);
        } else {
          this.resetDisponibilidad();
        }
      } else {
        this.resetDisponibilidad();
      }
    } else {
      this.resetDisponibilidad();
    }
  }

  // Función que resetea las variables de disponibilidad
  resetDisponibilidad() {
    this.disponibilidadDias = {};
    this.diasDisponibles = [];
    this.horariosDisponibles = [];
  }

  // Obtener los días disponibles dentro de los próximos 15 días
  getDiasDisponibles(diasDisponibles: any) {
    const diasValidos: any[] = [];
    const fechaHoy = new Date();
    const fechaLimite = this.fechaMaxima;

    // Recorrer los días de la semana (lunes, martes, etc.)
    this.diasDeLaSemana.forEach(dia => {
      if (diasDisponibles[dia]) {
        let fechaDia = this.obtenerFechaParaDia(dia, fechaHoy);

        // Mientras la fecha sea menor o igual a la fecha límite
        while (fechaDia <= fechaLimite) {
          // Validar si la fecha está dentro de los próximos 15 días
          if (fechaDia >= fechaHoy && fechaDia <= fechaLimite) {
            diasValidos.push({ dia, fecha: new Date(fechaDia) });
          }
          // Avanzamos a la misma fecha del próximo día (jueves o viernes)
          fechaDia.setDate(fechaDia.getDate() + 7);
        }
      }
    });

    return diasValidos;
  }

  // Obtener la fecha para un día específico de la semana (Ej. lunes, martes, etc.)
  obtenerFechaParaDia(dia: string, fechaHoy: Date): Date {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    let diaIndex = diasSemana.indexOf(dia);
    let fechaDia = new Date(fechaHoy);
    fechaDia.setDate(fechaHoy.getDate() + (diaIndex - fechaHoy.getDay() + 7) % 7); // Ajuste al día correcto de la semana
    fechaDia.setHours(0, 0, 0, 0); // Establecer a las 00:00 para comparar fechas
    return fechaDia;
  }

  // Genera la lista de horarios disponibles basada en la hora de inicio y la hora de fin
  generateHorarios(horaInicio: string, horaFin: string) {
    const horarios: string[] = [];
    const start = this.timeToMinutes(horaInicio);
    const end = this.timeToMinutes(horaFin);
    const interval = 30; // Intervalo de 30 minutos

    for (let time = start; time <= end; time += interval) {
      horarios.push(this.minutesToTime(time));
    }

    this.horariosDisponibles = horarios;
  }

  // Convertir hora (HH:mm) a minutos desde las 00:00
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convertir minutos desde las 00:00 a formato HH:mm
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${this.padZero(hours)}:${this.padZero(mins)}`;
  }

  // Asegurarse de que los números tengan 2 dígitos
  padZero(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }



   // Método para enviar la información del turno
   enviarTurno() {
    if (this.selectedEspecialidad && this.selectedEspecialista && this.selectedDia && this.selectedHora) {
      const userData = localStorage.getItem('user');
      let userEmail = "";
      const paciente: { nombre?: string, apellido?: string, email?: string } = {};
      if(userData) {
        const result = JSON.parse(userData);
        userEmail = result.email;
        paciente.nombre = result.nombre;
        paciente.apellido = result.apellido;
        paciente.email = result.email;
        
      }

      const buscarEspecialistaPorId = this.arrEspecialistas.find((e) => e.id === this.selectedEspecialista);

      const especialista = {
        nombre: buscarEspecialistaPorId.nombre,
        apellido: buscarEspecialistaPorId.apellido,
        email: buscarEspecialistaPorId.email,
        id: buscarEspecialistaPorId.id
      }

      

      const turnoData = {
        especialidad: this.selectedEspecialidad,
        especialista: especialista,
        dia: this.selectedDia,
        hora: this.selectedHora,
        paciente: paciente,
        estado: 'pendiente'
      };

      // Para propósitos de prueba, solo mostramos los datos en consola
      console.log('Turno enviado:', turnoData);
      
      // Enviar el turno al servicio
      this.turnoService.setTurno(turnoData).then(() => {
        console.log('Turno guardado correctamente');
      }).catch((error) => {
        console.error('Error al guardar el turno:', error);
      });

    }
  }
}
