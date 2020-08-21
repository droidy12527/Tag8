import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import cv2
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from utils import detect_lp
from os.path import splitext, basename
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.preprocessing import LabelEncoder
import json
from datetime import date 
import glob
import sys 
import watchdog.events 
import watchdog.observers 
import time 
import os 
from os import path
 

#TODO: Debug the LIST and develop an algorithm for manipulation of digits.
#Major bug regarding contour Explaination
'''
*DIFFERENT FONTS DONT WORK.
*Different image perspective does not work.
*Cropping of images should be fixed.
*Woking Images are 1--> FAR, 2-->LIST,3 --> BALENO, 4--> PERSPECTION, 5, 6-->LIST, 7, 8 ,9 -->LIST, 10 --> SPECIAL CASE DIFFERENT COLOR, 
11, 12-->LOW RES DAMAGED , 13--> DAMAGED, 14, 15-->LIST, 16, 17--> BOLT ERROR, 18, 19, 20 --> LIST,
21, 22-->LIST, 23-->LIST, 24, 25, 26 -->LIST, 27.
*Deep learning model confuses itself between W M and N because of cropping in irregular way.
*As the retrieval of the contours External the external boundaries are given
when the binary image is in a way black --> white ---> Black the external black
contour is only targetted leaving the inside number plate as not taken into
consideration , Leaving the numbers in the numberplate undetected.
If we try to make the retrieval as List then the 6 --> can be recognized in two
way 6 and 0 because the retrival is list and then the whole number changes due to this
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

    # fig = plt.figure(figsize=(12,6))
    # grid = gridspec.GridSpec(ncols=2,nrows=1,figure=fig)
    # fig.add_subplot(grid[0])
    # plt.axis(False)
    # plt.imshow(vehicle)
    # grid = gridspec.GridSpec(ncols=2,nrows=1,figure=fig)
    # fig.add_subplot(grid[1])
    # plt.axis(False)
    # plt.imshow(LpImg[0])
    # plt.show()

    if (len(LpImg)): 
        plate_image = cv2.convertScaleAbs(LpImg[0], alpha=(255.0))
        gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray,(7,7),0)
        binary = cv2.threshold(blur, 180, 255,cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        kernel3 = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        thre_mor = cv2.morphologyEx(binary, cv2.MORPH_DILATE, kernel3)

            
    # fig = plt.figure(figsize=(12,7))
    # plt.rcParams.update({"font.size":18})
    # grid = gridspec.GridSpec(ncols=2,nrows=3,figure = fig)
    # plot_image = [plate_image, gray, blur, binary,thre_mor]
    # plot_name = ["plate_image","gray","blur","binary","dilation"]

    # for i in range(len(plot_image)):
    #     fig.add_subplot(grid[i])
    #     plt.axis(False)
    #     plt.title(plot_name[i])
    #     if i ==0:
    #         plt.imshow(plot_image[i])
    #     else:
    #         plt.imshow(plot_image[i],cmap="gray")
    # plt.show()

    def sort_contours(cnts,reverse = False):
        i = 0
        boundingBoxes = [cv2.boundingRect(c) for c in cnts]
        (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),key=lambda b: b[1][i], reverse=reverse))
        return cnts
    #List approx and External approx can be changed here.
    #Code added to make contour into list if only external contour is detected.
    cont, _  = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if len(cont) <= 2:
        #IT NEEDS TO DEBUGGED FOR CASE OF VARIOUS CHARS.
        cont, _  = cv2.findContours(binary, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        print("NOTE: USING LIST CONTOURS")
    #Code to Debug the Contours on the plate image.
    '''print(len(cont))
    imagge = LpImg[0].copy()
    bxmi = sort_contours(cont)
    cv2.drawContours(imagge, bxmi, -1, (0,255,0), 3)
    cv2.imshow('Conto', imagge)
    cv2.waitKey(0)
    cv2.destroyAllWindows()'''
    test_roi = plate_image.copy()
    crop_characters = []
    digit_w, digit_h = 30, 60
    for c in sort_contours(cont):
        (x, y, w, h) = cv2.boundingRect(c)
        ratio = h/w
        #The ratio is used to make sure the number plate is not detected play with it in a way that numberplate is not detected.
        #Original value was set to 3.5 it was increased due to INDIAN numberplate fashion.
        if 1<=ratio<=5: 
            #Original value was 0.5
            #0.4 is more compaitable and 0.5 tweaking between them will workout, Basically it is used to check the number/cropped image shape ratio
            if h/plate_image.shape[0]>=0.4: 
                cv2.rectangle(test_roi, (x, y), (x + w, y + h), (0, 255,0), 2)
                curr_num = thre_mor[y:y+h,x:x+w]
                curr_num = cv2.resize(curr_num, dsize=(digit_w, digit_h))
                _, curr_num = cv2.threshold(curr_num, 220, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                crop_characters.append(curr_num)

    print("Detect {} letters...".format(len(crop_characters)))
    # fig = plt.figure(figsize=(10,6))
    # plt.axis(False)
    # plt.imshow(test_roi)
    # plt.show()

    # fig = plt.figure(figsize=(14,4))
    # grid = gridspec.GridSpec(ncols=len(crop_characters),nrows=1,figure=fig)

    # for i in range(len(crop_characters)):
    #     fig.add_subplot(grid[i])
    #     plt.axis(False)
    #     plt.imshow(crop_characters[i],cmap="gray")
    # plt.show()

    json_file = open('MobileNets_character_recognition.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    model = model_from_json(loaded_model_json)
    model.load_weights("License_character_recognition_weight.h5")
    print(" Model loaded successfully...")

    labels = LabelEncoder()
    labels.classes_ = np.load('license_character_classes.npy')
    print(" Labels loaded successfully...")

    def predict_from_model(image,model,labels):
        image = cv2.resize(image,(80,80))
        image = np.stack((image,)*3, axis=-1)
        prediction = labels.inverse_transform([np.argmax(model.predict(image[np.newaxis,:]))])
        return prediction

    fig = plt.figure(figsize=(15,3))
    cols = len(crop_characters)
    grid = gridspec.GridSpec(ncols=cols,nrows=1,figure=fig)

    final_string = ''
    for i,character in enumerate(crop_characters):
        fig.add_subplot(grid[i])
        title = np.array2string(predict_from_model(character,model,labels))
        plt.title('{}'.format(title.strip("'[]"),fontsize=20))
        final_string+=title.strip("'[]")
        plt.axis(False)
        # plt.imshow(character,cmap='gray')

    print(final_string)
    today = str(date.today())

    data = {
        'number': final_string,
        'date_created': today
    }

    json_object = json.dumps(data, indent=2)

    try:
        with open("output.json", "w") as outfile: 
            outfile.write(json_object) 
        print('JSON Object sucessfully exported')
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
