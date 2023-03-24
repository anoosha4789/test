import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';

@Component({
  selector: 'gateway-tree-view',
  templateUrl: './gateway-tree-view.component.html',
  styleUrls: ['./gateway-tree-view.component.scss']
})
export class GatewayTreeViewComponent implements OnInit, OnChanges {

  @Input()
  treeNodes: GatewayTreeNode[];

  toggleSourceIndex: number;

  // Tree control initialization
  private _transformer = (node: GatewayTreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      info: node.info,
      description: node.description,
      index: node.index,
      level: level,
      routerLink: node.routerLink,
      params: node.params,
      errors: node.errors,
      parentNode : node.parentNode ? node.parentNode : false
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
  constructor(private router: Router) { }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable; // tree node has child

  dataSourceClick(route: string, params: NodeQueryParams) {
    if(route){
      if (params) {
        this.router.navigate([route, params ]);
      }
      else {
        this.router.navigate([route]);
      }
    }
  }

  toggleEdit(index) {
    this.toggleSourceIndex = this.toggleSourceIndex === index ? null : index;  
  }

  ngOnChanges(): void {
    this.dataSourceTree.data = this.treeNodes;
  }

  ngOnInit(): void {
    this.dataSourceTree.data = this.treeNodes;
  }

}

export interface GatewayTreeNode {
  name : string;
  info?: string;
  description?: string;
  index: number;
  routerLink: string;
  params: NodeQueryParams;
  children?: GatewayTreeNode[];
  errors?: any[];
  parentNode?:boolean;
}

interface NodeQueryParams {
  selectedChild: number;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
