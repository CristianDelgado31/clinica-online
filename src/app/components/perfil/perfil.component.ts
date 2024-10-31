import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit{
  user: any;

  constructor() { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }
}
