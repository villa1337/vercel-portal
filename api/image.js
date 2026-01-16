export default async function handler(req, res) {
  const { tim, ext } = req.query;
  
  if (!tim || !ext) {
    return res.status(400).json({ error: 'Missing tim or ext parameter' });
  }
  
  try {
    // Fetch image from 4chan
    const imageUrl = `https://i.4cdn.org/wg/${tim}${ext}`;
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Set appropriate headers
    res.setHeader('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send the image
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
