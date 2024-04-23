import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

// env
import { environment } from '@environments/environment';

interface IHotelImage {
  fileUrl: string;
}

interface IHotelDescription {
  hotelDescription: string;
}

@Injectable()
export class HotelDetailsService {

  public hotelImages$ = new BehaviorSubject<IHotelImage[]>(null);
  public hotelDescription$ = new BehaviorSubject<string>(null);

  constructor(private _http: HttpClient) {}

  public getHotelImages(hotelId: number): Observable<IHotelImage[]> {
    const hotelImages = this.hotelImages$.getValue();
    return hotelImages ? of(hotelImages) : this._loadImages(hotelId);
  }

  public getHotelDescription(hotelId: number): Observable<string> {
    const description = this.hotelDescription$.getValue();
    return description ? of(description) : this._loadDescription(hotelId);
  }

  private _loadImages(hotelId: number): Observable<IHotelImage[]> {
    const body = { filter: { hotelId } };
    return this._http.post<IHotelImage[]>(`${environment.apiHotelUri}HotelRoomSearch/GetImages`, body)
      .pipe(tap((images) => this.hotelImages$.next(images)));
  }

  private _loadDescription(hotelId: number): Observable<string> {
    return this._http.get<IHotelDescription>(`${environment.apiHotelUri}HotelRoomSearch/GetHotelInfo/${hotelId}`)
      .pipe(
        pluck<IHotelDescription, string>('hotelDescription'),
        tap((hotelDescription) => this.hotelDescription$.next(hotelDescription)),
      );
  }

}
