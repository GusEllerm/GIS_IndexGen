#!/usr/bin/env cwl-runner

cwlVersion: v1.0

requirements:
  MultipleInputFeatureRequirement: {}

class: Workflow
inputs: 
  multi_res:
    type: string
  -r10m:
    type: Directory
  -r20m:
    type: Directory
  -r60m:
    type: Directory
  index: 
    type: string
  band_array:
    type: File
  color:
    type: File

outputs: 
  tiff:
    type: File
    outputSource: tiff_gen/tiff

steps:
  band_ingest:
    run: Modules/band_Ingest.cwl
    in:
      multi_res: multi_res
      -r10m: -r10m
      -r20m: -r20m
      -r60m: -r60m
    out:
        [AOT_10m,
        B02_10m,
        B03_10m,
        B04_10m,
        B08_10m,
        TCI_10m,
        WVP_10m,
        B01_20m,
        B02_20m,
        B03_20m,
        B04_20m,
        B05_20m,
        B06_20m,
        B07_20m,
        B8A_20m,
        B11_20m,
        B12_20m,
        AOT_60m,
        B01_60m,
        B02_60m,
        B03_60m,
        B04_60m,
        B05_60m,
        B06_60m,
        B07_60m,
        B8A_60m,
        B09_60m,
        B11_60m,
        B12_60m,
        SCL_60m,
        TCI_60m,
        WVP_60m]
      

  index_def:
    run: Modules/index_def.cwl
    in: 
      index: index
      bands: 
      - band_ingest/B04_20m
      - band_ingest/B8A_20m
    out: 
      [index_matrix]

  tiff_gen:
    run: Modules/tiff_gen.cwl
    in:
      index_array: index_def/index_matrix
      band_array: band_array
      color: color
    out:
      [tiff]



