from fastapi import FastAPI
import openai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API Key (Get from https://openai.com/)
openai.api_key = "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"

@app.get("/")
def home():
    return {"message": "Welcome to Study Buddy Backend!"}

@app.get("/ask")
def ask_question(question: str):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": question}]
    )
    return {"response": response["choices"][0]["message"]["content"]}
