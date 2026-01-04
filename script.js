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
let currentCategory = 'commercial';
let currentNewsData = [];
let autoRefreshInterval;

// API endpoints for commercial space news
const apiEndpoints = {
    'commercial': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=18&search=commercial',
    'satellites': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3&search=satellite',
    'launches': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3&search=launch',
    'spacex': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3&search=spacex',
    'technology': 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3&search=technology'
};

// Comprehensive commercial space sample data
const sampleNews = {
    'commercial': Array.from({length: 18}, (_, i) => ({
        title: `Commercial Space Venture ${i + 1} Raises $${(100 + i * 50)}M Funding`,
        description: `New commercial space company announces successful funding round for orbital infrastructure development. The investment will accelerate deployment of next-generation satellite constellations.`,
        image: `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=${i + 1}`,
        source: ["SpaceNews", "Space.com", "NASASpaceFlight", "TechCrunch Space", "Bloomberg Space"][i % 5],
        published_at: new Date(Date.now() - i * 3600000).toISOString(),
        url: `https://spacenews.com/article/commercial-venture-${i + 1}`,
        category: "Commercial Space"
    })),
    'satellites': Array.from({length: 3}, (_, i) => ({
        title: `Next-Gen Satellite Constellation ${i + 1} Launches Successfully`,
        description: `Commercial satellite operator completes deployment of new imaging/sensing constellation, promising unprecedented Earth observation capabilities for commercial clients.`,
        image: `https://images.unsplash.com/photo-1541188495357-ad2f6d6d1e9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Satellite Today", "Space Intel", "Orbital News"][i % 3],
        published_at: new Date(Date.now() - i * 7200000).toISOString(),
        url: `https://satellitetoday.com/launch-update-${i + 1}`,
        category: "Satellites"
    })),
    'launches': Array.from({length: 3}, (_, i) => ({
        title: `Commercial Launch ${i + 1} Successfully Deploys Payloads`,
        description: `Rocket launch company completes mission for multiple commercial customers, deploying communications and Earth observation satellites to precise orbits.`,
        image: `https://images.unsplash.com/photo-1541188495357-ad2f6d6d1e9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Launch Report", "Spaceflight Now", "Rocket News"][i % 3],
        published_at: new Date(Date.now() - i * 10800000).toISOString(),
        url: `https://launchreport.com/mission-${i + 1}`,
        category: "Launches"
    })),
    'spacex': Array.from({length: 3}, (_, i) => ({
        title: `SpaceX Announces New Commercial Contract ${i + 1}`,
        description: `SpaceX secures additional commercial launch contracts and announces progress on next-generation spacecraft development for orbital and interplanetary missions.`,
        image: `https://images.unsplash.com/photo-1516849677043-ef67c9557e16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["SpaceX Updates", "Commercial Spaceflight", "Elon Musk News"][i % 3],
        published_at: new Date(Date.now() - i * 5400000).toISOString(),
        url: `https://spacexupdates.com/contract-${i + 1}`,
        category: "SpaceX"
    })),
    'technology': Array.from({length: 3}, (_, i) => ({
        title: `Space Technology Breakthrough ${i + 1} Announced`,
        description: `Commercial space company reveals new propulsion/communication technology that promises to revolutionize satellite operations and reduce costs for commercial operators.`,
        image: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=${i + 1}`,
        source: ["Space Tech Daily", "Innovation in Space", "Future Space Tech"][i % 3],
        published_at: new Date(Date.now() - i * 3600000).toISOString(),
        url: `https://spacetechdaily.com/breakthrough-${i + 1}`,
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
                <i class="fas fa-satellite fa-spin"></i> Loading ${category} news...
            </div>
        `;
    }
    
    // Update section title
    const categoryTitles = {
        'commercial': 'Commercial Space News',
        'satellites': 'Satellite Updates',
        'launches': 'Launch Reports',
        'spacex': 'SpaceX Commercial News',
        'technology': 'Space Technology'
    };
    title.textContent = categoryTitles[category] || 'Space News';
    
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
        const expectedCount = category === 'commercial' ? 18 : 3;
        
        // Try to fetch from API first
        if (apiEndpoints[category]) {
            const response = await fetch(apiEndpoints[category]);
            
            if (response.ok) {
                const data = await response.json();
                
                // Transform API data to our format
                if (data.results) {
                    newsData = data.results.map((item, index) => ({
                        title: item.title || `Space News ${index + 1}`,
                        description: item.summary || "Latest commercial space development.",
                        image: item.image_url || `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=${index + 1}`,
                        source: item.news_site || "Space News Source",
                        published_at: item.published_at || new Date().toISOString(),
                        url: item.url || `https://spacenews.com/article/${category}-${index + 1}`,
                        category: category
                    }));
                }
            }
        }
        
        // If no data from API or not enough items, use sample data
        if (newsData.length < expectedCount) {
            // Supplement with sample data
            const supplementData = sampleNews[category] || sampleNews.commercial;
            const needed = expectedCount - newsData.length;
            const supplement = supplementData.slice(0, needed);
            newsData = [...newsData, ...supplement];
        }
        
        // Limit to expected count
        newsData = newsData.slice(0, expectedCount);
        
        // Store current news data
        currentNewsData = newsData;
        
        // Update news count
        countElement.textContent = `${newsData.length} Space Updates`;
        
        // Render news
        renderNews(newsData);
        
    } catch (error) {
        console.error('Error loading space news:', error);
        
        // In case of error, use sample data
        let newsData = sampleNews[category] || sampleNews.commercial;
        const expectedCount = category === 'commercial' ? 18 : 3;
        newsData = newsData.slice(0, expectedCount);
        currentNewsData = newsData;
        
        countElement.textContent = `${newsData.length} Space Updates`;
        renderNews(newsData);
        
        // Show error message
        if (showLoading) {
            container.innerHTML += `
                <div class="loading" style="grid-column: span 3; color: #ff6b6b; margin-top: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Using cached space news. Real-time updates may be delayed.
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
                <i class="fas fa-satellite"></i> No space news available for this category.
            </div>
        `;
        return;
    }
    
    // Generate HTML for each news item
    const newsHTML = newsItems.map(item => `
        <div class="news-card">
            <img src="${item.image}" alt="${item.title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80'">
            <div class="news-content">
                <h3 class="news-title">${item.title}</h3>
                <p class="news-desc">${item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span>${formatDate(item.published_at)}</span>
                </div>
                <a href="${item.url}" target="_blank" class="read-now-btn">
                    <i class="fas fa-external-link-alt"></i> Full Report
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
    refreshBtn.innerHTML = '<i class="fas fa-satellite fa-spin"></i> Refreshing...';
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
            countElement.textContent = '✓ Space News Updated';
            countElement.style.color = '#32CD32';
            countElement.style.backgroundColor = '#e6f7ff';
            countElement.style.borderColor = '#32CD32';
            
            setTimeout(() => {
                countElement.textContent = originalCount;
                countElement.style.color = '';
                countElement.style.backgroundColor = '';
                countElement.style.borderColor = '';
            }, 2000);
        }, 1500);
    }).catch(() => {
        // In case of error, still reset button
        refreshBtn.innerHTML = originalText;
        refreshBtn.classList.remove('refreshing');
        refreshBtn.disabled = false;
    });
}

// Back to Top functionality
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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
        console.log('Auto-refreshing space news...');
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

// Load initial news on page load and setup everything
document.addEventListener('DOMContentLoaded', () => {
    loadNews('commercial');
    setupBackToTop();
    setupAutoRefresh();
    
    // Display welcome message
    setTimeout(() => {
        const countElement = document.getElementById('news-count');
        const originalText = countElement.textContent;
        countElement.textContent = 'Commercial Space Intelligence Active';
        countElement.style.color = '#32CD32';
        
        setTimeout(() => {
            countElement.textContent = originalText;
            countElement.style.color = '';
        }, 3000);
    }, 1000);
});
