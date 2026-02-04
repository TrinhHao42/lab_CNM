const { ScanCommand, PutCommand, GetCommand, DeleteCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamoDB');

const TABLE_NAME = 'Products';

class ProductRepository {
    async findById(id) {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            })
        );
        return result.Item;
    }

    async getAll(includeDeleted = false) {
        let products = [];
        let lastKey = undefined;

        do {
            const params = {
                TableName: TABLE_NAME,
                ExclusiveStartKey: lastKey
            };

            // Không hiển thị sản phẩm đã xóa mềm
            if (!includeDeleted) {
                params.FilterExpression = 'attribute_not_exists(isDeleted) OR isDeleted = :false';
                params.ExpressionAttributeValues = { ':false': false };
            }

            const result = await docClient.send(new ScanCommand(params));

            if (result.Items) {
                products.push(...result.Items);
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        return products;
    }

    async searchAndFilter(filters = {}) {
        let products = [];
        let lastKey = undefined;

        const { categoryId, minPrice, maxPrice, searchName, limit = 10, lastEvaluatedKey } = filters;

        // Build filter expression
        const filterExpressions = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        // Không lấy sản phẩm đã xóa
        filterExpressions.push('(attribute_not_exists(isDeleted) OR isDeleted = :false)');
        expressionAttributeValues[':false'] = false;

        if (categoryId) {
            filterExpressions.push('categoryId = :categoryId');
            expressionAttributeValues[':categoryId'] = categoryId;
        }

        if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
            filterExpressions.push('price >= :minPrice');
            expressionAttributeValues[':minPrice'] = parseFloat(minPrice);
        }

        if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
            filterExpressions.push('price <= :maxPrice');
            expressionAttributeValues[':maxPrice'] = parseFloat(maxPrice);
        }

        if (searchName) {
            filterExpressions.push('contains(#name, :searchName)');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':searchName'] = searchName;
        }

        const params = {
            TableName: TABLE_NAME,
            Limit: limit
        };

        if (filterExpressions.length > 0) {
            params.FilterExpression = filterExpressions.join(' AND ');
            params.ExpressionAttributeValues = expressionAttributeValues;
            
            if (Object.keys(expressionAttributeNames).length > 0) {
                params.ExpressionAttributeNames = expressionAttributeNames;
            }
        }

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const result = await docClient.send(new ScanCommand(params));

        return {
            items: result.Items || [],
            lastEvaluatedKey: result.LastEvaluatedKey
        };
    }

    async create(product) {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: product
            })
        );
        return product;
    }

    async update(id, data) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (data.name) {
            updateExpressions.push('#name = :name');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':name'] = data.name;
        }

        if (data.price !== undefined) {
            updateExpressions.push('price = :price');
            expressionAttributeValues[':price'] = parseFloat(data.price);
        }

        if (data.quantity !== undefined) {
            updateExpressions.push('quantity = :quantity');
            expressionAttributeValues[':quantity'] = parseInt(data.quantity);
        }

        if (data.categoryId) {
            updateExpressions.push('categoryId = :categoryId');
            expressionAttributeValues[':categoryId'] = data.categoryId;
        }

        if (data.url_image !== undefined) {
            updateExpressions.push('url_image = :url_image');
            expressionAttributeValues[':url_image'] = data.url_image;
        }

        if (data.isDeleted !== undefined) {
            updateExpressions.push('isDeleted = :isDeleted');
            expressionAttributeValues[':isDeleted'] = data.isDeleted;
        }

        if (updateExpressions.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { id },
                UpdateExpression: `SET ${updateExpressions.join(', ')}`,
                ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })
        );

        return result.Attributes;
    }

    // Soft delete
    async softDelete(id) {
        const result = await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { id },
                UpdateExpression: 'SET isDeleted = :true',
                ExpressionAttributeValues: {
                    ':true': true
                },
                ReturnValues: 'ALL_NEW'
            })
        );
        return result.Attributes;
    }

    // Hard delete (nếu cần)
    async hardDelete(id) {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { id }
            })
        );
    }
}

module.exports = new ProductRepository();
