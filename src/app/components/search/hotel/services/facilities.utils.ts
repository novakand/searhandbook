import { IFacilitie } from '@components/search/hotel/interfaces';

const icons: Record<string, string> = {
  Bar: 'local_bar',
  'Business Center': 'business_center',
  'Disability Services': 'accessible',
  'Fitness Center or Spa': 'fitness_center',
  'Internet Access': 'public',
  Parking: 'local_parking',
  'Pets Allowed': 'pets',
  Pool: 'pool',
  Restaurant: 'restaurant',
  'Room Service': 'room_service',
};

export class FacilitiesUtils {

  public static setIcons(facilities: IFacilitie[]): void {
    facilities.forEach((v) => this.setIcon(v));
  }

  public static setIcon(item: IFacilitie): IFacilitie {
    const icon = icons[item.name];
    icon && (item.icon = icon);
    return item;
  }

}
