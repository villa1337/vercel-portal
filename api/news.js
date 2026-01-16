export default async function handler(req, res) {
    try {
        const feeds = [
            'https://feeds.arstechnica.com/arstechnica/index',
            'https://rss.slashdot.org/Slashdot/slashdotMain',
            'https://feeds.feedburner.com/oreilly/radar',
            'https://www.wired.com/feed/rss'
        ];

        const articles = [];
        
        for (const feedUrl of feeds) {
            try {
                const response = await fetch(feedUrl);
                const xml = await response.text();
                
                // Simple RSS parsing
                const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
                
                for (const item of items.slice(0, 3)) {
                    const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
                    const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim();
                    const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
                    
                    if (title && link) {
                        articles.push({
                            title,
                            link,
                            pubDate: pubDate ? new Date(pubDate).toLocaleString() : 'Unknown',
                            source: new URL(feedUrl).hostname
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching ${feedUrl}:`, error);
            }
        }

        // Sort by date and limit
        articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        res.json({
            success: true,
            articles: articles.slice(0, 10),
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
