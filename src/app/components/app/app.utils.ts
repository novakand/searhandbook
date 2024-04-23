import { whiteLabelParameters } from '@components/app/constatns';
import cssVars from 'css-vars-ponyfill';

// internal libs
import { ISidebarNavTab } from 'h21-be-ui-kit';

export class AppUtils {

  public static fixIEStyles(): void {
    // internet explorer - CSS variables support fix
    if (/msie\s|trident\//i.test(window.navigator.userAgent)) {
      cssVars({ variables: whiteLabelParameters });
    }
  }

  public static getActiveTab(router, sidebarNavTabs: ISidebarNavTab[]): string {
    let tabName = null;

    if (router.url.indexOf('/search') === 0) {
      switch (router.url) {
        case '/search/poi' :
        case '/search/favorites' :
        case '/search/history' :
          tabName = (router.url.split('/'))[2];
          break;
        default :
          tabName = 'search';
          break;
      }
    } else {
      const tab = sidebarNavTabs.filter((v) => router.url.indexOf(`/${v.url}`) === 0)[0];
      tabName = tab ? tab.name : '';
    }
    return tabName;
  }

}
