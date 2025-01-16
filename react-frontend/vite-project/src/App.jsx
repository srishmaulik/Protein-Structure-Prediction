import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import './App.css';



const elementColors = {
  H: 0xffffff,  // White
  C: 0x000000,  // Black
  O: 0xff0000,  // Red
  N: 0x0000ff,  // Blue
  S: 0xffff00,  // Yellow
  P: 0xff8000,  // Orange
};

const Atom = ({position, element}) => {
  const color = elementColors[element] || 0x888888;
  return(
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
const ProteinModel = ({pdbText}) => {
  const[atoms, setAtoms] = useState([]);
  useEffect(() => {
    if (!pdbText) return;
    const lines = pdbText.split('\n');
    const parsedAtoms = [];
    lines.forEach((line) => {
      if (line.startsWith('ATOM') || line.startsWith('HETATM')){
        const element = line.substring(76, 78).trim();
        const x = parseFloat(line.substring(30, 38));
        const y = parseFloat(line.substring(38, 46));
        const z = parseFloat(line.substring(46, 54));
        parsedAtoms.push({ position: [x, y, z], element });
      }
    });
    setAtoms(parsedAtoms);
  }, [pdbText]);
  return (
    <>
      {atoms.map((atom, index) => (
        <Atom key={index} position={atom.position} element={atom.element} />
      ))}
    </>
  );
};

const ProteinViewer = ({pdbText}) => (
  <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 5, 5]} intensity={1} />
    <ProteinModel pdbText={pdbText} />
    <OrbitControls />
  </Canvas>
);


function ProteinVisualization() {
  const [proteinName, setProteinName] = useState('');
  const [uniprotAccession, setUniprotAccession] = useState('');
  const [uniprotId, setUniprotId] = useState('');
  const [proteinData, setProteinData] = useState(null);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);  // Reference for 3Dmol.js viewer
  const [pdbText, setPdbText] = useState('');
  const[loading, setIsLoading] = useState(false);

    // Fetch protein data from the backend
  const fetchProteinData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/getprotein/${uniprotAccession}`);
      console.log(response);
      setProteinData(response.data.protein_sequence);
      setUniprotId(response.data.protein_id);
      setProteinName(response.data.protein_name);
      setPdbText(response.data.pdb);
    } catch (error) {
      setError('Protein not found');
    }
    finally{
      setIsLoading(false);
    }
  };

  // Function to render 3Dmol.js model in the viewer
  

  return (
    <div className="App">
      <h1>Protein Visualization</h1>
      <input
        type="text"
        value={uniprotAccession}
        onChange={(e) => setUniprotAccession(e.target.value)}
        placeholder="Enter UniProt Accession"
      />
      {loading ? <p>Loading...</p> : <button onClick={fetchProteinData}>Fetch Protein Data</button>}

      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      

      <div>
        <h2>Protein Name:</h2>
        {proteinName && (
          <div>
            <h3>{proteinName}</h3>
            </div>
            )}
      </div>
      {pdbText && <ProteinViewer pdbText={pdbText} />}
      
       
     
  </div>
  );
}

export default ProteinVisualization;
