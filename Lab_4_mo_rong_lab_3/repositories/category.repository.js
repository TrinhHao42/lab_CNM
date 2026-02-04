const { ScanCommand, PutCommand, GetCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamoDB');

const TABLE_NAME = 'Categories';

class CategoryRepository {
    async findById(categoryId) {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { categoryId }
            })
        );
        return result.Item;
    }

    async getAll() {
        let categories = [];
        let lastKey = undefined;

        do {
            const result = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    ExclusiveStartKey: lastKey
                })
            );

            if (result.Items) {
                categories.push(...result.Items);
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        return categories;
    }

    async create(category) {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: category
            })
        );
        return category;
    }

    async update(categoryId, data) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (data.name) {
            updateExpressions.push('#name = :name');
            expressionAttributeNames['#name'] = 'name';
            expressionAttributeValues[':name'] = data.name;
        }

        if (data.description !== undefined) {
            updateExpressions.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = data.description;
        }

        if (updateExpressions.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { categoryId },
                UpdateExpression: `SET ${updateExpressions.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })
        );

        return result.Attributes;
    }

    async delete(categoryId) {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { categoryId }
            })
        );
    }
}

module.exports = new CategoryRepository();
