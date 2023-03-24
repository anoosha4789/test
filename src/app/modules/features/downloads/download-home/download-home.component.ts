import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavItem } from 'bh-theme';

@Component({
  selector: 'app-download-home',
  templateUrl: './download-home.component.html',
  styleUrls: ['./download-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DownloadHomeComponent implements OnInit {

  activeTabIndex = 0;

  navItems: NavItem[] = [];

  constructor() { }

  onTabChanged(event) {}

  setNavigation() {
    this.navItems = [
      {
        parent: null,
        displayName: 'Data Files',
        iconName: 'storage',
        route: 'downloads/datafiles',
        children: [],
      },
      {
        parent: null,
        displayName: 'Reports',
        iconName: 'summarize',
        route: 'downloads/reports',
        children: [],
      }
    ];
  }

  ngOnInit(): void {
    this.setNavigation();
  }

}
