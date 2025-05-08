import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UbahpasswordPage } from './ubahpassword.page';

const routes: Routes = [
  {
    path: '',
    component: UbahpasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UbahpasswordPageRoutingModule {}
