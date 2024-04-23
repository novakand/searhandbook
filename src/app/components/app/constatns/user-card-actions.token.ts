import { IUserCardAction } from 'h21-be-ui-kit';

export const userCardActionsConst: IUserCardAction[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'apps',
    disabled: false,
    visibility: true,
  },
  {
    name: 'whiteLabel',
    label: 'White label',
    icon: 'format_color_fill',
    disabled: false,
    visibility: true,
  },
  {
    name: 'profile',
    label: 'My profile',
    icon: 'person',
    isLink: true,
    route: 'profile',
    disabled: false,
    visibility: true,
  },
  {
    name: 'companyProfile',
    label: 'Company profile',
    icon: 'business_center',
    isLink: true,
    route: 'company-profile',
    disabled: false,
    visibility: true,
  },
];
