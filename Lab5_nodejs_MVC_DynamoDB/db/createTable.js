const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.DYNAMODB_ENDPOINT,
  maxAttempts: 3,
  requestTimeout: 5000,
});

const TABLE_NAME = 'Products';

async function createTable() {
  try {
    // Kiểm tra bảng đã tồn tại chưa
    const listTablesCommand = new ListTablesCommand({});
    const tables = await client.send(listTablesCommand);
    
    if (tables.TableNames && tables.TableNames.includes(TABLE_NAME)) {
      console.log(`✓ Bảng ${TABLE_NAME} đã tồn tại`);
      return;
    }

    // Tạo bảng mới
    const params = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }
      ],
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }
      ],
      BillingMode: "PAY_PER_REQUEST"
    };

    const command = new CreateTableCommand(params);
    await client.send(command);
    
    console.log(`✓ Đã tạo bảng ${TABLE_NAME} thành công!`);
    console.log(`Schema: id (String), name (String), price (Number), url_image (String)`);
  } catch (error) {
    console.error('Lỗi khi tạo bảng:', error);
    throw error;
  }
}

createTable()
  .then(() => {
    console.log('\n✓ Khởi tạo database hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Lỗi:', error.message);
    process.exit(1);
  });
