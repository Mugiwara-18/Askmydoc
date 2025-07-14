import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

# Corrected model names
text_model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
image_model = genai.GenerativeModel("models/gemini-1.5-flash")



def summarize_text(text):
    try:
        prompt = f"Summarize the following document:\n\n{text}"
        response = text_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini API error: {str(e)}"

def extract_tags(text):
    prompt = f"Extract 5-8 hashtags describing this document:\n{text}"
    response = text_model.generate_content(prompt)
    return response.text

def answer_question(text, question):
    prompt = f"""You are a helpful assistant. Use the context below to answer the user's question.

Context:
{text}

Question:
{question}
"""
    response = text_model.generate_content(prompt)
    return response.text

def analyze_image(image_path):
    img = Image.open(image_path)
    prompt = "Describe this image and extract any important data or visuals."
    response = image_model.generate_content([prompt, img])
    return response.text
