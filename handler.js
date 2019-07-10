'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({signatureVersion: 'v4'});
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.graphql = async (event) => {
  
  console.log('Received event {}', JSON.stringify(event, 3));
  console.log('Got an Invoke Request.');

  switch (event.field) {
    case 'getImageSignedPath': {
      const bucket = 'appsync-intro-bucket';
      const imageName = event.arguments.imageName;      
      const key = await getImageS3Path(imageName);
      return signURL(bucket, key);
    }

    default: {
      return `Unknown field, unable to resolve ${event.field}`, null;
    }
  }
};

function signURL(bucket, key) {
  const params = {'Bucket': bucket, 'Key': key};
  return s3.getSignedUrl('getObject', params);
}

async function getImageS3Path(imageName) {
  const params = {
    Key: {
        name: imageName
    },
    TableName:'appsync-intro-image-table'
    };
  
  return dynamo.get(params).promise().then(result => {
    return result.Item.s3Path;
  });
}