import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { MultinodeAlarmsService } from '@features/multinode/services/multinode-alarms.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { SieComponent } from './sie.component';

fdescribe('SieComponent', () => {
  let component: SieComponent;
  let fixture: ComponentFixture<SieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SieComponent, GwTruncatePipe ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTooltipModule,RouterTestingModule,MatDialogModule,HttpClientTestingModule],
      providers:[provideMockStore({}),FormBuilder,ValidationService,MultinodeAlarmsService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
