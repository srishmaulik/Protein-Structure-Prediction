from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import json

load_dotenv()
app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
api_key = (os.getenv("OPENAI_API_KEY"))   

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/getprotein/{uniprot_id}")
def predict_protein(uniprot_id: str):
    data = ""
    try:
        api_endpoint = "https://alphafold.ebi.ac.uk/api/prediction/"
        url = f"{api_endpoint}{uniprot_id}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            protein_data =  response.json()
        else:
            raise HTTPException(status_code=404, detail="Protein Structure not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error") from e
    pdb_url = protein_data[0].get('pdbUrl')
    if pdb_url:
        pdb_data = requests.get(pdb_url).text
    else:
        raise HTTPException(status_code=404, detail="PDB URL not found for the protein")
    ProteinName = protein_data[0].get("uniprotDescription")
    URL = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": f"Explain the protein {ProteinName}. Keep it short with only a short description, structure, and function."}],
        "temperature" : 1.0,
        "top_p":1.0,
        "n" : 1,
        "stream": False,
        "presence_penalty":0,
        "frequency_penalty":0,
        }
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
    }
    reply = requests.post(URL, headers = headers, json = payload, stream = False)
    if reply.status_code == 200:
        data = reply.content

       
    else:
        raise HTTPException(status_code=404, detail="Chat did not work")
    # stream = client.chat.completions.create(
    #     model = "gpt-3.5-turbo",
    #     messages = [{"role" : "user", "content" : f"Explain the protein {ProteinName}"}],
    #     stream = True,
    # )
    # response_text = ""
    # for chunk in stream:
    #     if 'choices' in chunk:
    #         content = chunk.choices[0].delta.get("content", "")
    #         response_text += content
    decoded_data = data.decode('utf-8')
    parsed_data = json.loads(decoded_data) 
    response_text = parsed_data['choices'][0]['message']['content']
    return {"protein_sequence": protein_data[0].get('uniprotSequence'), "pdb" : pdb_data, "protein_name": protein_data[0].get("uniprotDescription"), "protein_id" : protein_data[0].get("uniprotId"), "reply":response_text }


        

    
   
    






    




