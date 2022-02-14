import logging
from file_handling import read_index_from_file
from index_def import *
from osgeo import gdal 
import os

## Image generation
# NDVI
def NDVI_tiff(geotrans, projection):

    logging.info("Creating NDVI tiff")

    outfile_name = 'Workflow outputs/Final outputs/Figures/NDVI.tif'
    ndvi_result = read_index_from_file('NDVI')

    # Get pixels for hight and width
    x_pixels = ndvi_result.shape[0]
    y_pixels = ndvi_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype
    ndvi_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set NDVI array as the 1 output raster band
    ndvi_data.GetRasterBand(1).WriteArray(ndvi_result)

    # Set geotransform parameters and projection on the output tiff
    ndvi_data.SetGeoTransform(geotrans)
    ndvi_data.SetProjection(projection)
    ndvi_data.FlushCache()
    ndvi_data = None
    
    root_dir = os.path.abspath(os.curdir)
    os.system('gdaldem color-relief {} {} {}'.format(
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/NDVI.tif" + '"',
    '"' + root_dir + "/Scripts/color_data/col.txt" + '"',
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/NDVI_color.tif" + '"'
    ))

def RECI_tiff(geotrans, projection):

    logging.info("Creating RECI tiff")

    outfile_name = 'Workflow outputs/Final outputs/Figures/RECI.tif'
    reci_result = read_index_from_file('RECI')

    # Get pixels for height and width
    x_pixels = reci_result.shape[0]
    y_pixels = reci_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype 
    reci_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set RECI array as teh 1 output raster band
    reci_data.GetRasterBand(1).WriteArray(reci_result)

    # Set geotransform parameters and projection on the output tiff
    reci_data.SetGeoTransform(geotrans)
    reci_data.SetProjection(projection)
    reci_data.FlushCache()
    reci_data = None

    root_dir = os.path.abspath(os.curdir)
    os.system('gdaldem color-relief {} {} {}'.format(
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/RECI.tif" + '"',
    '"' + root_dir + "/Scripts/color_data/col.txt" + '"',
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/RECI_color.tif" + '"'
    ))

def GNDVI_tiff(geotrans, projection):

    logging.info("Creating GNDVI tiff")
    
    outfile_name = 'Workflow outputs/Final outputs/Figures/GNDVI.tif'
    gndvi_result = read_index_from_file("GNDVI")

    # Get pixels for height and width
    x_pixels = gndvi_result.shape[0]
    y_pixels = gndvi_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype 
    gndvi_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set RECI array as teh 1 output raster band
    gndvi_data.GetRasterBand(1).WriteArray(gndvi_result)

    # Set geotransform parameters and projection on the output tiff
    gndvi_data.SetGeoTransform(geotrans)
    gndvi_data.SetProjection(projection)
    gndvi_data.FlushCache()
    gndvi_data = None

    root_dir = os.path.abspath(os.curdir)
    os.system('gdaldem color-relief {} {} {}'.format(
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/GNDVI.tif" + '"',
    '"' + root_dir + "/Scripts/color_data/col.txt" + '"',
    '"' + root_dir + "/Workflow outputs/Final outputs/Figures/GNDVI_color.tif" + '"'
    ))
