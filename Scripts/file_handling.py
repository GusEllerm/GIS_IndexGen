from osgeo import gdal 
import pathlib
import numpy as np

def write_band_to_file(band_name, band_array, band_link):
    # extract the coord reference system 
    geotrans = band_link.GetGeoTransform()
    projection = band_link.GetProjection()

    # Write the band array, geotrans, and projection to a compressed file
    np.savez_compressed(band_name, band_array=band_array, geotrans=geotrans, projection=projection)

def write_index_to_file(index_name, index_array, band):
    # Write the index array to a file with index name
    geotrans = read_band_from_file(band.with_suffix('.npz').name)[1]
    projection = read_band_from_file(band.with_suffix('.npz').name)[2]
    np.savez_compressed(index_name, index_array=index_array, geotrans=geotrans, projection=projection)

def read_band_from_file(band):
    # Read the compressed file
    band_info = np.load(band)
    # np returns a dictionary containing the arrays within; return an array of arrays
    return [band_info['band_array'],tuple(band_info['geotrans']),str(band_info['projection'])]

def read_index_from_file(index_name):
    # Read the compressed file
    index_info = np.load(index_name)
    # return the array
    return [index_info['index_array'], tuple(index_info['geotrans']),str(index_info['projection'])]