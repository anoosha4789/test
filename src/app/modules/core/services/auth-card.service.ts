import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BhAlertService } from 'bh-theme';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthCard implements CanActivate  {

  constructor(private router: Router, private userService: UserService, private bhAlertService: BhAlertService) { }

  canActivate() {
    return new Promise<boolean>((resolve) => {
        this.userService.GetCurrentLoginUser().then(user => {
            if (this.userService.isAdminUser(user) || this.userService.IsManufacturingUser(user) || this.userService.isOperatorUser(user)) {
              resolve(true);
            }
            else {
            
                this.bhAlertService.showAlert(
                    "info",
                    "top",
                    5000,
                    "Please login to view the details!"
                  );

              this.router.navigate(['Home']);
              resolve(false);
            }
          });
    });
}
}
