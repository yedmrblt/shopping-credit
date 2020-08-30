var ShoppingHistory = function()  {
  
  const fetchUserShoppingHistory = function(userId) {
    $.ajax({
      url: 'http://localhost:3001/shopping-history/user/'+userId,
      dataType: 'json',
      type: 'get',
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          addToHistoryTable(res.message);
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

  const addToHistoryTable = function(histories) {
    histories.forEach(element => {
      $('.history').append(
        '<tr>'+
          '<td>'+element.merchant_name+'</td>'+
          '<td>'+element.product_name+'</td>'+
        '</tr>'
      );
    });
  }

  return {

    init: function() {
      
      var userId = Cookies.getJSON('userId');
      if (userId === undefined) {
        window.location.href = 'login.html';
      }
      fetchUserShoppingHistory(userId);
    }
  }
}();

ShoppingHistory.init();