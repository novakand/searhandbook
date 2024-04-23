import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// inner libs
import { IQueryResult, Query } from 'h21-be-ui-kit';

// interfaces
import { IFavorite, IFavoriteFilter, IFavorites, IHotelSearchResultItem } from '@components/search/hotel/interfaces';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class SetSearchService {

  constructor(private _http: HttpClient) { }

  public getFavorites(filter: Query<IFavoriteFilter>): Observable<IQueryResult<IFavorite>> {
    return this._http.post<IFavorites>(`${environment.apiHotelUri}HotelFavorite/PostSearch`, filter);
  }

  public addFavorite(id: number): Observable<IHotelSearchResultItem> {
    return this._http.post<IHotelSearchResultItem>(`${environment.apiHotelUri}HotelFavorite/CreateFavorite`, { id: id });
  }

  public deleteFavorite(id: number): Observable<void> {
    return this._http.post<void>(`${environment.apiHotelUri}HotelFavorite/DeleteFavorite`, { id: id });
  }

}
