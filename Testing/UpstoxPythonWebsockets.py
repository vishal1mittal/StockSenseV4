import asyncio
import json
import ssl
import websockets
import requests
import os
from dotenv import load_dotenv
from google.protobuf.json_format import MessageToDict
import MarketDataFeedV3_pb2 as pb

# Load environment variables from .env file
load_dotenv()

def get_market_data_feed_authorize_v3():
    """Get authorization for market data feed."""
    access_token = os.getenv("ACCESS_TOKEN")
    if not access_token:
        raise Exception("ACCESS_TOKEN not set in environment variables.")

    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    url = 'https://api.upstox.com/v3/feed/market-data-feed/authorize'
    api_response = requests.get(url=url, headers=headers)
    api_response.raise_for_status()
    return api_response.json()

def decode_protobuf(buffer):
    """Decode protobuf message."""
    feed_response = pb.FeedResponse()
    feed_response.ParseFromString(buffer)
    return feed_response

async def fetch_market_data():
    """Fetch market data using WebSocket and print it."""

    # SSL context settings
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    # Authorize WebSocket connection
    response = get_market_data_feed_authorize_v3()
    ws_url = response["data"]["authorized_redirect_uri"]

    async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
        print('✅ WebSocket connected')

        await asyncio.sleep(1)  # Optional wait

        # Subscription payload
        payload = {
            "guid": "someguid",
            "method": "sub",
            "data": {
                "mode": "full",
                "instrumentKeys": [
                    "NSE_EQ|CINE848E01016"
                ]
            }
        }

        await websocket.send(json.dumps(payload))  # Send as UTF-8 string
        print('📩 Subscription message sent')

        # Listen for messages
        while True:
            try:
                message = await websocket.recv()
                decoded = decode_protobuf(message)
                print(json.dumps(MessageToDict(decoded), indent=2))
            except Exception as e:
                print("⚠️ Error decoding message:", e)

# Run the client
if __name__ == "__main__":
    asyncio.run(fetch_market_data())
