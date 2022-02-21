#!/usr/bin/env cwl-runner

cwlVersion: v1.0
class: CommandLineTool
baseCommand: echo
inputs: 
    script_location:
        type: Directory
        label: "Script directory"
        inputBinding:
            position: 1
outputs: []