export interface IToolbarAction {
  name: string;
  tooltipText?: string;
  icon: string;
  isSvgIcon?: boolean;
  cssClass?: string;
  disabled?: boolean;
  visible?: boolean;
  children?: IToolbarAction[];
  action?(...params: any[]): void;
}
