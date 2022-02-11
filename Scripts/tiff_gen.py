from index_def import *
from osgeo import gdal 
import os

## Image generation
# NDVI
def gen_NDVI(nir, red, link):
    ndvi_result = ndvi(nir, red)
    outfile_name = 'Workflow outputs/Figures/NDVI.tif'

    # Get pixels for hight and width
    x_pixels = ndvi_result.shape[0]
    y_pixels = ndvi_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype
    ndvi_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set NDVI array as the 1 output raster band
    ndvi_data.GetRasterBand(1).WriteArray(ndvi_result)

    # Set up coord reference system of the output GeoTIFF
    geotrans = link.GetGeoTransform() #-> get input GeoTransform information
    projection = link.GetProjection() #-> get projection information

    # Set geotransform parameters and projection on the output tiff
    ndvi_data.SetGeoTransform(geotrans)
    ndvi_data.SetProjection(projection)
    ndvi_data.FlushCache()
    ndvi_data = None

    

    os.system('gdaldem color-relief {} {} {}'.format(
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/NDVI.tif"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Scripts/col.txt"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/NDVI_color.tif"'"'
    ))

    # print("#####################")
    # print(geotrans)
    # print(projection)
    # print("#####################")


def gen_RECI(nir, red, link):
    reci_result = reci(nir, red)
    outfile_name = 'Workflow outputs/Figures/RECI.tif'

    # Get pixels for height and width
    x_pixels = reci_result.shape[0]
    y_pixels = reci_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype 
    reci_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set RECI array as teh 1 output raster band
    reci_data.GetRasterBand(1).WriteArray(reci_result)

    # Set yp coord reference system of the output GeoTIFF
    geotrans = link.GetGeoTransform() #-> get input GeoTransform information
    projection = link.GetProjection() #-> get projection information

    # Set geotransform parameters and projection on the output tiff
    reci_data.SetGeoTransform(geotrans)
    reci_data.SetProjection(projection)
    reci_data.FlushCache()
    reci_data = None

    os.system('gdaldem color-relief {} {} {}'.format(
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/RECI.tif"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Scripts/col.txt"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/RECI_color.tif"'"'
    ))

def get_GNDVI(nir, green, link):
    gndvi_result = gndvi(nir, green)
    outfile_name = 'Workflow outputs/Figures/GNDVI.tif'

    # Get pixels for height and width
    x_pixels = gndvi_result.shape[0]
    y_pixels = gndvi_result.shape[1]

    # Set up GeoTIFF output
    driver = gdal.GetDriverByName('GTiff')

    # Create driver using filename, x & y pixels, # of bands and datatype 
    gndvi_data = driver.Create(outfile_name,x_pixels,y_pixels,1,gdal.GDT_Float32)

    # Set RECI array as teh 1 output raster band
    gndvi_data.GetRasterBand(1).WriteArray(gndvi_result)

    # Set yp coord reference system of the output GeoTIFF
    geotrans = link.GetGeoTransform() #-> get input GeoTransform information
    projection = link.GetProjection() #-> get projection information

    # Set geotransform parameters and projection on the output tiff
    gndvi_data.SetGeoTransform(geotrans)
    gndvi_data.SetProjection(projection)
    gndvi_data.FlushCache()
    gndvi_data = None

    os.system('gdaldem color-relief {} {} {}'.format(
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/GNDVI.tif"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Scripts/col.txt"'"',
    '"'"/Users/eller/Library/CloudStorage/OneDrive-Personal/NDVI Prototype/Workflow outputs/Final outputs/Figures/GNDVI_color.tif"'"'
    ))