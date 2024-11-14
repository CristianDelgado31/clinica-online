import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs, updateDoc, Timestamp} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  constructor(private firestore: Firestore) { }

  setTurno(turno: any) {
    return addDoc(collection(this.firestore, 'turnos'), turno);
  }

  getTurnos() {
    return collectionData(collection(this.firestore, 'turnos'), { idField: 'id' });
  }
}
