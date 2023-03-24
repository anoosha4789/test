import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { UnitSystemComponent } from './unit-system.component';


fdescribe('UnitSystemComponent', () => {
  let component: UnitSystemComponent;
  let fixture: ComponentFixture<UnitSystemComponent>;
  let store: MockStore; 
  let navigateSpy;

  beforeEach(async(() => {

    const initialState = { 
      unitSystem: {
        UnitSystemName: '',
        UnitQuantities: []
      },
      loading: false,
      loaded: true,
      error: ''
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatCardModule, MatButtonModule, MatSelectModule],
      declarations: [ UnitSystemComponent ],
      providers: [provideMockStore({ initialState })],
    })
    .compileComponents();
    store = TestBed.inject(MockStore);

  }));

  beforeEach(() => {
   
    fixture = TestBed.createComponent(UnitSystemComponent);
    component = fixture.componentInstance;   
    fixture.detectChanges();
  });

  it('should create', () => {    
    expect(component).toBeTruthy();
  });

  // it('should update the unit system list on selecting a value from dropdpown', () => {
   
  //   component.onDropdownChange("Temperature", "degF"); 
  //   expect(component.unitSystem.UnitQuantities.length).toEqual(1);

  //   component.onDropdownChange("Temperature", "degC"); 
  //   expect(component.unitSystem.UnitQuantities[0].SelectedUnitSymbol).toEqual("degC");
  //   expect(component.unitSystem.UnitQuantities.length).toEqual(1);
    
  //   component.onDropdownChange("Pressure", "psia"); 
  //   expect(component.unitSystem.UnitQuantities.length).toEqual(2);
   
   
  // });


  /* it('should navigate to previous tab', () => {
    navigateSpy = spyOn(TestBed.get(Router), 'navigateByUrl');
    component.goToPrev();
    const url = navigateSpy.calls.first().args[0];
    expect(url).toBe('Home');
    
  });

  it('should send  unitsystem list to update ', () => {
    component.onDropdownChange("Temperature", "degF"); 
    expect(component.unitSystem.UnitQuantities.length).toEqual(1);
    component.submit();    
  }); */

});
