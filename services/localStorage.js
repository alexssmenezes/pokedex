// ==========================
// Chave utilizada no Local Storage para armazenar favoritos
// ==========================
const localStorageKey = 'favoritePokemons'

/**
 * Retorna a lista de Pokémons favoritados do Local Storage
 * @returns {Array|null} Lista de IDs dos Pokémons ou null se não existir
 */
function getFavoritePokemons() {
  return JSON.parse(localStorage.getItem(localStorageKey))
}

/**
 * Salva um Pokémon na lista de favoritos no Local Storage
 * @param {Object} pokemon - Objeto do Pokémon a ser salvo
 */
function saveToLocalStorage(pokemon) {
  const pokemons = getFavoritePokemons() || []
  pokemons.push(pokemon.id)

  const pokemonsJSON = JSON.stringify(pokemons)
  try {
    localStorage.setItem(localStorageKey, pokemonsJSON)
  } catch (error) {
    console.log('Error in local storage', error)
  }
}

/**
 * Verifica se um Pokémon já está favoritado
 * @param {number|string} idInput - ID do Pokémon
 * @returns {number|undefined} Retorna o ID se encontrado, caso contrário undefined
 */
function checkPokeminIsFavorited(idInput) {
  const pokemons = getFavoritePokemons() || []
  return pokemons.find(id => id == idInput)
}

/**
 * Remove um Pokémon da lista de favoritos no Local Storage
 * @param {number|string} idInput - ID do Pokémon a ser removido
 */
function removeFromLocalStorage(idInput) {
  const pokemons = getFavoritePokemons() || []
  const newPokemons = pokemons.filter(id => id != idInput)
  localStorage.setItem(localStorageKey, JSON.stringify(newPokemons))
}

// ==========================
// Exporta funções para uso em outros módulos
// ==========================
export const LocalStorage = {
  getFavoritePokemons,
  saveToLocalStorage,
  checkPokeminIsFavorited,
  removeFromLocalStorage
}
