from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI()

# Allow frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ytdl_options(extract_audio_only=True):
    opts = {
        'quiet': True,
        'no_warnings': True,
    }
    if extract_audio_only:
        opts['format'] = 'bestaudio/best'
    return opts

@app.get("/")
def read_root():
    return {"message": "Music Streaming API is running"}

@app.get("/search")
def search(q: str):
    """
    Search for a song query and return basic results (title, uploader, video_id, thumbnail).
    """
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
        
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'extract_flat': True, # Fast extraction, avoids downloading full formats list
        'default_search': 'ytsearch10', # search up to 10 results
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # ytsearch prefix forces a search
            info = ydl.extract_info(f"ytsearch10:{q}", download=False)
            entries = info.get('entries', [])
            
            results = []
            for entry in entries:
                if entry:
                    results.append({
                        "id": entry.get('id'),
                        "title": entry.get('title'),
                        "artist": entry.get('uploader') or entry.get('channel'),
                        "duration": entry.get('duration'),
                        "thumbnail": entry.get('thumbnails', [{}])[0].get('url') if entry.get('thumbnails') else None
                    })
            return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stream/{video_id}")
def get_stream(video_id: str):
    """
    Extract the raw audio stream URL from a given video ID.
    """
    ydl_opts = get_ytdl_options(extract_audio_only=True)
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # The URL of the actual raw media chunk
            url = info.get('url')
            if not url:
                raise HTTPException(status_code=404, detail="Stream URL not found")
                
            return {
                "id": video_id,
                "title": info.get('title'),
                "artist": info.get('uploader'),
                "stream_url": url,
                "duration": info.get('duration')
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
