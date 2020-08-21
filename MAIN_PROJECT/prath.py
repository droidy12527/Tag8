from os import path

while True:
    if path.exists('file_modifier/file'):
        flag = 1
        break
    else:
        flag = 0
        break