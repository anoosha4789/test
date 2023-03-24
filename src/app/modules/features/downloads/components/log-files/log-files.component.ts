import { Component, OnInit } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';

import { DownloadService } from '@core/services/Download.service';

export interface logFileNode {
  name: string;
  link: string,
  timeStamp: string,
  children?: logFileNode[];
}

@Component({
  selector: 'app-log-files',
  templateUrl: './log-files.component.html',
  styleUrls: ['./log-files.component.scss']
})

export class LogFilesComponent implements OnInit {

  treeControl = new NestedTreeControl<logFileNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<logFileNode>();
  activeNode: any;

  constructor(private downloadService: DownloadService) { }

  downloadFile(path: string) {
    const filePath =  path;
    const fileList = [];
    fileList.push(filePath);
    let filenameIndex = path.lastIndexOf('\\');//for windows
    if (filenameIndex == -1) {
      filenameIndex = path.lastIndexOf('/');//for linux
    }
    const fileName = path.substr(filenameIndex + 1);
    this.downloadService.getdownloadFileData(fileList).subscribe(res =>  {
      if(res) {
        saveAs(new Blob([res]), fileName);
      }

    });
  }

  constructTree(data) {

    const treeView:logFileNode[] = [];

    if(data.GatewayStorage && data.GatewayStorage.length > 0) {
      for(let i = 0 ; i < data.GatewayStorage.length ; i++) {
        const folder = data.GatewayStorage[i].Folder;
        const childNodes = data.GatewayStorage[i].ChildFolder;
        const files = data.GatewayStorage[i].Files;
        const rootNode :logFileNode = {
          name: folder.Name,
          link: null,
          timeStamp: folder.TimeStamp,
          children: []
        };
        if(childNodes && childNodes.length > 0 && files === null)  { 
         
          this.createChildNode(rootNode, childNodes,false);
        } else {
          if(files && files.length > 0) {
            this.updateRootNode(rootNode, files);
          }
        }
        treeView.push(rootNode);
       //  this.createChildNode(node, rootNode, childNodes);
      }
    }
    return treeView;
  }

  path: string = "";
  createChildNode(rootNode, data, subchild?) {
    rootNode.children = [];
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if(!subchild)
          this.path="";
        const node = data[i];
        const childNodes = data[i].ChildFolder;
        const files = data[i].Files;
        if (node) {   
          const childNode: logFileNode = {
            name: node.Folder.Name,
            link: null,
            timeStamp: node.Folder.TimeStamp,
            children: []
          };
          
          if(childNodes && childNodes.length > 0 && files === null)  { 
            this.path = `${rootNode.name}//${childNode.name}//`;
            this.createChildNode(childNode, childNodes,true);
            rootNode.children.push(childNode);
          } else {
            if(files && files.length > 0) {
              const rootFolder = `${rootNode.name}//`;
              this.updateRootNode(childNode, files, this.path? this.path :rootFolder);
            }
            rootNode.children.push(childNode);
          }
        }

      }
    }
  }

  updateRootNode(rootNode, data, rootFolder?) {
    const path = rootFolder ? `${rootFolder}${rootNode.name}//` : `${rootNode.name}//`;
    rootNode.children = [];
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const childNodes = data[i].ChildFolder;
        if (node) {   
          const childNode: logFileNode = {
            name: node.Name,
            link: path + node.Name,
            timeStamp: node.TimeStamp,
            children: []
          };
          rootNode.children.push(childNode);
        }
      }
    }
  }

  ngOnInit(): void {
    this.downloadService.getDownloadLogFilesData().subscribe(res =>  {
      if(res) {
        this.dataSource.data = this.constructTree(res);
      }
    });
  }

  
 hasChild = (_: number, node: logFileNode) => !!node.children && node.children.length > 0;


}
