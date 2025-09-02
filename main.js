// Importa o módulo de gerenciamento de favoritos no Local Storage
import { LocalStorage } from "././services/localStorage.js"
// Importa o módulo responsável pelas requisições à API
import { API } from "./services/api.js"

// Seletores de elementos do DOM
const pokemonsSection = document.querySelector('.pokemons')
const input = document.querySelector('input')
const searchButton = document.getElementById('icon-search')
const backpackElement = document.getElementById('backpack')
const bagPokemonElement = document.getElementById('bagPokemon')
const titlePage = document.getElementById('pokedex')
const btnToTop = document.getElementById('btn-to-top')

// Armazena links de cards (se necessário futuramente)
let cardLinks = []

// Evento de clique no botão de busca
searchButton.addEventListener('click', API.searchPokemon)

// Mapeamento de cores originais para cores substitutas
const changePokemonsColors = [
  { originalColor: 'yellow', substituteColor: '#F1B81A' },
  { originalColor: 'blue', substituteColor: '#5C92CB' },
  { originalColor: 'white', substituteColor: '#D0B9B3' },
  { originalColor: 'black', substituteColor: '#202020' },
  { originalColor: 'green', substituteColor: '#5D9242' },
  { originalColor: 'red', substituteColor: 'brown' },
  { originalColor: 'brown', substituteColor: '#684E36' },
  { originalColor: 'purple', substituteColor: '#674D7D' }
]

// Remove todos os cards da tela
function clearAllCards() {
  pokemonsSection.innerHTML = ''
}

// Evento para exibir pokémons favoritos ao clicar na mochila
backpackElement.addEventListener('click', () => {
  input.value = ''
  showFavoritePokemons()
})

// Evento para voltar à lista completa de pokémons
bagPokemonElement.addEventListener('click', () => {
  clearAllCards()
  API.fetchPokemons()
  input.value = ''
  backpackElement.style.display = 'block'
  bagPokemonElement.style.display = 'none'
  titlePage.textContent = 'Pokedex'
})

// Evento para buscar pokémon ao pressionar Enter
input.addEventListener('keyup', e => {
  if (e.keyCode == 13) {
    API.searchPokemon()
    return
  }
})

// Exibe apenas os pokémons favoritados
function showFavoritePokemons() {
  clearAllCards()
  const pokemons = LocalStorage.getFavoritePokemons() || []
  if (pokemons.length == 0) {
    const msg =
      'Ainda Não possui pokemons favoritados :(. Que tal adicionar alguns?'
    renderMessage(msg)
  } else {
    pokemons.forEach(pokemonID => API.getPokemonById(pokemonID))
  }
  backpackElement.style.display = 'none'
  bagPokemonElement.style.display = 'block'
  titlePage.textContent = 'My pokemons'
}

// Alterna estado de favorito ao clicar no ícone de coração
function favoriteButtonPressed(event, pokemon) {
  const favoriteState = {
    favorited: 'assets/heart-fill.svg',
    notFavorited: 'assets/heart-empty.svg'
  }

  if (event.target.src.includes(favoriteState.notFavorited)) {
    event.target.src = favoriteState.favorited
    LocalStorage.saveToLocalStorage(pokemon)
  } else {
    event.target.src = favoriteState.notFavorited
    LocalStorage.removeFromLocalStorage(pokemon.id)
    if (titlePage.textContent == 'My pokemons') {
      showFavoritePokemons()
    }
  }
}

// Ao carregar a página, busca os pokémons iniciais
window.onload = async () => {
  await API.fetchPokemons()
}

// Renderiza um card simples de pokémon na listagem
async function renderPokemons(pokemon) {
  const { id, name, sprites, types } = pokemon
  let backgroundColor
  let firstPower = ''
  let secondpower = ''

  // Busca a cor do pokémon e aplica substituição se necessário
  await API.getColorPokemon(id).then(response => {
    return response.json().then(data => {
      backgroundColor = data.color.name
      for (let i = 0; i < changePokemonsColors.length; i++) {
        if (data.color.name.includes(changePokemonsColors[i].originalColor)) {
          backgroundColor = changePokemonsColors[i].substituteColor
        }
      }
    })
  })

  // Define os tipos (poderes) do pokémon
  firstPower = types[0].type.name
  types.length > 1 ? (secondpower = types[1].type.name) : (secondpower = '')

  // Cria o card do pokémon
  const cardPokemon = document.createElement('div')
  cardPokemon.classList.add('card-pokemon')
  cardPokemon.style.backgroundColor = backgroundColor
  pokemonsSection.appendChild(cardPokemon)

  // Evento para abrir modal com detalhes do pokémon
  cardPokemon.addEventListener('click', async () => {
    await renderCardPokemons(pokemon)
  })

  // Container de informações do card
  const itemsCard = document.createElement('div')
  itemsCard.classList.add('items')
  cardPokemon.appendChild(itemsCard)

  // Nome do pokémon
  const pokemonNameElement = document.createElement('h3')
  pokemonNameElement.textContent = name
  itemsCard.appendChild(pokemonNameElement)

  // Primeiro tipo
  const firstPowerElement = document.createElement('p')
  firstPowerElement.textContent = firstPower
  firstPowerElement.style.backgroundColor = backgroundColor
  firstPowerElement.classList.add('power')
  itemsCard.appendChild(firstPowerElement)

  // Segundo tipo (se existir)
  const secondpowerElement = document.createElement('p')
  secondpowerElement.textContent = secondpower
  secondpowerElement.style.backgroundColor = backgroundColor
  secondpowerElement.classList.add('power')
  if (secondpower != '') itemsCard.appendChild(secondpowerElement)

  // Imagem do pokémon
  const imgPokemonElement = document.createElement('img')
  imgPokemonElement.src = sprites.other.home.front_default
  imgPokemonElement.alt = name
  cardPokemon.appendChild(imgPokemonElement)
}

// Renderiza o modal com detalhes do pokémon
async function renderCardPokemons(pokemon) {
  const { id, name, sprites, types } = pokemon
  let backgroundColor
  let firstpower = ''
  let secondpower = ''

  // Verifica se o pokémon já está favoritado
  const isFavorited = LocalStorage.checkPokeminIsFavorited(id)

  // Define os tipos
  firstpower = types[0].type.name
  types.length > 1 ? (secondpower = types[1].type.name) : (secondpower = '')

  // Busca a cor do pokémon e aplica substituição se necessário
  await API.getColorPokemon(id).then(response => {
    return response.json().then(data => {
      backgroundColor = data.color.name
      for (let i = 0; i < changePokemonsColors.length; i++) {
        if (data.color.name.includes(changePokemonsColors[i].originalColor)) {
          backgroundColor = changePokemonsColors[i].substituteColor
        }
      }
    })
  })

  // Cria overlay de fundo
  const overlayElement = document.createElement('div')
  overlayElement.classList.add('overlay')
  pokemonsSection.appendChild(overlayElement)
  overlayElement.addEventListener('click', () => {
    destroyModalOverlay()
  })

  // Cria modal principal
  const modalElement = document.createElement('div')
  modalElement.classList.add('modal')
  modalElement.style.backgroundColor = backgroundColor
  pokemonsSection.appendChild(modalElement)

  // Container de ícones do modal
  const iconsElement = document.createElement('div')
  iconsElement.classList.add('icons')
  modalElement.appendChild(iconsElement)

  // Ícone de favorito (coração)
  const iconHeartElement = document.createElement('img')
  iconHeartElement.src = isFavorited
    ? 'assets/heart-fill.svg'
    : 'assets/heart-empty.svg'
  iconHeartElement.alt = isFavorited
    ? 'assets/heart-fill.svg'
    : 'assets/heart-empty.svg'
  iconsElement.appendChild(iconHeartElement)
  iconHeartElement.addEventListener('click', event => {
    favoriteButtonPressed(event, pokemon)
  })

  // Ícone de fechar modal
  const iconCloseElement = document.createElement('i')
  iconCloseElement.classList.add('fa-solid')
  iconCloseElement.classList.add('fa-x')
  iconCloseElement.classList.add('fa-2xl')
  iconsElement.appendChild(iconCloseElement)
  iconCloseElement.addEventListener('click', () => {
    destroyModalOverlay()
  })

  // ==========================
  // Seção superior do modal
  // ==========================
  const topInfoElement = document.createElement('div')
  topInfoElement.classList.add('top-info')
  modalElement.appendChild(topInfoElement)

  // Container de descrição do Pokémon
  const descriptionElement = document.createElement('div')
  descriptionElement.classList.add('description')
  topInfoElement.appendChild(descriptionElement)

  // Nome do Pokémon
  const namePokemonElement = document.createElement('h4')
  namePokemonElement.textContent = name
  descriptionElement.appendChild(namePokemonElement)

  // Container para exibir os tipos (poderes)
  const powersElement = document.createElement('div')
  powersElement.classList.add('powers')
  descriptionElement.appendChild(powersElement)

  // Primeiro tipo
  const firstPower = document.createElement('p')
  firstPower.classList.add('power')
  firstPower.style.backgroundColor = backgroundColor
  firstPower.textContent = firstpower
  powersElement.appendChild(firstPower)

  // Segundo tipo
  const secondPower = document.createElement('p')
  secondPower.classList.add('power')
  secondPower.style.backgroundColor = backgroundColor
  secondPower.textContent = secondpower
  powersElement.appendChild(secondPower)

  // Número identificador do Pokémon formatado
  const spanDescription = document.createElement('span')
  if (id < 10) {
    spanDescription.textContent = `#00${id}`
  } else if (id >= 100) {
    spanDescription.textContent = `#${id}`
  } else {
    spanDescription.textContent = `#0${id}`
  }
  topInfoElement.appendChild(spanDescription)

  // Imagem principal do Pokémon no modal
  const imgPokemonElement = document.createElement('img')
  imgPokemonElement.classList.add('pokemon')
  imgPokemonElement.src = sprites.other.home.front_default
  imgPokemonElement.alt = name
  modalElement.appendChild(imgPokemonElement)

  // ==========================
  // Seção inferior do modal
  // ==========================
  const bottomInfoElement = document.createElement('div')
  bottomInfoElement.classList.add('bottom-info')
  modalElement.appendChild(bottomInfoElement)

  // Opções de navegação dentro do modal
  const bottomOptionsElement = document.createElement('div')
  bottomOptionsElement.classList.add('options')
  bottomInfoElement.appendChild(bottomOptionsElement)

  // Criação dos links de navegação (About, Base Stats, Moves)
  const linkAboutElement = document.createElement('a')
  const linkstatsElement = document.createElement('a')
  const linkMovesElement = document.createElement('a')

  // Configuração de classes e atributos
  linkAboutElement.classList.add('active')
  linkAboutElement.classList.add('card-link')
  linkAboutElement.setAttribute('data', 'about')
  linkstatsElement.classList.add('card-link')
  linkstatsElement.setAttribute('data', 'stats')
  linkMovesElement.classList.add('card-link')
  linkMovesElement.setAttribute('data', 'moves')

  // Definição de textos
  linkAboutElement.textContent = 'About'
  linkstatsElement.textContent = 'Base Stats'
  linkMovesElement.textContent = 'Moves'

  // Adiciona os links ao container
  bottomOptionsElement.appendChild(linkAboutElement)
  bottomOptionsElement.appendChild(linkstatsElement)
  bottomOptionsElement.appendChild(linkMovesElement)

  // Adiciona eventos de clique para alternar conteúdo
  cardLinks = Array.from(document.getElementsByClassName('card-link'))
  cardLinks.forEach(item => {
    item.addEventListener('click', async e => {
      onItemClick(e, pokemon)
    })
  })

  // Linha divisória
  const line = document.createElement('div')
  line.classList.add('line')
  bottomInfoElement.appendChild(line)

  // Conteúdo inicial (About)
  const content = await setBottomInfoElements('about', pokemon)
  bottomInfoElement.appendChild(content)
}

// ==========================
// Função para definir conteúdo da parte inferior do modal
// ==========================
async function setBottomInfoElements(selectedAttribute, pokemon) {
  const { id, moves } = pokemon
  let backgroundColor
  let color = ''
  let eggGroups = ''

  // Busca cor e grupos de ovos do Pokémon
  await API.getColorPokemon(id).then(response => {
    return response.json().then(data => {
      backgroundColor = data.color.name
      color = data.color.name
      eggGroups = data.egg_groups[0].name
      for (let i = 0; i < changePokemonsColors.length; i++) {
        if (data.color.name.includes(changePokemonsColors[i].originalColor)) {
          backgroundColor = changePokemonsColors[i].substituteColor
        }
      }
    })
  })

  // Caso a aba selecionada seja "About"
  if (selectedAttribute === 'about') {
    const { weight, height, abilities, types } = pokemon
    let firstpower = ''
    let firstAbility = ''
    let secondAbility = ''
    let weightConvert = weight.toString().split('')
    let heightConvert = `${height / 10} m`

    // Define primeiro tipo
    firstpower = types[0].type.name

    // Container principal das descrições
    const descriptions = document.createElement('div')
    descriptions.classList.add('descriptions')

    // Primeira seção de informações
    const firstSectionElement = document.createElement('div')
    firstSectionElement.classList.add('section')
    firstSectionElement.classList.add('first')

    // Primeira coluna (labels)
    const firstCol = document.createElement('div')
    firstCol.classList.add('col-a')
    firstSectionElement.appendChild(firstCol)

    // Labels das informações
    const speciesLabelElement = document.createElement('p')
    const heightLabelElement = document.createElement('p')
    const weightLabelElement = document.createElement('p')
    const abilitiesLabelElement = document.createElement('p')
    speciesLabelElement.textContent = 'Color'
    heightLabelElement.textContent = 'Height'
    weightLabelElement.textContent = 'Weight'
    abilitiesLabelElement.textContent =
      abilities.length > 1 ? 'Abilities' : 'Ability'
    firstCol.appendChild(speciesLabelElement)
    firstCol.appendChild(heightLabelElement)
    firstCol.appendChild(weightLabelElement)
    firstCol.appendChild(abilitiesLabelElement)

    // Segunda coluna (valores)
    const secondCol = document.createElement('div')
    secondCol.classList.add('col-b')

    // Conversão do peso para formato decimal
    if (weightConvert.length == 2) {
      weightConvert = weightConvert.join('.')
    } else {
      weightConvert.pop()
      weightConvert = weightConvert.join('')
    }

    // Habilidades
    firstAbility = abilities[0].ability.name
    if (abilities.length > 1) secondAbility = `, ${abilities[1].ability.name}`

    // Valores das informações
    const speciesInput = document.createElement('p')
    const heightInput = document.createElement('p')
    const weightInput = document.createElement('p')
    const abilitiesInput = document.createElement('p')
    speciesInput.textContent = color
    heightInput.textContent = heightConvert
    weightInput.textContent = `${weightConvert} kg`
    abilitiesInput.textContent = `${firstAbility} ${secondAbility}`
    secondCol.appendChild(speciesInput)
    secondCol.appendChild(heightInput)
    secondCol.appendChild(weightInput)
    secondCol.appendChild(abilitiesInput)

    // Monta a primeira seção
    firstSectionElement.appendChild(secondCol)
    descriptions.appendChild(firstSectionElement)

    // ==========================
    // Seção "Breeding" (criação/reprodução)
    // ==========================
    const h4Element = document.createElement('h4')
    h4Element.textContent = 'Breeding'
    descriptions.appendChild(h4Element)

    // Segunda seção de informações
    const secondSection = document.createElement('div')
    secondSection.classList.add('section')
    secondSection.classList.add('second')

    // Primeira coluna (labels)
    const firstColB = document.createElement('div')
    firstColB.classList.add('col-a')
    secondSection.appendChild(firstColB)

    const eggGrupsLabelElement = document.createElement('p')
    const eggCycleLabelElement = document.createElement('p')
    eggGrupsLabelElement.textContent = 'Egg Groups'
    eggCycleLabelElement.textContent = 'Egg Cycle'
    firstColB.appendChild(eggGrupsLabelElement)
    firstColB.appendChild(eggCycleLabelElement)

    // Segunda coluna (valores)
    const secondColB = document.createElement('div')
    secondColB.classList.add('col-b')
    secondSection.appendChild(secondColB)

    const eggGrupsInput = document.createElement('p')
    const eggCycleInput = document.createElement('p')
    eggGrupsInput.textContent = eggGroups
    eggCycleInput.textContent = firstpower
    secondColB.appendChild(eggGrupsInput)
    secondColB.appendChild(eggCycleInput)

    // Adiciona a segunda seção ao container principal
    descriptions.appendChild(secondSection)

    // Retorna o bloco de descrições
    return descriptions
  }

  // ==========================
  // Seção "Stats" (atributos base)
  // ==========================
  if (selectedAttribute === 'stats') {
    const { stats } = pokemon
    const descriptions = document.createElement('div')
    descriptions.classList.add('statsBox')

    // Cria um bloco para cada atributo
    stats.forEach(stats => {
      const content = document.createElement('div')
      content.classList.add('stats')

      const hpLabel = document.createElement('p')
      const hpValue = document.createElement('span')
      hpValue.textContent = stats.base_stat

      // Define abreviações para cada atributo
      switch (stats.stat.name) {
        case 'attack':
          hpLabel.textContent = 'atk'
          break
        case 'defense':
          hpLabel.textContent = 'def'
          break
        case 'special-attack':
          hpLabel.textContent = 'satk'
          break
        case 'special-defense':
          hpLabel.textContent = 'sdef'
          break
        case 'speed':
          hpLabel.textContent = 'spd'
          break
        default:
          hpLabel.textContent = stats.stat.name
      }

      // Barra de progresso do atributo
      const hpProgressBox = document.createElement('div')
      hpProgressBox.classList.add('progressBox')
      const hpProgress = document.createElement('div')
      hpProgress.classList.add('progress')
      hpProgress.style.width = `${stats.base_stat / 2}%`
      hpProgress.style.backgroundColor = backgroundColor

      // Monta o bloco de atributo
      descriptions.appendChild(content)
      content.appendChild(hpLabel)
      content.appendChild(hpValue)
      hpProgressBox.appendChild(hpProgress)
      content.appendChild(hpProgressBox)
    })

    return descriptions
  }

  // ==========================
  // Seção "Moves" (golpes)
  // ==========================
  if (selectedAttribute === 'moves') {
    const movesBox = document.createElement('div')
    movesBox.classList.add('movesBox')

    // Cabeçalho da coluna de golpes
    const moveLabel = document.createElement('h4')
    moveLabel.textContent = 'Moves'

    const cola = document.createElement('div')
    cola.classList.add('col-a')
    cola.appendChild(moveLabel)
    movesBox.appendChild(cola)

    // Cabeçalho da coluna de níveis
    const colb = document.createElement('div')
    colb.classList.add('col-b')
    const levelLabel = document.createElement('h4')
    levelLabel.textContent = 'Level'
    colb.appendChild(levelLabel)
    movesBox.appendChild(colb)

    // Cabeçalho da coluna de métodos
    const colc = document.createElement('div')
    colc.classList.add('col-c')
    const methodLabel = document.createElement('h4')
    methodLabel.textContent = 'Method'
    colc.appendChild(methodLabel)
    movesBox.appendChild(colc)

    // Lista os primeiros 5 golpes
    let i = 0
    while (i < 5 && i <= moves.length - 1) {
      const move = document.createElement('p')
      move.textContent = moves[i].move.name
      cola.appendChild(move)

      const level = document.createElement('p')
      level.textContent = moves[i].version_group_details[0].level_learned_at
      colb.appendChild(level)

      const method = document.createElement('p')
      method.textContent =
        moves[i].version_group_details[0].move_learn_method.name
      colc.appendChild(method)

      i++
    }
    return movesBox
  }
}

// ==========================
// Evento de clique nos links do modal
// ==========================
async function onItemClick(event, pokemon) {
  const selectedAttribute = event.target.getAttribute('data')
  addOrRemoveActive(selectedAttribute)
  destroyBottomInfoElement()
  const content = await setBottomInfoElements(selectedAttribute, pokemon)
  if (content != undefined) {
    const bottomInfo = document.querySelector('.bottom-info')
    bottomInfo.appendChild(content)
  }
}

// ==========================
// Alterna a classe "active" nos links
// ==========================
function addOrRemoveActive(selectedAttribute) {
  cardLinks.forEach(item => {
    const itemAttribute = item.getAttribute('data')
    if (itemAttribute === selectedAttribute) {
      item.classList.add('active')
      return
    }
    item.classList.remove('active')
  })
}

// ==========================
// Remove conteúdo da parte inferior do modal
// ==========================
function destroyBottomInfoElement() {
  const description = document.querySelector('.descriptions')
  if (description != null) {
    description.remove()
  }
  const statsBox = document.querySelector('.statsBox')
  if (statsBox != null) {
    statsBox.remove()
  }
  const movesBox = document.querySelector('.movesBox')
  if (movesBox != null) {
    movesBox.remove()
  }
}

// ==========================
// Remove modal e overlay
// ==========================
function destroyModalOverlay() {
  const modal = document.querySelector('.modal')
  if (modal != null) {
    modal.remove()
  }
  const overlay = document.querySelector('.overlay')
  if (overlay != null) {
    overlay.remove()
  }
}

// ==========================
// Renderiza mensagem na tela
// ==========================
function renderMessage(text) {
  const menssage = document.createElement('h1')
  menssage.classList.add('message')
  menssage.textContent = text
  pokemonsSection.appendChild(menssage)
}

// ==========================
// Ajusta ícones para telas menores
// ==========================
function mediaQuerie(value) {
  if (value.matches) {
    searchButton.classList.remove('fa-2x')
    searchButton.classList.add('fa-1x')
    btnToTop.classList.remove('fa-2x')
    btnToTop.classList.add('fa-1x')
  } else {
    searchButton.classList.add('fa-2x')
    searchButton.classList.remove('fa-1x')
    btnToTop.classList.add('fa-2x')
    btnToTop.classList.remove('fa-1x')
  }
}

// ==========================
// Configuração de media query
// ==========================
const screenWidth = window.matchMedia("(max-width:400px)")
mediaQuerie(screenWidth)
screenWidth.addListener(mediaQuerie)

// ==========================
// Exporta funções principais
// ==========================
export const Main = {
  renderPokemons,
  clearAllCards,
  renderMessage,
}
