import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorianEditDateDialogComponent } from './historian-edit-date-dialog.component';

describe('HistorianEditDateDialogComponent', () => {
  let component: HistorianEditDateDialogComponent;
  let fixture: ComponentFixture<HistorianEditDateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorianEditDateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorianEditDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
