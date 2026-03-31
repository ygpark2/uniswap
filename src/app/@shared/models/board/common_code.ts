import 'dart:collection';

export interface CommonCode {
  id: number;
  version: number;
  codeId: number;
  codeName: string;
  codeValue: string;
  sort: number;
  usageYesNo: string;
  children: CommonCode[];
  codeTypeId: string;
  codeTypeName: string;
  updatedOn: Date;
  createdAt: Date;
}
