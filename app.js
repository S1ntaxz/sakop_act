const apiKey = '1'; // Replace with your actual API key
const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

// Function to initialize the application
function init() {
    const searchForm = document.getElementById('search-form');
    const randomMealBtn = document.getElementById('random-meal-btn');
    const categorySelect = document.getElementById('category-select');
    const ingredientSearchBtn = document.getElementById('ingredient-search-btn');
    const viewFavoritesBtn = document.getElementById('view-favorites-btn');

    // Event listeners
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = document.getElementById('query-input').value;
        getMeals(query);
    });

    randomMealBtn.addEventListener('click', getRandomMeal);

    categorySelect.addEventListener('change', function() {
        const category = this.value;
        if (category) {
            getMealsByCategory(category);
        }
    });

    ingredientSearchBtn.addEventListener('click', function() {
        const ingredient = document.getElementById('ingredient-input').value;
        if (ingredient) {
            getMealsByIngredient(ingredient);
        }
    });

    viewFavoritesBtn.addEventListener('click', displayFavorites);

    // Fetch categories and populate select options
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
        .then(response => response.json())
        .then(data => {
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.strCategory;
                option.textContent = category.strCategory;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Display all meals on page load
    getMeals('');
}

// Function to fetch meals by query
function getMeals(query) {
    fetch(`${apiUrl}${query}`)
        .then(response => response.json())
        .then(data => displayMeals(data.meals))
        .catch(error => console.error('Error fetching data:', error));
}

// Function to fetch a random meal
function getRandomMeal() {
    fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
        .then(response => response.json())
        .then(data => displayMeals(data.meals))
        .catch(error => console.error('Error fetching random meal:', error));
}

// Function to fetch meals by category
function getMealsByCategory(category) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(response => response.json())
        .then(data => displayMeals(data.meals))
        .catch(error => console.error('Error fetching meals by category:', error));
}

// Function to fetch meals by ingredient
function getMealsByIngredient(ingredient) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
        .then(response => response.json())
        .then(data => displayMeals(data.meals))
        .catch(error => console.error('Error fetching meals by ingredient:', error));
}

// Function to display meals in the UI
function displayMeals(meals) {
    const container = document.getElementById('meals-container');
    container.innerHTML = '';
    if (meals) {
        meals.forEach(meal => {
            const mealDiv = createMealDiv(meal);
            container.appendChild(mealDiv);
        });
    } else {
        container.innerHTML = '<p>No meals found. Please try a different search.</p>';
    }
}

// Function to create a meal card
function createMealDiv(meal) {
    const mealDiv = document.createElement('div');
    mealDiv.className = 'meal';
    mealDiv.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2>${meal.strMeal}</h2>
        <button class="btn-view-details" data-meal-id="${meal.idMeal}">View Details</button>
        <button class="btn-add-to-favorites" data-meal-id="${meal.idMeal}">Add to Favorites</button>
    `;
    
    // Event listener for View Details button
    mealDiv.querySelector('.btn-view-details').addEventListener('click', function() {
        displayMealDetails(meal.idMeal);
    });

    // Event listener for Add to Favorites button
    mealDiv.querySelector('.btn-add-to-favorites').addEventListener('click', function() {
        addToFavorites(meal.idMeal);
    });

    return mealDiv;
}

// Function to display meal details
function displayMealDetails(mealId) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            const mealDetailsContainer = document.getElementById('meal-details');
            mealDetailsContainer.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="meal-info">
                    <h2>${meal.strMeal}</h2>
                    <h3>Ingredients</h3>
                    <ul>
                        ${getIngredients(meal)}
                    </ul>
                    <h3>Instructions</h3>
                    <p>${meal.strInstructions}</p>
                    <button id="btn-back">Back to Meals</button>
                </div>
            `;

            // Show modal
            const mealDetailsModal = document.getElementById('meal-details-modal');
            mealDetailsModal.style.display = 'block';

            // Event listener for Back button
            mealDetailsContainer.querySelector('#btn-back').addEventListener('click', function() {
                mealDetailsModal.style.display = 'none';
                const query = document.getElementById('query-input').value;
                getMeals(query);
            });
        })
        .catch(error => console.error('Error fetching meal details:', error));
}

// Function to get ingredients list
function getIngredients(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        } else {
            break;
        }
    }
    return ingredients;
}

// Function to add meal to favorites
function addToFavorites(mealId) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            if (!favorites.some(m => m.idMeal === meal.idMeal)) {
                favorites.push(meal);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                displayFavorites(); // Refresh favorites list
            }
        })
        .catch(error => console.error('Error adding to favorites:', error));
}

// Function to display favorites
function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('meals-container');
    container.innerHTML = '';

    if (favorites.length > 0) {
        favorites.forEach(meal => {
            const mealDiv = createFavoriteMealDiv(meal);
            container.appendChild(mealDiv);
        });
    } else {
        container.innerHTML = '<p>No favorite meals added yet.</p>';
    }
}

// Function to create a favorite meal card with delete button
function createFavoriteMealDiv(meal) {
    const mealDiv = document.createElement('div');
    mealDiv.className = 'meal';
    mealDiv.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2>${meal.strMeal}</h2>
        <button class="btn-view-details" data-meal-id="${meal.idMeal}">View Details</button>
        <button class="btn-delete-from-favorites" data-meal-id="${meal.idMeal}">Delete from Favorites</button>
    `;

    // Event listener for View Details button
    mealDiv.querySelector('.btn-view-details').addEventListener('click', function() {
        displayMealDetails(meal.idMeal);
    });

    // Event listener for Delete from Favorites button
    mealDiv.querySelector('.btn-delete-from-favorites').addEventListener('click', function() {
        deleteFromFavorites(meal.idMeal);
    });

    return mealDiv;
}

// Function to delete meal from favorites
function deleteFromFavorites(mealId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(meal => meal.idMeal !== mealId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites(); // Refresh favorites list
}

// Initialize the application
init();
