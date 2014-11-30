CS575-900_Assignment3 : Implementing a System Highlighting a Non-Trivial Modern Architecture
=====================



MEAN.JS Chat Application using Socket.IO

This is an attempt to build a web application using the MEAN.JS Yeoman generator as the starting point. The stack was then expanded with some GUI modifications, additional DBs and socket.io creating a very, very simplistic chat application.

This was my first experience with each of the platforms leveraged with MEAN.JS...

M ongoDB, a NoSQL database

E xpress.js, a web applications framework

A ngular.js, a JavaScript MVC framework for web apps

N ode.js, a software platform for scalable server-side and networking applications

I did not want to start with an existing project such as the [Angular Express Seed](https://github.com/btford/angular-express-seed) since I wanted benefit from building something myself.

## How to start the application

Clone the repository or download ZIP and extract it to a directory.

### Setting up the application for the first time.

   Open shell or command prompt, traverse to {EXTRACTED_DIR}\ChatApp
   
   Install dependencies using grunt:
   
     grunt install

   Provided MongoDB with a location to store databases. Create directory C:\Windows\Temp\MongoDb.

### Running the application.

   Start MongoDB:
   
     mongod.exe --dbpath C:\Windows\Temp\MongoDb

   To run application using grunt:
   
     grunt

### Playing with the application

   Open a web browser to http://localhost:3000
   
   Create an account: Click Sign Up (upper right corner), enter information for your user, Click blue Sign Up button. Application will bring you to the MEAN.JS entry page.
   
   Create a chat room: Select Rooms -> New Room. Enter room name, Click Submit. The room view will appear.

   Open a second web browser to http://localhost:3000
	 
   Using the scond browser, join the recently created chat room: Select Rooms -> List Rooms. A list of all available rooms will appear. Find the room created earlier. Click blue Join button.
   
   Enter chat messages in each browser, observe the other browser sees the conversation.
  
   View Message Database: http://localhost:3000/roommessages
   
   View Room Database: http://localhost:3000/rooms

   
## How initial stack was generated, before modification

   Generate application stack using (Yoeman MEAN.JS generator) (http://meanjs.org/generator.html):

     npm install -g generator-meanjs
     
     yo meanjs

  
   Created models, views and controllers for Room and Message History data using MEAN.JS generator.
     yo meanjs:crud-module RoomMessages
     
     yo meanjs:crud-module Rooms

   The stack initially provides a facility to login and view/edit/delete the CRUD records. Facebook, Twitter, and Google+ login strategies are provided.

### Global Prerequisites:

   Install the following globally:
   
     npm: Download installer from http://npmjs.org/
     
     Node.JS: Download installer from http://nodejs.org/
     
     MondoDB: Download installer from http://www.mongodb.org/downloads
     
     Grunt: 

     npm install -g grunt

     Grunt: 

     npm install -g grunt-cli

     Bower:

     npm install -g bower

     Yoeman:

     npm install -g yo

 
### Add socket.io to the application package.json:
 
   Open shell or command prompt, traverse to {EXTRACTED_DIR}\ChatApp

     socket.io: 

	 npm install socket.io --save

     socket.io component for AngularJS : 

	 bower install angular-socket-io --save 


## References and Tutorials that were helpful

http://socket.io/get-started/chat/
http://vexxhost.com/blog/mean-socket-io-integration-tutorial/
http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
http://smithamilli.com/tutorials/
http://blogs.msdn.com/b/brunoterkaly/archive/2012/02/22/node-js-socket-programming-with-c-and-javascript.aspx
http://blogs.msdn.com/b/brunoterkaly/archive/2012/02/28/node-js-a-chat-server-written-in-node-and-a-client-app-written-in-c.aspx
http://gonzalo123.com/category/technology/socket-io/
http://www.slideshare.net/simonaclapan/the-mean-stack-so-calcodecamp-june-29th-2014
http://www.adevedo.com/content/why-use-angularjs-very-short-introduction
http://bluefletch.com/blog/why-mean-js-matters-to-enterprise/
https://badwing.com/my-gruntfile-js-an-example-gruntfile-and-my-workflow/
Curran Kelleher: https://github.com/curran/screencasts, https://www.youtube.com/playlist?list=PL9yYRbwpkyktAZaphR2UfeYpgNGnIqjs9
LearnCode.academy: https://www.youtube.com/channel/UCVTlvUkGslCV_h-nSAId8Sw
Angularjs Tutorial for Beginners - learn Angular.js using UI-Router: https://www.youtube.com/watch?v=QETUuZ27N0w&index=1&list=PLoYCgNOIyGAApoDfJHjmMgGNlYenKg5jO
http://www.sitepoint.com/building-chat-app-node-webkit-firebase-angularjs/
http://blogs.msdn.com/b/cdndevs/archive/2014/09/04/node-js-tutorial-series-a-chatroom-for-all-part-1-introduction-to-node.aspx
http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/

