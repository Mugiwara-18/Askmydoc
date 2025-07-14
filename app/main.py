from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from app.pdf_utils import extract_text_from_pdf, extract_images_from_pdf
from app.gemini_engine import summarize_text, extract_tags, answer_question, analyze_image
import os

app = FastAPI()

# Enable CORS for React frontend running on localhost:3000
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCUMENT_TEXT = ""

@app.post("/upload/")
async def upload(file: UploadFile):
    global DOCUMENT_TEXT
    file_path = f"temp_{file.filename}"
    
    # Save uploaded file to disk
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Extract text from PDF
    DOCUMENT_TEXT = extract_text_from_pdf(file_path)
    
    # Generate summary and tags
    summary = summarize_text(DOCUMENT_TEXT)
    tags = extract_tags(DOCUMENT_TEXT).split("\n")
    # summary = "Summary unavailable (quota exceeded)"
    # tags = []
    
    # Extract images and analyze them
    image_paths = extract_images_from_pdf(file_path)
    image_insights = []
    for path in image_paths:
        try:
            insight = analyze_image(path)
            image_insights.append({"image": path, "insight": insight})
            os.remove(path)  # Clean up image file
        except Exception as e:
            image_insights.append({"image": path, "insight": f"Error: {e}"})
    
    # Clean up uploaded PDF file
    os.remove(file_path)
    
    return {
        "summary": summary,
        "tags": tags,
        "image_insights": image_insights
    }

@app.post("/ask/")
async def ask(question: str = Form(...)):
    global DOCUMENT_TEXT
    if not DOCUMENT_TEXT:
        return {"error": "Please upload a document first."}
    
    answer = answer_question(DOCUMENT_TEXT, question)
    return {"answer": answer}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Gemini PDF Assistant API"}