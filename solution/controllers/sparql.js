const fetch = require("node-fetch");

/**
 * Fetches bird details from DBpedia based on the bird name.
 *
 * @param {string} birdName - The name of the bird.
 * @returns {Object} - The bird information including URL, abstract, genus, and species.
 */
async function fetchBirdInfo(birdName) {
    const endpointUrl = 'https://dbpedia.org/sparql';
    const sparqlQuery = `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbp: <http://dbpedia.org/property/>
    SELECT ?bird ?abstract ?genus ?species WHERE {
        ?bird rdf:type dbo:Bird .
        ?bird rdfs:label ?name .
        ?bird dbo:abstract ?abstract .
        ?bird dbp:genus ?genus .
        ?bird dbp:species ?species .
        FILTER(?name = "${birdName}"@en && lang(?abstract) = 'en') .
    }`;

    // Encode the query
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

    // Fetch the data from DBpedia
    const response = await fetch(url);
    const data = await response.json();
    const bindings = data.results.bindings[0];

    // Extract and return the bird information
    const birdInfo = {
        url: bindings.bird.value,
        abstract: bindings.abstract.value,
        genus: bindings.genus.value,
        species: bindings.species ? bindings.species.value : null,
    };
    return birdInfo;
}

/**
 * Fetches the names of all bird species from DBpedia to be loaded into a combobox.
 *
 * @returns {Array} - An array of bird names.
 */
async function fetchAllBirds() {
    // The DBpedia SPARQL endpoint URL
    const endpointUrl = 'https://dbpedia.org/sparql';

    // The SPARQL query to retrieve all bird names
    const sparqlQuery = 'PREFIX dbo: <http://dbpedia.org/ontology/>\n' +
        'PREFIX dbprop: <http://dbpedia.org/property/>\n' +
        '\n' +
        'SELECT DISTINCT ?name WHERE {\n' +
        '  ?bird rdf:type dbo:Bird .\n' +
        '  ?bird rdfs:label ?name .\n' +
        '  ?bird dbp:species ?species . \n'+
        '  ?bird dbp:genus ?genus . \n'+
        '  FILTER (lang(?name) = \'en\')\n' +
        '}\n'

    // Encode the query as a URL parameter
    const encodedQuery = encodeURIComponent(sparqlQuery);

    // Build the URL for the SPARQL query
    const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

    // Use fetch to retrieve the data
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            // The results are in the 'data' object
            const bindings = data.results.bindings;
            let birdNames = bindings.map(b => b.name.value);
            return birdNames;
        })
        .catch(error => {
            console.error('Error fetching bird names:', error);
            return [];
        });
}

module.exports.fetchBirdInfo = fetchBirdInfo;
module.exports.fetchAllBirds = fetchAllBirds;
