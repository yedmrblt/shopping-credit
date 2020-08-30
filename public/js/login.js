var Login = function()  {
  var userId = null;
  const userLogin = function(postData) {
    $.ajax({
      url: 'http://localhost:3001/user/login/',
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(postData),
      processData: false,
      statusCode: {
        200: function(res) {
          Cookies.set('userId', res.message[0].user_id);
          window.location.href = 'http://localhost:3001/public/stores.html';
        },
        409: function() {
          swal("Uyarı!", "Kullanıcı adı hatalı!", "warning");
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
  
  return {
    init: function() {
      $('#login-form').submit(function(event) {
        event.preventDefault();
        const postData = {
          fullName: $('#fullName').val()
        };
        userLogin(postData);
      }); 
    },

    getUserId: function() {
      return userId;
    },

    logout: function() {
      Cookies.remove('userId');
      Cookies.remove('shopping-cart');
      window.location.href = 'login.html';
    }
  }
}();

Login.init();