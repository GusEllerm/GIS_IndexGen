#!/usr/bin/env cwl-runner

cwlVersion: v1.0

requirements:
  MultipleInputFeatureRequirement: {}
  ScatterFeatureRequirement: {}

class: Workflow
inputs:
  index_array:
    type: string[]
  band_array:
    type: 
      type: array
      items: array
        type: File
  color_array: 
    type: string[]

outputs:
  tiff:
    type: File[]
    outputSource: tiff_gen/tiff

steps:
  index_def:
    run: Modules/index_def.cwl
    scatter: [index, bands]
    scatterMethod: dotproduct
    in:
      index: index_array
      bands: band_array
    out: [index_matrix, all_outputs]

  tiff_gen:
    run: Modules/tiff_gen.cwl
    scatter: [color, index_array]
    scatterMethod: dotproduct
    in:
      index_array: index_def/index_matrix
      color: color_array
    out: [tiff]
