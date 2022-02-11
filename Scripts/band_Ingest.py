import glob
from osgeo import gdal 
from write_to_file import write_to_file

def ingest_10m(root_dir, r10m_dir):

    r10m_rel_dir = root_dir + r10m_dir

    # 10m bands
    AOT_10m = glob.glob(r10m_rel_dir + '**AOT_10m.jp2')
    B02_10m = glob.glob(r10m_rel_dir + '**B02_10m.jp2')
    B03_10m = glob.glob(r10m_rel_dir + '**B03_10m.jp2')
    B04_10m = glob.glob(r10m_rel_dir + '**B04_10m.jp2')
    B08_10m = glob.glob(r10m_rel_dir + '**B08_10m.jp2')
    TCI_10m = glob.glob(r10m_rel_dir + '**TCI_10m.jp2')
    WVP_10m = glob.glob(r10m_rel_dir + '**WVP_10m.jp2')

    # Open each band in gdal
    AOT_10m_link = gdal.Open(AOT_10m[0])
    B02_10m_link = gdal.Open(B02_10m[0])
    B03_10m_link = gdal.Open(B03_10m[0])
    B04_10m_link = gdal.Open(B04_10m[0])
    B08_10m_link = gdal.Open(B08_10m[0])
    TCI_10m_link = gdal.Open(TCI_10m[0])
    WVP_10m_link = gdal.Open(WVP_10m[0])

    # Read in each band as an array and cast to float
    AOT_10m_array = AOT_10m_link.ReadAsArray().astype(float)
    B02_10m_array = B02_10m_link.ReadAsArray().astype(float)
    B03_10m_array = B03_10m_link.ReadAsArray().astype(float)
    B04_10m_array = B04_10m_link.ReadAsArray().astype(float)
    B08_10m_array = B08_10m_link.ReadAsArray().astype(float)
    TCI_10m_array = TCI_10m_link.ReadAsArray().astype(float)
    WVP_10m_array = WVP_10m_link.ReadAsArray().astype(float)

    # Write the arrays, geotransoform and projection to file as output
    write_to_file('AOT_10m',AOT_10m_array, AOT_10m_link)
    write_to_file('B02_10m',B02_10m_array, B02_10m_link)
    write_to_file('B03_10m',B03_10m_array, B03_10m_link)
    write_to_file('B04_10m',B04_10m_array, B04_10m_link)
    write_to_file('B08_10m',B08_10m_array, B08_10m_link)
    write_to_file('TCI_10m',TCI_10m_array, TCI_10m_link)
    write_to_file('WVP_10m',WVP_10m_array, TCI_10m_link)

def ingest_20m(root_dir, r20m_dir):

    r20m_rel_dir = root_dir + r20m_dir

    # 20m bands
    B01_20m = glob.glob(r20m_rel_dir + '**B01_20m.jp2') 
    B02_20m = glob.glob(r20m_rel_dir + '**B02_20m.jp2')
    B03_20m = glob.glob(r20m_rel_dir + '**B03_20m.jp2')
    B04_20m = glob.glob(r20m_rel_dir + '**B04_20m.jp2')
    B05_20m = glob.glob(r20m_rel_dir + '**B05_20m.jp2')
    B06_20m = glob.glob(r20m_rel_dir + '**B06_20m.jp2')
    B07_20m = glob.glob(r20m_rel_dir + '**B07_20m.jp2')
    B8A_20m = glob.glob(r20m_rel_dir + '**B8A_20m.jp2')
    B11_20m = glob.glob(r20m_rel_dir + '**B11_20m.jp2')
    B12_20m = glob.glob(r20m_rel_dir + '**B12_20m.jp2')

    # Open each in gdal
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

    # Write the arrays, geotransoform and projection to file as output
    write_to_file('B01_20m',B01_20m_array, B01_20m_link)
    write_to_file('B02_20m',B02_20m_array, B02_20m_link)
    write_to_file('B03_20m',B03_20m_array, B03_20m_link)
    write_to_file('B04_20m',B04_20m_array, B04_20m_link)
    write_to_file('B05_20m',B05_20m_array, B05_20m_link)
    write_to_file('B06_20m',B06_20m_array, B06_20m_link)
    write_to_file('B07_20m',B07_20m_array, B07_20m_link)
    write_to_file('B8A_20m',B8A_20m_array, B8A_20m_link)
    write_to_file('B11_20m',B11_20m_array, B11_20m_link)
    write_to_file('B12_20m',B12_20m_array, B12_20m_link)
    
    

def ingest_60m(root_dir, r60m_dir):
    
    r60m_rel_dir = root_dir + r60m_dir

    # 60m bands
    AOT_60m = glob.glob(r60m_rel_dir + '**AOT_60m.jp2') 
    B01_60m = glob.glob(r60m_rel_dir + '**B01_60m.jp2')
    B02_60m = glob.glob(r60m_rel_dir + '**B02_60m.jp2')
    B03_60m = glob.glob(r60m_rel_dir + '**B03_60m.jp2')
    B04_60m = glob.glob(r60m_rel_dir + '**B04_60m.jp2')
    B05_60m = glob.glob(r60m_rel_dir + '**B05_60m.jp2')
    B06_60m = glob.glob(r60m_rel_dir + '**B06_60m.jp2')
    B07_60m = glob.glob(r60m_rel_dir + '**B07_60m.jp2')
    B8A_60m = glob.glob(r60m_rel_dir + '**B8A_60m.jp2')
    B09_60m = glob.glob(r60m_rel_dir + '**B09_60m.jp2')
    B11_60m = glob.glob(r60m_rel_dir + '**B11_60m.jp2')
    B12_60m = glob.glob(r60m_rel_dir + '**B12_60m.jp2')
    SCL_60m = glob.glob(r60m_rel_dir + '**SCL_60m.jp2')
    TCI_60m = glob.glob(r60m_rel_dir + '**TCI_60m.jp2')
    WVP_60m = glob.glob(r60m_rel_dir + '**WVP_60m.jp2')

    # Open each in gdal
    AOT_60m_link = gdal.Open(AOT_60m[0])
    B01_60m_link = gdal.Open(B01_60m[0])
    B02_60m_link = gdal.Open(B02_60m[0])
    B03_60m_link = gdal.Open(B03_60m[0])
    B04_60m_link = gdal.Open(B04_60m[0])
    B05_60m_link = gdal.Open(B05_60m[0])
    B06_60m_link = gdal.Open(B06_60m[0])
    B07_60m_link = gdal.Open(B07_60m[0])
    B8A_60m_link = gdal.Open(B8A_60m[0])
    B09_60m_link = gdal.Open(B09_60m[0])
    B11_60m_link = gdal.Open(B11_60m[0])
    B12_60m_link = gdal.Open(B12_60m[0])
    SCL_60m_link = gdal.Open(SCL_60m[0])
    TCI_60m_link = gdal.Open(TCI_60m[0])
    WVP_60m_link = gdal.Open(WVP_60m[0])

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
    write_to_file('AOT_60m',AOT_60m_array, AOT_60m_link)
    write_to_file('B01_60m',B01_60m_array, B01_60m_link)
    write_to_file('B02_60m',B02_60m_array, B02_60m_link)
    write_to_file('B03_60m',B03_60m_array, B03_60m_link)
    write_to_file('B04_60m',B04_60m_array, B04_60m_link)
    write_to_file('B05_60m',B05_60m_array, B05_60m_link)
    write_to_file('B06_60m',B06_60m_array, B06_60m_link)
    write_to_file('B07_60m',B07_60m_array, B07_60m_link)
    write_to_file('B8A_60m',B8A_60m_array, B8A_60m_link)
    write_to_file('B09_60m',B09_60m_array, B09_60m_link)
    write_to_file('B11_60m',B11_60m_array, B11_60m_link)
    write_to_file('B12_60m',B12_60m_array, B12_60m_link)
    write_to_file('SCL_60m',SCL_60m_array, SCL_60m_link)
    write_to_file('TCI_60m',TCI_60m_array, TCI_60m_link)
    write_to_file('WVP_60m',WVP_60m_array, WVP_60m_link)