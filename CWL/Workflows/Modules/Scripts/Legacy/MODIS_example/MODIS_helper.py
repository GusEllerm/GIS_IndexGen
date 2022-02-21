import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import requests
import shutil
from scipy import optimize
import os

def ee_array_to_df(arr, list_of_bands):
    """Transforms client-side ee.Image.getRegion array to pandas.DataFrame."""
    df = pd.DataFrame(arr)

    # Rearrange the header.
    headers = df.iloc[0]
    df = pd.DataFrame(df.values[1:], columns=headers)

    # Remove rows without data inside.
    df = df[['longitude', 'latitude', 'time', *list_of_bands]].dropna()

    # Convert the data to numeric values.
    for band in list_of_bands:
        df[band] = pd.to_numeric(df[band], errors='coerce')

    # Convert the time field into a datetime.
    df['datetime'] = pd.to_datetime(df['time'], unit='ms')

    # Keep the columns of interest.
    df = df[['time','datetime',  *list_of_bands]]

    return df

def t_modis_to_celsius(t_modis):
    """Converts MODIS LST units to degrees Celsius."""
    t_celsius =  0.02*t_modis - 273.15
    return t_celsius

def fit_func(t, lst0, delta_lst, tau, phi):
    # Fit function for the expected seasonality influence on LST for comparison to real values
    # https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/JZ070i012p02821
    return lst0 + (delta_lst/2)*np.sin(2*np.pi*t/tau + phi)

def generate_LST_graph(urban, rural, filename):
    ## Fit Curves
    # Extract x value (times) from the dfs
    x_data_u = np.asanyarray(urban['time'].apply(float)) # urban
    x_data_r = np.asanyarray(rural['time'].apply(float)) # rural

    # Extract y values (LST) from the dfs
    y_data_u = np.asanyarray(urban['LST_Day_1km'].apply(float)) # urban
    y_data_r = np.asanyarray(rural['LST_Day_1km'].apply(float)) # rural
    
    ## paramater optimisation
    lst0 = 20
    delta_lst = 40
    tau = 365*24*3600*1000   # milliseconds in a year
    phi = 2*np.pi*4*30.5*3600*1000/tau  # offset regarding when we expect LST(t)=LST0

    params_u, params_covariance_u = optimize.curve_fit(
        fit_func, x_data_u, y_data_u, p0=[lst0, delta_lst, tau, phi])
    params_r, params_covarience_r = optimize.curve_fit(
        fit_func, x_data_r, y_data_r, p0=[lst0, delta_lst, tau, phi])

    # Create subplots
    fig, ax = plt.subplots(figsize=(14, 6))

    # Add scatter 
    ax.scatter(urban['datetime'], 
                urban['LST_Day_1km'],
                c='black',
                alpha=0.2,
                label='Rural (data)')
    ax.scatter(rural['datetime'],
                rural['LST_Day_1km'],
                c='green',
                alpha=0.3,
                label='Rural (data)')

    # add fit curves
    ax.plot(urban['datetime'],
            fit_func(x_data_u, params_u[0], params_u[1], params_u[2], params_u[3]),
            label='Urban (fitted)',
            color='black',
            lw=2.5)
    ax.plot(rural['datetime'],
            fit_func(x_data_r, params_r[0], params_r[1], params_r[2], params_r[3]),
            label='Rural (fitted)',
            color='green',
            lw=2.5)
    
    # extra parameters
    ax.set_title('Daytime Land Surface Temperature Near Lyon', fontsize=16)
    ax.set_xlabel('Date', fontsize=14)
    ax.set_ylabel('Temperature [C]', fontsize=14)
    ax.set_ylim(-0, 40)
    ax.grid(lw=0.2)
    ax.legend(fontsize=14, loc='lower right')

    plt.savefig("Workflow outputs/Figures/{}.png".format(filename))
    os.system('open Workflow\ outputs/Figures/{}'.format(filename + ".png"))

def get_image_from_url(url, filename):
    # send outputs to workflow folder for organisation
    filename_ex = filename + '.png'
    filename_path = 'Workflow outputs/Figures/' + filename_ex

    # Start a request stream with the generated URL
    r = requests.get(url, stream = True)
    if r.status_code == 200:
        r.raw.decode_content = True
        with open(filename_path, 'wb') as f:
            # Copy image into local location
            shutil.copyfileobj(r.raw, f)
        print("Image downloaded")
        os.system('open Workflow\ outputs/Figures/{}'.format(filename_ex))
    else:
        print("Error downloading image")
    

def generate_LST_map(lst, poi, filename):
    ## Generates a visualisation of LST in the selected area
    # Define a region of interest with a buffer zone of 1000km
    roi = poi.buffer(1e6)

    # 1st reduce the LST collection by mean. 2nd adjust for scale factor. 3rd convert kelvin to celsius
    lst_img = lst.mean()
    lst_img = lst_img.select('LST_Day_1km').multiply(0.02)
    lst_img = lst_img.select('LST_Day_1km').add(-273.15)

    # Create a URL to the styled image 
    url = lst_img.getThumbUrl({
        'min': 10, 
        'max': 30, 
        'dimensions': 512, 
        'region': roi, 
        'palette':['blue', 'yellow', 'orange', 'red']
    })
    print('\nURL of generated image: {}'.format(url))

    # Display thumbnail LST in region
    print('\nPlease wait while the thmbnail loads, it may take a moment...')
    get_image_from_url(url, filename)

def generate_elevation_map(elv, poi, filename):
    ## Generates a visualisation of elevation in the selected area
    # Define a region of interest with a buffer zone of 1000km
    roi = poi.buffer(1e6)

    # using the elevation data, remove all elevation below sea level and make it transparent
    elv_img = elv.updateMask(elv.gt(0))

    # Create a URL to the styled image
    url = elv_img.getThumbURL({
        'min': 0, 
        'max': 2000, 
        'dimensions': 512, 
        'region': roi, 
        'palette':['006633', 'E5FFCC', '662A00', 'D8D8D8', 'F5F5F5']
    })
    print('URL of generated image: {}'.format(url))

    # Display thumbnail elevenation in region
    print('\nPlease wait while the thmbnail loads, it may take a moment...')
    get_image_from_url(url, filename)


