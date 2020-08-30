var Cart = function()  {
  var index = 0;
  var totalCart = 0;
  var installmentPrices = [];
  const removeFromCart = function(index) {
    var cart = Cookies.getJSON('shopping-cart');
    if (cart.products.length === 1) {
      Cookies.remove('shopping-cart');
    } else {
      cart.products.splice(index, 1);
      Cookies.set('shopping-cart', cart);
    }

    location.reload();
  }

  const fetchProduct = function(productId) {
    $.ajax({
      url: 'http://localhost:3001/product/'+productId,
      dataType: 'json',
      type: 'get',
      async: false,
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          addToProductsTable(res.message[0]);
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

  const fetchInstallments = function() {
    $.ajax({
      url: 'http://localhost:3001/credit-rule/',
      dataType: 'json',
      type: 'get',
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          fillInstallmentsTable(res.message);
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

  const addToProductsTable = function(product) {
    $('.products').append(
      '<tr>'+
        '<td>'+Cookies.getJSON('shopping-cart').merchantName+'</td>'+
        '<td>'+product.product_name+'</td>'+
        '<td>'+product.price+'</td>'+
        '<td><button type="button" onClick="Cart.removeFromCart('+index+');return false;" class="btn btn-primary btn-sm">Sil</button></td>'+
      '</tr>'
    );
    totalCart += parseFloat(product.price);
    index++;
  }

  const fillInstallmentsTable = function(installments) {
    var index = 0;
    installments.forEach(element => {
      var totalDebt = (totalCart + (totalCart*(parseFloat(element.interest_rate))/100)).toFixed(2);
      var amountPerMonth = (totalDebt / parseInt(element.installment_count)).toFixed(2);
      const obj = {
        installmentId: element.credit_rule_id,
        totalDebtAmount: totalDebt,
        amountPerInstallment: amountPerMonth
      };
      installmentPrices.push(obj);
      $('.installments').append(
        '<tr>'+
          '<td>'+element.installment_count+'</td>'+
          '<td>'+element.interest_rate+'</td>'+
          '<td>'+totalDebt+'</td>'+
          '<td>'+amountPerMonth+'</td>'+
          '<td><button type="button" onClick="Cart.pay('+index+');return false;" class="btn btn-primary btn-sm">Öde</button></td>'+
        '</tr>'
      );
      index++;
    });
  }

  const pay = function(index) {
    const tmp = installmentPrices[index];
    const postData = {
      merchantName: Cookies.getJSON('shopping-cart').merchantName,
      locationInfo: Cookies.getJSON('shopping-cart').locationInfo,
      userId: Cookies.get('userId'),
      creditRuleId: tmp.installmentId,
      totalDebtAmount: tmp.totalDebtAmount,
      amountPerInstallment: tmp.amountPerInstallment
    };
    $.ajax({
      url: 'http://localhost:3001/credit/create',
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(postData),
      processData: false,
      statusCode: {
        201: function(res) {
          console.log(res.message);
          addToShoppingHistory(res.creditId);
        },
        409: function(res) {
          swal("Uyarı!", res.responseJSON.message, "warning");
        },
        500: function(res) {
          swal("Uyarı!", "Servis hatası!", "error");
        }
      },
      error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
      }
    });
  }

  const addToShoppingHistory = function(creditId) {
    const products = Cookies.getJSON('shopping-cart').products;
    products.forEach(element => {
      const postData = {
        userId: Cookies.get('userId'),
        creditId: creditId,
        productId: element,
      };
      $.ajax({
        url: 'http://localhost:3001/shopping-history/create',
        dataType: 'json',
        type: 'post',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(postData),
        processData: false,
        statusCode: {
          201: function(res) {
            console.log(res.message);
          },
          409: function(res) {
            swal("Uyarı!", res.responseJSON.message, "warning");
          },
          500: function(res) {
            swal("Uyarı!", "Servis hatası!", "error");
          }
        },
        error: function( jqXhr, textStatus, errorThrown ){
          console.log( errorThrown );
        }
      });
    });
    swal("Ödeme işlemi başarılı!", "", "success").then((value) => {
      Cookies.remove('shopping-cart');
      window.location.href = 'stores.html';
    });
  }

  

  return {

    init: function() {
      if (Cookies.get('userId') === undefined) {
        window.location.href = 'login.html';
      }
      var cart = Cookies.getJSON('shopping-cart');
      if (cart === undefined || cart.products.length === 0) {
        swal("Uyarı!", "Sepetiniz boş!", "warning").then((value) => {
          window.location.href = 'http://localhost:3001/public/stores.html';
        });
        
      }

      (cart.products).forEach(element => {
        fetchProduct(element);
      });

      fetchInstallments();
    },

    removeFromCart: function(index) {
      return removeFromCart(index);
    },

    pay: function(index) {
      return pay(index);
    }
  }
}();

Cart.init();