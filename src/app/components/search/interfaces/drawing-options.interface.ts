import { DrawingModes } from 'h21-map/enums/drawing-mode.enum';
import { Position } from 'h21-map';

export interface IDrawingOptions {
  areaFitBounds?: boolean;
  areaCoordinates?: Position[];
  circleRadius?: number;
  circleMaxRadius?: number;
  circleFitBounds?: boolean;
  markerLatitude?: number;
  markerLongitude?: number;
  markerFitBounds?: boolean;
  markerIconUrl?: string;
  circleIconUrl?: string;
  drawMode?: DrawingModes;
  isAnimateMarker?: boolean;
  isResetButtons?: boolean;
  markerData?: any;
  isDraw?: boolean;
}
