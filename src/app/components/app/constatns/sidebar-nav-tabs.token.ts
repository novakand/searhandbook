// inner libs
import { ISidebarNavTab } from 'h21-be-ui-kit';

export const sidebarNavTabsConst: ISidebarNavTab[] = [
  {
    name: 'search',
    label: 'Search',
    icon: 'search',
    type: 'link',
    url: 'search',
    disabled: false,
  },
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'apps',
    type: 'button',
    url: 'dashboard',
    disabled: false,
  },
  {
    name: 'bookings',
    label: 'Bookings',
    icon: 'insert_drive_file',
    type: 'link',
    url: 'bookings',
    disabled: false,
  },
  {
    name: 'poi',
    label: 'Points of interest',
    icon: 'flag',
    type: 'link',
    url: 'search/poi',
    disabled: false,
  },
  {
    name: 'favorites',
    label: 'Favorites',
    icon: 'favorite_border',
    type: 'link',
    url: 'search/favorites',
    disabled: false,
  },
  {
    name: 'history',
    label: 'History',
    icon: 'history',
    type: 'link',
    url: 'search/history',
    disabled: false,
  },
  {
    name: 'support',
    label: 'Support',
    icon: 'phone_in_talk',
    type: 'link',
    url: 'support',
    disabled: false,
  },
];
