import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { DisponibilidadFormComponent } from '../disponibilidad-form/disponibilidad-form.component';
// import { Firestore, updateDoc, collection, doc, getDocs, query, where } from '@angular/fire/firestore';


@Component({
  standalone: true,
  imports: [ 
    CommonModule,
    DisponibilidadFormComponent
  ],
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  modal: any;
  // disponibilidades$!: Observable<any[]>;
  user: any;

  constructor(
    // private firestore: Firestore
  ) { }

  ngOnInit(): void {
    this.loadUser();
    if (this.user && this.user.especialidades) {
      this.modal = new window.bootstrap.Modal(document.getElementById('disponibilidadModal'));
      // if(this.user.especialidades.length > 0){
      //   // this.getDisponibilidades();
      // }
    }
    
  }

  loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  // Llamar al método del componente hijo (DisponibilidadForm) para actualizar disponibilidades
  handleDisponibilidadSubmit(data: boolean) {
    console.log(data);
    this.closeModal();
  }

  openModal() {
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }

  // getDisponibilidades() {
  //   // Crear una referencia a la colección de especialistas
  //   const col = collection(this.firestore, 'especialistas');
  //   const q = query(col, where('email', '==', this.user.email)); // Filtrar por el email del usuario logueado

  //   getDocs(q).then((querySnapshot) => {
  //     if (querySnapshot.empty) {
  //       console.log('No se encontró un especialista con ese email.');
  //       return;
  //     }

  //     const docSnapshot = querySnapshot.docs[0];
  //     const disponibilidades = docSnapshot.data()["disponibilidades"];

  //     if (disponibilidades) {
  //       this.disponibilidades$ = new Observable<any[]>(subscriber => {
  //         subscriber.next(disponibilidades);
  //       });
  //     }
  //   });
  // }
}
