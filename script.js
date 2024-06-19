$(document).ready(function() {
    const searchInput = $('#searchInput');
    const resultsList = $('#resultsList');
    const birdInfo = $('#birdInfo');
    const copyButton = $('#copyButton');

    let birds = [];
    let template = '';
    let hashtags = '';

    // Função para remover acentos e manter apenas letras
    function keepOnlyLetters(str) {
        return str.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-zA-Z]/g, ''); // Remove caracteres que não são letras
    }

    // Função para carregar e processar o CSV
    function loadCSV() {
        $.get('birds.csv', function(data) {
            const lines = data.trim().split('\n');
            birds = lines.slice(1).map(line => {
                const [nome_popular, nome_cientifico, nome_ingles] = line.split(';');
                return { nome_popular, nome_cientifico, nome_ingles };
            });
        }).fail(function() {
            console.error('Erro ao carregar o CSV');
        });
    }

    // Função para carregar o template
    function loadTemplate() {
        $.get('template.txt', function(data) {
            template = data;
        }).fail(function() {
            console.error('Erro ao carregar o template');
        });
    }

    // Função para gerar as hashtags formatadas
    function generateHashtags(bird) {
        const popularHashtag = keepOnlyLetters(bird.nome_popular).toLowerCase();
        const cientificHashtag = keepOnlyLetters(bird.nome_cientifico).toLowerCase();
        const inglesHashtag = keepOnlyLetters(bird.nome_ingles).toLowerCase();
        hashtags = `#${popularHashtag} #${cientificHashtag} #${inglesHashtag}`;
    }

    // Função para filtrar os resultados com base na entrada do usuário
    function filterResults(query) {
        const normalizedQuery = keepOnlyLetters(query.toLowerCase());
        return birds.filter(bird => 
            keepOnlyLetters(bird.nome_popular.toLowerCase()).includes(normalizedQuery) ||
            keepOnlyLetters(bird.nome_cientifico.toLowerCase()).includes(normalizedQuery)
        );
    }

    // Função para mostrar os resultados filtrados
    function displayResults(results) {
        resultsList.empty();
        results.forEach(bird => {
            const li = $('<li></li>').text(bird.nome_popular);
            li.on('click', function() {
                showBirdInfo(bird);
            });
            resultsList.append(li);
        });
    }

    // Função para mostrar a informação do pássaro selecionado
    function showBirdInfo(bird) {
        generateHashtags(bird);
        const info = template
            .replace('{nome_popular}', bird.nome_popular)
            .replace('{nome_cientifico}', bird.nome_cientifico)
            .replace('{nome_ingles}', bird.nome_ingles)
            .replace('{hashtags}', hashtags)
            .replace(/\n/g, '<br>'); // Substitui quebras de linha pelo código HTML <br>
        birdInfo.html(info);
        copyButton.show(); // Mostra o botão de copiar
    }

    // Event listener para o campo de pesquisa
    searchInput.on('input', function() {
        const query = $(this).val();
        const results = filterResults(query);
        displayResults(results);
    });

    // Event listener para o botão de cópia
    copyButton.on('click', function() {
        const textToCopy = birdInfo.text();
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyButton.text('Texto copiado').prop('disabled', true).addClass('copied'); // Altera o texto, desativa o botão e adiciona a classe
                setTimeout(() => {
                    copyButton.text('Copiar').prop('disabled', false).removeClass('copied'); // Restaura o texto, ativa o botão e remove a classe após 3 segundos
                }, 3000);
            })
            .catch(err => {
                console.error('Erro ao copiar texto: ', err);
            });
    });

    // Carregar o CSV e o template ao iniciar a página
    loadCSV();
    loadTemplate();
});
