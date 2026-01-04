// Real-time date and time
function updateDateTime() {
    const now = new Date();
    
    // Format date
    const optionsDate = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('en-US', optionsDate);
    
    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    // Update DOM
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
}

// Call function every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

// Global variables
let currentCategory = 'top';
let currentNewsData = [];

const apiEndpoints = {
    'top': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=18',
    'space': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3',
    'world': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/world',
    'sport': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/sports',
    'finance': 'https://free-apis.github.io/free-apis/apis/news#getNewsByCategory/finance'
};

// Sample data for when APIs are not available
const sampleNews = {
    'top': Array.from({length: 18}, (_, i) => ({
        title: `Top Story ${i + 1}: Major breakthrough in technology`,
        description: `This is a sample description for top story ${i + 1}. In a major development, researchers have made significant progress in the field of artificial intelligence.`,
        image: `https://images.unsplash.com/photo-${1518709268805 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80`,
        source: ["Tech News", "Science Daily", "Innovation Today", "Future Tech"][i % 4],
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://example.com/news/top-story-${i + 1}`
    })),
    'world': Array.from({length: 3}, (_, i) => ({
        title: `World News ${i + 1}: Global summit addresses climate change`,
        description: `World leaders gathered to discuss urgent measures to combat climate change and its effects on the global population.`,
        image: `https://images.unsplash.com/photo-${1551135049 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80`,
        source: ["Global News", "World Affairs", "International Report"][i % 3],
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://example.com/news/world-${i + 1}`
    })),
    'sport': Array.from({length: 3}, (_, i) => ({
        title: `Sport News ${i + 1}: Championship finals approach`,
        description: `Teams prepare for the final matches of the season with high stakes and intense competition expected.`,
        image: `https://images.unsplash.com/photo-${1575361204480 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80`,
        source: ["Sports Network", "Athletic News", "Championship Report"][i % 3],
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://example.com/news/sport-${i + 1}`
    })),
    'finance': Array.from({length: 3}, (_, i) => ({
        title: `Finance News ${i + 1}: Market trends show positive growth`,
        description: `Financial markets demonstrate resilience with promising indicators for economic recovery in the coming quarter.`,
        image: `https://images.unsplash.com/photo-${1611974789855 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80`,
        source: ["Financial Times", "Market Watch", "Economic Bulletin"][i % 3],
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://example.com/news/finance-${i + 1}`
    })),
    'space': Array.from({length: 3}, (_, i) => ({
        title: `Space News ${i + 1}: New discoveries in the cosmos`,
        description: `Astronomers have made groundbreaking observations that could reshape our understanding of the universe.`,
        image: `https://images.unsplash.com/photo-${1446776653964 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80`,
        source: ["Space Exploration", "Astronomy Today", "Cosmic News"][i % 3],
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://example.com/news/space-${i + 1}`
    }))
};

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Load news
async function loadNews(category, showLoading = true) {
    const container = document.getElementById('news-container');
    const title = document.getElementById('section-title');
    const countElement = document.getElementById('news-count');
    
    // Show loading state
    if (showLoading) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading ${category} news...
            </div>
        `;
    }
    
    // Update section title
    const categoryTitles = {
        'top': 'Top Stories',
        'world': 'World News',
        'sport': 'Sports',
        'finance': 'Finance',
        'space': 'Space'
    };
    title.textContent = categoryTitles[category] || 'News';
    
    // Update active button state
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Update current category
    currentCategory = category;
    
    try {
        let newsData;
        
        // For 'space' and 'top' categories use real Spaceflight News API
        if (category === 'space' || category === 'top') {
            const response = await fetch(apiEndpoints[category]);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform API data to our format
            newsData = data.results.map((item, index) => ({
                title: item.title,
                description: item.summary || "No description available",
                image: item.image_url || `https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80`,
                source: item.news_site || "Spaceflight News",
                published_at: item.published_at,
                url: item.url || `https://example.com/news/${category}-${index + 1}`
            }));
            
            // If not enough news, supplement with sample data
            const expectedCount = category === 'top' ? 18 : 3;
            if (newsData.length < expectedCount) {
                const supplementCount = expectedCount - newsData.length;
                newsData = newsData.concat(sampleNews[category].slice(0, supplementCount));
            }
        } else {
            // For other categories, use sample data
            // In a real app, you would make API calls here
            newsData = sampleNews[category];
            
            // Simulate network delay
            if (showLoading) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }
        
        // Limit to expected count
        const expectedCount = category === 'top' ? 18 : 3;
        newsData = newsData.slice(0, expectedCount);
        
        // Store current news data
        currentNewsData = newsData;
        
        // Update news count
        countElement.textContent = `${newsData.length} news items`;
        
        // Render news
        renderNews(newsData);
        
    } catch (error) {
        console.error('Error loading news:', error);
        
        // In case of error, use sample data
        let newsData = sampleNews[category] || sampleNews.top;
        const expectedCount = category === 'top' ? 18 : 3;
        newsData = newsData.slice(0, expectedCount);
        currentNewsData = newsData;
        
        countElement.textContent = `${newsData.length} news items`;
        renderNews(newsData);
        
        // Show error message
        if (showLoading) {
            container.innerHTML += `
                <div class="loading" style="grid-column: span 3; color: #d32f2f; margin-top: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Unable to load real-time news. Showing sample news.
                </div>
            `;
        }
    }
}

// Function to render news
function renderNews(newsItems) {
    const container = document.getElementById('news-container');
    
    if (!newsItems || newsItems.length === 0) {
        container.innerHTML = `
            <div class="loading" style="grid-column: span 3;">
                <i class="fas fa-newspaper"></i> No news available for this category.
            </div>
        `;
        return;
    }
    
    // Generate HTML for each news item
    const newsHTML = newsItems.map(item => `
        <div class="news-card">
            <img src="${item.image}" alt="${item.title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'">
            <div class="news-content">
                <h3 class="news-title">${item.title}</h3>
                <p class="news-desc">${item.description}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span>${formatDate(item.published_at)}</span>
                </div>
                <a href="${item.url}" target="_blank" class="read-now-btn">
                    <i class="fas fa-external-link-alt"></i> Read Now
                </a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = newsHTML;
}

// Function to refresh news
function refreshNews() {
    const refreshBtn = document.getElementById('refresh-news');
    const originalText = refreshBtn.innerHTML;
    
    // Add spinning animation to button
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Load news without showing loading message
    loadNews(currentCategory, false).then(() => {
        // Reset button after 1 second
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            // Show success message
            const countElement = document.getElementById('news-count');
            const originalCount = countElement.textContent;
            countElement.textContent = '✓ Refreshed!';
            countElement.style.color = '#4CAF50';
            
            setTimeout(() => {
                countElement.textContent = originalCount;
                countElement.style.color = '';
            }, 2000);
        }, 1000);
    });
}

// Event listeners for category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        loadNews(category);
    });
});

// Event listener for refresh button
document.getElementById('refresh-news').addEventListener('click', refreshNews);

// Add keyboard shortcut F5 to refresh news
document.addEventListener('keydown', (event) => {
    if (event.key === 'F5') {
        event.preventDefault();
        refreshNews();
    }
});

// Load initial news on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNews('top');
    
    // Auto-refresh news every 5 minutes
    setInterval(() => {
        refreshNews();
    }, 300000); // 300000 ms = 5 minutes
});
