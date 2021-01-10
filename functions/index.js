const functions = require('firebase-functions');
var admin = require("firebase-admin");

var serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
 
const express = require('express');
const app = express();
const db = admin.firestore();

const cors = require('cors');
app.use(cors({origin:true}))

var guid = require("guid");
const bodyparser = require("body-parser");
app.use(bodyparser.json());


app.post('/cart/add/:product', (req,res) =>{
    (async()=>{
        try{
            var item = req.params.product

            if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == '')
            {
                  var guiID = guid.create()
                  console.log(guiID.value)
                  var session = guiID.value;
                  const cartRef = db.collection('cart');   
                  await cartRef.add(
                    {   
                               productName: item,
                               productCount: 1,
                               sessionID: session
                    } )
                    .then(() => {
                        res.writeHead(200, {
                            'session-id': session
                        });
                        res.end()
                    })        
            }
            else{
            var session = req.headers['session-id']
            console.log(session);
            var id ='';
            var itemCount = 0;
            const cartRef = db.collection('cart');
            const snapshot = await cartRef
               .where('sessionID', '==', session).where('productName', '==', item)
               .get()
               .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    id = doc.id
                    itemCount = doc.data().productCount
                    console.log(id);
                    console.log(itemCount);
                });
            }) 
               
            if(id=='')   {
                await cartRef.add(
                    {   
                               productName: item,
                               productCount: 1,
                               sessionID: session
                    } )
                    .then(() => {
                        res.status(200).send('item added to the cart');
                       
                    })         
            } 
            else{
                await cartRef.doc(id)
                    .update(
                    {
                        productCount: itemCount+1,  
                    }
                )
                .then(() => {
                    res.status(200).send('item increased');
                   
                })      
            }
            }                               
        }
            catch(error){
                console.log(error);
                return res.status(500).send(error)
                
            }
        })();
    });
    
app.get('/cart', (req,res) =>{
        (async()=>{
            try{
                var session = req.headers['session-id']
                var productList=[];
                if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
                    res.send("No session exists. Provide valid session ID")
                }
                else {
                
                const cartRef = db.collection('cart');
                const snapshot = await cartRef
                .where('sessionID', '==', session)
                .get()
                .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let temp =[];
                    temp ={
                        'productName' : doc.data().productName,
                        'productCount': doc.data().productCount
                   }
                    productList.push(temp);
                    //console.log(doc.data());
                });
            })
                return res.status(200).send(productList)
    
            }
        }
            catch(error){
                return res.status(500).send(error)
            }
        
    })();
});
app.post('/cart/decrease/:item', (req, res) => {
    (async()=>{
        try{
            var item = req.params.item
            var session = req.headers['session-id']
            var id ='';
            if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
                res.send("No session exists. Provide valid session ID")
            }
            else {
                const cartRef = db.collection('cart');
                const snapshot = await cartRef
               .where('sessionID', '==', session).where('productName', '==', item)
               .get()
               .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    id = doc.id
                    itemCount = doc.data().productCount
                    //console.log(id);
                    //console.log(itemCount);
                });
            }) 
            if(id=='')   {
                return res.status(200).send("Product doesn't exist in cart")
            }
            else{
            await cartRef.doc(id)
                    .update(
                    {
                        productCount: itemCount-1,  
                    }
                )
                .then(() => {
                    res.status(200).send('item decreased');
                })       
            }
        }
        
        }
        catch(error){
            return res.status(500).send(error)
        }

      
    })();
});

app.delete('/cart/remove/:item', (req, res) => {
    (async()=>{
        try{
            var item = req.params.item
            var session = req.headers['session-id']
             var id ='';
            if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
                res.send("No session exists. Provide valid session ID")
            }
            else {
                const cartRef = db.collection('cart');
                const snapshot = await cartRef
               .where('sessionID', '==', session).where('productName', '==', item)
               .get()
               .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    id = doc.id
                    console.log(id);
                });
            })  
            if(id=='')   {
                return res.status(200).send("Product doesn't exist in cart")
            }
              else{
                await cartRef.doc(id).delete().then(function() {
                    console.log("Product removed");
                    return res.status(200).send("Product removed!")
                }).catch(function(error) {
                    console.error("Error removing document: ", error);
                });
            }
         }
        
        }
        catch(error){
            return res.status(500).send(error)
        }

      
    })();
});

exports.app = functions.https.onRequest(app);
