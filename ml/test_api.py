import configparser
import requests
from prompts import SYSTEM_PROMPT
import json
import base64

config = configparser.ConfigParser()
config.read('config.ini')

LLM_API_KEY = config['GEMINI']['api_key']
URL = config['GEMINI']['api_url']
IMAGE_PATH = "images/image.jpg"  

with open(IMAGE_PATH, "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": LLM_API_KEY
}

payload = {
    "systemInstruction": {
        "parts": [{"text": SYSTEM_PROMPT}]
    },
    "contents": [
        {
            "role": "user",
            "parts": [
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",  
                        "data": image_base64
                    }
                }
            ]
        }
    ]
}

response = requests.post(URL, headers=headers, json=payload)

response_json = json.loads(response.text)
llm_output = response_json["candidates"][0]["content"]["parts"][0]["text"]

print(llm_output)
