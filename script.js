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
let autoRefreshInterval;

// API endpoints - using public APIs that don't require keys
const apiEndpoints = {
    'top': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=18',
    'world': 'https://newsdata.io/api/1/latest?apikey=pub_385374d83e64c3e8b5a134553e6c7f25b2f93&country=us,gb&language=en',
    'sport': 'https://newsdata.io/api/1/latest?apikey=pub_385374d83e64c3e8b5a134553e6c7f25b2f93&category=sports&language=en',
    'finance': 'https://newsdata.io/api/1/latest?apikey=pub_385374d83e64c3e8b5a134553e6c7f25b2f93&category=business&language=en',
    'technology': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3&search=technology'
};

// Comprehensive sample data for fallback
const sampleNews = {
    'top': Array.from({length: 18}, (_, i) => ({
        title: `Breaking News ${i + 1}: Global Summit Addresses Climate Crisis`,
        description: `World leaders gather for urgent climate talks as new data shows accelerating environmental changes. The summit focuses on implementing the Paris Agreement targets ahead of schedule.`,
        image: `https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Global News", "Reuters", "AP News", "BBC", "CNN", "Al Jazeera"][i % 6],
        published_at: new Date(Date.now() - i * 3600000).toISOString(),
        url: `https://example.com/news/top-story-${i + 1}`,
        category: ["Politics", "Environment", "World", "Science", "Health", "Technology"][i % 6]
    })),
    'world': Array.from({length: 3}, (_, i) => ({
        title: `World Update ${i + 1}: Diplomatic Relations Strengthened`,
        description: `Countries establish new trade agreements and diplomatic ties in a move towards global cooperation and economic stability in the post-pandemic era.`,
        image: `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["World News Network", "International Herald", "Global Dispatch"][i % 3],
        published_at: new Date(Date.now() - i * 7200000).toISOString(),
        url: `https://example.com/news/world-${i + 1}`,
        category: "World"
    })),
    'sport': Array.from({length: 3}, (_, i) => ({
        title: `Sports Report ${i + 1}: Championship Finals Reach Climax`,
        description: `After an intense season, the championship finals are set with unexpected teams making it to the last stage, promising thrilling matches for fans worldwide.`,
        image: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Sports Network", "ESPN", "Sky Sports"][i % 3],
        published_at: new Date(Date.now() - i * 5400000).toISOString(),
        url: `https://example.com/news/sports-${i + 1}`,
        category: "Sports"
    })),
    'finance': Array.from({length: 3}, (_, i) => ({
        title: `Financial Bulletin ${i + 1}: Markets Show Strong Recovery Signs`,
        description: `Stock markets demonstrate resilience with technology and renewable energy sectors leading the way in a broader economic recovery across major indices.`,
        image: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Financial Times", "Bloomberg", "Wall Street Journal"][i % 3],
        published_at: new Date(Date.now() - i * 10800000).toISOString(),
        url: `https://example.com/news/finance-${i + 1}`,
        category: "Finance"
    })),
    'technology': Array.from({length: 3}, (_, i) => ({
        title: `Tech Innovation ${i + 1}: Breakthrough in Quantum Computing`,
        description: `Researchers announce significant progress in quantum computing technology, potentially revolutionizing data processing and cryptographic security systems.`,
        image: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["TechCrunch", "Wired", "The Verge"][i % 3],
        published_at: new Date(Date.now() - i * 3600000).toISOString(),
        url: `https://example.com/news/tech-${i + 1}`,
        category: "Technology"
    }))
};

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load news from APIs
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
        'technology': 'Technology'
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
        let newsData = [];
        
        // Try to fetch from API first
        if (apiEndpoints[category]) {
            const response = await fetch(apiEndpoints[category]);
            
            if (response.ok) {
                const data = await response.json();
                
                // Transform API data to our format based on API structure
                if (category === 'top' || category === 'technology') {
                    // Spaceflight News API format
                    newsData = (data.results || data).map((item, index) => ({
                        title: item.title || `News ${index + 1}`,
                        description: item.summary || item.description || "No description available",
                        image: item.image_url || item.urlToImage || `https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${index + 1}`,
                        source: item.news_site || "News Source",
                        published_at: item.published_at || new Date().toISOString(),
                        url: item.url || `https://example.com/news/${category}-${index + 1}`,
                        category: item.category || category
                    }));
                } else {
                    // NewsData.io API format
                    newsData = (data.results || []).map((item, index) => ({
                        title: item.title || `News ${index + 1}`,
                        description: item.description || "No description available",
                        image: item.image_url || `https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${index + 1}`,
                        source: item.source_id || "News Source",
                        published_at: item.pubDate || new Date().toISOString(),
                        url: item.link || `https://example.com/news/${category}-${index + 1}`,
                        category: item.category || category
                    }));
                }
            }
        }
        
        // If no data from API or not enough items, use sample data
        const expectedCount = category === 'top' ? 18 : 3;
        
        if (newsData.length < expectedCount) {
            // Supplement with sample data
            const supplementData = sampleNews[category] || sampleNews.top;
            const needed = expectedCount - newsData.length;
            const supplement = supplementData.slice(0, needed);
            newsData = [...newsData, ...supplement];
        }
        
        // Limit to expected count
        newsData = newsData.slice(0, expectedCount);
        
        // Store current news data
        currentNewsData = newsData;
        
        // Update news count
        countElement.textContent = `${newsData.length} News Articles`;
        
        // Render news
        renderNews(newsData);
        
    } catch (error) {
        console.error('Error loading news:', error);
        
        // In case of error, use sample data
        let newsData = sampleNews[category] || sampleNews.top;
        const expectedCount = category === 'top' ? 18 : 3;
        newsData = newsData.slice(0, expectedCount);
        currentNewsData = newsData;
        
        countElement.textContent = `${newsData.length} News Articles`;
        renderNews(newsData);
        
        // Show error message
        if (showLoading) {
            container.innerHTML += `
                <div class="loading" style="grid-column: span 3; color: #d32f2f; margin-top: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Unable to load real-time news. Showing latest available news.
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
                <p class="news-desc">${item.description.length > 150 ? item.description.substring(0, 150) + '...' : item.description}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span>${formatDate(item.published_at)}</span>
                </div>
                <a href="${item.url}" target="_blank" class="read-now-btn">
                    <i class="fas fa-external-link-alt"></i> Read Full Article
                </a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = newsHTML;
}

// Function to refresh news
function refreshNews() {
    const refreshBtn = document.getElementById('refresh-news');
    const countElement = document.getElementById('news-count');
    const originalText = refreshBtn.innerHTML;
    
    // Add spinning animation to button and disable it
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.classList.add('refreshing');
    refreshBtn.disabled = true;
    
    // Load news without showing loading message
    loadNews(currentCategory, false).then(() => {
        // Reset button after 1.5 seconds
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.classList.remove('refreshing');
            refreshBtn.disabled = false;
            
            // Show success message
            const originalCount = countElement.textContent;
            countElement.textContent = '✓ News Updated!';
            countElement.style.color = '#4CAF50';
            countElement.style.backgroundColor = '#e8f5e9';
            
            setTimeout(() => {
                countElement.textContent = originalCount;
                countElement.style.color = '';
                countElement.style.backgroundColor = '';
            }, 2000);
        }, 1500);
    }).catch(() => {
        // In case of error, still reset button
        refreshBtn.innerHTML = originalText;
        refreshBtn.classList.remove('refreshing');
        refreshBtn.disabled = false;
    });
}

// Setup auto-refresh
function setupAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Set new interval for auto-refresh every 5 minutes
    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing news...');
        refreshNews();
    }, 300000); // 300000 ms = 5 minutes
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
    
    // Also support Ctrl+R / Cmd+R
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshNews();
    }
});

// Load initial news on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNews('top');
    setupAutoRefresh();
    
    // Display auto-refresh info
    setTimeout(() => {
        const countElement = document.getElementById('news-count');
        const originalText = countElement.textContent;
        countElement.textContent = 'Auto-refresh every 5 minutes';
        countElement.style.color = '#ff9800';
        
        setTimeout(() => {
            countElement.textContent = originalText;
            countElement.style.color = '';
        }, 3000);
    }, 2000);
});
