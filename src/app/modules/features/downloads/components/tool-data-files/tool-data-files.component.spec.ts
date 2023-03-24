import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';

import { ToolDataFilesComponent } from './tool-data-files.component';

fdescribe('ToolDataFilesComponent', () => {
  let component: ToolDataFilesComponent;
  let fixture: ComponentFixture<ToolDataFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],
      providers: [GatewayChartService],
      declarations: [ ToolDataFilesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolDataFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
