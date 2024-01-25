require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

// 使用CORS中间件
app.use(cors());
app.use(express.json()); // 解析JSON请求体
let db;

MongoClient.connect(mongoUrl)
    .then(client => {
        console.log('Connected to MongoDB Replica Set');
        db = client.db(dbName);
        
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// API端点检查MongoDB副本集状态
app.get('/mongo-status', async (req, res) => {
    try {
        const status = await db.admin().command({ replSetGetStatus: 1 });
        res.json({ status: 'ok', details: status });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 插入数据
app.post('/data', async (req, res) => {
    try {
        const result = await db.collection('mycollection').insertOne(req.body);

        // 检查插入操作的结果
        if (result.acknowledged && result.insertedId) {
            res.status(201).json({ _id: result.insertedId });
        } else {
            throw new Error('Document insert failed');
        }
    } catch (error) {
        console.error('Error on insert:', error);
        res.status(500).json({ error: error.message });
    }
});


// 更新数据
app.put('/data/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.collection('mycollection').updateOne(
            { _id: new ObjectId(id) }, 
            { $set: req.body }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Document successfully updated' });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: error.message });
    }
});


// 删除数据
app.delete('/data/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.collection('mycollection').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Document successfully deleted' });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: error.message });
    }
});


// 查询数据
app.get('/data', (req, res) => {
    db.collection('mycollection').find({}).toArray()
       .then(result => res.json(result))
       .catch(error => res.status(500).json({ error }));
});