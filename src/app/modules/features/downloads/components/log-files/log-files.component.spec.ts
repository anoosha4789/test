import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';

import { LogFilesComponent } from './log-files.component';

fdescribe('LogFilesComponent', () => {
  let component: LogFilesComponent;
  let fixture: ComponentFixture<LogFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule,MatTooltipModule,MatTreeModule],
      providers: [GatewayChartService],
      declarations: [ LogFilesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
