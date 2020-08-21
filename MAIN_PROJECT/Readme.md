# WebClient and API V 1.0 Beta for deep learning model Integrated with MPH Number_Plate extractor Alpha Release V 2.0

*Gui needs to be fixed*

//Everything works great and now can be used with main model. 

MAJOR UPDATE: The model has its own watching service now.

Working on Licence Plate Detection using contour sorting based on area and Corners.

Tessaract model works perfectly, There are some issues in segmentation which will be fixed in further release.
MAJOR BUG FIXES ARE DONE IN DEEP LEARNING MODEL.
Deep Learning model is now working and fully up with some bugs.
*Video mode is currently under development.*
Model is based on WPOD and MobileNetV2.

*REQUIREMENTS*

1. Python 3.x.x
2. Tesseract OCR and Tesseract Python lib ("Will be removed in further release")
3. Matplotlib
4. imutils 
5. Tensorflow and keras 
6. open-cv
7. Watchdog

*TO-DO*
1. Use node to create rest API.
2. Routing must be done using express.
3. File saving: We are gonna do it with Multer so make sure you know about chunk transfers.

Packages we’re gonna use for NODE api
1. Express -For routing requests and responses 
Link: https://www.npmjs.com/package/express
2. Multer - For dealing with chunks of files ie Image files
Link: https://www.npmjs.com/package/multer
3. Morgan -To see incoming requests in production server.
Link: https://www.npmjs.com/package/morgan
4. Helmet - To hide our server status and make it more secure from exposing to real world. 
Link: https://www.npmjs.com/package/helmet
5. Cors - For whitelisting, Blacklisting and safe headers for our requests and response. 
Link: https://www.npmjs.com/package/cors
6. Nodemon - For auto restarting the server --This is only if you are developing will not be used in production server.
Link: https://www.npmjs.com/package/nodemon


*Install everything via python package manager pip*


Features:

Make Sure to Set the auth-token Header before accessing the API.

1. GET: /api/user/userid --fetch a user by userid
2. POST: /api/delete  --delete a user sending an id in body
3. GET: /api/users --get all users
4. GET: /api/ --check if the api is alive
5. POST: /api/create/ --send the post body with the req params and create a user in database
6. POST,FORM_DATA: /api/image/  --send an image with the params of form image in it
7. GET: /api/getdetails  --get the details associated with the photo uploaded
8. POST: /api/create_numberplate --create numberplate for the user with new vehicle