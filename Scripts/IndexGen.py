from distutils.filelist import findall
import glob
from xml.etree import ElementTree as ET
import numpy as np
from osgeo import gdal 
import os
from IndexGen_helper import *

# # Example 1
# data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GLL_20220208T001202.SAFE/'
# r10m_dir = data_dir + 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R10m/'
# r20m_dir = data_dir + 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R20m/'
# r60m_dir = data_dir + 'GRANULE/L2A_T59GLL_A034632_20220207T222543/IMG_DATA/R60m/'

# Example 2
data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMK_20220208T001202.SAFE/'
r10m_dir = data_dir + 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R10m/'
r20m_dir = data_dir + 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R20m/'
r60m_dir = data_dir + 'GRANULE/L2A_T59GMK_A034632_20220207T222543/IMG_DATA/R60m/'

# # Example 3
# data_dir = 'Data/S2A_MSIL2A_20220207T222541_N0400_R029_T59GMN_20220208T001202.SAFE/'
# r10m_dir = data_dir + 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R10m/'
# r20m_dir = data_dir + 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R20m/'
# r60m_dir = data_dir + 'GRANULE/L2A_T59GMN_A034632_20220207T222543/IMG_DATA/R60m/'

colour = 'col.txt' 

# Directories for level 2A processed data
r10m_dir = ''

# R10 bands
AOT_10m = glob.glob(r10m_dir + '**AOT_10m.jpg')
B02_10m = glob.glob(r10m_dir + '**B02_10m.jpg')
B03_10m = glob.glob(r10m_dir + '**B03_10m.jpg')
B04_10m = glob.glob(r10m_dir + '**B04_10m.jpg')
B08_10m = glob.glob(r10m_dir + '**B08_10m.jpg')
TCI_10m = glob.glob(r10m_dir + '**TCI_10m.jpg')
WVP_10m = glob.glob(r10m_dir + '**WVP_10m.jpg')

# R20 bands

B01_20m = glob.glob(r20m_dir + '**B01_20m.jp2') 
B02_20m = glob.glob(r20m_dir + '**B02_20m.jp2')
B03_20m = glob.glob(r20m_dir + '**B03_20m.jp2')
B04_20m = glob.glob(r20m_dir + '**B04_20m.jp2')
B05_20m = glob.glob(r20m_dir + '**B05_20m.jp2')
B06_20m = glob.glob(r20m_dir + '**B06_20m.jp2')
B07_20m = glob.glob(r20m_dir + '**B07_20m.jp2')
B8A_20m = glob.glob(r20m_dir + '**B8A_20m.jp2')
B11_20m = glob.glob(r20m_dir + '**B11_20m.jp2')
B12_20m = glob.glob(r20m_dir + '**B12_20m.jp2')

# R60 bands
AOT_60m = glob.glob(r60m_dir + '**AOT_60m.jp2') 
B01_60m = glob.glob(r60m_dir + '**B01_60m.jp2')
B02_60m = glob.glob(r60m_dir + '**B02_60m.jp2')
B03_60m = glob.glob(r60m_dir + '**B03_60m.jp2')
B04_60m = glob.glob(r60m_dir + '**B04_60m.jp2')
B05_60m = glob.glob(r60m_dir + '**B05_60m.jp2')
B06_60m = glob.glob(r60m_dir + '**B06_60m.jp2')
B07_60m = glob.glob(r60m_dir + '**B07_60m.jp2')
B8A_60m = glob.glob(r60m_dir + '**B8A_60m.jp2')
B09_60m = glob.glob(r60m_dir + '**B09_60m.jp2')
B11_60m = glob.glob(r60m_dir + '**B11_60m.jp2')
B12_60m = glob.glob(r60m_dir + '**B12_60m.jp2')
SCL_60m = glob.glob(r60m_dir + '**SCL_60m.jp2')
TCI_60m = glob.glob(r60m_dir + '**TCI_60m.jp2')
WVP_60m = glob.glob(r60m_dir + '**WVP_60m.jp2')

# open each band in gdal
B01_20m_link = gdal.Open(B01_20m[0])
B02_20m_link = gdal.Open(B02_20m[0])
B03_20m_link = gdal.Open(B03_20m[0])
B04_20m_link = gdal.Open(B04_20m[0])
B05_20m_link = gdal.Open(B05_20m[0])
B06_20m_link = gdal.Open(B06_20m[0])
B07_20m_link = gdal.Open(B07_20m[0])
B8A_20m_link = gdal.Open(B8A_20m[0])
B11_20m_link = gdal.Open(B11_20m[0])
B12_20m_link = gdal.Open(B12_20m[0])

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

## Calculate indices
gen_NDVI(B8A_20m_array, B04_20m_array, B04_20m_link)
gen_RECI(B8A_20m_array, B04_20m_array, B04_20m_link)
get_GNDVI(B8A_20m_array, B03_20m_array, B03_20m_link)