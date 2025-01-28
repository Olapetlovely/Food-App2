
fetch('./product-list-with-cart-main/data.json')
  .then(res => {
    if (!res.ok) throw new Error(`Error fetching data`);
    return res.json();
  })
  .then(data => {
    let html = "";
    if (data && Array.isArray(data)) {
      data.forEach(product => {
        html += `
          <div class="product">
            <div class="image">
              <img class="product-img" src="${product.image.desktop}" alt="${product.name}">
              <div class="btn add-to-cart">
                <i class="fa-solid fa-cart-plus"></i>
                Add to Cart
              </div>
              <div class="btn plus-min" style="visibility: hidden;">
                <div class="circle minus">-</div>
                <p class="no-of-order">1</p>
                <div class="circle plus">+</div>
              </div>
            </div>
            <div class="product-details">
              <p class="name">${product.name}</p>
              <p class="category">${product.category}</p>
              <p class="price">$${product.price}</p>
            </div>
          </div>
        `;
      });

      const productList = document.querySelector('.products-container');
      productList.innerHTML = html;

      const addToCartBtns = document.querySelectorAll(".add-to-cart");
      addToCartBtns.forEach(button => {
        button.addEventListener("click", showButton);
      });
    }
  })
  .catch(error => {
    console.error("Error fetching or processing the JSON file:", error);
  });

// Show and manage the plus and minus buttons
function showButton(e) {
  const parentEle = e.target.closest(".product");
  const img = parentEle.querySelector(".product-img");
  const plusMinBtn = parentEle.querySelector(".plus-min");
  const orderContainer = document.querySelector(".order-container");
  const emptyImage = document.querySelector(".empty-img");

  emptyImage.style.display = "none";
  orderContainer.style.display = "block";
  plusMinBtn.style.visibility = "visible";
  img.style.border = "2px solid var(--Red)";

  const plusBtn = plusMinBtn.querySelector(".plus");
  const minusBtn = plusMinBtn.querySelector(".minus");
  const noOfOrder = plusMinBtn.querySelector(".no-of-order");
  plusBtn.replaceWith(plusBtn.cloneNode(true));
  minusBtn.replaceWith(minusBtn.cloneNode(true));
  // Reassign variables for the cloned buttons
  const newPlusBtn = plusMinBtn.querySelector(".plus");
  const newMinusBtn = plusMinBtn.querySelector(".minus");

  newPlusBtn.addEventListener("click", () => {
    let currentValue = parseInt(noOfOrder.textContent);
    noOfOrder.textContent = currentValue + 1;

    updateOrderSection(parentEle, parseInt(noOfOrder.textContent));
    updateCartCount();
  });

  newMinusBtn.addEventListener("click", () => {
    let currentValue = parseInt(noOfOrder.textContent);
    if (currentValue > 1) {
      noOfOrder.textContent = currentValue - 1;
    } else if (currentValue === 1) {
      plusMinBtn.style.visibility = "hidden";
      img.style.border = "none";
      noOfOrder.textContent = currentValue - 1;
    }
    
    updateOrderSection(parentEle, parseInt(noOfOrder.textContent));
    updateCartCount()
  });
  addToOrderSection(parentEle);
}

// Add product to the order section
function addToOrderSection(productElement) {
  const orderContainer = document.querySelector('.order-container');
  const productName = productElement.querySelector(".name").textContent;
  const productPrice = parseFloat(productElement.querySelector(".price").textContent.slice(1));
  const existingOrderItem = document.querySelector(`[data-name="${productName}"]`);

  if (existingOrderItem) {
    const noOfPlate = existingOrderItem.querySelector(".no-of-plate");
    const totalPrice = existingOrderItem.querySelector(".total-price");
    const currentQuantity = parseInt(noOfPlate.textContent);
   
    noOfPlate.textContent = currentQuantity + 1;
    totalPrice.textContent = (productPrice * (currentQuantity + 1)).toFixed
    (2);
  } else {
    // Add new product to the order list
    const orderItemHTML = `
      <div class="order-details-title" data-name="${productName}">
        <h3>${productName}</h3>
        <div class="order-details">
          <div>
            <p class="no-of-plate">1</p>
            <p class="order-price">${productPrice.toFixed(2)}</p>
            <p class="total-price">${productPrice.toFixed(2)}</p>
          </div>
          <div class="close-btn">
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
      </div>
    `;
    orderContainer.insertAdjacentHTML('afterbegin', orderItemHTML);

    const closeBtn = orderContainer.querySelector(`[data-name="${productName}"] .close-btn`);
    closeBtn.addEventListener("click", () => {
      closeBtn.closest(".order-details-title").remove();
      updateTotalAmount();
      updateCartCount()
    });
  }
  updateTotalAmount();
  updateCartCount();
}

// Update product quantity in the order section
function updateOrderSection(productElement, quantity) {
  const productName = productElement.querySelector(".name").textContent;
  const productPrice = parseFloat(productElement.querySelector(".price").textContent.slice(1));
  const existingOrderItem = document.querySelector(`[data-name="${productName}"]`);

  if (existingOrderItem) {
    if (quantity === 0) {
      existingOrderItem.remove();
    } else {
      const noOfPlate = existingOrderItem.querySelector(".no-of-plate");
      const totalPrice = existingOrderItem.querySelector(".total-price");
      noOfPlate.textContent = quantity;
      totalPrice.textContent = (productPrice * quantity).toFixed(2);
    }
  }
  updateTotalAmount();

  // Check if the order section is empty and update visibility
  const orderContainer = document.querySelector('.order-container');
  const emptyImage = document.querySelector('.empty-img');
  const orderItems = orderContainer.querySelectorAll(".order-details-title");

  if (orderItems.length === 0) {
    orderContainer.style.display = "none";
    emptyImage.style.display = "block";
  }
}

// Update the total order amount
function updateTotalAmount() {
  const orderContainer = document.querySelector('.order-container');
  const totalAmountElement = orderContainer.querySelector(".total-Amount");
  const totalPrices = document.querySelectorAll(".total-price");
  let totalAmount = 0;

  totalPrices.forEach(price => {
    const priceValue = parseFloat(price.textContent);
    if (!isNaN(priceValue)) {
      totalAmount += priceValue;
    }
  });

  totalAmountElement.textContent = totalAmount.toFixed(2);
}

// Update the cart count
function updateCartCount() {
  const cartCountElement = document.querySelector('.order-section h2 span');
  const orderItems = document.querySelectorAll('.order-details-title');
  let totalItems = 0;

  orderItems.forEach(item => {
    const quantity = parseInt(item.querySelector('.no-of-plate').textContent);
    totalItems += quantity;
  });

  cartCountElement.textContent = totalItems;
}

document.querySelector('#confirm-order').addEventListener('click', confirmOrder);
 
  // confirm order
  function confirmOrder() {
    const orderContainer = document.querySelector('.order-container');
    const orderItems = orderContainer.querySelectorAll('.order-details-title');
    const confirmElem = document.querySelector('.confirmation-container');
    const confirmDetails = document.querySelector('.confirm-details');
    const confirmTotalPrice = document.querySelector('.confirm-total-price');
    const newOrderBtn = document.querySelector('.new-order');
    newOrderBtn.addEventListener("click", startNewOrder);
    
    if (orderItems.length > 0) {
      let orderDetailsHTML = '';
      let totalAmount = 0;
  
      orderItems.forEach(item => {
        const itemName = item.querySelector('h3').textContent;
        const itemPrice = parseFloat(item.querySelector('.total-price').textContent);
        const itemQuantity = parseInt(item.querySelector('.no-of-plate').textContent);
  
        const products = document.querySelectorAll('.product');
        let itemImage = '';
        products.forEach(product => {
          const name = product.querySelector('.name').textContent;
          if (name === itemName) {
            itemImage = product.querySelector('.product-img').getAttribute('src');
          }
        });
  
        orderDetailsHTML += `
          <div class="confirm-detail">
            <div class="img-wrapper">
              <img class="product-img" src="${itemImage}" alt="${itemName}">
              <div>
                <h3>${itemName}</h3>
                <div class="confirm-order">
                  <span class="no">${itemQuantity}</span>
                  <span class="confirm-order-price">
                    &#64;
                    <span>&#36;</span>${itemPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
  
        totalAmount += itemPrice;
      });
  
      orderDetailsHTML += `
        <div class="confirm-detail">
          <p>Order Total</p>
          <p class="total-price">&#36;${totalAmount.toFixed(2)}</p>
        </div>
      `;
      confirmDetails.innerHTML = orderDetailsHTML;
      confirmElem.style.display = 'block';
    } 
  }

  // start new order
  function startNewOrder(e) {
    e.preventDefault();
    location.reload();
  }