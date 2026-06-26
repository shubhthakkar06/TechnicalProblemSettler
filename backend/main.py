import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from google.antigravity import Agent, LocalAgentConfig

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

def get_agent_config(api_key: str, role: str):
    os.environ["GEMINI_API_KEY"] = api_key
    if role == "generator":
        system_instruction = """
        You are an expert Problem Setter for programming competitions. 
        Generate a rigorous problem statement. 
        Format your output as JSON with two keys:
        - "title": A catchy, professional title.
        - "markdown": The problem statement in markdown (Description, Input/Output format, Constraints, Example Test Cases).
        """
        return LocalAgentConfig(api_key=api_key, system_instructions=system_instruction, model="gemini-2.5-flash")
    elif role == "refiner":
        system_instruction = """
        You are an expert Problem Refiner. The user will ask you to modify an existing problem.
        First, write a short conversational response to the user.
        Then, on a new line, output EXACTLY the string '---UPDATE---'
        Then, output the updated problem as JSON with two keys: "title" and "markdown".
        Ensure the modifications are applied accurately to the markdown.
        """
        return LocalAgentConfig(api_key=api_key, system_instructions=system_instruction, model="gemini-2.5-flash")
    
    return LocalAgentConfig(api_key=api_key)

from fastapi.responses import StreamingResponse

@app.post("/api/agent/generate")
async def generate_problem(req: GenerateRequest):
    if not req.apiKey:
        raise HTTPException(status_code=400, detail="API Key required")
    
    config = get_agent_config(req.apiKey, "generator")
    prompt = f"Create a problem for the category '{req.category}' on the topic '{req.topic}' with difficulty '{req.difficulty}'. Return JSON."
    
    async def generate_stream():
        try:
            async with Agent(config=config) as agent:
                response = await agent.chat(prompt)
                async for token in response:
                    yield token
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
        
    config = get_agent_config(req.apiKey, "refiner")
    
    current_state = f"Current Title: {req.problemData.get('title')}\n\nCurrent Markdown:\n{req.problemData.get('markdown')}"
    prompt = f"{current_state}\n\nUser Request: {req.message}\nRefine the problem. Return JSON."
    
    async def chat_stream():
        try:
             async with Agent(config=config) as agent:
                response = await agent.chat(prompt)
                async for token in response:
                    yield token
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

