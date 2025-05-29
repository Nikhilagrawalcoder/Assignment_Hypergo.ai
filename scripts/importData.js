const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const axios = require("axios");
const Property = require("../models/Property");
const User = require("../models/User");
require("dotenv").config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");


    let defaultUser = await User.findOne({ email: "admin@propertyapp.com" });
    if (!defaultUser) {
      defaultUser = new User({
        name: "System Admin",
        email: "admin@propertyapp.com",
        password: "defaultpassword123",
        role: "admin",
      });
      await defaultUser.save();
      console.log("Created default user");
    }


    console.log("Downloading CSV file...");
    const response = await axios.get(
      "https://cdn2.gro.care/db424fd9fb74_1748258398689.csv"
    );
    fs.writeFileSync("properties.csv", response.data);

    const properties = [];


    fs.createReadStream("properties.csv")
      .pipe(csv())
      .on("data", (row) => {
        const property = {
          id: row.id,
          title: row.title,
          type: row.type,
          price: parseInt(row.price),
          state: row.state,
          city: row.city,
          areaSqFt: parseInt(row.areaSqFt),
          bedrooms: parseInt(row.bedrooms),
          bathrooms: parseInt(row.bathrooms),
          amenities: row.amenities ? row.amenities.split("|") : [],
          furnished: row.furnished,
          availableFrom: new Date(row.availableFrom),
          listedBy: row.listedBy,
          tags: row.tags ? row.tags.split("|") : [],
          colorTheme: row.colorTheme,
          rating: parseFloat(row.rating),
          isVerified: row.isVerified === "True",
          listingType: row.listingType,
          createdBy: defaultUser._id,
        };
        properties.push(property);
      })
      .on("end", async () => {
        try {
       
          await Property.deleteMany({});

   
          await Property.insertMany(properties);
          console.log(`Imported ${properties.length} properties successfully`);

         
          fs.unlinkSync("properties.csv");

          process.exit(0);
        } catch (error) {
          console.error("Error importing data:", error);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

importData();
