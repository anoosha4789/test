import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuresensGeneralSettingDetailsComponent } from './suresens-general-setting-details.component';

describe('SuresensGeneralSettingDetailsComponent', () => {
  let component: SuresensGeneralSettingDetailsComponent;
  let fixture: ComponentFixture<SuresensGeneralSettingDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuresensGeneralSettingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuresensGeneralSettingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
