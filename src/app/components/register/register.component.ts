import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacientFormComponent } from './pacient-form/pacient-form.component';
import { SpecialistFormComponent } from './specialist-form/specialist-form.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule, 
    PacientFormComponent, SpecialistFormComponent],
  // providers: [ImagesService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  showForm = false;
  isPacienteFormVisible = false;

  constructor() {}

  showPacienteForm() {
    this.isPacienteFormVisible = true;
    this.showForm = true;
  }

  showSpecialistForm() {
    this.isPacienteFormVisible = false;
    this.showForm = true;
  }

 ngOnInit(): void {
   
 }



}
