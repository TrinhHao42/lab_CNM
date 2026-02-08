require('dotenv').config();
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

console.log('Testing DynamoDB connection...');
console.log('Endpoint:', process.env.DYNAMODB_ENDPOINT);

const client = new DynamoDBClient({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.DYNAMODB_ENDPOINT,
});

async function test() {
  try {
    console.log('Sending ListTablesCommand...');
    const command = new ListTablesCommand({});
    const result = await client.send(command);
    console.log('✓ Kết nối thành công!');
    console.log('Tables:', result.TableNames);
  } catch (error) {
    console.error('✗ Lỗi kết nối:', error.message);
    console.error('Full error:', error);
  }
}

test();
