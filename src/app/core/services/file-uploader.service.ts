import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClientService, IFileInfo } from 'h21-be-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService {

  constructor(private http: HttpClientService) {
  }

  public upload(url: string, e: Event): Observable<IFileInfo> | null {
    if (this._isHTML5()) {
      return this._xhrTransport(url, e);
    }
  }

  private _isHTML5(): boolean {
    return !!((<any>window).File && (<any>window).FormData);
  }

  private _xhrTransport(url: string, e: Event): Observable<IFileInfo> | null {
    const fileList: FileList = (<HTMLInputElement>e.target).files;

    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('image', file, file.name);
      return this.http.upload<IFileInfo>(url, formData);
    }
    return null;
  }

}
