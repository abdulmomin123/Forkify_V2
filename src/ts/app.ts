// Module imports
import '../sass/main.scss';
import * as config from './config';
import { Recipe } from './models/Recipe';
import { Search } from './models/Search';
import { Bookmark } from './models/Bookmarks';
import RecipeView from './view/recipeView';
import SearchView from './view/searchView';
import BookmarksView from './view/bookmarksView';
import PaginationView from './view/paginationView';
import AddRecipeView from './view/addRecipeView';

// The state
const state: { recipe: Recipe; search?: Search; bookmark: Bookmark } = {
  bookmark: new Bookmark(),
  recipe: new Recipe(location.hash.slice(1)),
};

// The search controller
const controlSearch = async (e: Event) => {
  e.preventDefault();

  try {
    // Getting the search query from the input
    const searchQuery = SearchView.getQuery();

    // If no searchQuery then return
    if (!searchQuery) return;

    // Render the spinner while getting recipe
    SearchView.renderSpinner();

    // Creating the search object
    state.search = new Search(searchQuery);

    // Getting the recipe array
    await state.search.getSearchResults();

    // Rendering the results
    SearchView.render(
      state.search.getSearchResultsPage(state.search.currentPage)
    );

    // Rendering the initial pagination buttons
    PaginationView.render(state.search);
  } catch (err) {
    SearchView.renderError();
  }
};

// The recipe controller
const controlRecipes = async () => {
  try {
    // Getting the recipe id from the URL
    const recipeId = location.hash.slice(1);

    // If no id then return
    if (!recipeId) return;

    // Update the search results view (highlight the selected one)
    SearchView.update(state.search?.getSearchResultsPage()!);

    // Update the bookmarks (highlight the selected one)
    BookmarksView.render(state.bookmark.bookmarks!);

    // Render the spinner while getting recipe
    RecipeView.renderSpinner();

    // Creating the recipe object with the recipe id
    state.recipe = new Recipe(recipeId);

    // Getting the recipe details
    await state.recipe.getRecipe(state.bookmark.bookmarks);

    // Rendering the recipe
    RecipeView.render(state.recipe.recipe);
  } catch (err) {
    console.log(err);
    RecipeView.renderError();
  }
};

// Pagination buttons controler
const controlPagination = (e: Event) => {
  const btn = (e.target as HTMLElement).closest(
    '.btn--inline'
  ) as HTMLButtonElement;

  if (!btn) return;

  // Updating the current page
  state.search!.currentPage += +btn.dataset.value!;

  // Re-rendering the results and btns
  SearchView.render(
    state.search!.getSearchResultsPage(state.search!.currentPage)
  );
  PaginationView.render(state.search!);
};

// Update servings buttons controler
const controlServings = (e: Event) => {
  const btn = (e.target as HTMLElement).closest(
    '.btn--tiny'
  ) as HTMLButtonElement;

  // If not clicked on the button then return
  if (!btn) return;

  // Update the servings in the state
  state.recipe!.updateServings(
    state.recipe.recipe.servings + +btn.dataset.value!
  );

  // Update the view (re-render)
  RecipeView.update(state.recipe.recipe);
};

// The bookmark controller
const controlBookmark = (e: Event) => {
  const target = (e.target as HTMLElement).closest(
    '.btn--bookmark'
  ) as HTMLButtonElement;

  if (!target) return;

  // Creating the bookmark object
  state.bookmark ? null : (state.bookmark = new Bookmark());

  // If the recipe isn't bookmarked, bookmark it
  // If it is bookmarked, un-bookmark it
  state.recipe.recipe.isBookmarked
    ? state.bookmark.removeBookmark(state.recipe.recipe)
    : state.bookmark.addBookmark(state.recipe.recipe);

  // Re-render the recipe
  RecipeView.update(state.recipe.recipe);

  // Render bookmarked recipes into the bookmarks
  BookmarksView.render(state.bookmark.bookmarks);
};

// The add recipe handler
const controlAddRecipe = async (formData: {
  [k: string]: FormDataEntryValue;
}) => {
  try {
    // Show the spinner while data comes back
    AddRecipeView.renderSpinner();

    // Add the uploaded recipe to the state
    await state.recipe.uploadRecipe(formData);

    // Bookmak the recipe
    state.bookmark.addBookmark(state.recipe.recipe);

    // Re-render the recipe
    RecipeView.render(state.recipe.recipe);

    // Render bookmarked recipes into the bookmarks
    BookmarksView.render(state.bookmark.bookmarks);

    // Change the url hash (in case its a user recipe)
    history.pushState(null, '', `#${state.recipe.recipe.id}`);

    // Display a success message
    AddRecipeView.renderMessage();

    // Close the recipe editor
    setTimeout(() => {
      AddRecipeView.toggleRecipeEditor();
    }, config.MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    AddRecipeView.renderError();
  }
};

// App initializer
const init = async () => {
  // Handler for the search
  SearchView.addHandlerSearch(controlSearch);

  // Handler for the recipe & update servings
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);

  // Handler for the pagination btns click
  PaginationView.addHandlerClick(controlPagination);

  // Handler for the bookmark btn
  RecipeView.addHandlerAddBookmark(controlBookmark);

  // If theres bookmarks, then render them
  BookmarksView.render(state.bookmark.bookmarks);

  // Add & close btns handler of the add recipe
  AddRecipeView;

  // The recipe upload handler
  AddRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
