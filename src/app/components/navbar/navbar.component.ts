import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  userInLocalStorage: boolean = false; // Cambiar a booleano
  isAdmin: boolean = false; // Cambiar a booleano

  constructor(private authService: AuthService, private router: Router) { 
    this.authService.user$.subscribe(isLoggedIn => {
      this.userInLocalStorage = isLoggedIn;

      if(this.userInLocalStorage) {
        const user = this.authService.getUser();
        if(user) {
          if(user.isAdmin) {
           this.isAdmin = true;
          } else {
            this.isAdmin = false;
          }
        }
      }
    });

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
