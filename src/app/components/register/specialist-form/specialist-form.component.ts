import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ImagesService } from '../../../services/images.service';

@Component({
  selector: 'app-specialist-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './specialist-form.component.html',
  styleUrl: './specialist-form.component.css'
})
export class SpecialistFormComponent implements OnDestroy{
  @Input() redirectToLogin: boolean = true; // Recibir el flag del padre
  @Output() registrationSuccess = new EventEmitter<void>();

  registerForm!: FormGroup;
  perfil1Loaded: boolean = false;
  errorMessage: string = '';
  loading: boolean = false; // Agrega esta línea

  constructor(private fb: FormBuilder, private auth: Auth, private firestore: Firestore, 
    private router: Router, private imagesService: ImagesService) {
      this.registerForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
        edad: ['', [Validators.required, Validators.min(18)]],
        dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        especialidad: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]], // Solo para especialistas
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        perfil1: [null], // Para subir foto de perfil
        especialidadesExtras: this.fb.array([]), // FormArray para especialidades extras
      });
    }

  get extraSpecialties(): FormArray {
    return this.registerForm.get('especialidadesExtras') as FormArray;
  }

  addExtraSpecialty() {
    const specialtyForm = this.fb.group({
      nombre: ['', Validators.required]
    });
    this.extraSpecialties.push(specialtyForm);
  }

  ngOnDestroy(): void {
    console.log('Limpiando imagen');
  }


  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']; // Tipos válidos
      if (validTypes.includes(file.type)) {
        this.registerForm.patchValue({ [field]: file });
        this.perfil1Loaded = true; // Cambia esto a true solo si es una imagen
      } else {
        this.perfil1Loaded = false; // Cambia a false si no es una imagen
        this.errorMessage = 'Por favor, sube una imagen válida (JPEG, PNG o GIF).'; // Mensaje de error
      }
    } else {
      this.perfil1Loaded = false; // Si no hay archivo, cambia a false
      this.errorMessage = 'La imagen de perfil es requerida.'; // Mensaje de error si no hay archivo
    }
  }
  

  async onSubmit() {
    if(this.registerForm.valid) {
      console.log(this.registerForm.value);
      this.loading = true;

      createUserWithEmailAndPassword(this.auth, this.registerForm.value.email, this.registerForm.value.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log('Usuario creado:', user);
        // Verificar el correo electrónico
        try {
          await sendEmailVerification(user);
          console.log('Correo de verificación enviado');
        } catch (error) {
          console.error('Error al enviar el correo de verificación:', error);
        }

        // Subir la imagen de perfil
        const perfil1Url = await this.imagesService.uploadImage(this.registerForm.value.perfil1);

        // 
        try {
          await this.logUser(perfil1Url);
          console.log('Correo de verificación enviado');
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Por favor, verifica tu correo electrónico para continuar.'
          }).then(() => {
            if(this.redirectToLogin) {
              this.router.navigate(['/login']);
            } else {
              console.log('Usuario registrado desde el panel de administrador');
              this.registerForm.reset();
              this.registerForm.patchValue({ perfil1: null }); // Limpia el campo de perfil1  
              this.registrationSuccess.emit(); // Emitir el evento
            }
          });
        } catch (error) {
          console.error('Error al crear el usuario', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el usuario',
            text: 'Por favor, intenta de nuevo.'
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
            this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            break;
          default:
            this.errorMessage = 'Error al registrar el usuario';
            break;
        }
        this.loading = false;
      })
      .finally(() => {
        this.loading = false;
      });

    }
  }

  async logUser(perfil1Url: string) {
    const arrEspecialidades = [];
      arrEspecialidades.push(this.registerForm.value.especialidad);
      this.registerForm.value.especialidadesExtras.forEach((especialidad: any) => {
        arrEspecialidades.push((especialidad.nombre).toLowerCase());
      });

    const col = collection(this.firestore, 'especialistas');
    const data = {
      nombre: (this.registerForm.value.nombre).toLowerCase(),
      apellido: (this.registerForm.value.apellido).toLowerCase(),
      edad: this.registerForm.value.edad,
      dni: this.registerForm.value.dni,
      especialidades: arrEspecialidades,
      email: this.registerForm.value.email,
      perfil1: perfil1Url,
      profileValidatedByAdmin: false,
      fechaRegistro: Timestamp.now()
    };

    try {
      await addDoc(col, data);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
    }
  }



}
