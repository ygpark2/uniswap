import { CommonCode } from './common_code';
import { UploadFile } from './upload_file';

export interface PressPost {
  id: number;
  subject: string;
  mediaUrl: string;
  updatedOn: string;
  createdAt: string;
  mediaName: string;
}

export interface PressPostAtList {
  id: number;
  subject: string;
  mediaUrl: string;
  date: string;
  mediaName: string;
}
