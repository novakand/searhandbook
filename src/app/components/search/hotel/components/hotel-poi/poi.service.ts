import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

// inner libs
import { IFileInfo, IQueryResult, Query, Utils } from 'h21-be-ui-kit';

// models
import { PoiFilter } from './poi-filter.model';

// interfaces
import { IPoi } from './poi.interface';

// environment
import { environment } from '@environments/environment';
import { Point } from 'h21-map';
import { HotelGeneralInfoFilter } from '@search/hotel';

@Injectable()
export class PoiService {

  private _entity = 'Point';

  constructor(private _http: HttpClient) { }

  public getByFilter(filter: Query<PoiFilter>): Observable<IQueryResult<IPoi>> {
    filter.order = [{
      field: 'createDate',
      desc: true,
    }];
    return this._http.post<IPoi[]>(`${environment.apiPoiUri}${this._entity}/PostQuery`, filter);
  }

  public deleteById(id: number): Observable<void> {
    return this._http.post<void>(`${environment.apiPoiUri}${this._entity}/PostDelete`, { id: id });
  }

  public postQueryWithPoint(filter: Query<HotelGeneralInfoFilter>): Observable<Point[]> {
    return this._http.post<Point[]>(`${environment.apiPoiUri}Point/PostQueryWithPoint`, filter)
      .pipe(
        pluck('items'),
      );
  }

  public save(poi: IPoi): Observable<IPoi> {
    return this._http.post<IPoi>(`${environment.apiPoiUri}${this._entity}/PostEntity`, poi);
  }

  public loadImg(info: IFileInfo): Observable<string> {
    const url = `${environment.apiPoiUri}FileInfo/DownloadPublicFile?hash=${info.fileHash}&name=photo`;
    return this._http.get(url, { responseType: 'blob' })
      .pipe(
        map((data) => Utils.getUrlFromBlob(info.fileName, data)),
      );
  }

}
