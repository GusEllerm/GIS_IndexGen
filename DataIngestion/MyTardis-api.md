# How to ingest data from the MyTardis API

## Prerequisites

- the hosted mytardis instance at `192.168.1.108` must be accessible
- API key should be provided in the HTTP request header

```http
Authorization: ApiKey <username>:<key>
```

- API keys can be added in the django admin panel -> API keys; they can be any string

## Some useful API methods

### Get a list of experiments

- type: `GET`
- endpoint: `/api/v1/experiment/`
- example response:

```json
{
    "meta": {
        "limit": 20,
        "next": null,
        "offset": 0,
        "previous": null,
        "total_count": 1
    },
    "objects": [
        {
            "approved": false,
            "authors": [
                {
                    "name": "ESA",
                    "url": null
                }
            ],
            "created_by": "/api/v1/user/2/",
            "created_time": "2022-02-21T15:08:03.358175",
            "datafile_count": 7,
            "dataset_count": 2,
            "description": "",
            "end_time": null,
            "experiment_size": 597905000,
            "handle": "",
            "id": 2,
            "institution_name": "University of Auckland",
            "locked": false,
            "owner_ids": [
                2
            ],
            "parameter_sets": [],
            "public_access": 1,
            "resource_uri": "/api/v1/experiment/2/",
            "start_time": null,
            "title": "Sentinel test",
            "update_time": "2022-02-24T10:49:58.777481",
            "url": null
        }
    ]
}
```

### Get a list of datasets

- type: `GET`
- endpoint: `/api/v1/dataset`
- useful query params(optional):
  - `experiments__id=<id>`
- example response:

```json
{
    "meta": {
        "limit": 20,
        "next": null,
        "offset": 0,
        "previous": null,
        "total_count": 1
    },
    "objects": [
        {
            "created_time": "2022-02-21T15:08:32.043165",
            "dataset_datafile_count": 7,
            "dataset_experiment_count": 1,
            "dataset_size": 597905000,
            "description": "NDVI 1",
            "directory": null,
            "experiments": [
                "/api/v1/experiment/2/"
            ],
            "id": 5,
            "immutable": false,
            "instrument": null,
            "modified_time": "2022-02-21T15:08:32.054977",
            "parameter_sets": [],
            "resource_uri": "/api/v1/dataset/5/"
        }
    ]
}
```

### Get a list of data files

- type: `GET`
- endpoint: `/api/v1/dataset_file`
- useful query params (optional):
  - `dataset__experiments__id=<experimentId>`
  - `dataset=<datasetId>`
- example response:

```json
{
    "meta": {
        "limit": 20,
        "next": null,
        "offset": 0,
        "previous": null,
        "total_count": 7
    },
    "objects": [
        {
            "created_time": "2022-02-22T13:57:20",
            "datafile": null,
            "dataset": "/api/v1/dataset/5/",
            "deleted": false,
            "deleted_time": null,
            "directory": "R10m",
            "filename": "T59GMK_20220207T222541_AOT_10m.jp2",
            "id": 50,
            "md5sum": "c900b6d93b99838c27ad8de3a89a119c",
            "mimetype": "image/jp2",
            "modification_time": "2022-02-22T13:57:21",
            "parameter_sets": [],
            "replicas": [
                {
                    "created_time": "2022-02-24T10:45:41.774499",
                    "datafile": "/api/v1/dataset_file/50/",
                    "id": 57,
                    "last_verified_time": "2022-02-24T10:49:32",
                    "location": "new-box at /srv/mytardis",
                    "resource_uri": "/api/v1/replica/57/",
                    "uri": "IMG_DATA/R10m/T59GMK_20220207T222541_AOT_10m.jp2",
                    "verified": true
                }
            ],
            "resource_uri": "/api/v1/dataset_file/50/",
            "sha512sum": "",
            "size": 905000,
            "version": 1
        },
        ...
    ]
}
```

## Using schema information for queries

The API doesn't allow to restrict a query based on information in the associated schema (metadata). This can only be done via the search API. As this isn't currently available on our MyTardis instance we can't use the schema directly in our queries. However, we can use the returned JSON objects to filter out files manually using the `parameter_sets` entry. An example for a dataset schema is shown below

```json
"parameter_sets": [
    {
        "dataset": "/api/v1/dataset/5/",
        "id": 1,
        "parameters": [
            {
                "datetime_value": null,
                "id": 1,
                "link_id": null,
                "name": "/api/v1/parametername/1/",
                "numerical_value": null,
                "parameterset": "/api/v1/datasetparameterset/1/",
                "resource_uri": "/api/v1/datasetparameter/1/",
                "string_value": "10",
                "value": null
            }
        ],
        "resource_uri": "/api/v1/datasetparameterset/1/",
        "schema": {
            "hidden": false,
            "id": 1,
            "immutable": false,
            "name": "sentinel-dataset-schema",
            "namespace": "http://192.168.1.108/sentinel-dataset-schema",
            "resource_uri": "/api/v1/schema/1/",
            "subtype": null,
            "type": 2
        }
    }
]
```

Note that `name` field doesn't return the actual name, but an api endpoint to get the name. For our intents it is probably enough to hardcode the parameterset id's into the workflow scripts and use that instead of the name. The value that can be seen in the web interface is stored in `string_value` (the name probably depends on the value type that is defined in the schema).

## Downloading files

Generally, there are 2 ways files can be downloaded via http:

1. individually via their IDs
2. as a dataset bundle (tar).

### 1. Individual Download

To get a datafile id the `/api/v1/dataset_file` endpoint can be used. For each id a download query can be created, so each file will be downloaded manually.

```http
GET /api/v1/dataset_file/<id>/download/
```

This can actually be advantageous because you could check the md5 checksums of the files to see if you have a version of it already cached somewhere locally before you actually download the file. Below is an example showing how

```bash
wget --header="Authorization: ApiKey <username>:<key>" --content-disposition http://192.168.1.108/api/v1/dataset_file/<id>/download/
```

### 2. Bundle Download (tar)

To get all files of a dataset (or experiment) at once the following api endpoint can be used.

```http
GET /download/<dataset or experiment>/<id>/tar/
```

```bash
wget -c 192.168.1.108/download/<dataset or experiment>/<id>/tar/ -O <filename>.tar
```

The dataset or experiment id can be queried with one of the api endpoints above.
