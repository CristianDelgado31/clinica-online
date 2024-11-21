import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs, updateDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PacientFormComponent } from '../register/pacient-form/pacient-form.component';
import { SpecialistFormComponent } from '../register/specialist-form/specialist-form.component';
import { AdminFormComponent } from '../register/admin-form/admin-form.component';
import { UserService } from '../../services/user.service';
import { ExportService } from '../../services/export.service';
import { TurnoService } from '../../services/turno.service';
import { TimeFormatPipe } from '../../pipies/time-format.pipe';


declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, PacientFormComponent, SpecialistFormComponent, AdminFormComponent, TimeFormatPipe],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  
  // public users: any[] = [];
  arrPacientes: any[] = [];
  arrEspecialistas: any[] = [];
  arrAdmins: any[] = [];

  private subPacientes!: Subscription;
  private subEspecialistas!: Subscription;
  private subAdmins!: Subscription;

  // Variables para paginación
  currentPagePacientes: number = 1; // Página actual para pacientes
  itemsPerPagePacientes: number = 5; // Pacientes por página

  currentPageEspecialistas: number = 1; // Página actual para especialistas
  itemsPerPageEspecialistas: number = 10; // Especialistas por página

  currentPageAdmins: number = 1; // Página actual para administradores
  itemsPerPageAdmins: number = 5; // Administradores por página

  // modal
  selectedUserType: string | null = null;
  // isModalOpen: boolean = false; // Add this line

  //
  redirectToLogin: boolean = false; // Flag para controlar la redirección

  //
  pacientesFiltrados: any = [];
  turnos: any[] = [];
  subTurnos!: Subscription;

  turnosPacienteSeleccionado: any[] = [];

  constructor(private firestore: Firestore, private router: Router, private userService: UserService, private exportService: ExportService, private turnoService: TurnoService) {}

  ngOnInit() {
    this.currentPagePacientes = 1; // Inicializa cada variable aquí
    this.currentPageEspecialistas = 1;
    this.currentPageAdmins = 1;

    this.getUsers();
  }

  ngOnDestroy() {
    this.subPacientes.unsubscribe();
    this.subEspecialistas.unsubscribe();
    this.subAdmins.unsubscribe();
  }

  onPageChangePacientes(page: number) {
    this.currentPagePacientes = page;
  } 

  onPageChangeEspecialistas(page: number) {
      this.currentPageEspecialistas = page;
  }

  onPageChangeAdmins(page: number) {
      this.currentPageAdmins = page;
  }

  getUsers() {
    this.getPacientes();
    this.getEspecialistas();
    this.getAdmins();
    this.getTurnos();
  }

  async toggleUserAccess(userId: string, isActive: boolean) {
    const userDoc = doc(this.firestore, `especialistas/${userId}`);
    try {
      await updateDoc(userDoc, { profileValidatedByAdmin: !isActive }); // Cambia el estado de isActive
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  }

  getPacientes() {
    this.subPacientes = this.userService.getPacientes().subscribe((users: any) => {
      this.arrPacientes = users;
    });
  }

  getEspecialistas() {
    this.subEspecialistas = this.userService.getEspecialistas().subscribe((users: any) => {
      this.arrEspecialistas = users;
    });
  }

  getAdmins() {
    this.subAdmins = this.userService.getAdmins().subscribe((users: any) => {
      this.arrAdmins = users;
    });
  }

  // modal functions
  openUserTypeModal() {
    const modalElement = document.getElementById('userTypeModal');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
  

  openUserForm(userType: string) {
    this.selectedUserType = userType;
  
    // Mostrar el modal del formulario
    const modal = new window.bootstrap.Modal(document.getElementById('userFormModal'));
    modal.show();
  }

  //
  handleRegistrationSuccess() {
    // Aquí puedes cerrar el modal manualmente si no se cierra automáticamente.
    const modalElement = document.getElementById('userFormModal');
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      this.selectedUserType = null;
    }
  
    // Luego, actualiza la lista de usuarios, si es necesario.
    // this.getUsers(); // Llama a tu método para actualizar los usuarios
  }

  selectedSpecialist: any; // Variable para almacenar el especialista seleccionado

  openSpecialtiesModal(user: any) {
    this.selectedSpecialist = user;
    const modal = new window.bootstrap.Modal(document.getElementById('specialtiesModal'));
    modal.show();
  }

  exportarTodosLosUsuarios() {
    // Exportar los usuarios a un archivo CSV
    const copiaEspecialistas = [...this.arrEspecialistas]; // Copia de los especialistas
    const especialistasExport = copiaEspecialistas.map((especialista: any) => {
      const especialistaModificado = {
        nombre: especialista.nombre,
        apellido: especialista.apellido,
        dni: especialista.dni,
        edad: especialista.edad,
        email: especialista.email,
        especialidades: especialista.especialidades.join(', '),
        imagen1: especialista.perfil1,
        perfilValidado: especialista.profileValidatedByAdmin,
      }
      return especialistaModificado;
    });

    let pacientesExport = [...this.arrPacientes]; // Copia de los pacientes
    pacientesExport = pacientesExport.map((paciente: any) => {
      const pacienteModificado = {
        apellido: paciente.apellido,
        nombre: paciente.nombre,
        dni: paciente.dni,
        edad: paciente.edad,
        email: paciente.email,
        obraSocial: paciente.obraSocial,
        imagen1: paciente.perfil1,
        imagen2: paciente.perfil2,
      }
      return pacienteModificado;
    });
    let adminsExport = [...this.arrAdmins]; // Copia de los administradores
    adminsExport = adminsExport.map((admin: any) => {
      const adminModificado = {
        apellido: admin.apellido,
        nombre: admin.nombre,
        dni: admin.dni,
        edad: admin.edad,
        email: admin.email,
        imagen1: admin.perfil1
      }
      return adminModificado;
    });

    const disponiblidades = this.exportarDisponibilidad();

     // Verificamos si hay disponibilidades para exportar
  if (disponiblidades.length > 0 || pacientesExport.length > 0 || especialistasExport.length > 0 || adminsExport.length > 0) {    
    // Exportar los usuarios a un archivo Excel
    this.exportService.exportarUsuariosExcel(pacientesExport, especialistasExport, adminsExport, disponiblidades);
  } else {
    console.log('No hay datos disponibles para exportar.');
  }


  }

  exportarDisponibilidad() {
        // Creamos un arreglo vacío donde almacenaremos todas las disponibilidades
        const disponibilidades: any[] = [];
  
        // Recorremos todos los especialistas
        this.arrEspecialistas.forEach(especialista => {
          // Verificamos si el especialista tiene especialidades (o algún otro criterio)
          if (especialista.disponibilidades) {
            
            // Recorremos las disponibilidades de cada especialista
            especialista.disponibilidades.forEach((
              disponibilidad: {
                especialidad: string; horaInicio: string; horaFin: string; diasDisponibles: { lunes: boolean; martes: boolean; miercoles: boolean; jueves: boolean; viernes: boolean; }; }) => {
              // Creamos un objeto para cada disponibilidad, incluyendo los días y horas
              const disponibilidadEspecialista = {
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                especialidad: disponibilidad.especialidad,
                horaInicio: disponibilidad.horaInicio, // Hora de inicio
                horaFin: disponibilidad.horaFin, // Hora de fin
                lunes: disponibilidad.diasDisponibles.lunes ? 'Disponible' : 'No Disponible',
                martes: disponibilidad.diasDisponibles.martes ? 'Disponible' : 'No Disponible',
                miercoles: disponibilidad.diasDisponibles.miercoles ? 'Disponible' : 'No Disponible',
                jueves: disponibilidad.diasDisponibles.jueves ? 'Disponible' : 'No Disponible',
                viernes: disponibilidad.diasDisponibles.viernes ? 'Disponible' : 'No Disponible',
              };
      
              // Agregamos el objeto de disponibilidad al arreglo
              disponibilidades.push(disponibilidadEspecialista);
            });
          }
        });
    
        console.log('Disponibilidades:', disponibilidades);

        return disponibilidades;
      
  }

  getTurnos() {
    this.subTurnos = this.turnoService.getTurnos().subscribe((turnos: any) => {
      this.turnos = turnos;
    }
    );
  }

  exportarUnUsuario() {
    // filtrar los pacientes que no tienen historia clinica
    let pacientesConHistoriaClinica: any = [];

    this.pacientesFiltrados = this.turnos.filter((t: any) => {
      if(t.historiaClinica) {
        if(!pacientesConHistoriaClinica.includes(t.paciente.email)) {
          pacientesConHistoriaClinica.push(t.paciente.email);
          return t.paciente;
        }
      }
    });    
    
    this.pacientesFiltrados = pacientesConHistoriaClinica.map((paciente: any) => {
      return this.arrPacientes.find((p: any) => p.email === paciente);
    });

    console.log(this.pacientesFiltrados);


    const modalElement = document.getElementById('modalDescargaUsuario');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }

  seleccionarUsuario(user: any) {
    // Lógica para exportar el usuario seleccionado
    // console.log('Exportar usuario:', user);

    const turnosUsuario = this.turnos.filter((t: any) => t.paciente.email === user.email && t.historiaClinica);
    // console.log('Turnos del usuario:', turnosUsuario);  

    const datosAExportar = turnosUsuario.map((turno: any) => {
      return {
        paciente: `${turno.paciente.nombre} ${turno.paciente.apellido}`,
        especialista: `${turno.especialista.nombre} ${turno.especialista.apellido}`,
        especialidad: turno.especialidad,
        dia: turno.dia,
        hora: turno.hora,
        comentario: turno.comentario,
        historiaClinica: turno.historiaClinica,
      };
    });

    console.log('Datos a exportar:', datosAExportar);
    this.exportService.exportarUsuarioExcel(datosAExportar);  
  }

  mostrarHistoriaClinica(user: any){
    const turnosUsuario = this.turnos.filter((t: any) => t.paciente.email === user.email && t.historiaClinica);
    console.log('Historia clínica del usuario:', turnosUsuario);
    this.turnosPacienteSeleccionado = turnosUsuario;

    const modalElement = document.getElementById('modalHistoriaClinica');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }

  verificarHistoriaClinica(user: any) {
    // Verificar si el usuario tiene historia clínica
    const turnosUsuario = this.turnos.filter((t: any) => t.paciente.email === user.email && t.historiaClinica);
    return turnosUsuario.length > 0;
  }


  
}
