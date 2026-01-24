const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./S3");
const crypto = require("crypto");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const uploadToS3 = async (file) => {
  try {
    const safeOriginalName = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .toLowerCase();

    const fileName = `products/${Date.now()}-${crypto.randomUUID()}-${safeOriginalName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await s3.send(command);

    const url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${fileName}`;
    console.log('Uploaded to S3:', url);
    return url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

const deleteFromS3 = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const url = new URL(imageUrl);
    const key = url.pathname.substring(1);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
    console.log(`Deleted file from S3: ${key}`);
  } catch (error) {
    console.error("Error deleting from S3:", error);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
