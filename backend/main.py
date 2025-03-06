from fastapi import FastAPI, UploadFile, File
import google.generativeai as genai
import PyPDF2
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database = ""  # Store extracted text from PDF

@app.get("/")
def home():
    return {"message": "Welcome to Study Buddy Backend!"}

# Configure Google Gemini AI API
genai.configure(api_key="AIzaSyB8v7OQ1wexWWxcNeqyBYuBQIeTZ1fOjrA")

@app.post("/upload-pdf")  # ✅ Matches your frontend
async def upload_notes(file: UploadFile = File(...)):
    global database
    pdf_reader = PyPDF2.PdfReader(file.file)
    extracted_text = " ".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
    
    if not extracted_text:
        return {"error": "No text found in PDF"}

    database = extracted_text  # Store for later use

    # Generate Summary with AI
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(f"Summarize this document and point by point explanation to it and make it very clear and consise:\n\n{database}")
    
    return {"summary": response.text}

@app.get("/askupload")
def ask_question(question: str):
    if not database:
        return {"error": "No notes uploaded"}
    
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(f"Answer this question based on the notes:\n{database}\n\nQuestion: {question}")
    
    return {"response": response.text}

@app.get("/ask")
def ask_general_question(question: str):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(question)
        return {"response": response.text}
    except Exception as e:
        print("Error:", str(e))
        return {"error": str(e)}
        
