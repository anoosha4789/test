import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GridBaseAPIService, IgxGridCommonModule, IgxRowIslandAPIService } from '@infragistics/igniteui-angular';

import { ValvePositionComponent } from './valve-position.component';

fdescribe('ValvePositionComponent', () => {
  let component: ValvePositionComponent;
  let fixture: ComponentFixture<ValvePositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValvePositionComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[IgxGridCommonModule],
      providers:[GridBaseAPIService,IgxRowIslandAPIService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValvePositionComponent);
    component = fixture.componentInstance;
    component.data = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
