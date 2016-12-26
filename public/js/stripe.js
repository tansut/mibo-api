$(document).ready(function () {
    var $form = $('#payment-form');
    var $result = $('#stripe-success');
    $(function () {
        $form.submit(function (event) {
            $form.find('.errors').text('');
            $form.find('.submit').prop('disabled', true);
            if (Stripe.card.validateCardNumber($('#cc-number').val())
                && Stripe.card.validateExpiry($('#cc-exp').val())
                && Stripe.card.validateCVC($('#cc-cvc').val())) {

                Stripe.card.createToken($form, stripeResponseHandler);
            } else {
                $('.panel-danger').show();
                $form.find('.errors').text('Please enter valid credit card information.');
                $form.find('.submit').prop('disabled', false);
            }
            return false;
        });
    });
    function stripeResponseHandler(status, response) {
        if (response.error) {
            $form.find('.errors').text(response.error.message);
            $form.find('.submit').prop('disabled', false);
        } else {
            $('#stripeToken').val(response.id);
            // Submit the form:
            $form.get(0).submit();
            $result.show();
            // $result.html('Your Stripe token is: <strong>' + response.id + '</strong><br>This would then automatically be submitted to your server.');
        }
    };

    $('[data-numeric]').payment('restrictNumeric');
    $('.cc-number').payment('formatCardNumber');
    $('.cc-exp').payment('formatCardExpiry');
    $('.cc-cvc').payment('formatCardCVC');

    $.fn.toggleInputError = function (erred) {
        this.parent('.form-group').toggleClass('has-error', erred);
        return this;
    };

    $form.submit(function (e) {
        e.preventDefault();

        var cardType = $.payment.cardType($('.cc-number').val());
        $('.cc-number').toggleInputError(!$.payment.validateCardNumber($('.cc-number').val()));
        $('.cc-exp').toggleInputError(!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
        $('.cc-cvc').toggleInputError(!$.payment.validateCardCVC($('.cc-cvc').val(), cardType));
        $('.cc-brand').text(cardType);

        $('.validation').removeClass('text-danger text-success');
        $('.validation').addClass($('.has-error').length ? 'text-danger' : 'text-success');
    });
})