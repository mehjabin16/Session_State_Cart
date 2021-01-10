# Session_State_Cart 

- Language: node.js   
- Database: firebase  

Firebase setup:    
Create a project and a firestore database. Then go to project settings -> register a web app.   

Environment setup:   
Open a new folder named ‘Session_State’ in Visual Studio code. Then write these commands into the terminal.
> npm install -g firebase-tools

> firebase init  

After login to firebase account.   
Choose ‘Functions: Configure and deploy cloud functions’ features for the project.   
Choose an existing project. Then select the project.   
Then choose javascript.   
Use ESLint.  
Install all necessary npm dependencies   
> npm install express cors    
> npm install body-parser guid  

Copy and replace the index.js file from “Session_State/functions” in the newly created Session_State/functions folder.   
  
Go to firebase app settings -> service accounts -> generate a new private key   
Save the json file and rename it to permission.json. Then copy the file into functions folder.   
  
To run the program   
> cd functions   
> npm run serve     
 
The base url will be similar to this one (project id will change): http://localhost:5001/cartservice-61809/us-central1/app  

