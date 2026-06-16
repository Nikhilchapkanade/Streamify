import urllib.request
import json
import time
from main import app
import threading
import uvicorn

# Start the server in a thread
def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="error")

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()

time.sleep(2) # wait for server to start

try:
    print("Testing /search endpoint...")
    req = urllib.request.Request("http://127.0.0.1:8001/search?q=lofi+hip+hop")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Search Results Count: len({data.get('results', [])})")
        if data.get('results'):
            first_id = data['results'][0]['id']
            print(f"First Video ID: {first_id}")
            
            print(f"Testing /stream endpoint for {first_id}...")
            req2 = urllib.request.Request(f"http://127.0.0.1:8001/stream/{first_id}")
            with urllib.request.urlopen(req2) as response2:
                stream_data = json.loads(response2.read().decode())
                print("Stream Data extracted successfully!")
                print(f"Stream URL starts with: {stream_data['stream_url'][:50]}...")
except Exception as e:
    print(f"Error during testing: {e}")
