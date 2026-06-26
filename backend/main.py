import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from google import genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    category: str
    topic: str
    difficulty: str
    apiKey: str

class ChatRequest(BaseModel):
    message: str
    problemData: dict
    apiKey: str

def get_system_instruction(role: str):
    if role == "generator":
        return """
        You are an expert Problem Setter for programming competitions. 
        Generate a rigorous problem statement. 
        Format your output as JSON with two keys:
        - "title": A catchy, professional title.
        - "markdown": The problem statement in markdown (Description, Input/Output format, Constraints, Example Test Cases).
        """
    elif role == "refiner":
        return """
        You are an expert Problem Refiner. The user will ask you to modify an existing problem.
        First, write a short conversational response to the user.
        Then, on a new line, output EXACTLY the string '---UPDATE---'
        Then, output the updated problem as JSON with two keys: "title" and "markdown".
        Ensure the modifications are applied accurately to the markdown.
        """
    return ""

from fastapi.responses import StreamingResponse

@app.post("/api/agent/generate")
async def generate_problem(req: GenerateRequest):
    if not req.apiKey:
        raise HTTPException(status_code=400, detail="API Key required")
    
    sys_inst = get_system_instruction("generator")
    prompt = f"Create a problem for the category '{req.category}' on the topic '{req.topic}' with difficulty '{req.difficulty}'. Return JSON."
    
    async def generate_stream():
        try:
            client = genai.Client(api_key=req.apiKey)
            response = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": sys_inst}
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            error_str = str(e)
            if "503" in error_str and "high demand" in error_str:
                yield "I apologize, but the Gemini API is currently experiencing a temporary surge in demand. Please try sending your message again in a few moments."
            else:
                yield f"\n\nSystem Error: {error_str}"

    return StreamingResponse(
        generate_stream(), 
        media_type="text/plain", 
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.post("/api/agent/chat")
async def chat_with_agent(req: ChatRequest):
    if not req.apiKey:
        raise HTTPException(status_code=400, detail="API Key required")
        
    sys_inst = get_system_instruction("refiner")
    
    current_state = f"Current Title: {req.problemData.get('title')}\n\nCurrent Markdown:\n{req.problemData.get('markdown')}"
    prompt = f"{current_state}\n\nUser Request: {req.message}\nRefine the problem. Return JSON."
    
    async def chat_stream():
        try:
            client = genai.Client(api_key=req.apiKey)
            response = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": sys_inst}
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            error_str = str(e)
            if "503" in error_str and "high demand" in error_str:
                yield "I apologize, but the Gemini API is currently experiencing a temporary surge in demand. Please try sending your message again in a few moments."
            else:
                yield f"\n\nSystem Error: {error_str}"

    return StreamingResponse(
        chat_stream(), 
        media_type="text/plain", 
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

