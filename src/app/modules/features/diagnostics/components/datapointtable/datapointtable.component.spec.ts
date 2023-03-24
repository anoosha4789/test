import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DatapointtableComponent } from './datapointtable.component';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { MatTableModule } from '@angular/material/table';

fdescribe('DatapointtableComponent', () => {
  let component: DatapointtableComponent;
  let fixture: ComponentFixture<DatapointtableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatTableModule],
      providers: [provideMockStore({}), GatewayChartService],
      declarations: [DatapointtableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatapointtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
