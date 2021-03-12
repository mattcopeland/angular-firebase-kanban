import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { AddProjectComponent } from '../add-project/add-project.component';

export interface IProject {
  id?: string;
  name: string;
  created: firebase.firestore.FieldValue;
  updated: firebase.firestore.FieldValue;
  updatedBy: string;
}

@Component({
  selector: 'app-view-projects',
  templateUrl: './view-projects.component.html',
  styleUrls: ['./view-projects.component.scss']
})
export class ViewProjectsComponent {
  projects$: Observable<IProject[]>;
  projectsCol: AngularFirestoreCollection<IProject>;

  constructor(
    private afs: AngularFirestore,
    public dialog: MatDialog,
    private router: Router
  ) {
    // Projects collection reference
    this.projectsCol = this.afs.collection<IProject>('projects');
    // PRojects from firestore
    this.projects$ = this.projectsCol.valueChanges({ idField: 'id' });
  }

  /**
   * Opens the dialog to add a new project
   */
  openAddProjectDialog(): void {
    const dialogRef = this.dialog.open(AddProjectComponent);

    dialogRef.afterClosed().subscribe(project => {
      if (project) {
        this.addProject(project);
      }
    });
  }

  /**
   * Adds a new project tio the database, navigates to the board for that project
   * @param project name of the new project
   */
  private addProject(project: string): void {
    this.projectsCol.add({
      name: project,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: JSON.parse(localStorage.getItem('user') || '').uid
    })
      .then(docRef => {
        console.log(docRef);
      })
      .catch((error) => console.error('Error adding document: ', error));
  }
}
