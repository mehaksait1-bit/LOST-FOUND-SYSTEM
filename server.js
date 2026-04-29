const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/lostfound")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const Item = mongoose.model("Item", {
  personName: String,
  phone: String,
  itemName: String,
  description: String,
  type: String,
  location: String,
  image: String,
  date: { type: Date, default: Date.now }
});

// Add
app.post("/add", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json({ message: "Added" });
});

// Get
app.get("/items", async (req, res) => {
  const items = await Item.find().sort({ date: -1 });
  res.json(items);
});

// Delete
app.delete("/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

app.listen(5000, () => console.log("Server running on 5000"));