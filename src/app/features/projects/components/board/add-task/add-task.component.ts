import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent {
  task = '';

  constructor(
    public dialogRef: MatDialogRef<AddTaskComponent>,
  ) { }

  cancel(): void {
    this.dialogRef.close();
  }

}
