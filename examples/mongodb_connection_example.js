// Import the MongoDB client
const { MongoClient } = require("mongodb");

// Connection URI (change if using MongoDB Atlas)
const uri = "mongodb://127.0.0.1:27017"; // or your Atlas connection string

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Select the database and collection
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // --- 1️⃣ Find all books in a specific genre ---
    const genre = "Dystopian";
    const genreBooks = await books.find({ genre }).toArray();
    console.log(`\n📚 Books in genre "${genre}":`);
    console.log(genreBooks);

    // --- 2️⃣ Find books published after a certain year ---
    const year = 1900;
    const recentBooks = await books.find({ published_year: { $gt: year } }).toArray();
    console.log(`\n📘 Books published after ${year}:`);
    console.log(recentBooks);

    // --- 3️⃣ Find books by a specific author ---
    const author = "Harper Lee";
    const authorBooks = await books.find({ author }).toArray();
    console.log(`\n✍️ Books by "${author}":`);
    console.log(authorBooks);

    // --- 4️⃣ Update the price of a specific book ---
    const titleToUpdate = "the hobbit";
    const newPrice = 17.99;
    const updateResult = await books.updateOne(
      { title: titleToUpdate },
      { $set: { price: newPrice } }
    );
    console.log(`\n💰 Updated "${titleToUpdate}" with new price: ${newPrice}`);
    console.log(updateResult);

    // --- 5️⃣ Delete a book by its title ---
    const titleToDelete = "The lord of the rings";
    const deleteResult = await books.deleteOne({ title: titleToDelete });
    console.log(`\n❌ Deleted book titled "${titleToDelete}"`);
    console.log(deleteResult);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    // Close the connection
    await client.close();
    console.log("\n🔒 Connection closed.");
  }
}

run();
