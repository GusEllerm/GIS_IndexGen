from osgeo import gdal 
import numpy as np

out_dir = "Workflow outputs/Intermediate outputs/Band arrays/"

def write_band_to_file(band_name, band_array, band_link):
    # extract the coord reference system 
    geotrans = band_link.GetGeoTransform()
    projection = band_link.GetProjection()
    
    # Write the band array, geotrans, and projection to a compressed file
    np.savez_compressed(out_dir + band_name, band_array=band_array, geotrans=geotrans, projection=projection)

def read_band_from_file(band_name):
    # Read the compressed file
    band_info = np.load(out_dir + band_name + '.npz')
    # np returns a dictionary containing the arrays within; return an array of arrays

    return [band_info['band_array'],tuple(band_info['geotrans']),str(band_info['projection'])]
