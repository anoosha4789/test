import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DevicetreeComponent } from './devicetree.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

fdescribe('DevicetreeComponent', () => {
  let component: DevicetreeComponent;
  let fixture: ComponentFixture<DevicetreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatTreeModule, MatIconModule],
      declarations: [DevicetreeComponent],
      providers: [provideMockStore({}), GatewayChartService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicetreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
