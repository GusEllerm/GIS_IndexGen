#!/usr/bin/env cwl-runner

cwlVersion: v1.0
class: CommandLineTool

baseCommand: ["python3"]
arguments: [$(inputs.tiff_gen)]

inputs:
  tiff_gen: 
    type: File
    default:
      class: File
      location: /Users/eller/Projects/NDVI_Prototype/Scripts/tiff_gen.py
      secondaryFiles: 
        - class: File
          location: /Users/eller/Projects/NDVI_Prototype/Scripts/file_handling.py

  index_array:
    type: File
    inputBinding:
      position: 1
      prefix: -i

  color: 
    type: File
    inputBinding:
      position: 2
      prefix: -c

outputs:
  tif:
    type: File
    outputBinding:
      glob: "*.tif"