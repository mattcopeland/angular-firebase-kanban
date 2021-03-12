import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { ViewProjectsComponent } from './components/view-projects/view-projects.component';

const routes: Routes = [
  {
    path: '',
    component: ViewProjectsComponent
  },
  {
    path: ':projectname/:projectid',
    component: BoardComponent,
    data: { animation: 'isRight' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
