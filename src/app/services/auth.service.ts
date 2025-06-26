import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  /* Login dengan Google */
  async loginWithGoogle(): Promise<firebase.auth.UserCredential> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      return await this.afAuth.signInWithPopup(provider);
    } catch (error) {
      console.error('Error during Google authentication:', error);
      throw error;
    }
  }

  /* Cek status login */
  get isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }

  /* Logout */
  async logout(): Promise<void> {
    return await this.afAuth.signOut();
  }

  /* Dapatkan user saat ini */
  get currentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
}