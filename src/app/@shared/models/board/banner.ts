export interface ImgFile {
  dataUrl: string;
}

export interface ExtraInfo {
  bottomText1: string;
  bottomText2: string;
  linkButtonType: string;
}

export interface BannerPostAtList {
  display: boolean;
  pcImgFile: ImgFile;
  mobileImgFile: ImgFile;
  pcLink: string;
  pcLinkTarget: string;
  pcTextColor: string;
  pcTextSort: string;
  pcTextTitle: string;
  pcTextSubTitle: string;
  extraInfo: ExtraInfo;
}

export interface BannerPost {
  display: boolean;
  pcImgFile: ImgFile;
  mobileImgFile: ImgFile;
  pcLink: string;
  pcLinkTarget: string;
  pcTextColor: string;
  pcTextSort: string;
  pcTextTitle: string;
  pcTextSubTitle: string;
  extraInfo: string;
}
