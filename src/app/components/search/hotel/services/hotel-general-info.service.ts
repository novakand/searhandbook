import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { combineLatest, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

// inner libs
import { Query } from 'h21-be-ui-kit';
import { PlaceIconsType, Point } from 'h21-map';

// interfaces
import { IHotel, IHotelGeneralInfo, IHotelLocationFilter, IRoomDescription } from '@components/search/hotel/interfaces';

// models
import { HotelGeneralInfoFilter } from '@components/search/hotel/models';

// environment
import { environment } from '@environments/environment';

// services
import { StorageService } from '@core/services/storage.service';

@Injectable()
export class HotelGeneralInfoService {

  private _entity = 'HotelGeneralInfo';

  constructor(
    private _http: HttpClient,
    private _storage: StorageService,
  ) { }

  public getHotelsStream(val: string): Observable<[Point[], Point[]]> {
    const callbackFn = (item) => item.subtype !== PlaceIconsType.hotel;
    const autocomplete$ = this.autocomplete(new Query<HotelGeneralInfoFilter>({
      filter: new HotelGeneralInfoFilter({
        nameOrAddressContains: val,
      }),
      take: 3,
    }));
    const search$ = this._storage.manager$.value.getMap().search.searchAutocomplete(val)
    .pipe(
      map((points) => points && points.filter(callbackFn)),
    );

    return combineLatest(autocomplete$, search$);
  }

  public autocomplete(filter: Query<HotelGeneralInfoFilter>): Observable<Point[]> {
    return this._http.post<Point[]>(`${environment.apiGatewayUri}HotelSearch/SuggestCompletion`, filter)
    .pipe(pluck('items'));
  }

  public findById(id: number): Observable<Point> {
    return this._http.get<Point>(`${environment.apiGatewayUri}HotelSearch/GetPoi/${id}`);
  }

  public getById(id: number): Observable<IHotel> {
    return this._http.get<IHotel>(`${environment.apiHotelUri}${this._entity}/GetHotel?id=${id}`);
  }

  public hotelListForLocation(filter: Query<IHotelLocationFilter>): Observable<IHotelGeneralInfo[]> {
    return this._http.post<IHotelGeneralInfo[]>(`${environment.apiHotelUri}${this._entity}/HotelListForLocation`, filter)
      .pipe(pluck('items'));
  }

  public getHotelDescription(id: string, connectionId: string): Observable<IRoomDescription> {
    return this._http.get<IRoomDescription>(`${environment.apiHotelUri}HotelRoomSearch/GoToBookingPage/${id}/${connectionId}`);
  }

  public getBookResult({ id, connectionId }): Observable<void> {
    const params = new HttpParams().set('connectionId', connectionId);
    return this._http.get<void>(`${environment.apiOrderUri}Payment/ContinueAfterPriceCheck/${id}`, { params });
  }

  public getHotelInfo(roomId: string): Observable<IRoomDescription> {
    return this._http.get<IRoomDescription>(`${environment.apiHotelUri}HotelRoomSearch/GetShowBookingForm/${roomId}`);
  }

}
