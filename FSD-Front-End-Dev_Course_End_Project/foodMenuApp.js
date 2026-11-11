// Query Param technique 
// URL : it load whole data 
// URL?key=value    it search information base upon value if present it return data else return null

let BASE_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

function loadFoodDetails() {
    let user = sessionStorage.getItem("emailId");
    document.getElementById("userName").innerHTML = user;
    // get the food name from input field.
    let foodName = document.getElementById("foodName").value;

    let API_URL = BASE_URL + foodName;

    fetch(API_URL)
    .then(response => response.json())
    .then(result => {

        let foodDetails = result.meals;

        // Clear previous search results
        document.getElementById("result").innerHTML = "";

        if (foodDetails == null) {
            document.getElementById("result").innerHTML =
                "No Food Found";
            return;
        }

        foodDetails.forEach(menu => {

            let divTag = document.createElement("div");

            // Image creation and set attribute
            let foodImage = document.createElement("img");

            foodImage.setAttribute("src", menu.strMealThumb);
            foodImage.setAttribute("width", "150px");
            //foodImage.setAttribute("height", "150px");
            // <img src="" alt="" width="150px" height="150px">
            foodImage.addEventListener("click", () => {
                foodImage.classList.toggle("expanded");
            });
            
            let foodNameTag = document.createElement("b");

            // This is a hashing function to come up with a price between 5.99 and 17.99 based on the spelling of the food name
            // can be changed to a fetch for pricing from a database later. 
            const getPrice = name => (([...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 12) + 5.99).toFixed(2);
            
            let foodNameContent =
                document.createTextNode(menu.strMeal + " : $" + getPrice(menu.strMeal));

            foodNameTag.appendChild(foodNameContent);

            /*
            let foodDescriptionTag =
                document.createElement("i");
                foodDescriptionTag.classList.add("card-description");

            let foodDescriptionContent =
                document.createTextNode(menu.strInstructions);

            foodDescriptionTag.appendChild(foodDescriptionContent); */

            divTag.appendChild(foodImage);
            divTag.appendChild(document.createElement("br"));
            divTag.appendChild(foodNameTag);
            //divTag.appendChild(foodDescriptionTag);

            // 1. Create the Add to Cart button
            let cartButton = document.createElement("button");
            cartButton.innerHTML = "<i class='bi bi-plus-lg'></i>";
            cartButton.classList.add("btn", "btn-outline-secondary", "px-3", "py-2")

            // Save the unique meal ID and name right on the button using dataset
            cartButton.setAttribute("data-id", menu.idMeal);
            cartButton.setAttribute("data-name", menu.strMeal);
            cartButton.setAttribute("data-img", menu.strMealThumb);
            cartButton.setAttribute("data-cost", getPrice(menu.strMeal));

            // 2. Attach a click event listener to this specific button
            cartButton.addEventListener("click", function() {
                let mealId = this.getAttribute("data-id");
                let mealName = this.getAttribute("data-name");
                let mealImg = this.getAttribute("data-img");
                let mealCost = this.getAttribute("data-cost");
                
                addToCart(mealId, mealName, mealImg, mealCost);
            });

            // 3. Append the button to your card's divTag
            divTag.appendChild(cartButton);

            // Append div tag to existing result section
            document.getElementById("result").appendChild(divTag);

            //divTag.appendChild(document.createElement("hr"));

        });

    })
    .catch(error => console.log(error))
    .finally(() => console.log("Data Loaded.."));
}

// Keyup event - search while typing
document.getElementById("foodName")
.addEventListener("keyup", function() {
    loadFoodDetails();
});

function addToCart(id, name, img, cost) {
    // 1. Get existing cart from localStorage or start a blank array
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // 2. Check if the item is already in the cart
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        // If it's already there, bump up the quantity
        existingItem.quantity += 1;
    } else {
        // Otherwise, add it as a new item with quantity 1
        cart.push({
            id: id,
            name: name,
            image: img,
            cost: cost,
            quantity: 1
        });
    }

    // 3. Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Render the cart on the drawer
    renderCart();
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Filter out the item matching this ID
    cart = cart.filter(item => item.id !== id);
    
    // Save back to localStorage and re-render
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cartItemsContainer");
    let cartCountBadge = document.getElementById("cartCount");
    
    // Clear current display
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartCountBadge.innerText = "0";
        document.getElementById("cartTotal").innerText = "Total Unique Dishes: 0";
        document.getElementById("cartCost").innerText = "Total Cost: $0.00";

        // DISABLE the checkout button
        checkoutBtn.disabled = true;
        checkoutBtn.style.background = "#ccc"; // Gray it out
        checkoutBtn.style.cursor = "not-allowed";
        return;
    }

    // ENABLE the checkout button when cart has items
    checkoutBtn.disabled = false;
    checkoutBtn.style.background = "green"; // Restore green color
    checkoutBtn.style.cursor = "pointer";

    // Calculate total quantity for the badge
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.innerText = totalItems;
    document.getElementById("cartTotal").innerText = `Total Unique Dishes: ${cart.length}`;

    // Loop through cart items and build their HTML elements inside the drawer
    let cartCost = 0;
    cart.forEach(item => {
        let itemDiv = document.createElement("div");
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.marginBottom = "15px";
        itemDiv.style.borderBottom = "1px solid #eee";
        itemDiv.style.paddingBottom = "10px";
        
        let itemSubtotal = item.cost * item.quantity;
        cartCost += itemSubtotal;

        itemDiv.innerHTML = `
            <img src="${item.image}" width="50px" height="50px" style="border-radius: 4px; object-fit: cover; margin-right: 10px;">
            <div style="flex-grow: 1;">
                <h5 style="margin: 0 0 5px 0;">${item.name} : $${item.cost}</h5>
                <span style="font-size: 14px; color: #666;">Qty: ${item.quantity}</span>
            </div>
            <button onclick="removeItem('${item.id}')" style="background: #fd0000; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer;">X</button>
        `;
        
        cartContainer.appendChild(itemDiv);
    });
    document.getElementById("cartCost").innerText = `Total Cost: $${cartCost.toFixed(2)}`;

}

// Call renderCart to keep it synched
renderCart();

// Toggle Drawer Open/Close event listeners
document.getElementById("cartToggleBtn").addEventListener("click", function() {
    let drawer = document.getElementById("cartDrawer");
    if(drawer.style.right == "-350px") {
        drawer.style.right = "0px"; // Slide it into view
    } else {
        drawer.style.right = "-350px"; // Slide it out of view
    }
});

document.getElementById("closeDrawerBtn").addEventListener("click", function() {
    let drawer = document.getElementById("cartDrawer");
    drawer.style.right = "-350px"; // Slide it back out of view
});



