import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Konfigurasi Firebase - ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyA4jOZXch9vDkU4aRdz2iM8sjNErPuI_R0",
  authDomain: "locana-74f96.firebaseapp.com",
  projectId: "locana-74f96",
  storageBucket: "locana-74f96.firebasestorage.app",
  messagingSenderId: "753922056750",
  appId: "1:753922056750:web:cec955f78eb5914de375bf"
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, 
    IonicModule.forRoot({
    mode: 'md',
    backButtonText: '',
    backButtonIcon: 'arrow-back-outline',}), 
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
