import { Pipe, PipeTransform } from '@angular/core';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';

@Pipe({
    name: 'toolConnectionFilter',
    pure: false
})
export class ToolConnectionFilterPipe implements PipeTransform {
    transform(items: ToolConnectionUIModel[], filter: any ): ToolConnectionUIModel[] {
        return items.filter(item => item.WellId === filter.wellId && item.ZoneId === filter.zoneId && item.PortingId != -1)??[];
    }
}