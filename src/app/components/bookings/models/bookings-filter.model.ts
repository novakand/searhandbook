import { Application } from 'h21-be-ui-kit';
import { IBookingsFilter } from '@components/bookings';

export class BookingsFilterModel implements IBookingsFilter {

  public orderNumberStart?: string;
  public tripIdIn?: number[];
  public idIn?: number[];
  public typeIdIn?: number[];
  public orderStateIdIn?: number[];
  public viewOrderNumberContains?: string;
  public company?: string;
  public customerNameStart?: string;
  public corporateId?: number;
  public createDateGreaterEqual?: string;
  public createDateLessEqual?: string;
  public arrivalDateGreaterEqual?: string;
  public arrivalDateLessEqual?: string;
  public departureDateGreaterEqual?: string;
  public departureDateLessEqual?: string;
  public formOfPayment?: string;
  public payAccountNumber?: string; // последние 4 цифры - Сергей Радин сказал, что бэк на фронт не должен выводить весь номер
  public tourOperatorCode?: string;
  public tourOperatorNameStart?: string;
  public invoiceNumber?: string;
  public stateCodeIn?: string[];
  public paymentStateCodeIn?: string[];
  public paymentStateIdIn?: number[];
  public pnrStart?: string;
  public h21ProLogin?: number;
  public providerCode?: string;
  public bookingCode?: string;
  public createUserName?: string;
  public application: Application;
  public id?: number;
  public tripNameContains?: string;
  public paymentFormIdIn?: number[];
  public providerCodeIn?: string[];
  public providerTypeCodeIn?: string[];
  public customerCompanyNameContains?: string;
  public invoiceNumberContains?: string;
  public bookerIdIn?: any;
  public bookerId?: any;
  public companyNameContains?: string;
  public finalCostGreaterEqual?: string;
  public finalCostLessEqual?: string;

  constructor(obj?: Partial<BookingsFilterModel>) {
    Object.assign(this, obj);
  }

}
