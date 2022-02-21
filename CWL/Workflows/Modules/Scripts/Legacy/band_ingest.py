import glob
import logging
import argparse
import pathlib
from osgeo import gdal 
from file_handling import write_band_to_file

# Turn logging on
logging.getLogger().setLevel(logging.INFO)

def main():
    parser = argparse.ArgumentParser(description="Ingests band data from sentinal2, processing level 2A .SAFE data")
    subparser = parser.add_subparsers(help='help for subcommand', dest='subcomand')

    single_res_ingestion = subparser.add_parser('single_res', help="Ingests the set of bands corresponding to selected resolution")
    single_res_ingestion.add_argument('-rd', 
                        '--root-directory',
                        type=pathlib.Path, 
                        required=True,
                        help="The top directory of the .SAFE data")
    ingestion_group = single_res_ingestion.add_mutually_exclusive_group(required=True)
    ingestion_group.add_argument('-r10m',
                                default=False,
                                action='store_true',
                                help="Resolution of ingest data")
    ingestion_group.add_argument('-r20m',
                                default=False,
                                action='store_true',
                                help="Resolution of ingest data")
    ingestion_group.add_argument('-r60m',
                                default=False,
                                action='store_true',
                                help="Resolution of ingest data")

    multi_res_ingestion = subparser.add_parser('multi_res', help="Ingests all bands from all resolutions")
    multi_res_ingestion.add_argument('-r10m',
                                    type=pathlib.Path,
                                    required=True,
                                    help="r10m data directory")
    multi_res_ingestion.add_argument('-r20m',
                                    type=pathlib.Path,
                                    required=True,
                                    help="r20m data directory")
    multi_res_ingestion.add_argument('-r60m',
                                    type=pathlib.Path,
                                    required=True,
                                    help="r60m data directory")

    args = parser.parse_args()

    if "single_res" in args.subcomand:
        if args.r10m:
            if "R10m" in str(args.root_directory):
                ingest_10m(args.root_directory)
            else:
                print("Directory does not conform to R10m")
        elif args.r20m:
            if "R20m" in str(args.root_directory):
                ingest_20m(args.root_directory)
            else:
                print("Directory does not conform to R20m")        
        elif args.r60m:
            if "R60m" in str(args.root_directory):
                ingest_60m(args.root_directory)
            else:
                print("Directory does not conform to R60m")
    elif "multi_res" in args.subcomand:
        ingest_10m(args.r10m)
        ingest_20m(args.r20m)
        ingest_60m(args.r60m)
        

def ingest_10m(r10m_rel_dir):

    logging.info("Ingesting 10m bands")

    # 10m bands
    AOT_10m = str(list(r10m_rel_dir.glob('**/*AOT_10m*'))[0].resolve())
    B02_10m = str(list(r10m_rel_dir.glob('**/*B02_10m*'))[0].resolve())
    B03_10m = str(list(r10m_rel_dir.glob('**/*B03_10m*'))[0].resolve())
    B04_10m = str(list(r10m_rel_dir.glob('**/*B04_10m*'))[0].resolve())
    B08_10m = str(list(r10m_rel_dir.glob('**/*B08_10m*'))[0].resolve())
    TCI_10m = str(list(r10m_rel_dir.glob('**/*TCI_10m*'))[0].resolve())
    WVP_10m = str(list(r10m_rel_dir.glob('**/*WVP_10m*'))[0].resolve())

    # # Open each band in gdal
    AOT_10m_link = gdal.Open(AOT_10m)
    B02_10m_link = gdal.Open(B02_10m)
    B03_10m_link = gdal.Open(B03_10m)
    B04_10m_link = gdal.Open(B04_10m)
    B08_10m_link = gdal.Open(B08_10m)
    TCI_10m_link = gdal.Open(TCI_10m)
    WVP_10m_link = gdal.Open(WVP_10m)

    # # Read in each band as an array and cast to float
    AOT_10m_array = AOT_10m_link.ReadAsArray().astype(float)
    B02_10m_array = B02_10m_link.ReadAsArray().astype(float)
    B03_10m_array = B03_10m_link.ReadAsArray().astype(float)
    B04_10m_array = B04_10m_link.ReadAsArray().astype(float)
    B08_10m_array = B08_10m_link.ReadAsArray().astype(float)
    TCI_10m_array = TCI_10m_link.ReadAsArray().astype(float)
    WVP_10m_array = WVP_10m_link.ReadAsArray().astype(float)

    # # Write the arrays, geotransoform and projection to file as output
    write_band_to_file('AOT_10m',AOT_10m_array, AOT_10m_link)
    write_band_to_file('B02_10m',B02_10m_array, B02_10m_link)
    write_band_to_file('B03_10m',B03_10m_array, B03_10m_link)
    write_band_to_file('B04_10m',B04_10m_array, B04_10m_link)
    write_band_to_file('B08_10m',B08_10m_array, B08_10m_link)
    write_band_to_file('TCI_10m',TCI_10m_array, TCI_10m_link)
    write_band_to_file('WVP_10m',WVP_10m_array, TCI_10m_link)

def ingest_20m(r20m_rel_dir):

    logging.info("Ingesting 20m bands")

    # 20m bands
    B01_20m = str(list(r20m_rel_dir.glob('**/*B01_20m*'))[0].resolve()) 
    B02_20m = str(list(r20m_rel_dir.glob('**/*B02_20m*'))[0].resolve())
    B03_20m = str(list(r20m_rel_dir.glob('**/*B03_20m*'))[0].resolve())
    B04_20m = str(list(r20m_rel_dir.glob('**/*B04_20m*'))[0].resolve())
    B05_20m = str(list(r20m_rel_dir.glob('**/*B05_20m*'))[0].resolve())
    B06_20m = str(list(r20m_rel_dir.glob('**/*B06_20m*'))[0].resolve())
    B07_20m = str(list(r20m_rel_dir.glob('**/*B07_20m*'))[0].resolve())
    B8A_20m = str(list(r20m_rel_dir.glob('**/*B8A_20m*'))[0].resolve())
    B11_20m = str(list(r20m_rel_dir.glob('**/*B11_20m*'))[0].resolve())
    B12_20m = str(list(r20m_rel_dir.glob('**/*B12_20m*'))[0].resolve())

    # Open each in gdal
    B01_20m_link = gdal.Open(B01_20m)
    B02_20m_link = gdal.Open(B02_20m)
    B03_20m_link = gdal.Open(B03_20m)
    B04_20m_link = gdal.Open(B04_20m)
    B05_20m_link = gdal.Open(B05_20m)
    B06_20m_link = gdal.Open(B06_20m)
    B07_20m_link = gdal.Open(B07_20m)
    B8A_20m_link = gdal.Open(B8A_20m)
    B11_20m_link = gdal.Open(B11_20m)
    B12_20m_link = gdal.Open(B12_20m)

    # Read in each band as an array and cast to float
    B01_20m_array = B01_20m_link.ReadAsArray().astype(float)
    B02_20m_array = B02_20m_link.ReadAsArray().astype(float)
    B03_20m_array = B03_20m_link.ReadAsArray().astype(float)
    B04_20m_array = B04_20m_link.ReadAsArray().astype(float)
    B05_20m_array = B05_20m_link.ReadAsArray().astype(float)
    B06_20m_array = B06_20m_link.ReadAsArray().astype(float)
    B07_20m_array = B07_20m_link.ReadAsArray().astype(float)
    B8A_20m_array = B8A_20m_link.ReadAsArray().astype(float)
    B11_20m_array = B11_20m_link.ReadAsArray().astype(float)
    B12_20m_array = B12_20m_link.ReadAsArray().astype(float)

    # Write the arrays, geotransoform and projection to file as output
    write_band_to_file('B01_20m',B01_20m_array, B01_20m_link)
    write_band_to_file('B02_20m',B02_20m_array, B02_20m_link)
    write_band_to_file('B03_20m',B03_20m_array, B03_20m_link)
    write_band_to_file('B04_20m',B04_20m_array, B04_20m_link)
    write_band_to_file('B05_20m',B05_20m_array, B05_20m_link)
    write_band_to_file('B06_20m',B06_20m_array, B06_20m_link)
    write_band_to_file('B07_20m',B07_20m_array, B07_20m_link)
    write_band_to_file('B8A_20m',B8A_20m_array, B8A_20m_link)
    write_band_to_file('B11_20m',B11_20m_array, B11_20m_link)
    write_band_to_file('B12_20m',B12_20m_array, B12_20m_link)
    
    

def ingest_60m(r60m_rel_dir):

    logging.info("Ingesting 60m bands")
    
    # 60m bands
    AOT_60m = str(list(r60m_rel_dir.glob('**/*AOT_60m*'))[0].resolve()) 
    B01_60m = str(list(r60m_rel_dir.glob('**/*B01_60m*'))[0].resolve())
    B02_60m = str(list(r60m_rel_dir.glob('**/*B02_60m*'))[0].resolve())
    B03_60m = str(list(r60m_rel_dir.glob('**/*B03_60m*'))[0].resolve())
    B04_60m = str(list(r60m_rel_dir.glob('**/*B04_60m*'))[0].resolve())
    B05_60m = str(list(r60m_rel_dir.glob('**/*B05_60m*'))[0].resolve())
    B06_60m = str(list(r60m_rel_dir.glob('**/*B06_60m*'))[0].resolve())
    B07_60m = str(list(r60m_rel_dir.glob('**/*B07_60m*'))[0].resolve())
    B8A_60m = str(list(r60m_rel_dir.glob('**/*B8A_60m*'))[0].resolve())
    B09_60m = str(list(r60m_rel_dir.glob('**/*B09_60m*'))[0].resolve())
    B11_60m = str(list(r60m_rel_dir.glob('**/*B11_60m*'))[0].resolve())
    B12_60m = str(list(r60m_rel_dir.glob('**/*B12_60m*'))[0].resolve())
    SCL_60m = str(list(r60m_rel_dir.glob('**/*SCL_60m*'))[0].resolve())
    TCI_60m = str(list(r60m_rel_dir.glob('**/*TCI_60m*'))[0].resolve())
    WVP_60m = str(list(r60m_rel_dir.glob('**/*WVP_60m*'))[0].resolve())

    # Open each in gdal
    AOT_60m_link = gdal.Open(AOT_60m)
    B01_60m_link = gdal.Open(B01_60m)
    B02_60m_link = gdal.Open(B02_60m)
    B03_60m_link = gdal.Open(B03_60m)
    B04_60m_link = gdal.Open(B04_60m)
    B05_60m_link = gdal.Open(B05_60m)
    B06_60m_link = gdal.Open(B06_60m)
    B07_60m_link = gdal.Open(B07_60m)
    B8A_60m_link = gdal.Open(B8A_60m)
    B09_60m_link = gdal.Open(B09_60m)
    B11_60m_link = gdal.Open(B11_60m)
    B12_60m_link = gdal.Open(B12_60m)
    SCL_60m_link = gdal.Open(SCL_60m)
    TCI_60m_link = gdal.Open(TCI_60m)
    WVP_60m_link = gdal.Open(WVP_60m)

    # Read in each band as an array and cast to float
    AOT_60m_array = AOT_60m_link.ReadAsArray().astype(float)
    B01_60m_array = B01_60m_link.ReadAsArray().astype(float)
    B02_60m_array = B02_60m_link.ReadAsArray().astype(float)
    B03_60m_array = B03_60m_link.ReadAsArray().astype(float)
    B04_60m_array = B04_60m_link.ReadAsArray().astype(float)
    B05_60m_array = B05_60m_link.ReadAsArray().astype(float)
    B06_60m_array = B06_60m_link.ReadAsArray().astype(float)
    B07_60m_array = B07_60m_link.ReadAsArray().astype(float)
    B8A_60m_array = B8A_60m_link.ReadAsArray().astype(float)
    B09_60m_array = B09_60m_link.ReadAsArray().astype(float)
    B11_60m_array = B11_60m_link.ReadAsArray().astype(float)
    B12_60m_array = B12_60m_link.ReadAsArray().astype(float)
    SCL_60m_array = SCL_60m_link.ReadAsArray().astype(float)
    TCI_60m_array = TCI_60m_link.ReadAsArray().astype(float)
    WVP_60m_array = WVP_60m_link.ReadAsArray().astype(float)

    # Write the arrays, geotransoform and projection to file as output
    write_band_to_file('AOT_60m',AOT_60m_array, AOT_60m_link)
    write_band_to_file('B01_60m',B01_60m_array, B01_60m_link)
    write_band_to_file('B02_60m',B02_60m_array, B02_60m_link)
    write_band_to_file('B03_60m',B03_60m_array, B03_60m_link)
    write_band_to_file('B04_60m',B04_60m_array, B04_60m_link)
    write_band_to_file('B05_60m',B05_60m_array, B05_60m_link)
    write_band_to_file('B06_60m',B06_60m_array, B06_60m_link)
    write_band_to_file('B07_60m',B07_60m_array, B07_60m_link)
    write_band_to_file('B8A_60m',B8A_60m_array, B8A_60m_link)
    write_band_to_file('B09_60m',B09_60m_array, B09_60m_link)
    write_band_to_file('B11_60m',B11_60m_array, B11_60m_link)
    write_band_to_file('B12_60m',B12_60m_array, B12_60m_link)
    write_band_to_file('SCL_60m',SCL_60m_array, SCL_60m_link)
    write_band_to_file('TCI_60m',TCI_60m_array, TCI_60m_link)
    write_band_to_file('WVP_60m',WVP_60m_array, WVP_60m_link)


if __name__ == "__main__":
    main()