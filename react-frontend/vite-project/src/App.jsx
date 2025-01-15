import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import './App.css';

function ProteinVisualization() {
  const [uniprotId, setUniprotId] = useState('');
  const [proteinData, setProteinData] = useState(null);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);  // Reference for 3Dmol.js viewer
  
  const render3Dmol = (pdbData) => {
    if (viewerRef.current) {
      const viewer = window.VMD(viewerRef.current);
      viewer.addModel(pdbData, 'pdb');
      viewer.setStyle({ cartoon: { color: 'spectrum' } });
      viewer.zoomTo();
      viewer.render();
    }
  };
  // Fetch protein data from the backend
  const fetchProteinData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/getprotein/${uniprotId}`);
      console.log(response);
      setProteinData(response.data.protein_sequence);
      //render3Dmol(response.data.pdb_data);  // Render the 3D structure
     // console.log(response.data.protein_data)
    } catch (error) {
      setError('Protein not found');
    }
  };

  // Function to render 3Dmol.js model in the viewer
  

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
            <h3>{proteinData}</h3>
          </div>
        )}
      </div>
      
      {/* <div>
        <h2>Protein Structure:</h2>
       
        <div
          ref={viewerRef}
          style={{ width: '100%', height: '500px' }}
        ></div>
      </div> */}
    </div>
  );
}

export default ProteinVisualization;
