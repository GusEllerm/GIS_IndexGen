import logging
import argparse
import pathlib
import os
from re import L
from file_handling import read_index_from_file, read_band_from_file
from osgeo import gdal 

# Turn logging on
logging.getLogger().setLevel(logging.INFO)

def main():
    parser = argparse.ArgumentParser(description="Creates TIFF images from index files. Different Color reliefs can be applied")
    parser.add_argument('-i',
                        '--index_file',
                        type=pathlib.Path,
                        required=True,
                        help="Previously calculated matrix")
    parser.add_argument('-c',
                        '--color',
                        type=pathlib.Path,
                        required=False,
                        help="A color profile for the resulting TiFF output")
    parser.add_argument('-f',
                        '--force_recompute',
                        action='store_true')

    args = parser.parse_args()


    if (args.force_recompute):
        logging.info("Forced recomputation - recomputing ...")

    print(args)

    generate_tiff(args.index_file, args.color, args.force_recompute)


## Image generation
def generate_tiff(index, color, recompute):
    logging.info('-'*80)
    logging.info("Creating {}.tiff".format(index.stem))
    outfile = pathlib.Path(index).with_suffix('.tif')

    # Check if tiff already exists for this index
    if not (outfile.exists()) or recompute:
        logging.info("Tiff image does not exist. Creating ...")
        
        index = read_index_from_file(str(index))

        index_matrix, geotrans, projection = index[0], index[1], index[2] 
    
        # Get pixels for height and width
        x_pixels = index_matrix.shape[0]
        y_pixels = index_matrix.shape[1]

        # Set up GeoTIFF output
        driver = gdal.GetDriverByName('GTiff')

        # Create driver using filename, x & y pixels, # of bands and datatype
        matrix_driver = driver.Create(str(outfile), x_pixels, y_pixels, 1, gdal.GDT_Float32)

        # Set index array as the 1 output raster band
        matrix_driver.GetRasterBand(1).WriteArray(index_matrix)

        # Set geotransform parameters and projection on the output tiff
        matrix_driver.SetGeoTransform(geotrans)
        matrix_driver.SetProjection(projection)
        matrix_driver.FlushCache()
        matrix_driver = None

        if (color != None):
            logging.info("Color map provided. Generating tiff ...")
            # Apply Color relief
            os.system('gdaldem color-relief {} {} {}'.format(
            str(outfile),
            str(color),
            str(outfile)
            ))
        
    else:
        logging.info("{} exists! Skipping computation ...".format(str(outfile)))


if __name__ == "__main__":
    main()