import { Content } from './content';
import { CommonCode } from './common_code';
import { UploadFile } from './upload_file';

export interface Post {
  id: number;
  version: number;
  subject: string;
  writer: string;
  email: string;
  content: Content;
  urls: string[];
  uploadFiles: UploadFile[];
  readCount: number;
  upVote: number;
  downVote: number;
  displayEnabled: boolean;
  isNotice: boolean;
  category: CommonCode;
  tags: string[];
  updatedOn: string;
  createdAt: string;
}

export interface PostWrap {
  previous: Post;
  post: Post;
  next: Post;
}

export interface PostAtList {
  category?: CommonCode;
  id: number;
  subject: string;
  content: string;
  thumbnail: string;
  version: number;
  date: string;
  year?: string;
  monthDay?: string;
  codeName?: string;
  uploadFiles?: string;
  number?: number;
  writer?: string;
}

export interface PostPrevNext {
  id: number | undefined;
  subject: string;
  version: number;
}
