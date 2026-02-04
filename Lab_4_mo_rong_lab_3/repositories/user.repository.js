const { ScanCommand, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../db/dynamoDB');

const TABLE_NAME = 'Users';

class UserRepository {
    async findById(userId) {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { userId }
            })
        );
        return result.Item;
    }

    async findByUsername(username) {
        const result = await docClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'username = :username',
                ExpressionAttributeValues: {
                    ':username': username
                }
            })
        );
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }

    async create(user) {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: user
            })
        );
        return user;
    }

    async getAll() {
        let users = [];
        let lastKey = undefined;

        do {
            const result = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    ExclusiveStartKey: lastKey
                })
            );

            if (result.Items) {
                users.push(...result.Items);
            }

            lastKey = result.LastEvaluatedKey;
        } while (lastKey);

        return users;
    }
}

module.exports = new UserRepository();
