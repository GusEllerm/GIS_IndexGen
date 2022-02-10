from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
from datetime import date

# Connect to API
api = SentinelAPI(None, None, 'https://apihub.copernicus.eu/apihub')

footprint = geojson_to_wkt(read_geojson('Data/NZ.geojson'))

products = api.query(
    footprint,
    date=('NOW-2DAYS', 'NOW'), 
    platformname='Sentinel-2',
    processinglevel='Level-2A')

products_df = api.to_dataframe(products)
products_df_sorted = products_df.sort_values(['cloudcoverpercentage', 'ingestiondate'], ascending=[True, True])
products_df_sorted = products_df_sorted.head(3)

api.download_all(products_df_sorted.index)

# api.download('7b5ed31a-5668-428b-b81e-e893fe573270')