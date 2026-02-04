const { ScanCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamoDB');

const TABLE_NAME = 'ProductLogs';

class ProductLogRepository {
    async create(log) {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: log
            })
        );
        return log;
    }

    async getByProductId(productId) {
        let logs = [];
        let lastKey = undefined;

        do {
            const result = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: 'productId = :productId',
                    ExpressionAttributeValues: {
                        ':productId': productId
                    },
                    ExclusiveStartKey: lastKey
                })
            );

            if (result.Items) {
                logs.push(...result.Items);
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        // Sort by time descending
        return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    async getAll(limit = 50) {
        let logs = [];
        let lastKey = undefined;
        let count = 0;

        do {
            const result = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    ExclusiveStartKey: lastKey,
                    Limit: limit - count
                })
            );

            if (result.Items) {
                logs.push(...result.Items);
                count += result.Items.length;
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey && count < limit);

        // Sort by time descending
        return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }
}

module.exports = new ProductLogRepository();
