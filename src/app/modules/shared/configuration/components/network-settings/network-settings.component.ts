import { Component, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';

import { UtilityService } from '@core/services/utility.service';
import { UserService } from '@core/services/user.service';
import { NetworkAddressModel } from '@core/models/UIModels/network-address.model';
import { IPv4AddressModel } from '@core/models/webModels/IPv4Address.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Router } from '@angular/router';
import { UICommon } from '@core/data/UICommon';

@Component({
  selector: 'app-network-settings',
  templateUrl: './network-settings.component.html',
  styleUrls: ['./network-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class NetworkSettingsComponent implements OnInit {

  validationErrorMsg: string = null;
  networkSettingForm: any;
  networkList: NetworkAddressModel[];
  networkSettings: IPv4AddressModel[];

  @Output() ipAddressUpdatedEvent = new EventEmitter();

  constructor(private formBuilder: FormBuilder,
              private gwModalService: GatewayModalService,
              private userService: UserService,
              protected router: Router,
              private utilityService: UtilityService) {
    this.networkSettingForm = this.formBuilder.group({
      networkDetails: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.utilityService.getSystemIPAdress()
      .pipe(
        map(response => response.map(item => {
          item.IpAddressList = item.IpAddress ? item.IpAddress.split('.') : null;
          item.SubnetMaskList = item.SubnetMask ? item.SubnetMask.split('.') : null;
          item.DefaultGatewayList = item.DefaultGateway ? item.DefaultGateway.split('.') : null;
          return item;
        }))
      )
      .subscribe((res) => {
        if (res) {
          this.networkList = res;
          this.initForm(this.networkList);
        }
      });


  }

  initForm(data) {

    data.forEach(item => {

      this.networkSettingForm.get('networkDetails').push(
        this.formBuilder.group({
          Description: item.Description,
          Name: item.Name,
          Network: item.Network,
          InterfaceCardType: item.InterfaceCardType,
          IpAddress: item.IpAddress,
          SubnetMask: item.SubnetMask,
          DefaultGateway: item.DefaultGateway,
          Flag: item.Flag,
          IpAddressList: this.createIpAddressGroup(item.IpAddressList),
          SubnetMaskList: this.createSubnetMaskGroup(item.SubnetMaskList),
          DefaultGatewayList: this.createDefaultGatewayGroup(item.DefaultGatewayList)

        }));

    });
    this.networkSettingForm.markAllAsTouched();

  }


  get f() {  return this.networkSettingForm.controls; }
  get t() {  return this.f.networkDetails.controls as FormArray; }

  createIpAddressGroup(IpAddressList) {
    if (IpAddressList && IpAddressList.length > 0) {
      return this.formBuilder.group({
        ipPartOne: this.formBuilder.control(IpAddressList[0], [Validators.required, Validators.max(223), validateRange()]),
        ipPartTwo: this.formBuilder.control(IpAddressList[1], [Validators.required, Validators.max(255)]),
        ipPartThree: this.formBuilder.control(IpAddressList[2], [Validators.required, Validators.max(255)]),
        ipPartFour: this.formBuilder.control(IpAddressList[3], [Validators.required, Validators.max(255)])
      });
    } else { return null; }
  }

  createSubnetMaskGroup(SubnetMaskList) {
    if (SubnetMaskList && SubnetMaskList.length > 0) {
      return this.formBuilder.group({
        subnetPartOne: this.formBuilder.control(SubnetMaskList[0], [Validators.required, Validators.max(255)]),
        subnetPartTwo: this.formBuilder.control(SubnetMaskList[1], [Validators.required, Validators.max(255)]),
        subnetPartThree: this.formBuilder.control(SubnetMaskList[2], [Validators.required, Validators.max(255)]),
        subnetPartFour: this.formBuilder.control(SubnetMaskList[3], [Validators.required, Validators.max(255)])
      })
    } else { return null; }
  }

  createDefaultGatewayGroup(DefaultGatewayList) {
    if (DefaultGatewayList && DefaultGatewayList.length > 0) {
      return this.formBuilder.group({
        gatewayPartOne: this.formBuilder.control(DefaultGatewayList[0], [Validators.required, Validators.max(255)]),
        gatewayPartTwo: this.formBuilder.control(DefaultGatewayList[1], [Validators.required, Validators.max(255)]),
        gatewayPartThree: this.formBuilder.control(DefaultGatewayList[2], [Validators.required, Validators.max(255)]),
        gatewayPartFour: this.formBuilder.control(DefaultGatewayList[3], [Validators.required, Validators.max(255)])
      })
    } else { return null; }
  }

  ValidateNetworkSetings(network: any): boolean {
    this.networkSettingForm.markAllAsTouched();
    if (network) {

      this.validationErrorMsg = null;
      const index = this.networkSettingForm.value.networkDetails.indexOf(network.InterfaceCardType);
      const networkToUpdate = this.networkSettingForm.value.networkDetails
        .find((item) => item.InterfaceCardType === network.InterfaceCardType
          && item.Description === network.Description);

      if (networkToUpdate.IpAddressList.ipPartOne === 127 || networkToUpdate.IpAddressList.ipPartOne > 223) {
        this.validationErrorMsg = 'IP Settings: ' + 'Please enter a valid IP Address.';
        return false;
      }
      if (network.DefaultGatewayList) {
        if (networkToUpdate.DefaultGatewayList.gatewayPartOne === 127 || networkToUpdate.DefaultGatewayList.gatewayPartOne > 223) {
          this.validationErrorMsg = 'IP Settings: ' + 'Please enter a valid Default Gateway.';
          return false;
        }
      }

      if (networkToUpdate.IpAddressList) {
        if (!this.isValidIpAddress(networkToUpdate.IpAddressList, 'ip')) {
          this.validationErrorMsg = 'Please enter a valid IP Address.';
          return false;
        }
      }


      if (networkToUpdate.SubnetMaskList) {
        if (!this.isValidIpAddress(networkToUpdate.SubnetMaskList, 'subnet')) {
          this.validationErrorMsg = 'Please enter a valid Subnet Mask.';
          return false;
        }
      }

      if (networkToUpdate.DefaultGatewayList) {
        if (!this.isValidIpAddress(networkToUpdate.DefaultGatewayList, 'default')) {
          this.validationErrorMsg = 'Please enter a valid Default Gateway.';
          return false;
        }
      }

      return true;
    }

  }

  private concatIpAddress(network) {

    if (network.IpAddress) {
      network.IpAddress = network.IpAddressList.ipPartOne + '.' + network.IpAddressList.ipPartTwo + '.' +
        network.IpAddressList.ipPartThree + '.' + network.IpAddressList.ipPartFour;
    }

    if (network.SubnetMask) {
      network.SubnetMask = network.SubnetMaskList.subnetPartOne + '.' + network.SubnetMaskList.subnetPartTwo + '.' +
        network.SubnetMaskList.subnetPartThree + '.' + network.SubnetMaskList.subnetPartFour;
    }

    if (network.DefaultGateway) {
      network.DefaultGateway = network.DefaultGatewayList.gatewayPartOne + '.' + network.DefaultGatewayList.gatewayPartTwo + '.' +
        network.DefaultGatewayList.gatewayPartThree + '.' + network.DefaultGatewayList.gatewayPartFour;
    }

  }

  private isValidIpAddress(data: any, type: string): boolean {

    if (type === 'ip') {

      if (this.isvalidIpRange(data.ipPartOne) && this.isvalidIpRange(data.ipPartTwo) && this.isvalidIpRange(data.ipPartThree)
        && this.isvalidIpRange(data.ipPartFour)) {
        return true;
      } else {
        return false;
      }
    }

    if (type === 'subnet') {

      if (this.isvalidIpRange(data.subnetPartOne) && this.isvalidIpRange(data.subnetPartTwo) && this.isvalidIpRange(data.subnetPartTwo)
        && this.isvalidIpRange(data.subnetPartFour)) {
        return true;
      } else {
        return false;
      }
    }

    if (type === 'default') {

      if (this.isvalidIpRange(data.gatewayPartOne) && this.isvalidIpRange(data.gatewayPartTwo) && this.isvalidIpRange(data.gatewayPartThree)
        && this.isvalidIpRange(data.gatewayPartFour)) {
        return true;
      } else {
        return false;
      }
    }
  }

  private isvalidIpRange(num) {
    const ip = num ? Number(num) : num;
    return ip == null || ip && ip < 0 || ip && ip > 255 ? false : true;
  }

  updateSystemIPAdress(): void {

    this.validationErrorMsg = null;

    this.networkSettings = [];

    if (this.networkSettingForm.value.networkDetails && this.validationErrorMsg == null) {

      const networkFormDetails: IPv4AddressModel[] = this.networkSettingForm.value.networkDetails;

      networkFormDetails.forEach((network, index) => {
        const isvalidNetworkSetting = this.ValidateNetworkSetings(network);
        if (isvalidNetworkSetting) {
          this.concatIpAddress(network);
          this.networkSettings.push(this.networkList[index]);
          this.networkSettings.push(network);
        }
      });

      // console.log(networkList);
      if (this.networkSettings && this.networkSettings.length > 0 && this.validationErrorMsg == null) {
        this.showConfirmModal();
      }


    }
  }

  updateNetworkSettingsToDB() {
    this.utilityService.updateSystemIPAdress(this.networkSettings)
      .subscribe(res => {
        if (res.status === 200) {          
          this.gwModalService.closeModal(); 
          UICommon.isBusyWaiting = true;
          //waiting for server restarts and new IP takes effect
          setTimeout(() => {
            this.ipAddressUpdatedEvent.emit(true);
            UICommon.isBusyWaiting = false;
            this.userService.LogOut().then(() => {

            },
            (error) => {
              UICommon.isBusyWaiting = false;
            })
            .finally(() => {
              this.router.navigate(["/Home"]);
            });                      
          }, 15000);                
        } else {

          this.ngOnInit();
        }
        this.gwModalService.closeModal();

      });
  }

  showConfirmModal() {
    this.gwModalService.openDialog(
      `Network Settings has been modified.<br>Server restart will occur to take effect.</br>`,
      () => this.updateNetworkSettingsToDB(),
      () => this.gwModalService.closeModal(),
      'Warning',
      null,
      true,
      'Restart'
    );
  }

}

export function validateRange(): ValidatorFn {  
  return (control: AbstractControl): { [key: string]: any } | null =>  
      control.value  !== 127
          ? null : {invalidInput: control.value};
}
