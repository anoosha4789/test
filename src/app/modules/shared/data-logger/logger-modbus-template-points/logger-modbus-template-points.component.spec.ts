import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipDirective, IgxTooltipTargetDirective } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { LoggerModbusTemplatePointsComponent } from './logger-modbus-template-points.component';


fdescribe('ModbusTemplatePointsComponent', () => {
  let component: LoggerModbusTemplatePointsComponent;
  let fixture: ComponentFixture<LoggerModbusTemplatePointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoggerModbusTemplatePointsComponent,IgxTooltipDirective,IgxTooltipTargetDirective],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({})],
      imports:[MatDialogModule,BrowserAnimationsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggerModbusTemplatePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
