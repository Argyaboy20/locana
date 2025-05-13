import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ModalContentComponent implements OnInit {
  phoneNumber: string = '';
  provider: string = '';
  region: string = '';
  city: string = '';
  signalStrength: string = '';
  coordinates?: { lat: number | undefined, lng: number | undefined } | undefined;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Get data from NavParams
    this.phoneNumber = this.navParams.get('phoneNumber') || '';
    this.provider = this.navParams.get('provider') || '';
    this.region = this.navParams.get('region') || '';
    this.city = this.navParams.get('city') || '';
    this.signalStrength = this.navParams.get('signalStrength') || '';
    this.coordinates = this.navParams.get('coordinates');
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}