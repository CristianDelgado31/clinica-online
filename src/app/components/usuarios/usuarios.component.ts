import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs, updateDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PacientFormComponent } from '../register/pacient-form/pacient-form.component';
import { SpecialistFormComponent } from '../register/specialist-form/specialist-form.component';
import { AdminFormComponent } from '../register/admin-form/admin-form.component';
import { UserService } from '../../services/user.service';


declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, PacientFormComponent, SpecialistFormComponent, AdminFormComponent],
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

  constructor(private firestore: Firestore, private router: Router, private userService: UserService) {}

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
  }

  async toggleUserAccess(userId: string, isActive: boolean) {
    const userDoc = doc(this.firestore, `especialistas/${userId}`);
    try {
      await updateDoc(userDoc, { profileValidatedByAdmin: !isActive }); // Cambia el estado de isActive
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  }
  
  addUser() {
    // Mostrar en el componente usuarios el formulario de registro de usuarios (pacientes, especialistas, admins)
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
  
  // saveUser() {
  //   // Puedes llamar a un método en el componente del formulario hijo para manejar el guardado
  //   // Por ejemplo, podrías usar un EventEmitter o un servicio compartido para enviar los datos
  // }

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

  
}
