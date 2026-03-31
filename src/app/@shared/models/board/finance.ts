export interface PostFinance {
  id: number;
  createdAt: string;
  mobileContent: string;
  pcContent: string;
  updatedOn: string;
  version: number;
  year: number;
}

export interface attachFile {
  contentLength: number;
  contentType: string;
  dataOrigin: string;
  dataUrl: string;
  downloadCount: number;
  fileName: string;
  filePath: string;
  hostUrl: string;
  id: number;
  thumbnailUrl: string;
  version: number;
}

export interface PostOperation {
  id: number;
  updatedOn: string;
  createdAt: string;
  subject: string;
  version: number;
  year: number;
  attachFile: attachFile;
}

export interface PostOperationAtList {
  id: number;
  subject: string;
  version: number;
  date: string;
  dataUrl: string;
  attachFile: attachFile;
}
