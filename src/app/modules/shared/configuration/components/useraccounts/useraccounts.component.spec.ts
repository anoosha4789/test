import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipDirective, IgxTooltipModule, IgxTooltipTargetDirective } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';

import { UserAccountsComponent } from './useraccounts.component';

fdescribe('UserAccountsComponent', () => {
  let component: UserAccountsComponent;
  let fixture: ComponentFixture<UserAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountsComponent,IgxTooltipDirective,IgxTooltipTargetDirective],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatDialogModule,HttpClientTestingModule,BrowserAnimationsModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
