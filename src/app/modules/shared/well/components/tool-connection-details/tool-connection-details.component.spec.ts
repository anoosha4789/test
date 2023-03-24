import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { ToolConnectionDetailsComponent } from './tool-connection-details.component';

fdescribe('ToolConnectionDetailsComponent', () => {
  let component: ToolConnectionDetailsComponent;
  let fixture: ComponentFixture<ToolConnectionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolConnectionDetailsComponent ,GwTruncatePipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolConnectionDetailsComponent);
    component = fixture.componentInstance;
    component.portingList =[];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
