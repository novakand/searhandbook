import { IAirTrip } from './air-trip.interface';

export interface IAirSearchQuery {
  trips?: IAirTrip[];
  tripTypeId?: number;
  classId?: number;
  nonStopOnly?: boolean;
}
