import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { GatewayTreeviewModule } from '@shared/gateway-treeview/gateway-treeview.module';

import { PointTrendDataPointsDialogComponent } from './point-trend-data-points-dialog.component';

fdescribe('PointTrendDataPointsDialogComponent', () => {
  let component: PointTrendDataPointsDialogComponent;
  let fixture: ComponentFixture<PointTrendDataPointsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        RouterTestingModule,
        ScrollingModule,
        GatewayTreeviewModule,
        MatIconModule,
        HttpClientTestingModule
      ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      declarations: [PointTrendDataPointsDialogComponent],
      providers: [provideMockStore({}), GatewayChartService,
      { provide: MatDialogRef, useValue: {} },
      { provide: MAT_DIALOG_DATA, useValue: [] }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointTrendDataPointsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
