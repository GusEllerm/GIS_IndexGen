
from tiff_gen import *
from band_Ingest import *
import numpy as np

def main():
    
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
        
    ingest_10m(data_dir, r10m_dir)
    ingest_20m(data_dir, r20m_dir)
    ingest_60m(data_dir, r60m_dir)

    ## Example index calculation
    ## Calculate indices
    # gen_NDVI(B8A_20m_array, B04_20m_array, B04_20m_link)
    # gen_RECI(B8A_20m_array, B04_20m_array, B04_20m_link)
    # get_GNDVI(B8A_20m_array, B03_20m_array, B03_20m_link)

if __name__ == "__main__":
    main()
