# GIS IndexGen (Chapter 3 Technical Investigation)

This repository is the computational workflow artefact used in Chapter 3 (Technical Investigation). It implements a CWL-orchestrated pipeline that computes vegetation indices from multispectral imagery using Python band-math scripts. The workflow produces index matrices and can render GeoTIFF visualizations. In addition to the compute pipeline, this repo also includes the LivePublication integration components under `LP_compilation/` (HTML/JS + Pug templating, plus SQLite history handling).

## What this repository does

- Orchestrates index generation with Common Workflow Language in `CWL/Workflows/`.
- Uses Python band-math scripts in `CWL/Workflows/Modules/Scripts/` to calculate NDVI, RECI, NDRE, and GNDVI.
- Writes index matrices to disk as `.pickle` files (cached to avoid recomputation).
- Generates GeoTIFF images from index matrices via `tiff_gen.py`.
- Includes Pug templates for the prototype UI in `nodejs/views/`.

## Inputs

- CWL input YAMLs under `CWL/Workflow_inputs/` (for example `NDVI_10m.yaml`, `NDVI_20m.yaml`, `multi_workflow.yaml`).
- Each YAML lists `File` inputs with absolute paths into a Sentinel-2 Level-2A `.SAFE` directory structure (JP2 band files such as `.../IMG_DATA/R10m/..._B04_10m.jp2`).
- Optional color map name (e.g., `RdYlGn`) for TIFF rendering.
- `CWL/Workflow_inputs/Data/` contains supporting data files (e.g., `NZ.geojson`) and a helper script (`getData.py`).
- TODO: confirm which exact band combinations and resolutions are required for each workflow YAML and document them here.

## Outputs

- Band matrices and index matrices are written as `.pickle` files in the working directory.
  - Output naming is derived from the first band filename: the third underscore-separated token is replaced with the index name (see `gen_output_name()` in `index_def.py`).
- GeoTIFF images are written alongside the pickle outputs with the same base name and a `.tif` extension.
- TODO: confirm whether CWL outputs are redirected to a specific `CWL_output` directory in actual runs (not present in this repo).

## Quickstart (local run)

Create and activate a virtual environment, install requirements, then run a CWL workflow:
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt

# Run a single-index workflow (update YAML paths to your local Sentinel-2 data)
cwltool CWL/Workflows/Modules/index_def.cwl CWL/Workflow_inputs/NDVI_10m.yaml
```

Run the full workflow:
```bash
# Update paths inside CWL/Workflow_inputs/multi_workflow.yaml first
cwltool CWL/Workflows/multi_workflow.cwl CWL/Workflow_inputs/multi_workflow.yaml
```

## Workflow overview

- `CWL/Workflows/Modules/index_def.cwl` calls `index_def.py` to compute index matrices from band files.
- `CWL/Workflows/Modules/tiff_gen.cwl` calls `tiff_gen.py` to render GeoTIFFs from index pickles.
- `CWL/Workflows/workflow.cwl` and `CWL/Workflows/multi_workflow.cwl` compose the modules into single- and multi-index workflows.
- Example input files for these workflows are under `CWL/Workflow_inputs/`.

## Reproducibility notes

- Python dependencies are pinned in `Pipfile` and `requirements.txt` (Python 3.9 per `Pipfile`).
- Node dependencies (for the optional web viewer) are pinned in `nodejs/package-lock.json`.
- The index computation caches band and index matrices by filename; existing `.pickle` files skip recomputation unless `--force_recompute` is used.
- Sentinel-2 Level-2A data is not included; inputs must be prepared externally.

## How to cite
Zenodo DOI: (minted after release)  
GitHub: https://github.com/GusEllerm/GIS_IndexGen  
See `CITATION.cff` for citation metadata.

## License
Apache-2.0. See `LICENSE`.