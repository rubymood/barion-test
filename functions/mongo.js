const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "barion";

class Mongo {
	async connect() {
		this.client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true, })
		this.db = this.client.db(DB_NAME);
	}
	async getCollection()  {
		return await this.db.collection("teachers").find({}).toArray();
	}
	//todo: insert transaction, update transaction
	/* res = await collection.updateOne(
      { name: "Mount McKinley" },
      { $set: { meters: 6190 } },
    );*/
	async close() {
		await this.client.close();
	}
}
module.exports = new Mongo()
