#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const FILTERS_DIR = path.join(process.cwd(), 'public', 'filters');

function humanMB(bytes){ return (bytes/1024/1024).toFixed(2) + ' MB'; }

function readGLBInfo(filePath){
  const buf = fs.readFileSync(filePath);
  if(buf.length < 28) throw new Error('File too small to be valid GLB');
  const magic = buf.readUInt32LE(0); // 0x46546C67 => 'glTF'
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  if(magic !== 0x46546C67) throw new Error('Invalid GLB magic');

  let meta = { version, length, nodes: null, meshes: null, materials: null };

  // First chunk: JSON
  const jsonChunkLength = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16); // 0x4E4F534A = 'JSON'
  if(jsonChunkType === 0x4E4F534A){
    const jsonStart = 20;
    const jsonEnd = jsonStart + jsonChunkLength;
    const jsonText = buf.slice(jsonStart, jsonEnd).toString('utf8');
    try {
      const gltf = JSON.parse(jsonText);
      // Basic counts
      meta.nodes = Array.isArray(gltf.nodes) ? gltf.nodes.length : null;
      meta.meshes = Array.isArray(gltf.meshes) ? gltf.meshes.length : null;
      meta.materials = Array.isArray(gltf.materials) ? gltf.materials.length : null;
    } catch(e){ /* ignore parse errors */ }
  }

  return meta;
}

function main(){
  if(!fs.existsSync(FILTERS_DIR)){
    console.log('No filters directory found at', FILTERS_DIR);
    process.exit(0);
  }

  const files = fs.readdirSync(FILTERS_DIR).filter(f=>f.toLowerCase().endsWith('.glb'));
  if(files.length === 0){
    console.log('No .glb files found in', FILTERS_DIR);
    process.exit(0);
  }

  console.log('Analyzing GLB files in', FILTERS_DIR, '\n');

  for(const f of files){
    const p = path.join(FILTERS_DIR, f);
    const stat = fs.statSync(p);
    const sizeMb = stat.size/1024/1024;
    let warn = [];
    try{
      const meta = readGLBInfo(p);
      console.log(`- ${f}`);
      console.log(`  Size: ${humanMB(stat.size)}${sizeMb>10? '  ⚠️ >10MB – consider optimizing' : ''}`);
      if(meta.version) console.log(`  GLB v${meta.version}; JSON length ~ ${(meta.length/1024).toFixed(0)} KB total`);
      if(meta.nodes!=null) console.log(`  Nodes: ${meta.nodes}`);
      if(meta.meshes!=null) console.log(`  Meshes: ${meta.meshes}`);
      if(meta.materials!=null) console.log(`  Materials: ${meta.materials}`);
      if(warn.length) console.log('  Warnings:', warn.join('; '));
      console.log('');
    }catch(err){
      console.log(`- ${f}`);
      console.log('  Error reading GLB:', err.message);
      console.log('');
    }
  }

  console.log('Done. Tips: Use mesh decimation, texture compression, and reduce vertex count for mobile.');
}

if(require.main === module){ main(); }

