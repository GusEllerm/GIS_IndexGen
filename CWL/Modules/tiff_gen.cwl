#!/usr/bin/env cwl-runner

cwlVersion: v1.0
class: CommandLineTool

baseCommand: ["python3"]
arguments: [$(inputs.tiff_gen)]

requirements:
  ResourceRequirement:
    ramMin: 4096

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
    type: string
    inputBinding:
      position: 2
      prefix: -c

outputs:
  tiff:
    type: File
    outputBinding:
      glob: "*.tif"