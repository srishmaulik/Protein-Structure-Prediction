from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os
import requests
import py3Dmol
from stmol import showmol
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

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
    print(pdb_data)
    return {"protein_sequence": protein_data[0].get('uniprotSequence'), "pdb" : pdb_data, "protein_name": protein_data[0].get("uniprotDescription"), "protein_id" : protein_data[0].get("uniprotId")}


        

    
   
    






    

