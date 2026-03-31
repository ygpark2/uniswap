import { SafeHtml } from '@angular/platform-browser';

export interface Content {
  id: number;
  version: number;
  content: string;
  updatedOn: string;
  createdAt: string;
  getContentText(): () => string;

  /*
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = this.html;
    // Retrieve the text property of the element (cross-browser support)
    this.result = temporalDivElement.textContent || temporalDivElement.innerText || "";
    */
}
