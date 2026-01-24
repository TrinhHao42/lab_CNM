const { ScanCommand, PutCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamoDB');
const crypto = require('crypto');
const { uploadToS3, deleteFromS3 } = require('../configs/s3Helper');

const TABLE_NAME = 'Products';

exports.getAllProducts = async (req, res) => {
    try {
        let products = [];
        let lastKey = undefined;

        do {
            const result = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    ExclusiveStartKey: lastKey
                })
            );

            if (result.Items) {
                products.push(...result.Items);
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        console.log('Products:', JSON.stringify(products, null, 2));
        res.render('products', { products });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load products');
    }
};

exports.getAddProductPage = (req, res) => {
    res.render('add-product');
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        let imageUrl = '';

        if (req.file) {
            imageUrl = await uploadToS3(req.file);
        }

        const product = {
            id: crypto.randomUUID(),
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            url_image: imageUrl
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: product
            })
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to add product');
    }
};

exports.getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            })
        );

        if (!result.Item) {
            return res.status(404).send('Product not found');
        }

        res.render('edit-product', { product: result.Item });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load product');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, url_image } = req.body;

        const product = {
            id,
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            url_image: url_image || ''
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: product
            })
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to update product');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            })
        );

        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { id }
            })
        );

        if (result.Item && result.Item.url_image) {
            await deleteFromS3(result.Item.url_image);
        }

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to delete product');
    }
};


exports.getImageFromS3 = async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) return res.status(404).send("Image not found");

    try {
        const urlObj = new URL(imageUrl);
        const key = urlObj.pathname.substring(1);

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        const response = await s3.send(command);

        if (response.ContentType) {
            res.setHeader('Content-Type', response.ContentType);
        }

        response.Body.pipe(res);

    } catch (error) {
        console.error("Lỗi load ảnh:", error);
        res.status(404).send("Không tải được ảnh");
    }
};