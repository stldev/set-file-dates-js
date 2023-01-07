# set-file-dates-js

## Problem

- Many photos and videos on Windows PC that have varying datetimes set across: modified, created, dateTaken, and mediaCreated
- Want to have "on this day" media sent to users in the morning.
- Current on premise storage device that can share publicly sorts by modified and displays created. Also, it cannot show .heic files.

## Solution

- Set all the date fields to the same value, and then copy to the device for sharing
- Loop thru all photos:

  - if have a dateTaken then set created and modified to that value
  - if no dateTaken then set created or modified both to the earliest date
  - if photo is of type .HEIC, then create a JPG copy and set dates to same values as original

- Loop thru all videos:
  - if have a mediaCreated then set created and modified to that value
  - if no dateTaken then set created or modified both to the earliest date
