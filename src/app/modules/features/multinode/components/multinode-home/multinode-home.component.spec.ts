import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeHomeComponent } from './multinode-home.component';

fdescribe('MultinodeHomeComponent', () => {
  let component: MultinodeHomeComponent;
  let fixture: ComponentFixture<MultinodeHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeHomeComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[
        provideMockStore({})
      ],
      imports:[HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
