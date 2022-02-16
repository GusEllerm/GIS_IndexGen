import ee
import pandas as pd
from MODIS_helper import ee_array_to_df, t_modis_to_celsius, generate_LST_graph, generate_LST_map, generate_elevation_map

# Trigger authentication
ee.Authenticate()

# init the google earth api libary
ee.Initialize()

## Getting Data
# Import MODIS land cover collection
lc = ee.ImageCollection('MODIS/006/MCD12Q1')

# Import MODIS Land Surface Tempreature collection
lst = ee.ImageCollection('MODIS/006/MOD11A1')

# Import USGS ground elevation image
elv = ee.Image('USGS/SRTMGL1_003')

## Filter variables
# Initial and Final dates
# i_year = input("Please enter an initial year:")
# f_year = input("Please enter a final year:")
# i_date = '{}-01-01'.format(i_year)
# f_date = '{}-01-01'.format(f_year)

# i_date = '{}-01-01'.format(i_year)
# f_date = '{}-01-01'.format(f_year)

i_date = '2017-01-01'
f_date = '2020-01-01'

print("\n")
print("Selected date range {} to {}".format(i_date, f_date))
print("\n")

# Selection of bands for LST (Land Surface Temperature)
lst = lst.select('LST_Day_1km', 'QC_Day').filterDate(i_date,f_date)

# Define location of interest
# Urban Location: Lyon, France.

# For testing purposes, defults are below
u_lon = 4.8148
u_lat = 45.7758
r_lon = 5.175964
r_lat = 45.574064

# u_lon, u_lat = input("Urban long lat: ").split(', ')
# r_lon, r_lat = input("Rural long lat: ").split(', ')

print("\n")
print("Selected Urban coords {}:{}".format(u_lon, u_lat))
print("Selected rural coords {}:{}".format(r_lon, r_lat))
print("\n")

u_poi = ee.Geometry.Point(float(u_lon), float(u_lat))
r_poi = ee.Geometry.Point(float(r_lon), float(r_lat))

scale = 1000 # scale in meters

## Calculate elevenation, LST and land cover type for urban location
# calculate and print elevation 
elv_urban_point = elv.sample(u_poi, scale).first().get('elevation').getInfo()
print('Ground elevation at urban point:', elv_urban_point, 'm')

# calculate and print mean LST 
lst_urban_point = lst.mean().sample(u_poi, scale).first().get('LST_Day_1km').getInfo()
print('Average daytime LST at urban point:', round(t_modis_to_celsius(lst_urban_point)), '°C')

# print land cover type
lc_urban_point = lc.first().sample(u_poi, scale).first().get('LC_Type1').getInfo()
print('Land cover value at urban point is:', lc_urban_point)

### Creating a time serries to measure change over time
## Get time serries data for our urban and rurual locations

# Get urban data
lst_u_poi = lst.getRegion(u_poi, scale).getInfo()

# Get rural data
lst_r_poi = lst.getRegion(r_poi, scale).getInfo()

## Transform ee data to pandas dataset, scale temp to celsius. For both urban and rural data. 
lst_df_urban = ee_array_to_df(lst_u_poi, ['LST_Day_1km'])
lst_df_urban['LST_Day_1km'] = lst_df_urban['LST_Day_1km'].apply(t_modis_to_celsius)
lst_df_rural = ee_array_to_df(lst_r_poi, ['LST_Day_1km'])
lst_df_rural['LST_Day_1km'] = lst_df_rural['LST_Day_1km'].apply(t_modis_to_celsius)

print(lst_df_urban.head())

# Generate a LST over time for both urban and rural locations
generate_LST_graph(lst_df_urban, lst_df_rural, "LST_over_time")

# Generate a map visualisation of LST for a location
# Currently generating for urban
generate_LST_map(lst, u_poi, "urban")
generate_LST_map(lst, r_poi, "rural")

# Generate a map visualisation of elevantion a location
generate_elevation_map(elv, u_poi, "elevation_map")

