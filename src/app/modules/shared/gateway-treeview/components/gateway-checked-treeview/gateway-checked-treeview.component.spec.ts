import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule, MatTreeNodePadding } from '@angular/material/tree';

import { GatewayCheckedTreeviewComponent } from './gateway-checked-treeview.component';

fdescribe('GatewayCheckedTreeviewComponent', () => {
  let component: GatewayCheckedTreeviewComponent;
  let fixture: ComponentFixture<GatewayCheckedTreeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayCheckedTreeviewComponent],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTooltipModule,MatTreeModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayCheckedTreeviewComponent);
    component = fixture.componentInstance;
    component.treeNodes = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
