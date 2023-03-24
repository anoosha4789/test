import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-tool-connection-details',
  templateUrl: './tool-connection-details.component.html',
  styleUrls: ['./tool-connection-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolConnectionDetailsComponent implements OnInit {

  @Input()
  portingList: any[];

  data: gaugeDetails[];

  constructor() { }

  private getToolConnectionData() {
    let tools = [];
    let annulusTools = this.portingList.filter(t => t.PortingId === 2);
    let tubingTools  = this.portingList.filter(t => t.PortingId === 1);
    if (annulusTools.length > 0 && tubingTools.length > 0) {
      tools.push(annulusTools[0]);
      tools.push(tubingTools[0]);
    }
    else if (annulusTools.length > 0) {
      tools.push(annulusTools[0]);
      if (annulusTools.length > 1)
        tools.push(annulusTools[1]);
    }
    else if (tubingTools.length > 0) {
      tools.push(tubingTools[0]);
      if (tubingTools.length > 1)
        tools.push(tubingTools[1]);
    }

    return tools;
  }

  ngOnInit(): void {

    const toolConnectionList = this.getToolConnectionData();
    this.data = [];
    toolConnectionList.forEach(tc => {
      const gaugeObj: gaugeDetails = {
        portingType: tc.Porting,
        gaugePath: tc.ChannelName + '-' + tc.CardDeviceName + '-' + tc.DeviceName
      };
      this.data.push(gaugeObj);
    });
  }

}

export class gaugeDetails {
  portingType: string;
  gaugePath: string;

}
