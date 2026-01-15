#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from typing import Iterable

from rocrate.model.contextentity import ContextEntity
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

VERSION = "1.0.1"
TITLE = "GIS IndexGen (Technical Investigation)"
DESCRIPTION = (
    "CWL workflows and Python scripts to compute vegetation indices "
    "(NDVI, RECI, NDRE, GNDVI) from multispectral band inputs and render "
    "GeoTIFF outputs, with an optional Node.js web viewer."
)
REPO_URL = "https://github.com/GusEllerm/GIS_IndexGen"
LICENSE = "https://www.apache.org/licenses/LICENSE-2.0"
SOFTWARE_ID = "#software"
ORCID = "https://orcid.org/0000-0001-8260-231X"
CREATOR_NAME = "Augustus Ellerm"

KEY_PATHS = [
    "README.md",
    "LICENSE",
    "CITATION.cff",
    "codemeta.json",
    ".zenodo.json",
    "requirements.txt",
    "Pipfile",
    "Pipfile.lock",
    "package.json",
    "package-lock.json",
    "CWL",
    "CWL/Workflows/Modules/Scripts/index_def.py",
    "CWL/Workflows/Modules/Scripts/tiff_gen.py",
    "CWL/Workflows/Modules/Scripts/file_handling.py",
    "CWL/Workflows/Modules/index_def.cwl",
    "CWL/Workflows/Modules/tiff_gen.cwl",
    "CWL/Workflows/workflow.cwl",
    "CWL/Workflows/multi_workflow.cwl",
    "CWL/Workflow_inputs/multi_workflow.yaml",
    "CWL/Workflow_inputs/NDVI_10m.yaml",
    "CWL/Workflow_inputs/NDVI_20m.yaml",
    "CWL/Workflow_inputs/NDRE_20m.yaml",
    "CWL/Workflow_inputs/GNDVI_20m.yaml",
    "CWL/Workflow_inputs/RECI_10m.yaml",
    "CWL/Workflow_inputs/Data/NZ.geojson",
    "nodejs",
    "nodejs/app.ts",
    "nodejs/bin/www",
    "nodejs/package.json",
    "LP_compilation",
    "LP_compilation/compile.ts",
    "scripts/generate_ro_crate.py",
    "scripts/validate_metadata.py",
]


def _normalize_paths(paths: Iterable[str]) -> list[str]:
    return sorted({Path(path).as_posix() for path in paths})


def _entity_id(entity) -> str:
    if isinstance(entity, dict):
        return entity.get("@id", "")
    return getattr(entity, "id", "")


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    crate = ROCrate()

    root_dataset = crate.root_dataset
    root_dataset["name"] = TITLE
    root_dataset["description"] = DESCRIPTION
    root_dataset["license"] = LICENSE
    root_dataset["version"] = VERSION

    creator = crate.add(
        Person(
            crate,
            ORCID,
            properties={
                "name": CREATOR_NAME,
            },
        )
    )
    root_dataset["creator"] = creator

    software = crate.add(
        ContextEntity(
            crate,
            SOFTWARE_ID,
            properties={
                "@type": "SoftwareSourceCode",
                "name": TITLE,
                "description": DESCRIPTION,
                "codeRepository": REPO_URL,
                "license": LICENSE,
                "version": VERSION,
            },
        )
    )
    root_dataset["mainEntity"] = software

    crate.metadata["conformsTo"] = {"@id": "https://w3id.org/ro/crate/1.1"}

    added_paths: set[str] = set()
    for rel_path in _normalize_paths(KEY_PATHS):
        abs_path = repo_root / rel_path
        if not abs_path.exists():
            raise FileNotFoundError(f"Missing path for RO-Crate: {rel_path}")
        if rel_path in added_paths:
            continue
        if abs_path.is_dir():
            entity = crate.add_directory(source=rel_path, dest_path=rel_path)
        else:
            entity = crate.add_file(source=rel_path, dest_path=rel_path)
        added_paths.add(rel_path)

    # Deduplicate hasPart entries by @id to avoid rocrate add pitfalls.
    unique_parts = []
    seen_ids: set[str] = set()
    for part in root_dataset.get("hasPart", []):
        part_id = _entity_id(part)
        if not part_id or part_id in seen_ids:
            continue
        seen_ids.add(part_id)
        unique_parts.append(part)
    root_dataset["hasPart"] = unique_parts

    crate.metadata.write(repo_root)


if __name__ == "__main__":
    main()

