import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { IgxTooltipDirective, IgxTooltipTargetDirective } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';

import { IfieldDataloggerComponent } from './ifield-datalogger.component';

fdescribe('IfieldDataloggerComponent', () => {
  let component: IfieldDataloggerComponent;
  let fixture: ComponentFixture<IfieldDataloggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IfieldDataloggerComponent,IgxTooltipDirective,IgxTooltipTargetDirective],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,MatDialogModule, HttpClientTestingModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IfieldDataloggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
