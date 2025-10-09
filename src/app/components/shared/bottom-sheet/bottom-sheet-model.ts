import { Type } from '@angular/core';

export interface BottomSheetConfig<T = any> {
  component: Type<any>;
  data?: T;
  dismissible?: boolean;
  backdropDismiss?: boolean;
  cssClass?: string;
}

export interface BottomSheetRef<T = any> {
  id: string;
  close: (data?: T) => Promise<boolean>;
  onWillDismiss: () => Promise<BottomSheetDismissResult<T>>;
  onDidDismiss: () => Promise<BottomSheetDismissResult<T>>;
}

export interface BottomSheetDismissResult<T = any> {
  data?: T;
  role?: string;
}

export interface BottomSheetInstance {
  id: string;
  component: Type<any>;
  data: any;
  dismissible: boolean;
  backdropDismiss: boolean;
  cssClass?: string;
  closeResolve?: (result: BottomSheetDismissResult) => void;
  willDismissResolve?: (result: BottomSheetDismissResult) => void;
  didDismissResolve?: (result: BottomSheetDismissResult) => void;
}