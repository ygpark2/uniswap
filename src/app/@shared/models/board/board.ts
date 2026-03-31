import 'dart:collection';

export interface Board {
  id: number;
  version: number;
  boardId: string;
  name: string;
  mobileName: string;
  introduction: string;
  orderIndex: number;
  enableComment: boolean;
  enableCategory: boolean;
  enableNotice: boolean;
  fileUploadCount: number;
  linkUrlCount: number;
  postCount: number;
  tags: string[];
  settingInfo: string;
  updatedOn: Date;
  createdAt: Date;
}
