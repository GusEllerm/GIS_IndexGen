#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

from ruamel.yaml import YAML

VERSION = "1.0.0"
ORCID_URL = "https://orcid.org/0000-0001-8260-231X"
ORCID_BARE = "0000-0001-8260-231X"

REQUIRED_FILES = [
    "README.md",
    "LICENSE",
    "CITATION.cff",
    "codemeta.json",
    ".zenodo.json",
    "ro-crate-metadata.json",
    "scripts/generate_ro_crate.py",
    "scripts/validate_metadata.py",
]


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_yaml(path: Path) -> dict:
    yaml = YAML(typ="safe")
    with path.open("r", encoding="utf-8") as handle:
        return yaml.load(handle)


def is_absolute_id(value: str) -> bool:
    return value.startswith("/") or Path(value).is_absolute()


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    errors: list[str] = []

    for rel_path in REQUIRED_FILES:
        if not (repo_root / rel_path).exists():
            errors.append(f"Missing required file: {rel_path}")

    if errors:
        _report(errors)
        sys.exit(1)

    citation = load_yaml(repo_root / "CITATION.cff")
    codemeta = load_json(repo_root / "codemeta.json")
    zenodo = load_json(repo_root / ".zenodo.json")
    rocrate = load_json(repo_root / "ro-crate-metadata.json")

    if citation.get("version") != VERSION:
        errors.append("CITATION.cff version is not 1.0.0")
    if codemeta.get("version") != VERSION:
        errors.append("codemeta.json version is not 1.0.0")
    if zenodo.get("version") != VERSION:
        errors.append(".zenodo.json version is not 1.0.0")

    graph = rocrate.get("@graph", [])
    dataset = next((item for item in graph if item.get("@id") == "./"), None)
    if not dataset:
        errors.append("RO-Crate root dataset (./) is missing")
        _report(errors)
        sys.exit(1)

    if dataset.get("version") != VERSION:
        errors.append("RO-Crate root dataset version is not 1.0.0")

    main_entity_ref = dataset.get("mainEntity")
    if isinstance(main_entity_ref, list):
        main_entity_ref = main_entity_ref[0] if main_entity_ref else None
    main_entity_id = (
        main_entity_ref.get("@id") if isinstance(main_entity_ref, dict) else None
    )
    main_entity = (
        next((item for item in graph if item.get("@id") == main_entity_id), None)
        if main_entity_id
        else None
    )
    if not main_entity:
        errors.append("RO-Crate mainEntity is missing or unresolved")
    elif main_entity.get("version") != VERSION:
        errors.append("RO-Crate mainEntity version is not 1.0.0")

    metadata_descriptor = next(
        (item for item in graph if item.get("@id") == "ro-crate-metadata.json"),
        None,
    )
    if not metadata_descriptor:
        errors.append("RO-Crate metadata descriptor is missing")
    else:
        conforms_to = metadata_descriptor.get("conformsTo", [])
        conforms_ids = {
            item.get("@id")
            for item in (conforms_to if isinstance(conforms_to, list) else [conforms_to])
            if isinstance(item, dict)
        }
        if "https://w3id.org/ro/crate/1.1" not in conforms_ids:
            errors.append("RO-Crate conformsTo does not include 1.1")
        about = metadata_descriptor.get("about")
        about_id = about.get("@id") if isinstance(about, dict) else None
        if about_id != "./":
            errors.append("RO-Crate metadata descriptor is not about ./")

    has_part = dataset.get("hasPart", [])
    part_ids: list[str] = []
    for part in has_part:
        if isinstance(part, dict) and part.get("@id"):
            part_ids.append(part["@id"])
        elif isinstance(part, str):
            part_ids.append(part)

    duplicates = {pid for pid in part_ids if part_ids.count(pid) > 1}
    if duplicates:
        errors.append(f"RO-Crate hasPart contains duplicates: {sorted(duplicates)}")

    for part_id in part_ids:
        if is_absolute_id(part_id):
            errors.append(f"RO-Crate hasPart uses absolute path: {part_id}")
            continue
        if ".." in Path(part_id).parts:
            errors.append(f"RO-Crate hasPart uses parent traversal: {part_id}")
            continue
        if not (repo_root / part_id).exists():
            errors.append(f"RO-Crate hasPart path missing: {part_id}")

    zenodo_creators = zenodo.get("creators", [])
    zenodo_orcids = {creator.get("orcid") for creator in zenodo_creators}
    if not (ORCID_URL in zenodo_orcids or ORCID_BARE in zenodo_orcids):
        errors.append("Zenodo ORCID is missing or not in a recognized form")

    citation_title = citation.get("title")
    codemeta_name = codemeta.get("name")
    zenodo_title = zenodo.get("title")
    rocrate_name = dataset.get("name")
    if len({citation_title, codemeta_name, zenodo_title, rocrate_name}) != 1:
        errors.append("Title mismatch across CITATION, CodeMeta, Zenodo, or RO-Crate")

    def normalize_license(value: str | None) -> str | None:
        if not value:
            return value
        if value.lower() in {"apache-2.0", "apache 2.0"}:
            return "apache-2.0"
        if value in {"https://www.apache.org/licenses/LICENSE-2.0"}:
            return "apache-2.0"
        return value.lower()

    citation_license = normalize_license(citation.get("license"))
    codemeta_license = normalize_license(codemeta.get("license"))
    zenodo_license = normalize_license(zenodo.get("license"))
    rocrate_license = normalize_license(dataset.get("license"))
    if len({citation_license, codemeta_license, zenodo_license, rocrate_license}) != 1:
        errors.append("License mismatch across CITATION, CodeMeta, Zenodo, or RO-Crate")

    citation_orcid = None
    citation_authors = citation.get("authors", [])
    if citation_authors:
        citation_orcid = citation_authors[0].get("orcid")
    codemeta_orcid = None
    if codemeta.get("author"):
        codemeta_orcid = codemeta["author"][0].get("@id")
    creator = dataset.get("creator")
    rocrate_orcid = creator.get("@id") if isinstance(creator, dict) else None
    if len({citation_orcid, codemeta_orcid, rocrate_orcid, ORCID_URL}) != 1:
        errors.append("ORCID mismatch across CITATION, CodeMeta, or RO-Crate")

    _report(errors)
    sys.exit(1 if errors else 0)


def _report(errors: list[str]) -> None:
    if errors:
        print("❌ Metadata validation failed.")
        for error in errors:
            print(f" - {error}")
    else:
        print("✅ Metadata validation passed.")


if __name__ == "__main__":
    main()

