import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataPointTrendComponent } from './data-point-trend.component';
import { provideMockStore } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({ selector: 'gateway-multiaxis-chart', template: '' })
export class MultiaxisChartComponent {
  @Input('chartId') chartId: string;
  @Input('chartOptions') chartOptions: ChartOptions;
}

fdescribe('DataPointTrendComponent', () => {
  let component: DataPointTrendComponent;
  let fixture: ComponentFixture<DataPointTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, MatIconModule, MatDialogModule],
      providers: [provideMockStore({}), GatewayChartService],
      declarations: [DataPointTrendComponent, MultiaxisChartComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPointTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();   
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
