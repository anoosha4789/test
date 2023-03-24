import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayComponentsModule } from '@shared/gateway-components/gateway-components.module';
import { NavService, ThemeLibModule } from 'bh-theme';

import { HeaderComponent } from './header.component';

fdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [HttpClientTestingModule, ThemeLibModule, GatewayComponentsModule, RouterTestingModule],
      providers: [provideMockStore({}), NavService, GatewayPanelConfigurationService, PanelConfigurationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
