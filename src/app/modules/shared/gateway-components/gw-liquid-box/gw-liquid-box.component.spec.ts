import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GwLiquidBoxComponent } from './gw-liquid-box.component';

fdescribe('GwLiquidBoxComponent', () => {
  let component: GwLiquidBoxComponent;
  let fixture: ComponentFixture<GwLiquidBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwLiquidBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwLiquidBoxComponent);
    component = fixture.componentInstance;
    component.options ={
      bgFillColor: "red",
      fillColor: "red",
      with: "test",
      height: "23px",
      border: "34px"
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
