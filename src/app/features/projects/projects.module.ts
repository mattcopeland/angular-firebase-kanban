import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { AddProjectComponent } from './components/add-project/add-project.component';
import { ViewProjectsComponent } from './components/view-projects/view-projects.component';
import { ProjectsRoutingModule } from './projects-routing.module';

@NgModule({
  declarations: [ViewProjectsComponent, AddProjectComponent],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    MaterialModule,
    FormsModule
  ]
})
export class ProjectsModule { }
