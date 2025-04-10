const express = require("express");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const storage = new Storage();
const bucket = storage.bucket("eventradar-images");

const upload = multer({
  storage: multer.memoryStorage(),
});

app.get("/api/events", async (req, res) => {
  try 
  {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) 
  {
    res.status(500).send("Error getting events");
  }
});

app.post("/api/events", async (req, res) => {
  try 
  {
    const { title, description, date, location, imageUrl } = req.body;

    const docRef = await db.collection("events").add({
      title,
      description,
      date,
      location,
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).send("Error creating event");
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const blob = bucket.file(Date.now() + "-" + req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on("error", (err) => res.status(500).send(err.message));
    
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).json({ imageUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send("Error uploading image");
  }
});

app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
