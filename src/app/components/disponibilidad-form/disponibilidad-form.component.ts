import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, updateDoc, collection, doc, getDocs, query, where } from '@angular/fire/firestore';

interface Disponibilidad {
  especialidad: string;
  diasDisponibles: {
    lunes: boolean;
    martes: boolean;
    miercoles: boolean;
    jueves: boolean;
    viernes: boolean
  };
  horaInicio: string;
  horaFin: string;
}


@Component({
  selector: 'app-disponibilidad-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule
  ],
  templateUrl: './disponibilidad-form.component.html',
  styleUrl: './disponibilidad-form.component.css'
})
export class DisponibilidadFormComponent implements OnInit {
  @Input() especialidades: string[] = []; // Especialidades del especialista
  @Input() user: any; // Usuario logueado
  @Output() submit = new EventEmitter<any>(); // Emite el formulario cuando es enviado

  disponibilidadForm!: FormGroup; // Formulario reactivo para disponibilidad

  constructor(private fb: FormBuilder, private firestore: Firestore) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  // Inicializar el formulario reactivo
  initializeForm() {
    this.disponibilidadForm = this.fb.group({
      especialidad: [this.especialidades[0], Validators.required],
      lunes: [false],
      martes: [false],
      miercoles: [false],
      jueves: [false],
      viernes: [false],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required]
    });
  }

  // Manejar el envío del formulario
  onSubmit() {
    if (this.disponibilidadForm.valid) {
      const disponibilidad = this.disponibilidadForm.value;
      console.log(disponibilidad);
      // console.log(this.user.email);
      this.updateEspecialista(disponibilidad); // Actualizar las disponibilidades del especialista

      this.submit.emit(true); // Emitir el formulario con los valores


      const ultimaEspecialidad = this.disponibilidadForm.get('especialidad')?.value;
      this.disponibilidadForm.reset(); // Limpiar el formulario
      this.initializeForm(); // Volver a inicializar el formulario
      this.disponibilidadForm.get('especialidad')?.setValue(ultimaEspecialidad); // Establecer la última especialidad seleccionada
    } else {
      console.log('Formulario inválido');
    }
  }

  async updateEspecialista(disponibilidad: any) {
    const col = collection(this.firestore, 'especialistas');
    const q = query(col, where('email', '==', this.user.email));
  
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log('No se encontró un especialista con ese email.');
        return;
      }
  
      const docSnapshot = querySnapshot.docs[0];
      const docRef = docSnapshot.ref;
      const disponibilidades = docSnapshot.data()["disponibilidades"];
      let flagExist: Boolean = false;
  
      // Limpiar el objeto de disponibilidad
      const disponibilidadLimpa : Disponibilidad= {
        especialidad: disponibilidad.especialidad,
        diasDisponibles: {
          lunes: disponibilidad.lunes,
          martes: disponibilidad.martes,
          miercoles: disponibilidad.miercoles,
          jueves: disponibilidad.jueves,
          viernes: disponibilidad.viernes,
        },
        horaInicio: disponibilidad.horaInicio,
        horaFin: disponibilidad.horaFin
      };
  
      // Verificación de la estructura del objeto antes de enviarlo
      console.log('Disponibilidad a enviar a Firestore:', disponibilidadLimpa);
      const newArrDisponibilidades = [];

      // Si no hay disponibilidades, agregarla
      if (!disponibilidades) {
        newArrDisponibilidades.push(disponibilidadLimpa);
      } else {
        // Reemplazar la disponibilidad si la especialidad ya existe
        for (let i = 0; i < disponibilidades.length; i++) {
          if (disponibilidades[i].especialidad === disponibilidadLimpa.especialidad) {
            disponibilidades[i] = disponibilidadLimpa;
            flagExist = true;
            break;
          }
        }
        if (!flagExist) {
          disponibilidades.push(disponibilidadLimpa);
        }
      }
  
      // Actualizar el documento con la nueva lista de disponibilidades
      await updateDoc(docRef, {
        disponibilidades: disponibilidades || newArrDisponibilidades
      });
      
  
      console.log("Disponibilidad actualizada correctamente");
  
    } catch (error) {
      console.error("Error al actualizar las disponibilidades: ", error);
    }
  }
}