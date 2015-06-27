

/**
 * @param type: a string, value is "pay" or "charge"
 * @param recipient: recipient name, phone number, etc.
 * @param amount: a number in dollars
 * @param note: string, text note
 * @param audience: String, "public" or "private"
 * @constructor to create a venmo payment link
 */
var Venmo = function(type, recipient, amount, note, audience) {
    this.type = type;
    this.recipient = recipient;
    this.amount = amount;
    this.note =  note;
    this.audience = audience;
    return this;
};

Venmo.baseURL = "https://venmo.com/";

Venmo.prototype.getPaymentLink = function () {
    return Venmo.baseURL + "?txn=" + this.type
        + "&recipients=" + this.recipient
        + "&amount=" + this.amount
        + "&note=" + this.note
        + "&audience=" + this.audience;
};