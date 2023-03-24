import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTreeModule } from '@angular/material/tree';
import { RouterTestingModule } from '@angular/router/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { GatewayTreeViewComponent } from './gateway-tree-view.component';

fdescribe('GatewayTreeViewComponent', () => {
  let component: GatewayTreeViewComponent;
  let fixture: ComponentFixture<GatewayTreeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayTreeViewComponent ,GwTruncatePipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTreeModule,RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayTreeViewComponent);
    component = fixture.componentInstance;
    component.treeNodes  =[];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
