import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoService } from '../../services/turno.service';
import { user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [DatePipe, TitleCasePipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {
  arrEspecialistas: any[] = [];
  especialidades: string[] = [];
  selectedEspecialidad: string = '';
  selectedEspecialista: any;
  selectedDia: string | null = '';
  selectedHora: string = '';

  // Variables para controlar el flujo
  especialidadSeleccionada: boolean = false;
  especialistaSeleccionado: boolean = false;
  mostrarDisponibilidad: boolean = false;
  mostrarConfirmarTurno: boolean = false;

  // 
  diasDeLaSemana: string[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  disponibilidadDias: any = {}; // Disponibilidad de los días
  horariosDisponibles: string[] = []; // Lista de horarios disponibles
  diasDisponibles: any[] = []; // Array de días disponibles para elegir
  fechaLimite: Date = new Date();
  fechaMaxima: Date = new Date(this.fechaLimite.getTime() + 15 * 24 * 60 * 60 * 1000); // Fecha límite + 15 días

  // turnos
  turnos: any[] = [];
  disponibilidadesSeleccionadas: any;

  //
  isAdmin: boolean = false;
  isPaciente: boolean = false;
  pacientes: any[] = [];
  pacienteSeleccionado: boolean = false;
  mostrarEspecialidades: boolean = true;
  paciente: any;

  constructor(private userService: UserService, private turnoService: TurnoService, private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if(userData) {
      const result = JSON.parse(userData);
      if(result.especialidades) {
        this.router.navigate(['/home']);
      } else if(result.isAdmin) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
        this.isPaciente = true;
      }
    }

    if(this.isAdmin) {
      // cargar los pacientes
      this.userService.getPacientes().subscribe((pacientes: any[]) => {
        this.pacientes = pacientes;
      });
    }
    
    this.loadEspecialidades();
    // suscripcion a los turnos
    this.turnoService.getTurnos().subscribe((turnos: any[]) => {
      this.turnos = turnos;
    });
  }

  loadEspecialidades() {
    // Aquí cargamos las especialidades desde el servicio o una fuente local
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

  onPacienteSelect(paciente: any) {
    // Esta función se ejecuta cuando el usuario selecciona un paciente
    console.log('Paciente seleccionado:', paciente);
    this.pacienteSeleccionado = true;
    this.mostrarEspecialidades = true;
    this.paciente = paciente;
    // this.loadEspecialidades();
  }

  onEspecialidadSelect(especialidad: string) {
    // Esta función se ejecuta cuando el usuario selecciona una especialidad
    this.selectedEspecialidad = especialidad;
    this.especialidadSeleccionada = true;
    this.mostrarEspecialidades = false;
    console.log(`Especialidad seleccionada: ${especialidad}`);
    this.resetDisponibilidad();
    // Aquí puedes cargar los especialistas correspondientes a la especialidad seleccionada
    this.onEspecialidadChange();
  }

  onEspecialistaSelect(especialista : any) {
    // Esta función se ejecuta cuando el usuario selecciona un especialista
    this.selectedEspecialista = especialista;
    this.especialistaSeleccionado = true;
    this.resetDisponibilidad();

    // Aquí puedes cargar la disponibilidad del especialista seleccionado
    if(especialista.disponibilidades) {
      this.onEspecialistaChange(especialista);
    } else {
      this.resetDisponibilidad();
    }

  }

  onEspecialidadChange() {
    // Limpiar especialistas previos al seleccionar una nueva especialidad
    if (this.selectedEspecialidad) {
      this.userService.getEspecialistasPorEspecialidad(this.selectedEspecialidad).subscribe((especialistas: any[]) => {
        this.arrEspecialistas = especialistas;
      });
    } else {
      this.arrEspecialistas = [];
    }
  }

  onDiaSelect(dia: any) {
    // Aquí, cambiamos para mostrar solo el día y mes (dd/MM)
    this.selectedDia = this.datePipe.transform(dia.fecha, 'dd/MM');
    console.log(`Día seleccionado: ${this.selectedDia}`);
    // Aquí puedes cargar los horarios disponibles para el día seleccionado
    this.generateHorarios(this.disponibilidadesSeleccionadas.horaInicio, this.disponibilidadesSeleccionadas.horaFin);
    
  }

  onHoraSelect(hora: string) {
    // Aquí se obtiene la hora seleccionada
    this.selectedHora = hora;
    console.log(`Hora seleccionada: ${hora}`);
    // dia y hora seleccionados
    console.log(`fecha y hora seleccionada: ${this.selectedDia} ${this.selectedHora}`);
    this.mostrarConfirmarTurno = true;
  }

  obtenerRutaImagen(especialidad: string) {
    // Aquí puedes devolver la ruta de la imagen correspondiente a la especialidad
    if(especialidad == "psicologia") {
      return `media/${especialidad.toLowerCase()}.png`;
    } else if(especialidad == "cirugia" || especialidad == "pediatria" || especialidad == "psiquiatria") {
      return `media/${especialidad.toLowerCase()}.jpeg`;
    } else if(especialidad == "cardiologia" || especialidad == "odontologia" || especialidad == "pedagogia") {
      return `media/${especialidad.toLowerCase()}.jpg`;
    } else {
      return 'media/fondo_azul.jpeg';
    }
      
  }

  onEspecialistaChange(especialista: any) {
    const disponibilidadesSeleccionadas = especialista?.disponibilidades.find((d:any) => d.especialidad === this.selectedEspecialidad);
    if(disponibilidadesSeleccionadas) {
      console.log("Disponibilidades seleccionadas:", disponibilidadesSeleccionadas);

      this.disponibilidadDias = disponibilidadesSeleccionadas.diasDisponibles;
      this.diasDisponibles = this.getDiasDisponibles(this.disponibilidadDias);
      // this.generateHorarios(disponibilidadesSeleccionadas.horaInicio, disponibilidadesSeleccionadas.horaFin);
      this.mostrarDisponibilidad = true;
      this.disponibilidadesSeleccionadas = disponibilidadesSeleccionadas;
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
          if (fechaDia >= fechaHoy && fechaDia <= fechaLimite) {
            diasValidos.push({ dia, fecha: new Date(fechaDia)});
          }
          fechaDia.setDate(fechaDia.getDate() + 7);
        }
      }
    });

    diasValidos.sort((a, b) => a.fecha - b.fecha); // Comparación directa de fechas

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

  // Función para generar los horarios en formato HH:mm
  generateHorarios(horaInicio: string, horaFin: string) {
    let horarios: string[] = [];
    const start = this.timeToMinutes(horaInicio);
    const end = this.timeToMinutes(horaFin);
    const interval = 30; // Intervalo de 30 minutos
  
    // Verificar si hay turnos
    if (!this.turnos || this.turnos.length === 0) {
      console.log("No hay turnos disponibles.");
      return;
    }
  
    // Filtrar turnos ocupados por especialista y especialidad
    const turnosOcupados = this.turnos.filter((turno) => {
      return turno.especialista?.id === this.selectedEspecialista.id && turno.especialidad === this.selectedEspecialidad && turno.dia === this.selectedDia;
    });
    console.log('Horarios ocupados:', turnosOcupados);
  
    // Crear un Set de horarios ocupados
    const horariosOcupadosSet = new Set(turnosOcupados.map((turno) => turno.hora));
    console.log('Horarios ocupados (Set):', horariosOcupadosSet);
  
    // Generar horarios en intervalos de 30 minutos
    for (let time = start; time <= end; time += interval) {
      horarios.push(this.minutesToTime(time));
    }
  
    // Filtrar horarios ocupados
    const horariosDisponibles = horarios.filter((hora) => !horariosOcupadosSet.has(hora));
    console.log('Horarios disponibles:', horariosDisponibles);
  
    // Asignar horarios disponibles
    this.horariosDisponibles = horariosDisponibles;
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

  onVolver() {
    if(this.isPaciente) {
      this.especialidadSeleccionada = false;
      this.especialistaSeleccionado = false;
      this.mostrarDisponibilidad = false;
      this.mostrarConfirmarTurno = false;
      this.selectedDia = "";
      this.resetDisponibilidad();
    } else {
      this.pacienteSeleccionado = false;
      this.mostrarEspecialidades = false;
      this.especialidadSeleccionada = false;
      this.especialistaSeleccionado = false;
      this.mostrarDisponibilidad = false;
      this.mostrarConfirmarTurno = false
      this.selectedDia = "";
      this.resetDisponibilidad();
    }
  }

  onConfirmarTurno() {
    let paciente: any = null;
    let especialista: any = null;

    if(!this.isAdmin){
      const userData = localStorage.getItem('user');
        let userEmail = "";
        paciente = { nombre: String, apellido: String, email: String };
        if(userData) {
          const result = JSON.parse(userData);
          userEmail = result.email;
          paciente.nombre = result.nombre;
          paciente.apellido = result.apellido;
          paciente.email = result.email;
          
        }

        especialista = {
          nombre: this.selectedEspecialista.nombre,
          apellido: this.selectedEspecialista.apellido,
          email: this.selectedEspecialista.email,
          id: this.selectedEspecialista.id
        }

      } else {
        especialista = {
          nombre: this.selectedEspecialista.nombre,
          apellido: this.selectedEspecialista.apellido,
          email: this.selectedEspecialista.email,
          id: this.selectedEspecialista.id
        }

        paciente = {
          nombre: this.paciente.nombre,
          apellido: this.paciente.apellido,
          email: this.paciente.email,
          // id: this.paciente.id
        }
      }
      
      const turnoData = {
        especialidad: this.selectedEspecialidad,
        especialista: especialista,
        dia: this.selectedDia,
        hora: this.selectedHora,
        paciente: paciente,
        estado: 'pendiente'
      };
      console.log('Turno enviado:', turnoData);

      // Enviar el turno al servicio
      this.turnoService.setTurno(turnoData).then(() => {
        console.log('Turno guardado correctamente');
      }).catch((error) => {
        console.error('Error al guardar el turno:', error);
      });

      // Redirigir al componente de mis turnos
      this.router.navigate(['/mis-turnos']);
  }


   // Método para enviar la información del turno
  //  enviarTurno() {
  //   if (this.selectedEspecialidad && this.selectedEspecialista && this.selectedDia && this.selectedHora) {
  //     const userData = localStorage.getItem('user');
  //     let userEmail = "";
  //     const paciente: { nombre?: string, apellido?: string, email?: string } = {};
  //     if(userData) {
  //       const result = JSON.parse(userData);
  //       userEmail = result.email;
  //       paciente.nombre = result.nombre;
  //       paciente.apellido = result.apellido;
  //       paciente.email = result.email;
        
  //     }

  //     const buscarEspecialistaPorId = this.arrEspecialistas.find((e) => e.id === this.selectedEspecialista);

  //     const especialista = {
  //       nombre: buscarEspecialistaPorId.nombre,
  //       apellido: buscarEspecialistaPorId.apellido,
  //       email: buscarEspecialistaPorId.email,
  //       id: buscarEspecialistaPorId.id  
  //     }

  //     const turnoData = {
  //       especialidad: this.selectedEspecialidad,
  //       especialista: especialista,
  //       dia: this.selectedDia,
  //       hora: this.selectedHora,
  //       paciente: paciente,
  //       estado: 'pendiente'
  //     };

  //     // Para propósitos de prueba, solo mostramos los datos en consola
  //     console.log('Turno enviado:', turnoData);
      
  //     // Enviar el turno al servicio
  //     this.turnoService.setTurno(turnoData).then(() => {
  //       console.log('Turno guardado correctamente');
  //     }).catch((error) => {
  //       console.error('Error al guardar el turno:', error);
  //     });

  //     // Redirigir al componente de mis turnos
  //     this.router.navigate(['/mis-turnos']);
  //   }
  // }

}
