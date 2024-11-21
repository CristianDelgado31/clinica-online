import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  user$ = this.userSubject.asObservable();

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  login() {
    this.userSubject.next(true);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(false);
  }

  getUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  }

  isThereAnAdmin(): boolean{
    const user = this.getUser();
    return user && user.isAdmin;
  }

  
}
