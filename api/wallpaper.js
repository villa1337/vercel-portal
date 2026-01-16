export default async function handler(req, res) {
  try {
    // Get catalog of /wg/ board
    const catalogResponse = await fetch('https://a.4cdn.org/wg/catalog.json');
    const catalog = await catalogResponse.json();
    
    // Collect all threads
    const allThreads = [];
    catalog.forEach(page => {
      page.threads.forEach(thread => {
        if (thread.filename) { // Only threads with images
          allThreads.push(thread);
        }
      });
    });
    
    if (allThreads.length === 0) {
      return res.json({ success: false, error: 'No threads with images found' });
    }
    
    // Pick random thread
    const randomThread = allThreads[Math.floor(Math.random() * allThreads.length)];
    
    // Get thread details
    const threadResponse = await fetch(`https://a.4cdn.org/wg/thread/${randomThread.no}.json`);
    const threadData = await threadResponse.json();
    
    // Collect all posts with images
    const postsWithImages = threadData.posts.filter(post => post.filename && post.ext);
    
    if (postsWithImages.length === 0) {
      return res.json({ success: false, error: 'No posts with images in thread' });
    }
    
    // Pick random post with image
    const randomPost = postsWithImages[Math.floor(Math.random() * postsWithImages.length)];
    
    // Use our proxy endpoint instead of direct 4chan URL
    const imageUrl = `/api/image?tim=${randomPost.tim}&ext=${randomPost.ext}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      threadId: randomThread.no,
      postId: randomPost.no,
      filename: randomPost.filename
    });
    
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    res.json({ 
      success: false, 
      error: 'Failed to fetch wallpaper from 4chan' 
    });
  }
}
