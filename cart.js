document.addEventListener("DOMContentLoaded", function () {

    const cart = new Map();

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const checkoutButton = document.getElementById("checkoutButton");
    // CHECKOUT ELEMENTS
    const checkoutOverlay = document.getElementById("checkoutOverlay");
    const closeCheckout = document.getElementById("closeCheckout");
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutSubtotal = document.getElementById("checkoutSubtotal");

    function formatPrice(amount) {
        return "₱" + amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // OPEN AND CLOSE CART
    function openCart() {
        cartOverlay.hidden = false;
        cartPanel.classList.add("is-open");
        cartPanel.setAttribute("aria-hidden", "false");
    }

    function closeCartPanel() {
        cartOverlay.hidden = true;
        cartPanel.classList.remove("is-open");
        cartPanel.setAttribute("aria-hidden", "true");
    }

    cartButton.addEventListener("click", openCart);
    closeCart.addEventListener("click", closeCartPanel);
    cartOverlay.addEventListener("click", closeCartPanel);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeCartPanel();
    });

    // =================================
// ADD TO CART - CHECK AVAILABILITY
// =================================

const menuCards = document.querySelectorAll(".menu-card");

menuCards.forEach(function (card) {

    const nameElement = card.querySelector("h3");
    const priceElement = card.querySelector(".price");
    const imageElement = card.querySelector("img");

    if (!nameElement || !priceElement) return;

    if (card.querySelector(".add-to-cart-btn")) return;

    const productName = nameElement.textContent.trim();

    const isAvailable = card.dataset.available !== "false";

    const priceMatch = priceElement.textContent.match(/₱\s*([\d,]+)/);

    const addButton = document.createElement("button");

    addButton.type = "button";
    addButton.className = "add-to-cart-btn";

    // CHECK IF SOLD OUT
    if (!isAvailable) {

        addButton.textContent = "SOLD OUT";
        addButton.disabled = true;
        addButton.classList.add("sold-out-btn");

    }

    // CHECK IF PRICE IS AVAILABLE
    else if (!priceMatch) {

        addButton.textContent = "Price unavailable";
        addButton.disabled = true;

    }

    // AVAILABLE PRODUCT
    else {

        const productPrice = Number(
            priceMatch[1].replace(/,/g, "")
        );

        const productImage = imageElement
            ? imageElement.getAttribute("src")
            : "";

        addButton.textContent = "＋ Add to Cart";

        addButton.addEventListener("click", function () {

            if (cart.has(productName)) {

                cart.get(productName).quantity++;

            } else {

                cart.set(productName, {
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });

            }

            renderCart();

            addButton.textContent = "✓ Added!";

            setTimeout(function () {
                addButton.textContent = "＋ Add to Cart";
            }, 800);

        });

    }

    card.appendChild(addButton);

});


    // DISPLAY CART
    function renderCart() {

        cartItems.replaceChildren();

        let subtotal = 0;
        let totalItems = 0;

        if (cart.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "cart-empty";
            emptyMessage.textContent = "Your cart is currently empty.";
            cartItems.appendChild(emptyMessage);
        }

        cart.forEach(function (item, name) {

            const itemTotal = item.price * item.quantity;

            subtotal += itemTotal;
            totalItems += item.quantity;

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";

            // PRODUCT IMAGE
            const itemImage = document.createElement("img");
            itemImage.className = "cart-item-image";
            itemImage.src = item.image || "";
            itemImage.alt = item.name;

            if (!item.image) {
                itemImage.style.display = "none";
            }

            // PRODUCT DETAILS
            const itemDetails = document.createElement("div");
            itemDetails.className = "cart-item-details";

            const itemName = document.createElement("h3");
            itemName.textContent = item.name;

            const eachPrice = document.createElement("p");
            eachPrice.textContent = formatPrice(item.price) + " each";

            const itemBottom = document.createElement("div");
            itemBottom.className = "cart-item-bottom";

            // QUANTITY CONTROLS
            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const minusButton = document.createElement("button");
            minusButton.type = "button";
            minusButton.textContent = "−";

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const plusButton = document.createElement("button");
            plusButton.type = "button";
            plusButton.textContent = "+";

            minusButton.addEventListener("click", function () {
                item.quantity--;

                if (item.quantity <= 0) {
                    cart.delete(name);
                }

                renderCart();
            });

            plusButton.addEventListener("click", function () {
                item.quantity++;
                renderCart();
            });

            controls.append(minusButton, quantity, plusButton);

            // ITEM TOTAL
            const lineTotal = document.createElement("strong");
            lineTotal.className = "cart-line-total";
            lineTotal.textContent = formatPrice(itemTotal);

            itemBottom.append(controls, lineTotal);

            itemDetails.append(
                itemName,
                eachPrice,
                itemBottom
            );

            // REMOVE BUTTON
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-item";
            removeButton.textContent = "×";
            removeButton.setAttribute("aria-label", "Remove " + item.name);

            removeButton.addEventListener("click", function () {
                cart.delete(name);
                renderCart();
            });

            cartItem.append(
                itemImage,
                itemDetails,
                removeButton
            );

            cartItems.appendChild(cartItem);
        });

        // UPDATE TOTALS
        cartCount.textContent = totalItems;
        cartSubtotal.textContent = formatPrice(subtotal);
        checkoutButton.disabled = cart.size === 0;
    }

    // =================================
    // CHECKOUT SYSTEM
    // =================================

    function renderCheckoutSummary() {

        checkoutItems.replaceChildren();

        let subtotal = 0;

        cart.forEach(function (item) {

            const row = document.createElement("div");
            row.className = "checkout-item-row";

            const name = document.createElement("span");
            name.textContent = item.name + " × " + item.quantity;

            const price = document.createElement("strong");
            price.textContent = formatPrice(item.price * item.quantity);

            row.append(name, price);
            checkoutItems.appendChild(row);

            subtotal += item.price * item.quantity;
        });

        checkoutSubtotal.textContent = formatPrice(subtotal);
    }


    // OPEN CHECKOUT
    checkoutButton.addEventListener("click", function () {

        if (cart.size === 0) return;

        renderCheckoutSummary();

        closeCartPanel();

        checkoutOverlay.hidden = false;
    });


    // CLOSE CHECKOUT
    closeCheckout.addEventListener("click", function () {
        checkoutOverlay.hidden = true;
    });

    checkoutOverlay.addEventListener("click", function (event) {
        if (event.target === checkoutOverlay) {
            checkoutOverlay.hidden = true;
        }
    });


    // =================================
// SUBMIT CUSTOMER ORDER
// =================================

checkoutForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (cart.size === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    // GET CUSTOMER INFORMATION
    const customerName =
        document.getElementById("customerName").value.trim();

    const customerPhone =
        document.getElementById("customerPhone").value.trim();

    const deliveryAddress =
        document.getElementById("deliveryAddress").value.trim();

    const deliveryInstructions =
        document.getElementById("deliveryInstructions").value.trim();

    const selectedPayment =
        checkoutForm.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    if (!selectedPayment) {
        alert("Please select a payment method.");
        return;
    }

    // GET CART PRODUCTS
    const orderItems = Array.from(cart.values()).map(function (item) {
        return {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || ""
        };
    });

    // CALCULATE SUBTOTAL
    const subtotal = orderItems.reduce(function (total, item) {
        return total + (item.price * item.quantity);
    }, 0);

    // GENERATE ORDER REFERENCE
    const orderReference = "CEM-" + Date.now();

    // CREATE ORDER RECORD
    const order = {
        reference: orderReference,
        customerName: customerName,
        customerPhone: customerPhone,
        deliveryAddress: deliveryAddress,
        deliveryInstructions: deliveryInstructions,
        paymentMethod: selectedPayment.value,
        items: orderItems,
        subtotal: subtotal,
        deliveryFee: null,
        status: "Order Received",
        createdAt: new Date().toISOString()
    };

    // SAVE ORDER FOR THE DEMONSTRATION
    let orders = [];

    try {
        orders = JSON.parse(
            localStorage.getItem("cemOrders") || "[]"
        );

        if (!Array.isArray(orders)) {
            orders = [];
        }
    } catch (error) {
        orders = [];
    }

    orders.push(order);

    localStorage.setItem(
        "cemOrders",
        JSON.stringify(orders)
    );

    localStorage.setItem(
        "cemLatestOrder",
        JSON.stringify(order)
    );

    // GO TO ORDER CONFIRMATION PAGE
    window.location.href = "order-confirmation.html";

}); // Close checkout submit event

}); // Close DOMContentLoaded event