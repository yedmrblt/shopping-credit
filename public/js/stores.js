var Store = function()  {
  var map = undefined;
  var selectedMerchantName = null;
  var selectedMerchantLocation = null;
  const addToCart = function(productId) {
    if (Cookies.get('shopping-cart') === undefined) {
      Cookies.set('shopping-cart', {
        products: [],
        merchantName: selectedMerchantName,
        locationInfo: selectedMerchantLocation
      });
    } else {
      if (Cookies.getJSON('shopping-cart').products.length > 0 && selectedMerchantName !== Cookies.getJSON('shopping-cart').merchantName) {
        swal("Uyarı!", "Aynı anda birden çok mağazada alışveriş yapamazsınız!", "warning");
        return;
      }
    }

    var cart = Cookies.getJSON('shopping-cart');
    cart.products.push(productId);
    Cookies.set('shopping-cart', cart);
    swal("Seçtiğiniz ürün sepete eklendi!","","success");

    console.log(Cookies.get('shopping-cart'));
  }

  const fetchProducts = function() {
    $.ajax({
      url: 'http://localhost:3001/product/',
      dataType: 'json',
      type: 'get',
      contentType: 'application/json',
      statusCode: {
        200: function(res) {
          console.log(res.message);
          fillProductsTable(res.message);
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

  const fillProductsTable = function(products) {
    $('.products').empty();
    products.forEach(element => {
      $('.products').append(
        '<tr>'+
          '<td>'+element.product_name+'</td>'+
          '<td>'+element.price+'</td>'+
          '<td><button type="button" onClick="Store.addToCart('+element.product_id+');return false;" class="btn btn-primary btn-sm">Sepete Ekle</button></td>'+
        '</tr>'
      );
    });
    $('.product-list').show();
  }

  const markStore = function(storeInfo) {
    var marker = new google.maps.Marker({
      map: map,
      position: storeInfo.location,
      title: storeInfo.name
    });

    // show store info when marker is clicked
    marker.addListener('click', function() {
      $('#merchant-name').text(storeInfo.name);
      $('#merchant-address').text(storeInfo.address);
      $('#merchant-hours').text(storeInfo.hours);
      $('#merchant-phone').text(storeInfo.phone);
      selectedMerchantName = storeInfo.name;
      selectedMerchantLocation = JSON.stringify(storeInfo.location);
      $('.store-info').show();
      fetchProducts();
    });
  }

  return {
    init: function() {
      if (Cookies.get('userId') === undefined) {
        window.location.href = 'login.html';
      }
	    var mapCenter = {lat: 41.028411, lng: 28.974177};
      map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: 13
      });

      var stores = [
        {
          name: 'Remzi Kitabevi',
          location: {lat: 41.054008, lng: 28.989198},
          address: 'Teşvikiye, Rumeli Cd. No:44, 34363 Şişli/İstanbul',
          phone: '0212 234 5475',
          hours: '09:00 - 20:00'
        },
        {
          name: 'Starbucks',
          location: {lat: 41.038431, lng: 28.985792},
          address: 'Gümüşsuyu Mahallesi, Taki Zafer Cad., Taksim Meydan The Marmara Oteli, 34425 Beyoğlu/İstanbul',
          phone: '0212 293 7909',
          hours: '07:00 - 22:00'
        },
        {
          name: 'MM Migros',
          location: {lat: 41.055050, lng: 28.981992},
          address: 'Cumhuriyet Mahallesi, Cumhuriyet Mah. Kazım Orbay Cad. 3. Elysium Çarşı, 34380 Şişli/İstanbul',
          phone: '0850 229 8466',
          hours: '09:00 - 22:00'
        }
      ];

      stores.forEach(function(store){
        markStore(store);
      });
    },

    addToCart: function(productId) {
      return addToCart(productId);
    }
  }
}();