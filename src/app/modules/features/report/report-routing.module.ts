import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCard } from '@core/services/auth-card.service';

import { ReportHomeComponent } from './components/report-home/report-home.component';


export const routes: Routes = [
  { path: '', component: ReportHomeComponent, pathMatch: 'full', canActivate: [AuthCard] }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }