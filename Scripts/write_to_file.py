from osgeo import gdal 
import numpy as np

out_dir = "Workflow outputs/Intermediate outputs/Band arrays/"

def write_to_file(band_name, band_array, band_link):
    ## Example writing to file process
    # np.savez_compressed("OutputArrays/testArray_bytes", B12_20m_array=B12_20m_array)
    # test_array = np.load("OutputArrays/testArray_bytes.npz")
    # print(test_array['B12_20m_array'])

    # extract the coord reference system 
    geotrans = band_link.GetGeoTransform()
    projection = band_link.GetProjection()

    # Write the band array, geotrans, and projection to a compressed file
    np.savez_compressed(out_dir + band_name, band_array=band_array, geotrans=geotrans, projection=projection)
