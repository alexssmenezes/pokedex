// Importa funções principais do módulo Main
import { Main } from "../main.js"

// URL base da API PokeAPI
const url = `https://pokeapi.co/api/v2/`

// Seletores de elementos do DOM
const backpackElement = document.getElementById('backpack')
const bagPokemonElement = document.getElementById('bagPokemon')
const input = document.querySelector('input')

/**
 * Busca um Pokémon pelo nome digitado no campo de pesquisa
 */
async function searchPokemon() {
  // Exibe ícones de mochila e bolsa
  backpackElement.style.display = 'block'
  bagPokemonElement.style.display = 'block'

  // Captura e formata o valor do input
  const inputValue = input.value.trim().toLowerCase()

  // Mensagem de erro caso não encontre o Pokémon
  const msg =
    'Desculpa, não conseguimos escontrar esse pokemon. Verifique se digitou corretamente seu nome.'

  // Limpa todos os cards antes de exibir novos resultados
  Main.clearAllCards()

  // Se o campo de busca não estiver vazio
  if (inputValue != '') {
    const getPokemonByName = `${url}pokemon/${inputValue}`

    await fetch(getPokemonByName)
      .then(response => {
        if (!response.ok) {
          Main.renderMessage(msg)
          throw new Error(response.statusText)
        }
        response.json().then(data => {
          if (data != undefined) Main.renderPokemons(data)
        })
      })
      .catch(e => {
        console.log('catch:', e)
      })
  } else {
    // Caso o campo esteja vazio, volta para a lista padrão
    backpackElement.style.display = 'block'
    bagPokemonElement.style.display = 'none'
    fetchPokemons()
  }
}

/**
 * Busca um Pokémon pelo seu ID
 */
async function getPokemonById(id) {
  Main.clearAllCards()
  const urlId = `${url}pokemon/${id}`

  await fetch(urlId)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      response.json().then(data => {
        if (data != undefined) Main.renderPokemons(data)
      })
    })
    .catch(e => {
      console.log('catch:', e)
    })
}

/**
 * Busca os 150 primeiros Pokémons da API
 */
async function fetchPokemons() {
  const getPokemonUrl = id => `${url}pokemon/${id}`

  const pokemonPromises = []

  // Cria uma lista de promessas para buscar todos os Pokémons
  for (let i = 1; i <= 150; i++) {
    pokemonPromises.push(
      fetch(getPokemonUrl(i)).then(response => response.json())
    )
  }

  // Aguarda todas as requisições e renderiza os Pokémons
  Promise.all(pokemonPromises).then(pokemons => {
    pokemons.forEach(pokemon => {
      Main.renderPokemons(pokemon)
    })
  })
}

/**
 * Busca informações de cor de um Pokémon
 */
async function getColorPokemon(id) {
  const urlColor = `${url}pokemon-species/${id}/`
  return fetch(urlColor)
}

// Exporta funções para uso em outros módulos
export const API = {
  searchPokemon,
  fetchPokemons,
  getColorPokemon,
  getPokemonById
}
