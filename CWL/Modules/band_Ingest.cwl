#!/usr/bin/env cwl-runner

cwlVersion: v1.0
class: CommandLineTool

baseCommand: ["python3"]
arguments: [$(inputs.band_ingest)]

inputs:
  band_ingest:
    type: File
    default:
      class: File
      location: /Users/eller/Projects/NDVI_Prototype/Scripts/band_ingest.py
      secondaryFiles:
        - class: File
          location: /Users/eller/Projects/NDVI_Prototype/Scripts/file_handling.py

  multi_res:
    type: string
    inputBinding:
      position: 1
    
  -r10m:
    type: Directory
    inputBinding: 
      prefix: -r10m
      position: 2

  -r20m:
    type: Directory
    inputBinding: 
      prefix: -r20m
      position: 3

  -r60m:
    type: Directory
    inputBinding: 
      prefix: -r60m
      position: 4

outputs: 

  AOT_10m:
    type: File
    outputBinding:
      glob: AOT_10m.npz
  B02_10m:
    type: File
    outputBinding:
      glob: B02_10m.npz
  B03_10m:
    type: File
    outputBinding:
      glob: B03_10m.npz
  B04_10m:
    type: File
    outputBinding:
      glob: B04_10m.npz
  B08_10m:
    type: File
    outputBinding:
      glob: B08_10m.npz
  TCI_10m:
    type: File
    outputBinding:
      glob: TCI_10m.npz
  WVP_10m:
    type: File
    outputBinding:
      glob: WVP_10m.npz
  B01_20m:
    type: File
    outputBinding:
      glob: B01_20m.npz
  B02_20m:
    type: File
    outputBinding:
      glob: B02_20m.npz
  B03_20m:
    type: File
    outputBinding:
      glob: B03_20m.npz
  B04_20m:
    type: File
    outputBinding:
      glob: B04_20m.npz
  B05_20m:
    type: File
    outputBinding:
      glob: B05_20m.npz
  B06_20m:
    type: File
    outputBinding:
      glob: B06_20m.npz
  B07_20m:
    type: File
    outputBinding:
      glob: B07_20m.npz
  B8A_20m:
    type: File
    outputBinding:
      glob: B8A_20m.npz
  B11_20m:
    type: File
    outputBinding:
      glob: B11_20m.npz
  B12_20m:
    type: File
    outputBinding:
      glob: B12_20m.npz
  AOT_60m:
    type: File
    outputBinding:
      glob: AOT_60m.npz
  B01_60m:
    type: File
    outputBinding:
      glob: B01_60m.npz
  B02_60m:
    type: File
    outputBinding:
      glob: B02_60m.npz
  B03_60m:
    type: File
    outputBinding:
      glob: B03_60m.npz
  B04_60m:
    type: File
    outputBinding:
      glob: B04_60m.npz
  B05_60m:
    type: File
    outputBinding:
      glob: B05_60m.npz
  B06_60m:
    type: File
    outputBinding:
      glob: B06_60m.npz
  B07_60m:
    type: File
    outputBinding:
      glob: B07_60m.npz
  B8A_60m:
    type: File
    outputBinding:
      glob: B8A_60m.npz
  B09_60m:
    type: File
    outputBinding:
      glob: B09_60m.npz
  B11_60m:
    type: File
    outputBinding:
      glob: B11_60m.npz
  B12_60m:
    type: File
    outputBinding:
      glob: B12_60m.npz
  SCL_60m:
    type: File
    outputBinding:
      glob: SCL_60m.npz
  TCI_60m:
    type: File
    outputBinding:
      glob: TCI_60m.npz
  WVP_60m:
    type: File
    outputBinding:
      glob: WVP_60m.npz

