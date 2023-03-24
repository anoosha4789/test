import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { NavService } from 'bh-theme';

import { DiagnosticsHomeComponent } from './diagnostics-home.component';

fdescribe('DiagnosticsHomeComponent', () => {
  let component: DiagnosticsHomeComponent;
  let fixture: ComponentFixture<DiagnosticsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DiagnosticsHomeComponent],
      imports: [HttpClientTestingModule, BrowserAnimationsModule, GwLayoutModule, RouterTestingModule ],
      providers: [provideMockStore({}), NavService, GatewayChartService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
