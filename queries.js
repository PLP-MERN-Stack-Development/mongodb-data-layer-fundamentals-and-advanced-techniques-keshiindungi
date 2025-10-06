// Import MongoDB client
const { MongoClient } = require("mongodb");

// Connection URI (local or Atlas)
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB");

    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // --- Task 2: Basic CRUD Operations ---
    console.log("\nTASK 2: BASIC CRUD OPERATIONS");

    // 1 Find all books in a specific genre
    const genre = "Dystopian";
    const genreBooks = await books.find({ genre }).toArray();
    console.log(`\n Books in genre "${genre}":`);
    console.log(genreBooks);

    // 2 Find books published after a certain year
    const year = 1900;
    const recentBooks = await books.find({ published_year: { $gt: year } }).toArray();
    console.log(`\n Books published after ${year}:`);
    console.log(recentBooks);

    // 3Find books by a specific author
    const author = "Harper Lee";
    const authorBooks = await books.find({ author }).toArray();
    console.log(`\n Books by "${author}":`);
    console.log(authorBooks);

    // 4 Update the price of a specific book
    const titleToUpdate = "The Hobbit";
    const newPrice = 17.99;
    const updateResult = await books.updateOne(
      { title: titleToUpdate },
      { $set: { price: newPrice } }
    );
    console.log(`\n Updated "${titleToUpdate}" with new price: ${newPrice}`);
    console.log(updateResult);

    // 5 Delete a book by its title
    const titleToDelete = "The Lord of the Rings";
    const deleteResult = await books.deleteOne({ title: titleToDelete });
    console.log(`\n Deleted book titled "${titleToDelete}"`);
    console.log(deleteResult);

    console.log("\nTASK 3: ADVANCED QUERIES");

       const inStockAfter2010 = await books
      .find({ in_stock: true, published_year: { $gt: 2010 } })
      .project({ title: 1, author: 1, price: 1, _id: 0 })
      .toArray();
    console.log("\n In-stock books published after 2010:");
    console.log(inStockAfter2010);

      const sortedAsc = await books
      .find({})
      .sort({ price: 1 })
      .project({ title: 1, author: 1, price: 1, _id: 0 })
      .toArray();
    console.log("\n Books sorted by price (ascending):");
    console.log(sortedAsc);

    // 3 Sort by price descending
    const sortedDesc = await books
      .find({})
      .sort({ price: -1 })
      .project({ title: 1, author: 1, price: 1, _id: 0 })
      .toArray();
    console.log("\n Books sorted by price (descending):");
    console.log(sortedDesc);

    // 4 Pagination (Page 1)
    const page1 = await books
      .find({})
      .skip(0)
      .limit(5)
      .project({ title: 1, author: 1, price: 1, _id: 0 })
      .toArray();
    console.log("\n Page 1 (5 books):");
    console.log(page1);

    // 5 Pagination (Page 2)
    const page2 = await books
      .find({})
      .skip(5)
      .limit(5)
      .project({ title: 1, author: 1, price: 1, _id: 0 })
      .toArray();
    console.log("\n Page 2 (next 5 books):");
    console.log(page2);

    // --- Task 4: Aggregation Pipeline ---
    console.log("\nTASK 4: AGGREGATION PIPELINES");

    // 1 Average price by genre
    const avgPriceByGenre = await books
      .aggregate([
        { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } },
        { $sort: { avgPrice: -1 } },
      ])
      .toArray();
    console.log("\n Average price by genre:");
    console.log(avgPriceByGenre);

    // 2 Author with the most books
    const mostBooks = await books
      .aggregate([
        { $group: { _id: "$author", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();
    console.log("\n Author with the most books:");
    console.log(mostBooks);

    // 3 Group books by publication decade
    const groupedByDecade = await books
      .aggregate([
        {
          $project: {
            decade: {
              $concat: [
                {
                  $toString: {
                    $subtract: ["$published_year", { $mod: ["$published_year", 10] }],
                  },
                },
                "s",
              ],
            },
          },
        },
        { $group: { _id: "$decade", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();
    console.log("\n Books grouped by decade:");
    console.log(groupedByDecade);

    // --- Task 5: Indexing ---
    console.log("\nTASK 5: INDEXING");

    // 1 Index on title
    await books.createIndex({ title: 1 });
    console.log(" Created index on 'title'");

    // 2 Compound index on author and published_year
    await books.createIndex({ author: 1, published_year: -1 });
    console.log(" Created compound index on 'author' and 'published_year'");

    // 3 Using explain() to analyze query performance
    const explainResult = await books.find({ title: "Dune" }).explain("executionStats");
    console.log("\n Explain plan for finding 'Dune':");
    console.log(JSON.stringify(explainResult.executionStats, null, 2));

  } catch (err) {
    console.error(" Error:", err);
  } finally {
    await client.close();
    console.log("\n Connection closed.");
  }
}

run();
