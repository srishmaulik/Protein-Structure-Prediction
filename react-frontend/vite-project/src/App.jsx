import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import './App.css';

function ProteinVisualization() {
  const [uniprotId, setUniprotId] = useState('');
  const [proteinData, setProteinData] = useState(null);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);  // Reference for 3Dmol.js viewer
  
  // Fetch protein data from the backend
  const fetchProteinData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/getprotein/${uniprotId}`);
      setProteinData(response.data[1]);
      //render3Dmol(response.data[0]);  // Render the 3D structure
    } catch (error) {
      setError('Protein not found');
    }
  };

  // Function to render 3Dmol.js model in the viewer
  const render3Dmol = (pdbData) => {
    if (viewerRef.current) {
      const viewer = window.VMD(viewerRef.current);
      viewer.addModel(pdbData, 'pdb');
      viewer.setStyle({ cartoon: { color: 'spectrum' } });
      viewer.zoomTo();
      viewer.render();
    }
  };

  return (
    <div className="App">
      <h1>Protein Visualization</h1>
      <input
        type="text"
        value={uniprotId}
        onChange={(e) => setUniprotId(e.target.value)}
        placeholder="Enter UniProt ID"
      />
      <button onClick={fetchProteinData}>Fetch Protein Data</button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <h2>Protein Data:</h2>
        {proteinData && (
          <div>
            <h3>{proteinData.protein_data.name}</h3>
            <p>{proteinData.protein_data.description}</p>
            {/* You can display other protein metadata here */}
          </div>
        )}
      </div>
      
      <div>
        <h2>Protein Structure:</h2>
        {/* This div will hold the 3Dmol.js viewer */}
        <div
          ref={viewerRef}
          style={{ width: '100%', height: '500px' }}
        ></div>
      </div>
    </div>
  );
}

export default ProteinVisualization;
