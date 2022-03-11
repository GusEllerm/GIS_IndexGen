#!/usr/bin/env cwl-runner

cwlVersion: v1.0

requirements:
  MultipleInputFeatureRequirement: {}

class: Workflow
inputs:
  # ndvi 10m
  index_ndvi_10m:
    type: string
  bands_ndvi_10m:
    type: File[]
  color_ndvi_10m:
    type: string
  # ndvi 20m
  index_ndvi_20m:
    type: string
  bands_ndvi_20m:
    type: File[]
  color_ndvi_20m:
    type: string
  # GNDVI 10m
  index_gndvi_10m:
    type: string
  bands_gndvi_10m:
    type: File[]
  color_gndvi_10m:
    type: string
  # GNDVI 20m
  index_gndvi_20m:
    type: string
  bands_gndvi_20m:
    type: File[]
  color_gndvi_20m:
    type: string
  # NDRE 20m
  index_ndre_20m:
    type: string
  bands_ndre_20m:
    type: File[]
  color_ndre_20m:
    type: string
  # RECI 10m
  index_reci_10m:
    type: string
  bands_reci_10m:
    type: File[]
  color_reci_10m:
    type: string
  # RECI 20m
  index_reci_20m:
    type: string
  bands_reci_20m:
    type: File[]
  color_reci_20m:
    type: string

outputs:
  # ndvi 10m
  ndvi_10m_tiff:
    type: File
    outputSource: ndvi_10m_tiff/tiff
  # ndvi 20m
  ndvi_20m_tiff:
    type: File
    outputSource: ndvi_20m_tiff/tiff
  # gndvi 10m
  gndvi_10m_tiff:
    type: File
    outputSource: gndvi_10m_tiff/tiff
  # gndvi 20m
  gndvi_20m_tiff:
    type: File
    outputSource: gndvi_20m_tiff/tiff
  # ndre 20m
  ndre_20m_tiff:
    type: File
    outputSource: ndre_20m_tiff/tiff
  # reci 10m
  reci_10m_tiff:
    type: File
    outputSource: reci_10m_tiff/tiff
  # reci 20m
  reci_20m_tiff:
    type: File
    outputSource: reci_20m_tiff/tiff

steps:
  # NDVI 10m
  ndvi_10m:
    run: Modules/index_def.cwl
    in:
      index: index_ndvi_10m
      bands: bands_ndvi_10m
    out: [index_matrix, all_outputs]
  ndvi_10m_tiff:
    run: Modules/tiff_gen.cwl
    in:
      index_array: ndvi_10m/index_matrix
      color: color_ndvi_10m
    out: [tiff]
  # NDVI 20m
  ndvi_20m:
    run: Modules/index_def.cwl
    in:
      index: index_ndvi_20m
      bands: bands_ndvi_20m
    out: [index_matrix, all_outputs]
  ndvi_20m_tiff:
    run: Modules/tiff_gen.cwl
    in:
      index_array: ndvi_20m/index_matrix
      color: color_ndvi_20m
    out: [tiff]
  # GNDVI 10m
  gndvi_10m:
    run: Modules/index_def.cwl
    in:
      index: index_gndvi_10m
      bands: bands_gndvi_10m
    out: [index_matrix, all_outputs]
  gndvi_10m_tiff:
    run: Modules/tiff_gen.cwl
    in:
      index_array: gndvi_10m/index_matrix
      color: color_gndvi_10m
    out: [tiff]
  # GNDVI 20m
  gndvi_20m:
    run: Modules/index_def.cwl
    in:
      index: index_gndvi_20m
      bands: bands_gndvi_20m
    out: [index_matrix, all_outputs]
  gndvi_20m_tiff:
    run: Modules/tiff_gen.cwl
    in: 
      index_array: gndvi_20m/index_matrix
      color: color_gndvi_20m
    out: [tiff]
  # ndre 20m
  ndre_20m:
    run: Modules/index_def.cwl
    in:
      index: index_ndre_20m
      bands: bands_ndre_20m
    out: [index_matrix, all_outputs]
  ndre_20m_tiff:
    run: Modules/tiff_gen.cwl
    in:
      index_array: ndre_20m/index_matrix
      color: color_ndre_20m
    out: [tiff]
  # reci 10m
  reci_10m:
    run: Modules/index_def.cwl
    in:
      index: index_reci_10m
      bands: bands_reci_10m
    out: [index_matrix, all_outputs]
  reci_10m_tiff:
    run: Modules/tiff_gen.cwl
    in:
      index_array: reci_10m/index_matrix
      color: color_reci_10m
    out: [tiff]
  # reci 20m
  reci_20m:
    run: Modules/index_def.cwl
    in:
      index: index_reci_20m
      bands: bands_reci_20m
    out: [index_matrix, all_outputs]
  reci_20m_tiff:
    run: Modules/tiff_gen.cwl
    in: 
      index_array: reci_20m/index_matrix
      color: color_reci_20m
    out: [tiff]
