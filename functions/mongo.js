const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "barion";

class Mongo {
	async connect() {
		this.client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true, })
		this.db = this.client.db(DB_NAME);
	}
	async getCollection(collection)  {
		return await this.db.collection(collection).find({}).toArray();
	}
	async insertTransaction(transaction) {
		await this.db.collection("transactions").insertOne({
			status: transaction.status, 
			barionTransactionId: transaction.id
		})
	}
        async updateTransaction(transaction) {
	        await this.db.collection("transactions").updateOne(
			{ barionTransactionId: transaction.id },
			{ $set: { status: transaction.status } }
		)
	}
	async close() {
		await this.client.close();
	}
}
module.exports = new Mongo()
