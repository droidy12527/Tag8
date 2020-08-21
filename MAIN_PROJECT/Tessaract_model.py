import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import cv2
import numpy as np
import pytesseract
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from utils import detect_lp
from os.path import splitext,basename
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.preprocessing import LabelEncoder
import glob
import json
import watchdog.events 
import watchdog.observers 
import time 
import os 
from os import path
from datetime import date

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

#Bug Section for this model
'''
*Bug where S was detected as $ has been fixed using a simple loop
*Sometimes I get detected as first character because of some imperfection in Image Cropping.
*9, 13 and 22 Image not getting detected due to some issue.
*Different background numberplate is not detected.
*Reflection are not getting detected.
'''

flag = 0

def model():
    def load_model(path):
        try:
            path = splitext(path)[0]
            with open('%s.json' % path, 'r') as json_file:
                model_json = json_file.read()
            model = model_from_json(model_json, custom_objects={})
            model.load_weights('%s.h5' % path)
            print("Loading model successfully...")
            return model
        except Exception as e:
            print(e)

    wpod_net_path = "wpod-net.json"
    wpod_net = load_model(wpod_net_path)
    def preprocess_image(image_path,resize=False):
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img / 255
        if resize:
            img = cv2.resize(img, (224,224))
        return img

    def get_plate(image_path):
        Dmax = 608
        Dmin = 288
        vehicle = preprocess_image(image_path)
        ratio = float(max(vehicle.shape[:2])) / min(vehicle.shape[:2])
        side = int(ratio * Dmin)
        bound_dim = min(side, Dmax)
        _ , LpImg, _, cor = detect_lp(wpod_net, vehicle, bound_dim, lp_threshold=0.5)
        return vehicle, LpImg, cor

    test_image_path = "images/numberplate_image.png"
    vehicle, LpImg,cor = get_plate(test_image_path)

    fig = plt.figure(figsize=(12,6))
    grid = gridspec.GridSpec(ncols=2,nrows=1,figure=fig)
    fig.add_subplot(grid[0])
    plt.axis(False)
    plt.imshow(vehicle)
    grid = gridspec.GridSpec(ncols=2,nrows=1,figure=fig)
    fig.add_subplot(grid[1])
    plt.axis(False)
    plt.imshow(LpImg[0])
    # plt.show()

    image = LpImg[0] * 255
    #print(image)
    result_BGR = cv2.cvtColor(image.astype('float32'), cv2.COLOR_RGB2BGR)
    cv2.imwrite('number.png', result_BGR)

    text = pytesseract.image_to_string("number.png", lang='eng')
    name = list(text)
    if (len(name)!=0):
        #Debug this section for special cases and fonts to replace them acc to your need.
        #Optimize the loop it takes Order of n^2 time complexity.
        special_chars = ["$", "e"]
        replace_chars = ["S", " "]
        for x in range(len(name)):
            for y in range(len(special_chars)):
                if name[x] == special_chars[y]:
                    name[x] = replace_chars[y]
        #Because the first two are chars not number, If it detects it as number that is because of cropping.
        first_numbers = ["1", "2", "3", "4", "5", "6", "7", "8","9", "0"]
        for x in range(2):
            for y in range(len(first_numbers)):
                if name[x] == first_numbers[y]:
                    name[x] = " " 

        savename = ''.join(name)
        savename = savename.strip()
        print("Number is :", savename)

    else:
        print("Failed picking up number.")
    today = str(date.today())

    data = {
        'number': savename,
        'date_created': today
    }

    json_object = json.dumps(data, indent=1)

    try:
        with open("output.json", "w") as outfile: 
            outfile.write(json_object) 
        print('JSON is exported sucessfully')
        os.remove('file_modifier/file')
        checker()
    except:
        print('Error working with json')


def checker():
    while True:
        print('Checking for file_modifier on server.')
        if path.exists('file_modifier/file'):
            os.remove('output.json')
            model()
            break
        else:
            flag = 0

checker()
