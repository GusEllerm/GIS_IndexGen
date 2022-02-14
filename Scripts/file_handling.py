from osgeo import gdal 
import numpy as np

# out_dir_band = "Workflow outputs/Intermediate outputs/Band arrays/"
# out_dir_index = "Workflow outputs/Intermediate outputs/Index arrays/"

out_dir_band = ""
out_dir_index = ""

def write_band_to_file(band_name, band_array, band_link):
    # extract the coord reference system 
    geotrans = band_link.GetGeoTransform()
    projection = band_link.GetProjection()

    # Write the band array, geotrans, and projection to a compressed file
    np.savez_compressed(out_dir_band + band_name, band_array=band_array, geotrans=geotrans, projection=projection)

def write_index_to_file(index_name, index_array):
    # Write the index array to a file with index name
    np.savez_compressed(out_dir_index + index_name, index_array=index_array)

def read_band_from_file(band_name):
    # Read the compressed file
    band_info = np.load(out_dir_band + band_name + '.npz')
    # np returns a dictionary containing the arrays within; return an array of arrays
    return [band_info['band_array'],tuple(band_info['geotrans']),str(band_info['projection'])]

def read_index_from_file(index_name):
    # Read the compressed file
    index_info = np.load(out_dir_index + index_name + '.npz')
    # return the array
    return index_info['index_array']