var time = new Date(Date.now())

function addToDatabase (db, col, data) {
    return new Promise(resolve => {
        console.log('Adding item to database.')
        db.collection(col).insertMany(data, function(err, items) {
            if (err) throw err
            console.log('Item added to database.')
            resolve(items.ops)
        })
    })
}

function updateItem (db, col, item, data) {
    return new Promise(resolve => {
        console.log('Updating item in database.')
        db.collection(col).updateMany(item, data, function(err, result) {
            if (err) throw err
            console.log('Item updated.')
            resolve(result.ops)
        })
    })
}

function findItem(db, col, data) {
    return new Promise(resolve => {
        console.log('Getting Item in database.')
        var info = db.collection(col).find(data).limit(1).toArray()
        resolve(info)
    })   
}

function getCollection(db, col, data) {
    return new Promise(resolve => {
        console.log('Getting collection in database.')
        var info = db.collection(col).find(data).toArray()
        resolve(info)
    })
}


module.exports = {addToDatabase, updateItem, findItem, getCollection}