import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MultinodeFooterService } from '@features/multinode/services/multinode-footer.service';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeAdvancedComponent } from './multinode-advanced.component';

fdescribe('MultinodeAdvancedComponent', () => {
  let component: MultinodeAdvancedComponent;
  let fixture: ComponentFixture<MultinodeAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeAdvancedComponent ],
      imports:[ RouterTestingModule,HttpClientTestingModule,MatDialogModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [ provideMockStore({}), MultinodeFooterService
        ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
