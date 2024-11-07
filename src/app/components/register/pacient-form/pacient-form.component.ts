import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ImagesService } from '../../../services/images.service';

@Component({
  selector: 'app-pacient-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './pacient-form.component.html',
  styleUrl: './pacient-form.component.css'
})
export class PacientFormComponent implements OnDestroy {
  @Input() redirectToLogin: boolean = true; // Recibir el flag del padre
  @Output() registrationSuccess = new EventEmitter<void>();

  registerForm!: FormGroup;
  perfil1Loaded: boolean = false;
  perfil2Loaded: boolean = false;
  errorMessage: string = '';
  loading: boolean = false; // Agrega esta línea


  constructor(private fb: FormBuilder, private auth: Auth, private firestore: Firestore, 
    private router: Router, private imagesService: ImagesService) {

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      edad: ['', [Validators.required, Validators.min(0)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      obraSocial: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]], // Solo para pacientes
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      perfil1: [null], // Para subir foto de perfil
      perfil2: [null]
    });
  }

  ngOnDestroy(): void {
    console.log('Limpiando imagen');
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']; // Tipos válidos
  
    if (file) {
      if (validTypes.includes(file.type)) {
        this.registerForm.patchValue({ [field]: file });
        if (field === 'perfil1') {
          this.perfil1Loaded = true;
        } else if (field === 'perfil2') {
          this.perfil2Loaded = true;
        }
        this.errorMessage = ''; // Limpiar el mensaje de error si el archivo es válido
      } else {
        this.errorMessage = 'Por favor, sube una imagen válida (JPEG, PNG o GIF).'; // Mensaje de error
        if (field === 'perfil1') {
          this.perfil1Loaded = false;
        } else if (field === 'perfil2') {
          this.perfil2Loaded = false;
        }
      }
    } else {
      // Si no hay archivo, significa que el usuario ha borrado la selección
      if (field === 'perfil1') {
        this.perfil1Loaded = false;
      } else if (field === 'perfil2') {
        this.perfil2Loaded = false;
      }
      this.errorMessage = 'La imagen de perfil es requerida.'; // Mensaje de error si no hay archivo
    }
  }
  
  

  async onSubmit() {
    if (this.registerForm.valid) {

      this.loading = true; // Muestra el indicador de carga
      
      createUserWithEmailAndPassword(this.auth, this.registerForm.value.email, this.registerForm.value.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          console.log('Usuario creado', user);

          // Envía un correo de verificación
          try {
            await sendEmailVerification(user);
            console.log('Correo de verificación enviado');
          } catch (error) {
            console.error('Error al enviar el correo de verificación', error);
          }

          // Guardar las imagenes en Spaces
          const perfil1Url = await this.imagesService.uploadImage(this.registerForm.value.perfil1);
          const perfil2Url = await this.imagesService.uploadImage(this.registerForm.value.perfil2);

          // Guardar el usuario en Firestore
          try {
            await this.logUser(perfil1Url, perfil2Url);
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '¡Registro exitoso!',
              text: 'Por favor, verifica tu correo electrónico para continuar.',
              icon: 'success',
              confirmButtonText: 'Ok'
            }).then(() => {
              if(this.redirectToLogin) {
                this.router.navigate(['/login']);
              } else {
                console.log('Usuario registrado desde el panel de administrador');
                this.registerForm.reset();
                this.registerForm.patchValue({ perfil1: null }); // Limpia el campo de perfil1
                this.registerForm.patchValue({ perfil2: null }); // Limpia el campo de perfil2
                this.registrationSuccess.emit(); // Emitir el evento
              }
            });
          } catch (error) {
            console.error('Error al registrar el usuario', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al registrar el usuario. Por favor, intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'Ok'
            });
          }

        })
        .catch((error) => {
          switch (error.code) {
            case 'auth/email-already-in-use':
              this.errorMessage = 'El email ya está en uso';
              break;
            case 'auth/invalid-email':
              this.errorMessage = 'El email no es válido';
              break;
            case 'auth/weak-password':
              this.errorMessage = 'La contraseña tiene que tener al menos 6 caracteres';
              break;
            default:
              this.errorMessage = 'Error al registrar el usuario';
              break;
          }
          this.loading = false; // Detener carga en caso de error
        })
        .finally(() => {
          this.loading = false; // Detener carga
        });

    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }
  
  async logUser(perfil1Url: string, perfil2Url: string): Promise<void> {
    const col = collection(this.firestore, 'pacientes');
    const obj: any = {
      nombre: (this.registerForm.value.nombre).toLowerCase(),
      apellido: (this.registerForm.value.apellido).toLowerCase(),
      edad: this.registerForm.value.edad,
      dni: this.registerForm.value.dni,
      obraSocial: this.registerForm.value.obraSocial,
      email: this.registerForm.value.email,
      perfil1: perfil1Url,
      perfil2: perfil2Url,
      fechaRegistro: Timestamp.fromDate(new Date()),
    }

    try {
      await addDoc(col, obj);
      console.log('Usuario registrado correctamente');
    } catch (error) {
      console.error('Error al registrar el usuario', error);
    }

  }


}
