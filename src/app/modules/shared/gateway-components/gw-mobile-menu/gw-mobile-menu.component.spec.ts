import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { GwMobileMenuComponent } from './gw-mobile-menu.component';

fdescribe('GwMobileMenuComponent', () => {
  let component: GwMobileMenuComponent;
  let fixture: ComponentFixture<GwMobileMenuComponent>;
  

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwMobileMenuComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatDialogModule,HttpClientTestingModule],
      providers:[MatDialog,provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwMobileMenuComponent);
    component = fixture.componentInstance;
    component.mobileMenuData ={
      "profileFirstName": "admin",
      "profileLastName": "",
      "profileEmail": "Administrator",
      "profileImageUrl": null,
      "loginUrl": "Login",
      "logoutUrl": "logout",
      "loginStatus": true,
      "mobileMenuItems": [
          {
              "subTitle": "Menu",
              "navList": [
                  {
                      "displayName": "Monitoring",
                      "enabled": true,
                      "selected": false,
                      "route": "/multinode/monitoring",
                      "iconName": "home",
                      "expandable": false
                  },
                  {
                      "displayName": "Toolbox",
                      "enabled": true,
                      "selected": false,
                      "route": "/multinode/toolbox",
                      "iconName": "business_center",
                      "expandable": false
                  }
              ]
          },
          {
              "subTitle": "Downloads",
              "navList": [
                  {
                      "displayName": "Data Files",
                      "iconName": "folder",
                      "route": "downloads/datafiles",
                      "expandable": false
                  },
                  {
                      "displayName": "Reports",
                      "iconName": "description",
                      "route": "downloads/reports",
                      "expandable": false
                  }
              ]
          }
      ]
  };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
