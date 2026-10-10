const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const status = document.getElementById("status");
const recentSearches = document.getElementById("recent-searches");
const searchView = document.getElementById("search-view");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.getElementById("meal-details-content");
const backButton = document.getElementById("back-btn");

const API_BASE = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${API_BASE}search.php?s=`;
const LOOKUP_URL = `${API_BASE}lookup.php?i=`;
const RECENT_KEY = "recipe-finder-recent-searches";

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchMeals();
});
mealsContainer.addEventListener("click", handleMealClick);
backButton.addEventListener("click", () => {
  mealDetails.classList.add("hidden");
  searchView.classList.remove("hidden");
  searchInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function setStatus(message = "") { status.textContent = message; }

async function searchMeals(term = searchInput.value.trim()) {
  if (!term) {
    setStatus("Please enter a meal or keyword to search.");
    searchInput.focus();
    return;
  }

  setStatus("Searching recipes...");
  resultHeading.textContent = "";
  mealsContainer.innerHTML = "";
  try {
    const response = await fetch(`${SEARCH_URL}${encodeURIComponent(term)}`);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    if (!data.meals) {
      resultHeading.textContent = `No recipes found for "${term}"`;
      setStatus("Try another ingredient, dish, or country.");
      return;
    }
    resultHeading.textContent = `Search results for "${term}":`;
    setStatus(`${data.meals.length} recipes found`);
    displayMeals(data.meals);
    saveRecentSearch(term);
    searchInput.value = "";
  } catch (error) {
    resultHeading.textContent = "";
    setStatus("Something went wrong. Check your connection and try again.");
  }
}

function displayMeals(meals) {
  const fragment = document.createDocumentFragment();
  meals.forEach((meal) => {
    const card = document.createElement("article");
    card.className = "meal";
    card.dataset.mealId = meal.idMeal;
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const image = document.createElement("img");
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.loading = "lazy";
    const info = document.createElement("div");
    info.className = "meal-info";
    const title = document.createElement("h3");
    title.className = "meal-title";
    title.textContent = meal.strMeal;
    info.appendChild(title);
    if (meal.strCategory) {
      const category = document.createElement("span");
      category.className = "meal-category";
      category.textContent = meal.strCategory;
      info.appendChild(category);
    }
    card.append(image, info);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMealDetails(meal.idMeal);
      }
    });
    fragment.appendChild(card);
  });
  mealsContainer.appendChild(fragment);
}

async function handleMealClick(event) {
  const card = event.target.closest(".meal");
  if (card) await openMealDetails(card.dataset.mealId);
}

async function openMealDetails(mealId) {
  setStatus("Loading recipe details...");
  try {
    const response = await fetch(`${LOOKUP_URL}${encodeURIComponent(mealId)}`);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    const meal = data.meals?.[0];
    if (!meal) throw new Error("Recipe not found");
    renderMealDetails(meal);
    searchView.classList.add("hidden");
    mealDetails.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setStatus("Could not load recipe details. Please try again.");
  }
}

function renderMealDetails(meal) {
  mealDetailsContent.innerHTML = "";
  const image = document.createElement("img");
  image.className = "meal-details-img";
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  const title = document.createElement("h2");
  title.className = "meal-details-title";
  title.id = "details-title";
  title.textContent = meal.strMeal;
  const category = document.createElement("div");
  category.className = "meal-details-category";
  category.innerHTML = `<span>${meal.strCategory || "Uncategorized"}</span>`;
  const instructions = document.createElement("section");
  instructions.className = "meal-details-instructions";
  instructions.innerHTML = "<h3>Instructions</h3>";
  const instructionText = document.createElement("p");
  instructionText.textContent = meal.strInstructions || "No instructions available.";
  instructions.appendChild(instructionText);
  const ingredients = document.createElement("section");
  ingredients.className = "meal-details-ingredients";
  ingredients.innerHTML = "<h3>Ingredients</h3>";
  const list = document.createElement("ul");
  list.className = "ingredients-list";
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();
    if (!ingredient) continue;
    const item = document.createElement("li");
    item.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> `;
    item.append(document.createTextNode(`${measure ? `${measure} ` : ""}${ingredient}`));
    list.appendChild(item);
  }
  ingredients.appendChild(list);
  mealDetailsContent.append(image, title, category, instructions, ingredients);
  if (meal.strYoutube) {
    const video = document.createElement("a");
    video.className = "youtube-link";
    video.href = meal.strYoutube;
    video.target = "_blank";
    video.rel = "noreferrer";
    video.innerHTML = '<i class="fa-brands fa-youtube" aria-hidden="true"></i> Watch Video';
    mealDetailsContent.appendChild(video);
  }
}

function saveRecentSearch(term) {
  const searches = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  const next = [term, ...searches.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  renderRecentSearches(next);
}

function renderRecentSearches(searches = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")) {
  if (!searches.length) return;
  recentSearches.hidden = false;
  recentSearches.textContent = "Recent: ";
  searches.forEach((term) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = term;
    button.addEventListener("click", () => searchMeals(term));
    recentSearches.appendChild(button);
  });
}

renderRecentSearches();
