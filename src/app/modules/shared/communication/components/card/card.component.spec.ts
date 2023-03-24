import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { ValidationService } from '@core/services/validation.service';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { CardComponent } from './card.component';

fdescribe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
   let mockDataSourceFacade = {
     validateCardAddressValidator(card): ValidatorFn {
        return(c: AbstractControl): { [key: string]: any } | null => {
          if (c.value === undefined || c.value == null || c.value == '')
            return null;
        };
    },
     validateCardNameValidator(card): ValidatorFn{ return(c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == '')
        return null;
    }; 
    },

    initToolTypes(){
      return new BehaviorSubject<GaugeTypeUIModel[]>([]);
    },
    initDataSources(){
      return new BehaviorSubject<DataSourceUIModel[]>([]);
    },
    initToolConnections(){      return new BehaviorSubject<ToolConnectionUIModel[]>([]);
    },
    validateGauges(){
      return true;
    }
  }
  

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatTooltipModule,IgxTooltipModule,RouterTestingModule,HttpClientTestingModule,MatDialogModule
      ,BrowserAnimationsModule,MatSelectModule,MatFormFieldModule,MatInputModule],
      providers:[provideMockStore({}),ValidationService,
        {provide:DataSourceFacade,useValue:mockDataSourceFacade },
        ToolConnectionService,SurefloFacade,PanelConfigurationFacade,WellFacade ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.card = {
      "DeviceId": -1,
      "Active": true,
      "CardAddress": 1,
      "CommConfigId": -1,
      "Gauges": [],
      "CardType": 2,
      "Description": "Card 1",
      "SupportInChargePowerSupplyModule": false,
      "EnableDownlink": true,
      "currentCardName": "Card 1"
  };
  component.channel ={
    "Id": -1,
    "IdCommConfig": -1,
    "Description": "COM1",
    "ComPort": 1,
    "BaudRate": 19200,
    "DataBits": 0,
    "StopBits": 0,
    "Parity": 0,
    "PortNamePath": "COM1",
    "SupportSoftwareFlowControl": false,
    "FlowControlTimeIntervalInMs": 0,
    "channelType": 0,
    "TimeoutInMs": 2000,
    "Retries": 3,
    "PollRateInMs": 1000,
    "Protocol": 1,
    "SinglePollRateMode": false,
    "Purpose": 1
}

    fixture.detectChanges();
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
