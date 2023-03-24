import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDefaultsComponent } from './panel-defaults.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
fdescribe('PanelDefaultsComponent', () => {
  let component: PanelDefaultsComponent;
  let fixture: ComponentFixture<PanelDefaultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDefaultsComponent ],
      imports: [ 
        HttpClientTestingModule,
        RouterTestingModule,
        MatRadioModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule  
      ],//HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule,BrowserAnimationsModule  ],
      providers: [ provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDefaultsComponent);
    component = fixture.componentInstance;
    setTimeout(() => {
    // component.ngAfterViewInit();
    fixture.detectChanges();
  }, 500);
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
