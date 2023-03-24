import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';

import { ModbusTemplatePointsComponent } from './modbus-template-points.component';

fdescribe('ModbusTemplatePointsComponent', () => {
  let component: ModbusTemplatePointsComponent;
  let fixture: ComponentFixture<ModbusTemplatePointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusTemplatePointsComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatButtonToggleModule,MatTooltipModule,IgxTooltipModule,HttpClientTestingModule,MatDialogModule,BrowserAnimationsModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusTemplatePointsComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
