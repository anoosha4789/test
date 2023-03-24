import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuresensHomeComponent } from './suresens-home.component';

describe('SuresensHomeComponent', () => {
  let component: SuresensHomeComponent;
  let fixture: ComponentFixture<SuresensHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuresensHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuresensHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
