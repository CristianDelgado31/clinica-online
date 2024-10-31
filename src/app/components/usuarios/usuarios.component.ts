import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs, updateDoc, Timestamp} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  
  public users: any[] = [];
  private sub!: Subscription;

  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  getUsers() {
    const col = collection(this.firestore, 'users');
    const orderedQuery = query(col, orderBy('fecha', 'asc'));
    const observable = collectionData(orderedQuery, { idField: 'id' });
    this.sub = observable.subscribe((users: any) => {
      this.users = users;
    });
  }

  async toggleUserAccess(userId: string, isActive: boolean) {
    const userDoc = doc(this.firestore, `users/${userId}`);
    try {
      await updateDoc(userDoc, { profileValidatedByAdmin: !isActive }); // Cambia el estado de isActive
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  }
  
  addUser() {
    this.router.navigate(['/register']);
  }
}
