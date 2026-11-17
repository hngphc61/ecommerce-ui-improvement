/* code goes here */
var isCanadian = true;

// tax is a function passed as a parameter; tax() calls that function.
function calculateTax(amount, tax) {
    return amount * tax();
}

function calculateTotal(price, quantity) {
    var amount = price * quantity;
    // Pass an anonymous function that chooses the tax rate.
    return amount + calculateTax(amount, function () {
        if (isCanadian) {
            return 0.05;
        } else {
            return 0.0;
        }
    });
}
