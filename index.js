require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())
const port = process.env.PORT||4000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whfsa.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, 
    { useNewUrlParser: true, 
     useUnifiedTopology: true, 
    serverApi: ServerApiVersion.v1 });

const run = async () => {
  try {
    const db = client.db("jobBox");
    const userCollection = db.collection("user");
    const jobCollection = db.collection("job");

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    // app.get("/users", async (req, res) => {
    //   const cursor = userCollection.find({});
    //   const result = await cursor.toArray();
    //   if(result?.email){
    //     res.send({status:true,data:result})
    //   }
     
    //   res.send({status:false})
     
    // });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }
     else{
      res.send({ status: false });
     }
      
    });

    app.patch("/apply", async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const email = req.body.email;
      let count = 0
      const total = count + 1
      count = total
      console.log( count)

      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $push: { applicants: { id: ObjectId(userId), email } , totalApplicants: count },
        
      };

      const result = await jobCollection.updateOne(filter, updateDoc);
      
      if (result.acknowledged) {
         
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });



    app.patch("/close", async (req, res) => {
       const jobId = req.body.jobId;
      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $set: { status: "closed", }
        
      };

      const result = await jobCollection.updateOne(filter, updateDoc);
      
      if (result.acknowledged) {
         
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

           // open
    app.patch("/open", async (req, res) => {
       const jobId = req.body.jobId;
      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $set: { status: "open", }
        
      };

      const result = await jobCollection.updateOne(filter, updateDoc);
      
      if (result.acknowledged) {
         
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });


    app.patch("/query", async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const email = req.body.email;
      const question = req.body.question;

      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $push: {
          queries: {
            id: ObjectId(userId),
            email,
            question: question,
            reply: [],
          },
        },
      };

      const result = await jobCollection.updateOne(filter, updateDoc);

      if (result?.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    app.patch("/reply", async (req, res) => {
      const userId = req.body.userId;
      const reply = req.body.reply;
      console.log(reply);
      console.log(userId);

      const filter = { "queries.id": ObjectId(userId) };
     console.log("filter:",filter)
      const updateDoc = {
        $push: {
          "queries.$[user].reply": reply,
        },
       
      };
      console.log("updateDoc:",updateDoc)
      const arrayFilter = {
        arrayFilters: [{ "user.id": ObjectId(userId) }],
      };

      const result = await jobCollection.updateOne(
        filter,
        updateDoc,
        arrayFilter
      );
      if (result?.acknowledged) {
        return res.send({ status: true, data: result });
      }
      console.log("result:", result)

      res.send({ status: false });
    });

       

    app.get("/applied-jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { applicants: { $elemMatch: { email: email } } };
      const cursor = jobCollection.find(query).project({ applicants: 0 });
      const result = await cursor.toArray();

      res.send({ status: true, data: result });
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;

      const result = await jobCollection.findOne({ _id: ObjectId(id) });
      res.send({ status: true, data: result });
    });

    app.post("/job", async (req, res) => {
      const job = req.body;

      const result = await jobCollection.insertOne(job);

      res.send({ status: true, data: result });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World jobbox!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});