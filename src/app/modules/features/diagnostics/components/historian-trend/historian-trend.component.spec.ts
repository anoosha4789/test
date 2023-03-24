import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HistorianTrendComponent } from './historian-trend.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { MultiaxisChartComponent } from '../data-point-trend/data-point-trend.component.spec';

fdescribe('HistorianTrendComponent', () => {
  let component: HistorianTrendComponent;
  let fixture: ComponentFixture<HistorianTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule],
      declarations: [HistorianTrendComponent, MultiaxisChartComponent],
      providers: [provideMockStore({}), GatewayChartService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorianTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
