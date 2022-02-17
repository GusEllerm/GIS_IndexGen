#!/usr/bin/env cwl-runner

cwlVersion: v1.0
class: CommandLineTool

baseCommand: ["python3"]
arguments: [$(inputs.index_def)]
requirements: 
  InlineJavascriptRequirement: {}

inputs: 
  index_def:
    type: File
    default:
      class: File
      location: /Users/eller/Projects/NDVI_Prototype/Scripts/index_def.py
      secondaryFiles:
        - class: File
          location: /Users/eller/Projects/NDVI_Prototype/Scripts/file_handling.py

  index:
    type: string
    inputBinding:
      position: 1
      prefix: -i

  bands:
    type: File[]
    inputBinding:
        prefix: -b
        separate: true
        position: 2

outputs: 
  index_matrix:
    type: File
    outputBinding:
      glob: "*$(inputs.index)*.pickle"

  all_outputs:
    type: File[]
    outputBinding: 
      glob: "*.pickle"

    
  

