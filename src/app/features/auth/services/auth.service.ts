import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';


export interface IUser {
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
  firstName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<IUser | null | undefined>;


  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    // Get auth data and then get firestore user document || null
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<IUser>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignin(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    this.router.navigate(['projects']);
    return this.updateUserData(credential.user as IUser);
  }

  async signOut(): Promise<boolean> {
    localStorage.removeItem('user');
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  getUser(): IUser {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  /**
   * Sets user data to firestore after succesful login
   */
  private updateUserData({
    uid,
    email,
    displayName,
    photoURL,
  }: IUser): Promise<void> {
    const userRef: AngularFirestoreDocument<IUser> = this.afs.doc(
      `users/${uid}`
    );

    const data: IUser = {
      uid,
      email,
      displayName,
      photoURL,
      firstName: displayName?.split(' ')[0],
    };

    localStorage.setItem('user', JSON.stringify(data));

    return userRef.set(data, { merge: true });
  }
}
