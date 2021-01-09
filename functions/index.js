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
var itemcount = 0;

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
                        products: [{
                               productName: item,
                               productID:req.body.productID,
                               productCount: 1,
                    }],
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
            var productList =[]
            const cartRef = db.collection('cart');
            const snapshot = await cartRef
            .where('sessionID', '==', session)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    id = doc.id;
                    productList = doc.data().products;
                    console.log(doc.data().products);

                });
            })
            await cartRef.doc(id).set(
                {   
                    products: [...productList,{
                           productName: item,
                           productID:req.body.productID,
                           productCount: 1,
                           }],
                   
                },{ merge: true } )
                .then(() => {
                    res.status(200).send('success')
                })        
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
                var response=[];
                const cartRef = db.collection('cart');
                const snapshot = await cartRef
                .where('sessionID', '==', session)
                .get()
                .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    response = doc.data().products;
                    //console.log(doc.data().products);
                });
            })
                return res.status(201).send(response)
    
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
        
            if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
                res.send("No Session. Provide Valid Session ID")
            }
            else {
                //
            }
        
        }
        catch(error){
            return res.status(500).send(error)
        }

      
    })();
});

exports.app = functions.https.onRequest(app);
