import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { set } from '@angular/fire/database';
import { ImagesService } from '../../services/images.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  // providers: [ImagesService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  selectSpecialist: boolean = false; // Controla el tipo de registro
  selectedType: string = ''; // Controla el tipo seleccionado
  perfil1Loaded: boolean = false;
  perfil2Loaded: boolean = false;
  errorMessage: string = '';
  loading: boolean = false; // Agrega esta línea
  selectPaciente: boolean = false;
  anAdmin: boolean = false;
  selectAdmin: boolean = false;


  constructor(private fb: FormBuilder, private auth: Auth, private firestore: Firestore, private router: Router, private imagesService: ImagesService, private authService: AuthService) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      edad: ['', [Validators.required, Validators.min(0)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      obraSocial: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]], // Solo para pacientes
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      perfil1: [null], // Para subir foto de perfil
      perfil2: [null],
      especialidad: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]], // Solo para especialistas
      nuevaEspecialidad: ['', ] // Campo para agregar especialidad
    });
  }

  ngOnInit(): void {
    this.anAdmin = this.authService.isThereAnAdmin();
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({ [field]: file });
      if (field === 'perfil1') {
        this.perfil1Loaded = true;
      } else if (field === 'perfil2') {
        this.perfil2Loaded = true;
      }
    }
  }

  resetImages() {
    this.perfil1Loaded = false;
    this.perfil2Loaded = false;
  }

  onTypeChange(event: any) {
    this.selectedType = event.target.value;
    this.selectSpecialist = this.selectedType === 'especialista';
    this.selectPaciente = this.selectedType === 'paciente';
    this.selectAdmin = this.selectedType === 'admin';
    this.updateValidators();
  }


  onEspecialidadChange(event: any) {
    const selectedValue = event.target.value;
    const nuevaEspecialidadControl = this.registerForm.get('nuevaEspecialidad');

    if (selectedValue === 'otra') {
        nuevaEspecialidadControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]); // Hacer el campo requerido
    } else {
        nuevaEspecialidadControl?.clearValidators(); // Limpiar validación si no es "Otra"
        nuevaEspecialidadControl?.setValue(''); // Limpiar el valor
    }

    nuevaEspecialidadControl?.updateValueAndValidity(); // Actualizar validaciones
}


  updateValidators() {
    const obraSocialControl = this.registerForm.get('obraSocial');
    const especialidadControl = this.registerForm.get('especialidad');
    const perfilControl = this.registerForm.get('perfil1'); // Imagen de perfil

    // Limpiar validaciones y valores
    obraSocialControl?.clearValidators();
    obraSocialControl?.setValue(null);
    especialidadControl?.clearValidators();
    especialidadControl?.setValue('');
    perfilControl?.clearValidators();
    perfilControl?.setValue(null);

    if (this.selectSpecialist) {
        especialidadControl?.setValidators([Validators.required]);
        perfilControl?.setValidators([Validators.required]);
    } else if (this.selectPaciente) {
        obraSocialControl?.setValidators([Validators.required]);
        perfilControl?.setValidators([Validators.required]);
    } else if (this.selectAdmin) {
      perfilControl?.setValidators([Validators.required]);
    } 

    obraSocialControl?.updateValueAndValidity();
    especialidadControl?.updateValueAndValidity();
    perfilControl?.updateValueAndValidity();
  }


  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true; // Iniciar carga

      createUserWithEmailAndPassword(this.auth, this.registerForm.value.email, this.registerForm.value.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          console.log('Usuario creado', user);

          // Enviar email de verificación
          try {
            await sendEmailVerification(user);
            console.log('Email de verificación enviado');
          } catch (error) {
            console.error('Error al enviar email de verificación', error);
          }

          // Guardar las imagenes en Spaces
          const perfil1Url = await this.imagesService.uploadImage(this.registerForm.value.perfil1);
          if(this.selectPaciente){
            const perfil2Url = await this.imagesService.uploadImage(this.registerForm.value.perfil2);
            // Guardar datos en Firestore
            await this.logUser(perfil1Url, perfil2Url);
          } else {
            // Guardar datos en Firestore
            await this.logUser(perfil1Url, '');
          }

          // Redirigir al 
          this.router.navigate(['/login']);
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
      
    }
  }


  async logUser(perfil1Url: string, perfil2Url: string): Promise<void> {
    const col = collection(this.firestore, 'users');
    const obj : any = {
      nombre: (this.registerForm.value.nombre).toLowerCase(),
      apellido: (this.registerForm.value.apellido).toLowerCase(),
      edad: this.registerForm.value.edad,
      dni: this.registerForm.value.dni,
      email: (this.registerForm.value.email).toLowerCase(),
      perfil1: perfil1Url,
      fecha: Timestamp.fromDate(new Date()),
    }

    if(this.selectSpecialist) {
      obj['especialidad'] = (this.registerForm.value.especialidad).toLowerCase();
      obj['profileValidatedByAdmin'] = false;
    } else if(this.selectPaciente) {
      obj['obraSocial'] = (this.registerForm.value.obraSocial).toLowerCase();
      obj['perfil2'] = perfil2Url;
    } else if(this.selectAdmin) {
      obj['isAdmin'] = true;
    }
    
    try {
      await addDoc(col, obj);
      console.log('Usuario registrado en Firestore:', obj);
    } catch (error) {
      console.error('Error al registrar el usuario en Firestore:', error);
    }

  }


}
