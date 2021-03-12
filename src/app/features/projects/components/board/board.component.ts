import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import firebase from 'firebase/app';
import { skip, take } from 'rxjs/operators';
import { AuthService, IUser } from 'src/app/features/auth/services/auth.service';
import { IProject } from '../view-projects/view-projects.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { SnackbarComponent } from './snackbar/snackbar.component';

export interface ITask {
  id?: string;
  name: string;
  status: string;
  created: firebase.firestore.FieldValue;
  updated: firebase.firestore.FieldValue;
  userId: string;
  userName: string;
  userPhoto: string;
}

export interface IProjectUser {
  userId: string;
  role: string;
}

@UntilDestroy()
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  user: IUser = this.authService.getUser();
  projectName: string = this.route.snapshot.paramMap.get('projectname') ?? '';
  projectId: string = this.route.snapshot.paramMap.get('projectid') ?? '';

  taskCol: AngularFirestoreCollection<ITask>;
  users: IProjectUser[] = [];

  todo: ITask[] = [];
  doing: ITask[] = [];
  done: ITask[] = [];

  constructor(
    public authService: AuthService,
    private afs: AngularFirestore,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {

    // Tasks collection for a specified project
    this.taskCol = this.afs
      .collection('projects')
      .doc(this.projectId)
      .collection<any>('tasks', ref => ref.orderBy('updated', 'desc'));

    // Get the tasks from firestore
    this.getTasks();

    // Watch for changes to this project, this will fire when first subscribed so skip that one
    // Show a snackbar when the project gets updated
    this.afs.collection<IProject>('projects').doc(this.projectId).valueChanges()
      .pipe(
        skip(1),
        untilDestroyed(this)
      )
      .subscribe((project) => {
        if (project) {
          this.boardUpdatedSnackBar(project.updatedBy, 'Board Updated', 'snackbar');
        }
      });

    // Get the list of users of this project
    this.afs.collection('projects').doc(this.projectId).collection<any>('users').valueChanges({ idField: 'userId' })
      .pipe(take(1))
      .subscribe((users: IProjectUser[]) => {
        this.users = users;
      });
  }

  /**
   * Get the list of tasks for this project
   */
  getTasks(): void {
    // Bucket each task according to status
    this.taskCol.valueChanges({ idField: 'id' }).pipe(
      take(1))
      .subscribe((tasks: ITask[]) => {
        this.todo = tasks.filter(task => task.status === 'todo');
        this.doing = tasks.filter(task => task.status === 'doing');
        this.done = tasks.filter(task => task.status === 'done');
      });
  }

  /**
   * Moves the task from one column to another or withing  column
   * @param event drag drop event
   */
  moveTask(event: CdkDragDrop<ITask[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      // Update the task in the database
      this.taskCol.doc(event.container.data[event.currentIndex].id as any).update({
        status: event.container.id,
        updated: firebase.firestore.FieldValue.serverTimestamp()
      }).then(res => {
        // Mark the board as updated
        this.afs.collection('projects').doc(this.projectId).update({
          updated: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: this.authService.getUser().uid,
        });
      }).catch(err => {
        this.openSnackBar('Not Allowed', 'Dismiss');
        this.getTasks();
      });
    }
  }

  /**
   * Opens the dialog to add a new task
   */
  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(AddTaskComponent);

    dialogRef.afterClosed().subscribe(task => {
      if (task) {
        this.addTask(task);
      }
    });
  }

  /**
   * Check if a user is the owner of this project
   * @param userId user id of user to check
   */
  isProjectOwner(userId: string): boolean {
    return !!this.users.find(user => user.userId === userId && user.role === 'owner');
  }

  /**
   * Adds the task to the database
   * @param task name of task to add
   */
  private addTask(task: string): void {
    const newTask = {
      name: task,
      status: 'todo',
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      userId: this.authService.getUser().uid,
      userName: this.authService.getUser().displayName,
      userPhoto: this.authService.getUser().photoURL
    };
    this.taskCol.add(newTask).then(res => {
      this.todo.push(newTask);

      this.afs.collection('projects').doc(this.projectId).update({
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: this.authService.getUser().uid
      });
    });
  }

  /**
   * Opens a snackbar to display to the user
   * @param message message to display
   * @param action type of action
   */
  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: 'snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Custom snackbar display for when board is upadted
   * @param userId user that made the update
   * @param message message to display
   * @param panelClass class to style the snackbar
   */
  private boardUpdatedSnackBar(userId: string, message: string, panelClass: string): void {
    if (userId !== this.authService.getUser().uid) {
      const snackBarRef = this.snackBar.openFromComponent(SnackbarComponent, {
        data: message,
        panelClass,
        duration: 0,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      snackBarRef.onAction().pipe(take(1)).subscribe(() => {
        this.getTasks();
      });
    }
  }
}
