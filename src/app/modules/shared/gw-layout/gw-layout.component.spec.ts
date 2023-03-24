import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NavService } from 'bh-theme';

import { GwLayoutComponent } from './gw-layout.component';

fdescribe('GwLayoutComponent', () => {
  let component: GwLayoutComponent;
  let fixture: ComponentFixture<GwLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwLayoutComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,HttpClientTestingModule],
      providers:[provideMockStore({}),NavService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
