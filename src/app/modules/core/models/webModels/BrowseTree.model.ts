
export interface TreeFilePropertyModel {
    name: string;
    timeStamp: string;
}

export interface TreeNodeModel {
    folder: TreeFilePropertyModel;
    files: TreeFilePropertyModel[];
}

export interface TreeBranchModel {
    folder: TreeFilePropertyModel;
    childFolder: TreeNodeModel[];
    files: TreeFilePropertyModel[];
}

export interface TreeModel {
    gatewayStorage: TreeBranchModel[];
}
