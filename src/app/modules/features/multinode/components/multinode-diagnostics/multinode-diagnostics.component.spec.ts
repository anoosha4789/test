import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DiagnosticTestService } from '@features/multinode/services/diagnostic-test.service';
import { MultinodeFooterService } from '@features/multinode/services/multinode-footer.service';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeDiagnosticsComponent } from './multinode-diagnostics.component';

fdescribe('MultinodeDiagnosticsComponent', () => {
  let component: MultinodeDiagnosticsComponent;
  let fixture: ComponentFixture<MultinodeDiagnosticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeDiagnosticsComponent ],
      imports:[ ReactiveFormsModule, MatFormFieldModule,MatInputModule,BrowserAnimationsModule,HttpClientTestingModule,MatDialogModule,MatSelectModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({}),
        DiagnosticTestService,
        MultinodeFooterService
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeDiagnosticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
