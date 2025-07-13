from config.mongodb import sales_collection  # or your Mongo client setup

store_ids = sales_collection.distinct("store_id")
print(store_ids)
