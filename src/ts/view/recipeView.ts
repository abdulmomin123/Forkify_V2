import Fraction from 'fraction.js';
import * as Interfaces from '../Interfaces';
import { elements } from './base';
import View from './View';

export class RecipeView extends View {
  parentEl = elements.recipeContainer;
  errorMessage = 'We could not find that recipe. Please try another one!';
  message = '';

  addHandlerRender(handlerFn: (e: Event) => void) {
    ['hashchange', 'load'].forEach(e => window.addEventListener(e, handlerFn));
  }

  addHandlerUpdateServings(handlerFn: (e: Event) => void) {
    this.parentEl.addEventListener('click', handlerFn);
  }

  addHandlerAddBookmark(handlerFn: (e: Event) => void) {
    this.parentEl.addEventListener('click', handlerFn);
  }

  generateMarkup() {
    const data = this.data as Interfaces.Recipe | Interfaces.UserRecipe;
    return `
      <figure class="recipe__fig">
         <img src="${data.image_url}" alt="${data.title}" class="recipe__img" />
         <h1 class="recipe__title">
            <span>${data.title}</span>
         </h1>
      </figure>
      <div class="recipe__details">
         <div class="recipe__info">
            <svg class="recipe__info-icon">
               <use href="img/icons.svg#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${
              data.cooking_time
            }</span>
            <span class="recipe__info-text">minutes</span>
         </div>
         <div class="recipe__info">
            <svg class="recipe__info-icon">
               <use href="img/icons.svg#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${
              data.servings
            }</span>
            <span class="recipe__info-text">servings</span>
            <div class="recipe__info-buttons">
               <button data-value="-1" class="btn--tiny btn--increase-servings">
                  <svg>
                     <use href="img/icons.svg#icon-minus-circle"></use>
                  </svg>
               </button>
               <button data-value="1" class="btn--tiny btn--increase-servings">
                  <svg>
                     <use href="img/icons.svg#icon-plus-circle"></use>
                  </svg>
               </button>
            </div>
         </div>
         <div class="recipe__user-generated">
         ${
           (data as Interfaces.UserRecipe).key
             ? `
         <svg>
            <use href="img/icons.svg#icon-user"></use>
         </svg>
         `
             : ''
         }
         </div>
         <button class="btn--round btn--bookmark">
            <svg class="">
               <use href="img/icons.svg#icon-bookmark${
                 (this.data as Interfaces.Recipe).isBookmarked ? '-fill' : ''
               }"></use>
            </svg>
         </button>
      </div>
      <div class="recipe__ingredients">
         <h2 class="heading--2">Recipe ingredients</h2>
         <ul class="recipe__ingredient-list">
            ${data.ingredients.map(this.generateRecipeIngredient).join('')}
         </ul>
      </div>
      <div class="recipe__directions">
         <h2 class="heading--2">How to cook it</h2>
         <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
         <span class="recipe__publisher">${
           data.publisher
         }</span>. Please check out
         directions at their website.
         </p>
         <a
         class="btn--small recipe__btn"
         href="${data.source_url}"
         target="_blank"
         >
         <span>Directions</span>
         <svg class="search__icon">
            <use href="img/icons.svg#icon-arrow-right"></use>
         </svg>
         </a>
      </div>
     `;
  }

  generateRecipeIngredient(ingredient: Interfaces.Ingredient) {
    return `
     <li class="recipe__ingredient">
        <svg class="recipe__icon">
           <use href="img/icons.svg#icon-check"></use>
        </svg>
        <div class="recipe__quantity">${
          ingredient.quantity
            ? new Fraction(ingredient.quantity).toFraction(true)
            : ''
        }</div>
        <div class="recipe__description">
           <span class="recipe__unit">${ingredient.unit}</span>
           ${ingredient.description}
        </div>
     </li>
     `;
  }
}

export default new RecipeView();
