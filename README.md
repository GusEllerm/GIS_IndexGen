readme currently out of date

# MODIS example

## Data source

MODIS data is pulled from google earth api. 
You will need a google account (for authen) which is regestered for dev work. 

## Files

MODIS.py contains high level code, pulling from MODIS_helper.py for image generation and some helper functions. 
Currently, the image data is of an area in frace. This is manually set. 

# Sentinal2 example

This is the primary example which will be used for the prototype

## Data source

Data is pulled from the Copernicus Open Access Hub's (https://scihub.copernicus.eu) API.
You need an account with Copernicus to access their API. 

Sentinal data is required to be of the highest processing level (2A) to maintain the proper file structure for processing. 
Product stiching is not yet supported, so only single products can be processed at once. 

## Files

IndexGen.py contains the high level code for calculating and outputting various GIS indexs. 
IndexGen pulls from IndexGen_helper.py which contains each index's definition, and image output functions. 
getData.py contains code to retrieve raw data (.SAFE format) from Copernicus's API. This uses the Sentinelsat package (https://sentinelsat.readthedocs.io/en/stable/api_overview.html).
Details on authentication to Copernicus can be found in the docs. 

