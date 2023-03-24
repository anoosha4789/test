import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuresensWellComponent } from './suresens-well.component';

describe('SuresensWellComponent', () => {
  let component: SuresensWellComponent;
  let fixture: ComponentFixture<SuresensWellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuresensWellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuresensWellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
