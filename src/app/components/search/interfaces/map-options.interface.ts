import { LanguageCode, MapType } from 'h21-map';

export interface IMapOptions {
  latitude: number;
  longitude: number;
  language?: LanguageCode;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  preloaderIsOpen: boolean;
  provider: MapType;
  enableDefaultControl: boolean;
  isClick: boolean;
  defaultCursor: string;
  fitBounds: boolean;
  apiKey?: string;
}
