import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs} from '@angular/fire/firestore';
import { signInWithEmailAndPassword, Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false; // Nueva propiedad para manejar el estado de carga
  private sub!: Subscription;
  // isPaciente: boolean = false;
  isDoctor: boolean | null = null;
  // isAdmin: boolean = false;
  urlPaciente: string = 'https://clinic-profile-images.nyc3.digitaloceanspaces.com/7805c816-51e7-495e-a433-4fa93f9dec07.png';
  urlEspecialista: string = 'https://clinic-profile-images.nyc3.digitaloceanspaces.com/b60aba11-355f-45a6-981b-00bb78321cd8.jpg';
  urlAdmin: string = 'https://clinic-profile-images.nyc3.digitaloceanspaces.com/ebcc95df-f57b-4a55-9112-345ed0d1b5d4.png';
  

  constructor(private fb: FormBuilder, private firestore: Firestore, private auth: Auth, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true; // Iniciar carga
      const { email, password } = this.loginForm.value;
      
      try {
        const normalizedEmail = email.toLowerCase();
        const userCredential = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          this.errorMessage = 'Por favor, verifica tu correo electrónico antes de iniciar sesión.';
          return;
        }

        const userExists = await this.getUser(email);
        if (this.isDoctor == false) {
          this.errorMessage = 'El usuario no ha sido validado por el administrador.';
          return;
        } else {
          Swal.fire({
            title: 'Inicio de sesión exitoso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          console.log('Inicio de sesión exitoso', user);
          this.errorMessage = null;
          this.authService.login();
          this.router.navigate(['/home']);
        }

      } catch (error) {
        console.error('Error al iniciar sesión', error);
        this.errorMessage = 'Email y/o contraseña incorrecto.';
        
      } finally {
        this.loading = false; // Detener carga al final
      }
    }
  }
  

  async getUser(email: string): Promise<string | boolean> {
    const userType = await this.checkUser(email);
    
    if (userType) {
        return userType; // Retorna el tipo de usuario encontrado
    }
    
    this.errorMessage = 'Usuario no encontrado.';
    return false;
  }

  private async checkUser(email: string): Promise<string | null> {
      if (await this.findPaciente(email)) return 'paciente'; 
      if (await this.findDoctor(email)) return 'doctor';
      if (await this.findAdmin(email)) return 'admin';
      return null;
  }



  async findPaciente(email: string): Promise<boolean> {
    const col = collection(this.firestore, 'pacientes');
    const filteredQuery = query(col, where('email', '==', email));
    const querySnapshot = await getDocs(filteredQuery);

    // Si el usuario es paciente, se retorna true
    if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data();
        console.log('Usuario encontrado:', user); // Debugging
        localStorage.setItem('user', JSON.stringify(user));
        return true;
    }
    return false;
  }

  async findDoctor(email: string): Promise<boolean> {
    const col = collection(this.firestore, 'especialistas');
    const filteredQuery = query(col, where('email', '==', email));
    const querySnapshot = await getDocs(filteredQuery);

    // Si el usuario es doctor, se retorna true
    if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data();
        console.log('Usuario encontrado:', user); // Debugging
        if(user['profileValidatedByAdmin'] === false) {
          this.isDoctor = false;
          return true; // Si el usuario es doctor pero no ha sido validado por el admin, se retorna true
        }
        this.isDoctor = true;
        console.log('Usuario doctor');
        localStorage.setItem('user', JSON.stringify(user));
        return true;
    }
    return false;
  }

  async findAdmin(email: string): Promise<boolean> {
    const col = collection(this.firestore, 'admins');
    const filteredQuery = query(col, where('email', '==', email));
    const querySnapshot = await getDocs(filteredQuery);

    // Si el usuario es admin, se retorna true
    if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data();
        console.log('Usuario encontrado:', user); // Debugging
        localStorage.setItem('user', JSON.stringify(user));
        return true;
    }
    return false;
  }

  getPacientes(numero: number) {
    if(numero == 1) {
      this.loginForm.get('email')?.setValue('j9hpx2l0@cj.MintEmail.com');
    } else if(numero == 2) {
      this.loginForm.get('email')?.setValue('18duu2j9@cj.MintEmail.com');
    } else if(numero == 3) {
      this.loginForm.get('email')?.setValue('a5yfl81p@cj.MintEmail.com');
    }

    this.loginForm.get('password')?.setValue('123456');
  }

  getEspecialistas(numero: number) {
    if(numero == 1) {
      this.loginForm.get('email')?.setValue('c7hup2p3@cj.MintEmail.com');
    } else if(numero == 2) {
      this.loginForm.get('email')?.setValue('q796si4b@cj.MintEmail.com');
    }
    this.loginForm.get('password')?.setValue('123456');
  }

  getAdmins(numero: number) {
    if(numero == 1) {
      this.loginForm.get('email')?.setValue('r6q00n9h@cj.MintEmail.com');
    }
    this.loginForm.get('password')?.setValue('123456');
  }

}
