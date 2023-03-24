import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  date: Date;
  @Input()
  labelText: string = "";
  @Input()
  minDate: Date;
  @Input()
  maxDate: Date;
  @Input()
  errorMessage: string = "";
  @Output()
  timeSelectedEvent = new EventEmitter();

  dateControl: FormControl;
  private dataSubscriptions: Subscription[] = [];

  constructor() { }
  
  ngOnChanges(changes: SimpleChanges): void {
  //  if(changes?.date?.previousValue !== this.date)
  //     this.dateControl?.setValue(this.date);
  }

  onValueChanged(dateValue) {
    this.timeSelectedEvent.emit(dateValue);
  }

  ngOnInit(): void {
    // date.setSeconds(0);
    this.dateControl = new FormControl(this.date);
    const subscription = this.dateControl.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.onValueChanged(val);
    });
    this.dataSubscriptions.push(subscription);
  }
  

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.dataSubscriptions = [];
  }

}
