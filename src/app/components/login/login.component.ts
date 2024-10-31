import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs} from '@angular/fire/firestore';
import { signInWithEmailAndPassword, Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

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

  constructor(private fb: FormBuilder, private firestore: Firestore, private auth: Auth, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

        const userExists = await this.getUser(normalizedEmail);
        if (!userExists) {
          this.errorMessage = 'El usuario no ha sido validado por el administrador.';
          return;
        } else {
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
  
  async getUser(email: string): Promise<boolean> {
    try {
      const col = collection(this.firestore, 'users');
      const filteredQuery = query(col, where('email', '==', email));
      const querySnapshot = await getDocs(filteredQuery);
  
      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data();
        if (user['profileValidatedByAdmin'] === false) {
          return false;
        } else {
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      throw error;
    }
  }
}
