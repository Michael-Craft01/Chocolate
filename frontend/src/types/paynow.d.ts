declare module 'paynow' {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string);
    resultUrl: string;
    returnUrl: string;
    createPayment(reference: string, authEmail: string): any;
    send(payment: any): Promise<any>;
    pollTransaction(pollUrl: string): Promise<any>;
  }
}
