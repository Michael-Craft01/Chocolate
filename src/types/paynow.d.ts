declare module 'paynow' {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string);
    resultUrl: string;
    returnUrl: string;
    /**
     * Create a new payment
     * @param reference Unique reference for this payment
     * @param authEmail Email of the customer
     */
    createPayment(reference: string, authEmail: string): any;
    /**
     * Send a payment to Paynow
     * @param payment The payment object created via createPayment
     */
    send(payment: any): Promise<any>;
    /**
     * Check the status of a transaction
     * @param pollUrl The poll URL returned from the send method
     */
    pollTransaction(pollUrl: string): Promise<any>;
  }
}
