import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { SatPopoverModule } from '@ncstate/sat-popover';

import { MultinodeWellStepperComponent } from './multinode-well-stepper.component';

fdescribe('MultinodeWellStepperComponent', () => {
  let component: MultinodeWellStepperComponent;
  let fixture: ComponentFixture<MultinodeWellStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeWellStepperComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[IgxTooltipModule,SatPopoverModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeWellStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
