import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BhAlertDataService } from 'bh-theme';

import { AuthCard } from './auth-card.service';

fdescribe('AuthCardService', () => {
  let service: AuthCard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
      providers: [provideMockStore({}), BhAlertDataService]
    });
    service = TestBed.inject(AuthCard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
