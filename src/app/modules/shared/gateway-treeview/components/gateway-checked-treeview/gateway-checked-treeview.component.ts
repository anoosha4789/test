import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, EventEmitter, Injectable, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DataPointModbusRegisterConfigurationModel } from '@core/models/webModels/DataPointModbusRegisterConfiguration.model';
import { BehaviorSubject, Observable, of as ofObservable } from 'rxjs';

@Component({
    selector: 'gateway-checked-treeview',
    templateUrl: './gateway-checked-treeview.component.html',
    styleUrls: ['./gateway-checked-treeview.component.scss']
})
export class GatewayCheckedTreeviewComponent implements OnInit, OnChanges {

    @Input()
    treeNodes: GatewayCheckedTreeNode[];

    @Input()
    existingDataPoints: GatewayCheckedFlatNode[];

    @Input()
    clearNodes: boolean;

    @Input()
    systemClockMultipleEnable: boolean = false;

    @Output()
    selectedTreeNodes = new EventEmitter<GatewayCheckedFlatNode[]>();
    lastclickedItem: GatewayCheckedFlatNode;

    transformer = (node: GatewayCheckedTreeNode, level: number) => {
        let flatNode = this.nestedNodeMap.has(node) && this.nestedNodeMap.get(node)!.name === node.name
            ? this.nestedNodeMap.get(node)!
            : new GatewayCheckedFlatNode();
        flatNode.treeNodeData = node.treeNodeData;
        flatNode.name = node.name;
        flatNode.fullName = node.fullName;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    flatNodeMap: Map<GatewayCheckedFlatNode, GatewayCheckedTreeNode> = new Map<GatewayCheckedFlatNode, GatewayCheckedTreeNode>();
    nestedNodeMap: Map<GatewayCheckedTreeNode, GatewayCheckedFlatNode> = new Map<GatewayCheckedTreeNode, GatewayCheckedFlatNode>();
    selectedParent: GatewayCheckedFlatNode | null = null;
    treeControl = new FlatTreeControl<GatewayCheckedFlatNode>(node => node.level, node => node.expandable);
    treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);
    checklistSelection = new SelectionModel<GatewayCheckedFlatNode>(true /* multiple */);
    existingSelection = new SelectionModel<GatewayCheckedFlatNode>(true /* multiple */);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    isShiftKeyPressed: boolean = false;

    constructor() {
    }

    getLevel = (node: GatewayCheckedFlatNode) => { return node.level; };

    isExpandable = (node: GatewayCheckedFlatNode) => { return node.expandable; };

    getChildren = (node: GatewayCheckedTreeNode): Observable<GatewayCheckedTreeNode[]> => {
        return ofObservable(node.children);
    }

    hasChild = (_: number, _nodeData: GatewayCheckedFlatNode) => { return _nodeData.expandable; };

    descendantsAllSelected(node: GatewayCheckedFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        return descendants.every(child => this.checklistSelection.isSelected(child) || this.existingSelection.isSelected(child));
    }

    descendantsPartiallySelected(node: GatewayCheckedFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child) || this.existingSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    scrollLeft(nodeLevel = 1) {
        if (document.getElementsByClassName("gw-checked-treeview-scroll-viewport")[0]) {
            const scrollSize = nodeLevel * 30;
            document.getElementsByClassName("gw-checked-treeview-scroll-viewport")[0].scrollLeft = scrollSize;
        }
    }

    todoItemSelectionToggle(node: GatewayCheckedFlatNode): void {
        this.scrollLeft(node.level);
        let multipleSelectionNeeded = false;
        let selectedItems = [];
        let allItemsInParent = this.treeControl.dataNodes.filter(value => value.fullName === node.fullName);
        if (this.lastclickedItem && this.isShiftKeyPressed && !node.expandable) {
            const previousItemIndex = allItemsInParent.findIndex(value => value.name === this.lastclickedItem.name);
            const currentItemIndex = allItemsInParent.findIndex(value => value.name === node.name);
            const start = Math.min(previousItemIndex, currentItemIndex);
            const end = Math.max(previousItemIndex, currentItemIndex) + 1;
            selectedItems = allItemsInParent.slice(start, end);
            let existingSelectedItems = selectedItems.find(item => this.existingSelection.isSelected(item));
            multipleSelectionNeeded = !existingSelectedItems;
        }
        if (multipleSelectionNeeded && selectedItems.length > 0) {
            // For selection using shift key press
            this.toggleSelectedItems(selectedItems, this.checklistSelection.isSelected(node));
        } else {
            // Normal selection
            this.checklistSelection.toggle(node);
            const descendants = this.treeControl.getDescendants(node).filter(child => !this.existingSelection.isSelected(child));
            this.checklistSelection.isSelected(node)
                ? this.checklistSelection.select(...descendants)
                : this.checklistSelection.deselect(...descendants);
        }

        this.selectParentNode(allItemsInParent, node);
        this.lastclickedItem = node;
        this.selectedTreeNodes.emit(this.checklistSelection.selected);
    }

    selectParentNode(allItemsInParent, node: GatewayCheckedFlatNode) {
        // To select parentNode if all child items is selected
        const nonSelectedNode = allItemsInParent?.find(item => !this.checklistSelection.isSelected(item) && !this.existingSelection.isSelected(item));
        if (!nonSelectedNode) {
            let parentNode;
            if (node.level === 3) {
                const parentNodesArray = this.treeControl?.dataNodes?.filter(value => (node.fullName.includes(value.name)));
                parentNode = parentNodesArray?.find(node => node.level === 2)
            }
            if (node.level === 2) {
                const parentNodesArray = this.treeControl?.dataNodes?.filter(value => (node.fullName.includes(value.name)));
                parentNode = parentNodesArray?.find(node => node.level === 1)
            }
            if (node.level === 1) {
                parentNode = this.treeControl?.dataNodes?.find(value => value.name === node?.fullName);
            }
            if (parentNode)
                this.checklistSelection.toggle(parentNode);
        }

    }

    toggleSelectedItems(selectedItems: GatewayCheckedFlatNode[], isCurrentNodeSelected) {
        selectedItems.forEach(item => {
            let isItemSelected = isCurrentNodeSelected ? this.checklistSelection.isSelected(item) : !this.checklistSelection.isSelected(item);
            if (isItemSelected && !this.existingSelection.isSelected(item))
                this.checklistSelection.toggle(item);
        });
    }

    itemClick(event: MouseEvent) {
        this.isShiftKeyPressed = event.shiftKey;
    }

    selectExistingPoints() {
        this.existingSelection.clear();
        this.dataSource._flattenedData.value.forEach(node => {
            if (node.treeNodeData) {
                this.existingDataPoints.forEach(existing => {
                    if (existing.treeNodeData?.some(point => point.DeviceId === node.treeNodeData.DeviceId && point.DataPointIndex === node.treeNodeData.DataPointIndex)) {
                        if (this.systemClockMultipleEnable) {
                            if (!(node.fullName === 'System Clock')) this.existingSelection.select(node);
                        } else {
                            this.existingSelection.select(node)
                        }
                    }
                });
            }
        })
    }

    ngOnChanges(simpleChanges: SimpleChanges): void {
        if (simpleChanges.treeNodes) {
            this.dataSource.data = this.treeNodes;
            this.checklistSelection.clear();
            this.selectExistingPoints();
        }

        if (simpleChanges.existingDataPoints) {
            this.checklistSelection.clear();
            this.selectExistingPoints();
        }


        if (simpleChanges.clearNodes && simpleChanges.clearNodes.currentValue) {
            this.checklistSelection.clear();
            this.selectExistingPoints();
        }
    }

    ngOnInit(): void {
        this.dataSource.data = this.treeNodes;
    }
}

export class GatewayCheckedTreeNode {
    treeNodeData: any;
    name: string;
    fullName: string;
    children?: GatewayCheckedTreeNode[];
}

export class GatewayCheckedFlatNode {
    treeNodeData: any;
    name: string;
    fullName: string;
    level: number;
    expandable: boolean;
}




