
from tiff_gen import *
from band_Ingest import *
from file_handling import read_band_from_file
import numpy as np

def main():
    
    ## Examples - uncomment and comment out prev to run new example file
    # # Example 1
    # data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GLL_20220208T001202.SAFE/'
    # r10m_dir = 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R10m/'
    # r20m_dir = 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R20m/'
    # r60m_dir = 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R60m/'

    # Example 2
    data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMK_20220208T001202.SAFE/'
    r10m_dir = 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R10m/'
    r20m_dir = 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R20m/'
    r60m_dir = 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R60m/'

    # # Example 3
    # data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMN_20220208T001202.SAFE/'
    # r10m_dir = 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R10m/'
    # r20m_dir = 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R20m/'
    # r60m_dir = 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R60m/'

    colour = 'Scripts/Sup data/col.txt' 
        
    # Run the ingestion on different resolutions
    # ingest_10m(data_dir, r10m_dir)
    # ingest_20m(data_dir, r20m_dir)
    # ingest_60m(data_dir, r60m_dir)


    ## Example index calculation
    # First, we need to extract the stored info from the ingestion 
    B8A_20m = read_band_from_file('B8A_20m')
    # B04_20m = read_band_from_file('B04_20m')
    B03_20m = read_band_from_file('B03_20m')

    # Now we can do the index calculation and tiff generation
    # gen_NDVI(B8A_20m[0], B04_20m[0], B8A_20m[1], B8A_20m[2])
    # gen_RECI(B8A_20m[0], B04_20m[0], B8A_20m[1], B8A_20m[2])
    get_GNDVI(B8A_20m[0], B03_20m[0], B8A_20m[1], B8A_20m[2])


if __name__ == "__main__":
    main()
