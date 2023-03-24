import { Pipe, PipeTransform } from '@angular/core';
import { CardMonitoringDataPoint } from '../components/carddetails/data/cardDetails.model';

@Pipe({
    name: 'swampyFilter',
    pure: false
})
export class SwampyFilterPipe implements PipeTransform {
    transform(items: CardMonitoringDataPoint[]): CardMonitoringDataPoint[] {
        return items.filter(item => item.hide === false)??[];
    }
}