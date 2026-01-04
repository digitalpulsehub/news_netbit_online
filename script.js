// Data e ora in tempo reale
function updateDateTime() {
    const now = new Date();
    
    // Formatta la data
    const optionsDate = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('it-IT', optionsDate);
    
    // Formatta l'ora
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    // Aggiorna il DOM
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
}

// Chiama la funzione ogni secondo
setInterval(updateDateTime, 1000);
updateDateTime(); // Chiamata iniziale

// Variabili globali
let currentCategory = 'top';
const apiEndpoints = {
    'top': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=9',
    'space': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=9',
    'world': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/world',
    'sport': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/sports',
    'finance': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/finance'
};

// Dati di esempio per quando le API non sono disponibili
const sampleNews = {
    'top': [
        { 
            title: "Nuova scoperta nello spazio profondo", 
            description: "Gli scienziati hanno individuato un nuovo esopianeta con caratteristiche simili alla Terra.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "Space News",
            published_at: "2023-10-15T10:30:00Z"
        },
        { 
            title: "Innovazione tecnologica nel 2023", 
            description: "Le nuove tecnologie stanno rivoluzionando il settore dell'informazione e della comunicazione.",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Tech Today",
            published_at: "2023-10-14T14:20:00Z"
        },
        { 
            title: "Cambiamenti climatici: ultimi sviluppi", 
            description: "La conferenza internazionale sul clima discute nuove strategie per ridurre le emissioni.",
            image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Eco News",
            published_at: "2023-10-13T09:15:00Z"
        },
        { 
            title: "Avanzamenti nella ricerca medica", 
            description: "Scoperto un nuovo trattamento potenzialmente efficace per una malattia rara.",
            image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Health Journal",
            published_at: "2023-10-12T16:45:00Z"
        },
        { 
            title: "Nuova legge sulla privacy digitale", 
            description: "Il parlamento approva una nuova normativa per la protezione dei dati personali online.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Digital Law",
            published_at: "2023-10-11T11:30:00Z"
        },
        { 
            title: "Record di visitatori nei musei nazionali", 
            description: "Dopo la pandemia, i musei registrano un aumento record di visitatori.",
            image: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Culture News",
            published_at: "2023-10-10T13:20:00Z"
        },
        { 
            title: "Innovazioni nell'agricoltura sostenibile", 
            description: "Nuove tecniche agricole promettono di aumentare la produzione riducendo l'impatto ambientale.",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
            source: "AgriTech",
            published_at: "2023-10-09T08:10:00Z"
        },
        { 
            title: "Crescita del mercato dell'auto elettrica", 
            description: "Le vendite di veicoli elettrici aumentano del 40% rispetto all'anno precedente.",
            image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
            source: "Auto News",
            published_at: "2023-10-08T15:55:00Z"
        },
        { 
            title: "Nuova mostra d'arte contemporanea", 
            description: "Inaugurata una mostra che riunisce opere di artisti emergenti da tutto il mondo.",
            image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1158&q=80",
            source: "Art World",
            published_at: "2023-10-07T18:40:00Z"
        }
    ],
    'world': [
        { 
            title: "Vertice internazionale per la pace", 
            description: "Leader mondiali si incontrano per discutere soluzioni ai conflitti in corso.",
            image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "World News",
            published_at: "2023-10-15T12:45:00Z"
        },
        { 
            title: "Nuovo accordo commerciale globale", 
            description: "Firmato un importante patto tra diverse nazioni per facilitare gli scambi commerciali.",
            image: "https://images.unsplash.com/photo-1551135049-8a33b2fb2f5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Global Affairs",
            published_at: "2023-10-14T16:30:00Z"
        },
        { 
            title: "Crisi umanitaria: appello internazionale", 
            description: "Le organizzazioni umanitarie lanciano un appello per aiutare le popolazioni colpite.",
            image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Humanitarian News",
            published_at: "2023-10-13T11:20:00Z"
        }
    ],
    'sport': [
        { 
            title: "Campionato mondiale di calcio 2023", 
            description: "Le squadre si preparano per la fase finale del torneo più atteso dell'anno.",
            image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "Sport News",
            published_at: "2023-10-15T08:15:00Z"
        },
        { 
            title: "Record mondiale nei 100 metri", 
            description: "Un atleta stabilisce un nuovo record mondiale nella gara dei 100 metri piani.",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd8facb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Athletics World",
            published_at: "2023-10-14T19:40:00Z"
        },
        { 
            title: "Olimpiadi 2024: ultimi preparativi", 
            description: "La città ospitante si prepara ad accogliere atleti da tutto il mondo.",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1190&q=80",
            source: "Olympic News",
            published_at: "2023-10-13T13:25:00Z"
        }
    ],
    'finance': [
        { 
            title: "Mercati finanziari in ripresa", 
            description: "Dopo un periodo di volatilità, i mercati mostrano segnali di ripresa.",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Financial Times",
            published_at: "2023-10-15T17:10:00Z"
        },
        { 
            title: "Nuova criptovaluta lanciata con successo", 
            description: "Una nuova criptovaluta promette di rivoluzionare il settore finanziario.",
            image: "https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            source: "Crypto News",
            published_at: "2023-10-14T21:55:00Z"
        },
        { 
            title: "Banche centrali alzano i tassi d'interesse", 
            description: "Le principali banche centrali aumentano i tassi per contrastare l'inflazione.",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w-1211&q=80",
            source: "Economic Journal",
            published_at: "2023-10-13T10:05:00Z"
        }
    ],
    'space': [
        { 
            title: "Lancio di un nuovo satellite per osservazione terrestre", 
            description: "Una nuova missione spaziale è stata lanciata per monitorare i cambiamenti climatici.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "Spaceflight News",
            published_at: "2023-10-15T11:20:00Z"
        },
        { 
            title: "Scoperta di acqua su Marte", 
            description: "Nuove prove confermano la presenza di acqua liquida sotto la superficie marziana.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "Planetary Science",
            published_at: "2023-10-14T15:45:00Z"
        },
        { 
            title: "Missione con equipaggio verso la Luna", 
            description: "Preparativi in corso per la prossima missione umana verso il satellite terrestre.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            source: "Lunar Exploration",
            published_at: "2023-10-13T07:30:00Z"
        }
    ]
};

// Funzione per formattare la data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Funzione per caricare le notizie
async function loadNews(category) {
    const container = document.getElementById('news-container');
    const title = document.getElementById('section-title');
    
    // Mostra stato di caricamento
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Caricamento notizie ${category}...
        </div>
    `;
    
    // Aggiorna il titolo della sezione
    const categoryTitles = {
        'top': 'Top Storie',
        'world': 'Notizie Mondiali',
        'sport': 'Sport',
        'finance': 'Finanza',
        'space': 'Spazio'
    };
    title.textContent = categoryTitles[category] || 'Notizie';
    
    // Aggiorna lo stato attivo dei pulsanti
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Aggiorna la categoria corrente
    currentCategory = category;
    
    try {
        let newsData;
        
        // Per la categoria 'space' e 'top' usa l'API reale di Spaceflight News
        if (category === 'space' || category === 'top') {
            const response = await fetch(apiEndpoints[category]);
            
            if (!response.ok) {
                throw new Error(`Errore API: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Trasforma i dati dell'API nello stesso formato dei nostri dati di esempio
            newsData = data.results.map(item => ({
                title: item.title,
                description: item.summary || "Nessuna descrizione disponibile",
                image: item.image_url || "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
                source: item.news_site || "Spaceflight News",
                published_at: item.published_at
            }));
            
            // Se non ci sono abbastanza notizie, integra con dati di esempio
            if (newsData.length < 3) {
                newsData = newsData.concat(sampleNews[category].slice(0, 3 - newsData.length));
            }
        } else {
            // Per altre categorie, usa i dati di esempio
            // In un'app reale, qui si farebbe una chiamata alle API appropriate
            newsData = sampleNews[category];
            
            // Simula un ritardo di rete
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Renderizza le notizie
        renderNews(newsData);
        
    } catch (error) {
        console.error('Errore nel caricamento delle notizie:', error);
        
        // In caso di errore, usa i dati di esempio
        const newsData = sampleNews[category] || sampleNews.top;
        renderNews(newsData);
        
        // Mostra un messaggio di errore
        container.innerHTML += `
            <div class="loading" style="grid-column: span 3; color: #d32f2f; margin-top: 20px;">
                <i class="fas fa-exclamation-triangle"></i> 
                Impossibile caricare le notizie in tempo reale. Mostriamo notizie di esempio.
            </div>
        `;
    }
}

// Funzione per visualizzare le notizie
function renderNews(newsItems) {
    const container = document.getElementById('news-container');
    
    if (!newsItems || newsItems.length === 0) {
        container.innerHTML = `
            <div class="loading" style="grid-column: span 3;">
                <i class="fas fa-newspaper"></i> Nessuna notizia disponibile per questa categoria.
            </div>
        `;
        return;
    }
    
    // Limita a 9 notizie per mantenere 3 per riga
    const itemsToShow = newsItems.slice(0, 9);
    
    // Genera HTML per ogni notizia
    const newsHTML = itemsToShow.map(item => `
        <div class="news-card">
            <img src="${item.image}" alt="${item.title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'">
            <div class="news-content">
                <h3 class="news-title">${item.title}</h3>
                <p class="news-desc">${item.description}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span>${formatDate(item.published_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = newsHTML;
}

// Event listener per i pulsanti delle categorie
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        loadNews(category);
    });
});

// Carica le notizie iniziali all'avvio
document.addEventListener('DOMContentLoaded', () => {
    loadNews('top');
    
    // Ricarica automaticamente le notizie ogni 2 minuti
    setInterval(() => {
        loadNews(currentCategory);
    }, 120000); // 120000 ms = 2 minuti
});
