import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { ManualModePowerSupplyCardsComponent } from './manual-mode-power-supply-cards.component';

fdescribe('ManualModePowerSupplyCardsComponent', () => {
  let component: ManualModePowerSupplyCardsComponent;
  let fixture: ComponentFixture<ManualModePowerSupplyCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualModePowerSupplyCardsComponent,GwTruncatePipe ],
      imports:[MatTooltipModule,FormsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualModePowerSupplyCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
