# Creating sample data
1. install mongodump:
    ```
    brew tap mongodb/brew
    brew install mongodb-database-tools
    ```
2. run the backup:
    ```
    mongodump --host=localhost --port=27017 --db=CAM
    ```
3. make sure that the dump folder create for you is under models folder, so we are aware it exsists.

# Deploying our sample data
1. install mongodump:
    ```
    brew tap mongodb/brew
    brew install mongodb-database-tools
    ```
2. mongorestore --host=localhost --port=27017 --db=CAM /path/to/dump/CAM (will be backend/models/dump/CAM)

# Requirments:
- have a MongoDB container running
