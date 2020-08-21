#This project is closed source so do not copy 

import numpy as np
import cv2
import imutils
import pytesseract
import os 
import matplotlib.pyplot as plt
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

#Debug the code for more changes 
#Orientation changes does not work 
#Many more changes to be done
#Does not detect contours on reflections
#Does not work on images with contours which matches the area New filteration is needed 
#Works on pytessarct need to make more improvements
#Bugs in most of panels 
#No Neural Network has been yet made
#CNN to be made with 2-2 COnvo and MAxPool2d
#New character detection to be made rather than this Tessaract engine
#Solution for numberplate not detected check the tessaract and then if that outputs null then start looking for another contour assuming it works

def compare_images(img1, img2, title1="", title2=""):
    fig = plt.figure(figsize=[15,15])
    ax1 = fig.add_subplot(121)
    ax1.imshow(img1, cmap="gray")
    ax1.set(xticks=[], yticks=[], title=title1)

    ax2 = fig.add_subplot(122)
    ax2.imshow(img2, cmap="gray")
    ax2.set(xticks=[], yticks=[], title=title2)
    plt.show()

IMAGE_NUMBER = 1
image = cv2.imread('Car Images/{}.jpg'.format(IMAGE_NUMBER))
image = imutils.resize(image, width=500)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
compare_images(image, gray, "Original Image", "Gray image")
gray = cv2.bilateralFilter(gray, 11, 17, 17)
compare_images(image, gray, "Original Image", "Bilateral filter")
edged = cv2.Canny(gray, 170, 200)
compare_images(image, edged, "Original image", "Canny edges")
cnts, new  = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
img1 = image.copy()
cv2.drawContours(img1, cnts, -1, (0,255,0), 3)
cnts=sorted(cnts, key = cv2.contourArea, reverse = True)[:30]
NumberPlateCnt = None 
img2 = image.copy()
cv2.drawContours(img2, cnts, -1, (0,255,0), 3)

#Find the numberplate by looping and comparing areas.

count = 0
idx =7
for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:  # Select the contour with 4 corners
            NumberPlateCnt = approx 
            x, y, w, h = cv2.boundingRect(c) 
            new_img = gray[y:y + h, x:x + w] 
            cv2.imwrite('Cropped Images-Text/' + str(idx) + '.png', new_img) 
            idx+=1

            break


cv2.drawContours(image, [NumberPlateCnt], -1, (0,255,0), 3)
compare_images(img2, image , "Top contours localization", "The Numberplate detected" )
Cropped_img_loc = 'Cropped Images-Text/7.png'
cv2.imshow("Cropped Image ", cv2.imread(Cropped_img_loc))
text = pytesseract.image_to_string(Cropped_img_loc, lang='eng')
print("Number is :", text)
cv2.waitKey(0) 