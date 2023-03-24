import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { provideMockStore } from '@ngrx/store/testing';
import { TruncateFileNameExtension } from '@shared/gateway-pipes/pipes/truncateFileExtension.pipe';

import { GatewayBrowseFileDialogComponent } from './gateway-browse-file-dialog.component';

fdescribe('GatewayBrowseFileDialogComponent', () => {
  let component: GatewayBrowseFileDialogComponent;
  let fixture: ComponentFixture<GatewayBrowseFileDialogComponent>;
  let data = {  title: "string",
  importFile: true,
  fileExtensions: "ss.csv",
  selectedFileName: "",
  selectedFile: "any",
  numberOfPositions: false ,
  primaryBtnText: "string",
  secondaryBtnText: "er"} ;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayBrowseFileDialogComponent,TruncateFileNameExtension ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,HttpClientTestingModule,MatDialogModule],
      providers:[provideMockStore({}),{ provide: MatDialogRef, useValue: GatewayBrowseFileDialogComponent },{ provide: MAT_DIALOG_DATA, useValue: data },GatewayPanelConfigurationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayBrowseFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
