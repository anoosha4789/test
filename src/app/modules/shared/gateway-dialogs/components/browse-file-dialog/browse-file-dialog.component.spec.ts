import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { TruncateFileNameExtension } from '@shared/gateway-pipes/pipes/truncateFileExtension.pipe';

import { BrowseFileDialogComponent } from './browse-file-dialog.component';

fdescribe('BrowseFileDialogComponent', () => {
  let component: BrowseFileDialogComponent;
  let fixture: ComponentFixture<BrowseFileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseFileDialogComponent ,TruncateFileNameExtension],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[HttpClientTestingModule,FormsModule,ReactiveFormsModule,MatDialogModule],
      providers:[provideMockStore({}),{ provide: MatDialogRef, useValue: {BrowseFileDialogComponent} },
        { provide: MAT_DIALOG_DATA, useValue: {  Title: "string",
          ForImportFile: true,
          FileExtensions: "csv",
          SelectedFileName: "",
          SelectedFile: "any",
          IsConfigDirty: false ,
          PrimaryBtnText: "string",
          SecondaryBtnText: "er"} },GatewayPanelConfigurationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseFileDialogComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
