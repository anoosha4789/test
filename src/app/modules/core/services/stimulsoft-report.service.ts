import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StimulsoftReportService {

  constructor() { }

  
  //Set Default Tool Bar Options
  setReportToolBarOptions(options, Viewer) {
    
    options.appearance.showTooltips = false;
    options.appearance.scrollbarsMode = true; 

    options.height = "100%";

    options.toolbar.printDestination = Viewer.StiPrintDestination.Pdf;
    
    options.toolbar.showOpenButton = false;
    options.toolbar.showBookmarksButton = false; 
    options.toolbar.showParametersButton = false; 
    options.toolbar.showResourcesButton = false; 
    options.toolbar.showAboutButton = false; 
    
    options.exports.showExportToExcel2007 = false;
    options.exports.showExportToPowerPoint = false;
    options.exports.showExportToHtml = false;
    options.exports.showExportToHtml5 = false;
    options.exports.showExportToText = false;
    options.exports.showExportToDocument = false;
    options.exports.showExportToOpenDocumentCalc = false;
    options.exports.showExportToOpenDocumentWriter = false;    
    options.exports.showExportToCsv = false;
    options.exports.showExportToXml = false;
    options.exports.showExportToJson = false;
    
    
    return options;
  }
}
