import { NotifyDictionaryItem } from '@models/notify/notify-dictionary-item';
import { NotifyType } from '@app/enums/notify-type';

export class NotifyDictionary {

  private static _travelportNotifyTypes: NotifyDictionaryItem[] = [
    {
      type: NotifyType.Error,
      icon: 'error',
    },
    {
      type: NotifyType.Warning,
      icon: 'warning',
    },
    {
      type: NotifyType.Notification,
      icon: 'notifications_active',
    },
  ];

  public static getIcon(type: NotifyType): string {
    return this._travelportNotifyTypes.find((item) => item.type === type).icon;
  }

}
