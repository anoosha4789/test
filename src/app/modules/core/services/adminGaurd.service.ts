import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { BhAlertService } from 'bh-theme';

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private router: Router, private userService: UserService, private bhAlertService: BhAlertService) { }

    canActivate() {
        return new Promise<boolean>((resolve) => {
            this.userService.GetCurrentLoginUser().then(x => {
                if (this.userService.isAdminUser(x)) {
                  resolve(true);
                }
                else {
                
                    this.bhAlertService.showAlert(
                        "info",
                        "top",
                        5000,
                        "Please login as Admin to view Configuration details!"
                      );

                  this.router.navigate(['Home']);
                  resolve(false);
                }
              });
        });
    }
}