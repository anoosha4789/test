import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { provideMockStore } from '@ngrx/store/testing';
import { NavService } from 'bh-theme';
import { NgxLoadingModule } from 'ngx-loading';

import { GatewayComponent } from './gateway.component';

fdescribe('GatewayComponent', () => {
  let component: GatewayComponent;
  let fixture: ComponentFixture<GatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayComponent ],
      imports:[MatCardModule, NgxLoadingModule, RouterTestingModule, HttpClientTestingModule, MatDialogModule],
      providers: [provideMockStore({}), NavService, GatewayPanelConfigurationService, PanelConfigurationService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
