var Credit = function()  {
  
  const fetchUserCredits= function(userId) {
    $.ajax({
      url: 'http://localhost:3001/credit/user/'+userId,
      dataType: 'json',
      type: 'get',
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          addToCreditsTable(res.message);
        },
        500: function() {
          swal("Uyarı!", "Servis hatası!", "error");
        }
      },
      error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
      }
    });
  };

  const fetchUserPayments= function(userId) {
    $.ajax({
      url: 'http://localhost:3001/payment/user/'+userId,
      dataType: 'json',
      type: 'get',
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          addToPaymentsTable(res.message);
        },
        500: function() {
          swal("Uyarı!", "Servis hatası!", "error");
        }
      },
      error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
      }
    });
  };


  const addToCreditsTable = function(credits) {
    credits.forEach(element => {
      $('.credits').append(
        '<tr>'+
          '<td>'+element.credit_id+'</td>'+
          '<td>'+element.merchant_name+'</td>'+
          '<td>'+element.total_debt_amount+'</td>'+
          '<td>'+element.amount_per_installment+'</td>'+
          '<td><button type="button" onClick="Credit.pay('+element.credit_id+');return false;" class="btn btn-primary btn-sm">Ödeme Yap</button></td>'+
        '</tr>'
      );
    });
  }

  const addToPaymentsTable = function(payments) {
    payments.forEach(element => {
      $('.payments').append(
        '<tr>'+
          '<td>'+element.credit_id+'</td>'+
          '<td>'+element.payment_amount+'</td>'+
        '</tr>'
      );
    });
  }


  const pay = function(creditId) {
    var price = prompt("Ödemek istediğiniz miktarı girin:", "0");
    if (price !== null && price !== "") { 
      const postData = {
        userId: Cookies.get('userId'),
        paymentAmount: parseFloat(price)
      }
      $.ajax({
        url: 'http://localhost:3001/payment/credit/'+creditId,
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(postData),
        processData: false,
        statusCode: {
          201: function(res) {
            console.log(res.message);
            location.reload();
          },
          500: function() {
            swal("Uyarı!", "Servis hatası!", "error");
          }
        },
        error: function( jqXhr, textStatus, errorThrown ){
          console.log( errorThrown );
        }
      });
    }
  }

  return {

    init: function() {
      
      var userId = Cookies.getJSON('userId');
      if (userId === undefined) {
        window.location.href = 'login.html';
      }
      fetchUserCredits(userId);
      fetchUserPayments(userId);
    },

    pay: function(creditId) {
      return pay(creditId);
    }
  }
}();

Credit.init();