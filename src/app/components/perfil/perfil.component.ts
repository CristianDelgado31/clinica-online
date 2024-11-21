import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { DisponibilidadFormComponent } from '../disponibilidad-form/disponibilidad-form.component';
import { UserService } from '../../services/user.service';
import { ExportService } from '../../services/export.service';
import { Observable } from 'rxjs';
import { HoverZoomDirective } from '../../directivas/hover-zoom.directive';
import { HighlightDirective } from '../../directivas/highlight.directive';
import { CapitalizePipe } from '../../pipies/capitalize.pipe';
import { TimeFormatPipe } from '../../pipies/time-format.pipe';

@Component({
  standalone: true,
  imports: [ 
    CommonModule,
    DisponibilidadFormComponent,
    HoverZoomDirective,
    HighlightDirective,
    DatePipe,
    CapitalizePipe,
    TimeFormatPipe
  ],
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  modal: any;
  user: any;
  isPacient: boolean = false;
  turnos: any[] = [];
  historiaClinica: any;
  especialistas: any = [];
  observable: any;

  constructor(private userService: UserService, private exportService: ExportService) { }

  ngOnInit(): void {
    this.loadUser();
    if (this.user && this.user.especialidades) {
      this.modal = new window.bootstrap.Modal(document.getElementById('disponibilidadModal'));
    }
    
  }

  loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      if(this.user.obraSocial){
        this.userService.getTurnos(this.user.email).subscribe((turnos: any) => {
          if(turnos.length > 0) {
            this.isPacient = true;
            this.turnos = turnos.filter((t:any) => t.historiaClinica);
            console.log(this.turnos);
            this.cargarHistoriaClinica();
          } else {
            this.isPacient = false;
          }
        });
      }
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

  descargarHistoriaClinica() {
    //modal 
    const modalElement = document.getElementById('modalDescargaHistoriaClinica');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }


  descargaHistoriaClinicaCompleta() {
    const nombrePaciente = this.user.nombre + " " + this.user.apellido;
    console.log(this.historiaClinica);

    this.exportService.exportarHistoriasClinicasPDF(this.historiaClinica, nombrePaciente, 'paciente');
  }

  mostrarEspecialistas() {
    const especialistasUnicos = this.turnos.map((t: any) => t.especialista.email).filter((value, index, self) => self.indexOf(value) === index);
    console.log(especialistasUnicos);
    
    this.especialistas = this.userService.getEspecialistas().subscribe((especialistas: any) => {
      this.especialistas = especialistas.filter((e: any) => especialistasUnicos.includes(e.email));
      console.log(this.especialistas);
    });

    // modal
    const modalElement = document.getElementById('modalDescargaPorEspecialista');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }

  descargarHistoriaClinicaPorEspecialista(especialista: any) {
    const nombrePaciente = this.user.nombre + " " + this.user.apellido;
    const historiaClinicaPorEspecialista = this.historiaClinica.filter((hc: any) => hc.especialista === `${especialista.nombre} ${especialista.apellido}`);
    console.log(historiaClinicaPorEspecialista);

    this.exportService.exportarHistoriasClinicasPDF(historiaClinicaPorEspecialista, nombrePaciente, 'paciente');
  }


  cargarHistoriaClinica() {
    const historiaClinica = this.turnos.map((t: any) => {
      let result = {
        especialista: t.especialista.nombre + ' ' + t.especialista.apellido,
        especialidad: t.especialidad,
        dia: t.dia,
        hora: t.hora,
        altura: t.historiaClinica.altura,
        peso: t.historiaClinica.peso,
        temperatura: t.historiaClinica.temperatura,
        presion: t.historiaClinica.presion,
        datosDinamicos: t.historiaClinica.datosDinamicos
      }
      return result;
    });

    this.historiaClinica = historiaClinica;
  }

  mostrarHistoriaClinica() {
    // modal
    const modalElement = document.getElementById('modalHistoriaClinica');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}
