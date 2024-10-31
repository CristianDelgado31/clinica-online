import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  services = [
    { name: 'Consulta Médica', description: 'Atención médica personalizada.' },
    { name: 'Exámenes de Laboratorio', description: 'Realizamos exámenes de sangre y otros.' },
    { name: 'Radiología', description: 'Servicios de rayos X y ultrasonido.' },
    { name: 'Vacunación', description: 'Vacunas para todas las edades.' },
  ];
}
