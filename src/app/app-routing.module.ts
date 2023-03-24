import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GatewayComponent } from '@comp/gateway/gateway.component';
import { LoginComponent } from '@comp/login/login.component';

const routes: Routes = [
  { path: '', component: GatewayComponent},
  { path: 'gateway', component: GatewayComponent },
  { path: 'Home', component: GatewayComponent, pathMatch: 'full' },
  { path: 'Login', component: LoginComponent, pathMatch: 'full'},
  { path: 'About', redirectTo: '/ModalDialog/1', pathMatch: 'full' },
  // { path: 'Configuration', loadChildren: () => import('./modules/features/incharge/incharge.module').then( m => m.InchargeModule) },
  { path: 'Diagnostics',   loadChildren: () => import('./modules/features/diagnostics/diagnostics.module').then( m => m.DiagnosticsModule) },
  // { path: 'datapointviewer', loadChildren: () => import('./modules/features/dataPointViewer/dataPointViewer.module').then(m => m.DataPointViewerModule) },
  { path: 'suresens', loadChildren: () => import('./modules/features/suresens/suresens.module').then( m => m.SuresensModule) },
  { path: 'incharge', loadChildren: () => import('./modules/features/incharge/incharge.module').then( m => m.InchargeModule) },
  { path: 'inforce-configuration', loadChildren: () => import('./modules/features/inforce-configuration/inforce-configuration.module').then( m => m.InforceConfigurationModule) },
  { path: 'inforce', loadChildren: () => import('./modules/features/inforce/inforce.module').then( m => m.InforceModule) },
  { path: 'multinode', loadChildren: () => import('./modules/features/multinode/multinode.module').then( m => m.MultinodeModule) },
  { path: 'downloads', loadChildren: () => import('./modules/features/downloads/downloads.module').then( m => m.DownloadsModule) },
  { path: '**', redirectTo: '/Home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
