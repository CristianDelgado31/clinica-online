import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, where, orderBy, limit, query, doc, setDoc, getDocs, getDoc, updateDoc, Timestamp} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) { }

  getPacientes() {
    const col = collection(this.firestore, 'pacientes');
    const orderedQuery = query(col, orderBy('fechaRegistro', 'asc'));
    const observable = collectionData(orderedQuery, { idField: 'id' });
    return observable; 
  }

  getEspecialistas() {
    const col = collection(this.firestore, 'especialistas');
    const orderedQuery = query(col, orderBy('fechaRegistro', 'asc'));
    const observable = collectionData(orderedQuery, { idField: 'id' });
    return observable;
  }

  getAdmins() {
    const col = collection(this.firestore, 'admins');
    const orderedQuery = query(col, orderBy('fechaRegistro', 'asc'));
    const observable = collectionData(orderedQuery, { idField: 'id' });
    return observable;
  }

  getEspecialista(email: string) {
    const docRef = doc(this.firestore, 'especialistas', email);
    return getDoc(docRef);
  }

  // Obtener especialistas por especialidad seleccionada
  getEspecialistasPorEspecialidad(especialidad: string): Observable<any[]> {
    const col = collection(this.firestore, 'especialistas');
    const q = query(col, where('especialidades', 'array-contains', especialidad));
    return collectionData(q, { idField: 'id' });
  }
  
  getTurnos(email: string) {
    const col = collection(this.firestore, 'turnos');
    const q = query(
      col,
      where('paciente.email', '==', email)
    );
    return collectionData(q, { idField: 'id' });
  }
  

  getTurnosEspecialista(email: string) {
    const col = collection(this.firestore, 'turnos');
    const q = query(col, where('especialista.email', '==', email)); // Acceso correcto al campo email dentro del objeto especialista
    return collectionData(q, { idField: 'id' });
  }
  
  updateEstadoTurno(turnoId: string, estado: string) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { estado }); 
  }

  cancelarTurno(turnoId: string, comentario: string) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { estado: 'cancelado', comentario: comentario });
  }

  rechazarTurno(turnoId: string, comentario: string) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { estado: 'rechazado', comentario: comentario });
  }

  finalizarTurno(turnoId: string, comentario: string) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { estado: 'realizado', comentario: comentario });
  }

  calificarAtencion(turnoId: string, calificacion: string) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { calificacion });
  }

  completarEncuesta(turnoId: string, encuesta: any) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { encuesta });
  }

  agregarHistoriaClinica(turnoId: string, historiaClinica: any) {
    const docRef = doc(this.firestore, 'turnos', turnoId);
    return updateDoc(docRef, { historiaClinica });
  }

  logUsuarios(email: string) {
    const fecha = Timestamp.now();
    const col = collection(this.firestore, 'logUsuarios');
    const data = {
      email,
      fecha
    };
    return addDoc(col, data);
  }

  getLogUsuarios() {
    const col = collection(this.firestore, 'logUsuarios');
    const orderedQuery = query(col, orderBy('fecha', 'asc'));
    const observable = collectionData(orderedQuery, { idField: 'id' });
    return observable;
  }
}
