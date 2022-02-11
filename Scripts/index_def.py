from cmath import sqrt

############### Define spectral vegetation indicies ##############
##################################################################
"""
Index's are described here: https://eos.com/blog/vegetation-indices/
"""

# Normalized Difference Vegetation Index (NDVI) definition
"""
NDVI is used thoughout crop production and measures 
phtotsynthetically active biomass in plants. 
However, this index is senstive to soil brightness and atmospheric effects -
this can be mitigated though other indices (EVI, SAVI, ARVI, GCL, SIPI)
"""

def ndvi(nir, red):
    return ((nir - red)/(nir + red))
 
# Red-Edge Chlorophyll Vegetation Index (RECI)
"""
Index measures chlorophyll content in leaves that are nourished by nitrogen. 
Shows the photosyntheic activity of the canopy cover. 
"""
def reci(nir, red):
    return ((nir/red) -1)

# Normalized Difference Red Edge Vegetation Index (NDRE)
"""
Is a joint measure of NDVI and RECI indices. 
This index combines NIR spectral bands and a specific band for 
the narrow range between the visible red and read-nir transition
zone. 
"""
def ndre(nir, rededge):
    return (nir - rededge) / (nir + rededge)

# Modified Soil-Adjusted Vegetation Index (MSAVI)
"""
This index is designated to mitigate soil effects on crop monitoring 
results. It is applied when NDVI can't provide accurate values - particually
with a high percentage of bare soil, scarce vegetation, or low chlorophyll
content in plants
"""
def msavi(band4, band3):
    a = 2*band4+1
    return ((a - sqrt((a*2)-8*(band4-band3)))/2)

# Green Normalized Difference Vegetation Index (GNDVI)
"""
GNDVI is a modification of NDVI but substitutes the green band for the red band.
GNDVI measures chlorophyll content more accurately than NDVI.
"""
def gndvi(nir, green):
    return ((nir - green) / (nir + green))

# Normalized Difference Water Index (NDWI)
"""
This index outlines open water bodies and assess their turbidity,
mitigating the reflectance of soil and land vegetation cover. 
"""
def ndwi(nir, green):
    return ((green - nir) / (green + nir))

# Soil Adjusted Vegetation Index (SAVI)
"""
Corrects the NDVI index by adding an adjustment factor L to the equation. 
This corrects for soil noise (soil color, moisture, variability etc)
"""
def savi(nir, red, l):
    return (((nir - red) / (nir + red + l)) * (1 + l))

# Optimized Soil Adjusted Vegetation Index (OSAVI)
"""
Modified SAVI index, which uses reflectance in the NIR and red bands. 
The difference between OSAVI and SAVI is that OSAVI takes into account
the standard value of the canopy background adjustment factor (0.16)
"""
def osavi(nir, red):
    (nir - red) / (nir + red + 0.16)

# Atmospherically Resistant Vegetation Index (ARVI)
"""
A vegetation index which mitigates atmospheric factors (e.g., aerosols).
Kuafman and Tanré corrected NDVI to mitigate atomspheric scattering effects
by doubling the red band measurements and adding blue wavelengths
"""
def arvi(nir, red, blue):
    return ((nir - (2*red) + blue) / (nir + (2*red) + blue))

# Enhanced Vegetation Index (EVI)
"""
Liu and Huete introduced EVI to adjust NDVI results to atmospheric and 
soil noises, particually in dense vegetation areas.
The value range for EVI is -1 to 1, and for healthy vegetation, it
varies between 0.2 and 0.8
"""
def evi(nir, red, blue, c1, c2, l):
    # c1 and c2 are coefficents to adjust for aerosol scattering
    # for MODIS sensor, c1 = 6; c2 = 7.5 & l = 1
    return (2.5 * ((nir - red) / ((nir) + (c1 * red) - (c2 * blue) + l)))

# Visible Atmospherically Resistant Index (VARI)
"""
Enhances vegetation under strong atmospheric impact while smooting illumination
variations. 
"""
def vari(red, green, blue):
    (green - red) / (green + red - blue)

# Leaf Area Vegetation Index (LAI)
"""
Designed to analyze the foliage surface of earth and estimate the quantity
of leaves in a specific region. 
"""
def lai():
    # This index requires some form of computer vision to identify the land 
    # mass of an image, and than create a ratio of land mass covered by biomass
    # I have excluded it for now. 
    pass 

# Normalized Burn Ratio (NBR)
"""
Used to highlight burned areas following a fire. 
Healthy vegetation shows a high reflectance in the NIR spectum, whereas 
the recently burned areas of vegetation reflect highly in the SWIR spectrum
"""
def nbr(nir, swir):
    # SWIR for sentinel2 can be band 12 -> 2190mm short wave infrared
    return ((nir - swir) / (nir + swir))

# Structure Insensitive Pigment Vegetation Index (SIPI)
"""
Provides analysis of vegetation with variable sanopy structure. It estimates
the ratio of carotenoids to chlorophyll: an increasing valye signals vegetation stress
"""
def sipi(nir, red, blue):
    return ((nir - blue) / (nir - red))

# Green Chlorophyll Vegetation Index (GCI)
"""
Used to estimate the content of leaf chlorophyll in various species of plant. 
The chlorophyll content reflects the physiological state of vegetation; it 
decreases in stressed plants and can therefore be used as a measurement of 
vegetation health
"""
def gci(nir, green):
    return (nir / green - 1)

# Normalized Difference Snow Index (NDSI)
"""
Detects snow cover. Snow has high reflectance in the SWIR band, and low reflectance
in the VIS band. Cloud reflection in these bands are high, allowing snow 
and clouds to be distingushed from each other. 
"""
def ndsi(green, swir):
    return ((green - swir) / (green + swir))
