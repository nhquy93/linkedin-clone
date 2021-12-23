import { Injectable } from '@angular/core';
import { Role } from 'src/app/auth/models/user.model';

type BannerColors = {
  colorOne: string,
  colorTwo: string,
  colorThree: string
}

@Injectable({
  providedIn: 'root'
})
export class BannerColorService {
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6'
  };

  constructor() { }

  getBannerColors(role: Role): BannerColors {
    switch (role) {
      case 'admin':
        return {
          colorOne: '#ff6666',
          colorTwo: '#ff9999',
          colorThree: '#ffdddd'
        };
      case 'premium':
        return {
          colorOne: '#60ff60',
          colorTwo: '#c0ff88',
          colorThree: '#ddffaf'
        };
      default:
        return this.bannerColors;
    }
  }
}
