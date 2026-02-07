import configparser
import requests
from prompts import SYSTEM_PROMPT
import json
import base64
import os
from dotenv import load_dotenv

load_dotenv()

config = configparser.ConfigParser()
config.read('config.ini')

LLM_API_KEY = os.getenv("GEMINI_API_KEY")
URL = config['GEMINI']['api_url']
IMAGE_PATH = "images/test_img.jpeg"  

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

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

response_json = json.loads(response.text)

if "error" in response_json:
    print(f"API Error: {response_json['error']}")
    exit(1)

if "candidates" not in response_json:
    print(f"Unexpected response format: {response_json}")
    exit(1)

llm_output = response_json["candidates"][0]["content"]["parts"][0]["text"]

with open("llm_output.json", "w") as f:
    f.write(llm_output)