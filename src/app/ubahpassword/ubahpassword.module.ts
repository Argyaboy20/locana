import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UbahpasswordPageRoutingModule } from './ubahpassword-routing.module';

import { UbahpasswordPage } from './ubahpassword.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UbahpasswordPageRoutingModule
  ],
  declarations: [UbahpasswordPage]
})
export class UbahpasswordPageModule {}
