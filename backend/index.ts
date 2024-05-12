import {
  generateCosmeticObject,
  generateHouseObject,
  generateVillagerObject,
  generateResourceObject,
} from "./asset-gen/generate-image";

const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const sharp = require("sharp");
dotenv.config();

const express = require("express");
const { OpenAI } = require("openai");

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("haiii guys");
});

// Get cosmetic image
app.get("/gen/cosmetic", async (req, res) => {
  try {
    const data = await generateCosmeticObject();
    const imageURL = data;
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get house image
app.get("/gen/house", async (req, res) => {
  try {
    const data = await generateHouseObject();
    const imageURL = data;
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get villager image
app.get("/gen/villager", async (req, res) => {
  try {
    const data = await generateVillagerObject();
    const imageURL = data;
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get resource building image
app.get("/gen/resource", async (req, res) => {
  try {
    const data = await generateResourceObject();
    const imageURL = data;
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
