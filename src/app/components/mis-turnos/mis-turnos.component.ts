import { Component, OnInit } from '@angular/core';
import { TurnosPacienteComponent } from './turnos-paciente/turnos-paciente.component';
import { CommonModule } from '@angular/common';
import { TurnosEspecialistaComponent } from './turnos-especialista/turnos-especialista.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [TurnosPacienteComponent, CommonModule, TurnosEspecialistaComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent implements OnInit{
  isPaciente = false;

  constructor() { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      this.isPaciente = userObj.obraSocial ? true : false;
    }
  }
}
