const pokedexContainer = document.getElementById('pokedex-container');
const searchInput = document.getElementById('search-input');
const loadingElement = document.getElementById('loading');

// Traduction simple des types pour l'affichage en français
const typeTranslations = {
    grass: 'Plante', fire: 'Feu', water: 'Eau', bug: 'Insecte', normal: 'Normal',
    poison: 'Poison', electric: 'Électrik', ground: 'Sol', fairy: 'Fée',
    fighting: 'Combat', psychic: 'Psy', rock: 'Roche', ghost: 'Spectre',
    ice: 'Glace', dragon: 'Dragon'
};

let allPokemon = []; // Stockera la liste locale pour la recherche

// 1. Fonction principale pour récupérer les données de l'API
async function fetchPokedex() {
    try {
        // On récupère les 151 premiers Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        
        // Pour chaque Pokémon, on doit faire une requête détaillée pour avoir les images et types
        const detailPromises = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return res.json();
        });
        
        // On attend que toutes les requêtes détaillées se terminent
        allPokemon = await Promise.all(detailPromises);
        
        // On cache le message de chargement et on affiche les cartes
        loadingElement.classList.add('hidden');
        displayPokemon(allPokemon);
        
    } catch (error) {
        console.error("Erreur lors de la récupération du Pokédex :", error);
        loadingElement.textContent = "Impossible de charger le Pokédex. Vérifiez votre connexion.";
    }
}

// 2. Fonction pour générer le code HTML et afficher les Pokémon
function displayPokemon(pokemonList) {
    pokedexContainer.innerHTML = ''; // On vide le conteneur
    
    pokemonList.forEach(pokemon => {
        // Formatage de l'ID (ex: 1 devient #001)
        const pokemonId = String(pokemon.id).padStart(3, '0');
        
        // Récupération de l'image officielle haute résolution
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default;
        
        // Génération des badges de types
        const typesHTML = pokemon.types.map(typeInfo => {
            const typeNameEn = typeInfo.type.name;
            const typeNameFr = typeTranslations[typeNameEn] || typeNameEn;
            return `<span class="type-badge type-${typeNameEn}">${typeNameFr}</span>`;
        }).join('');

        // Création de la carte HTML
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.innerHTML = `
            <p class="pokemon-id">#${pokemonId}</p>
            <img class="pokemon-image" src="${imageUrl}" alt="${pokemon.name}">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <div class="types-container">
                ${typesHTML}
            </div>
        `;
        
        pokedexContainer.appendChild(pokemonCard);
    });
}

// 3. Gestionnaire d'événement pour la barre de recherche
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // On filtre le tableau global selon le nom ou l'ID
    const filteredPokemon = allPokemon.filter(pokemon => {
        return pokemon.name.toLowerCase().includes(searchTerm) || 
               pokemon.id.toString() === searchTerm;
    });
    
    displayPokemon(filteredPokemon);
});

// Lancement de l'application
fetchPokedex();