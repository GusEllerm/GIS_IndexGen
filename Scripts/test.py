from IPython.display import Image, display
import requests
import shutil
from PIL import Image

filename = 'Workflow outputs/Figures/urban.png'
img = Image.open(filename)
img.show()