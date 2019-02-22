'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let dynamodbConfig = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  dynamodbConfig = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}


const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamodbConfig);

/**
 * CREATE - POST
 */
module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const data = JSON.parse(event.body);
  
  if (typeof data.contents !== 'string') {
    console.error('Validation Failed');
  
    callback(null, withCorsHeaders({
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create item.'
    }));
  
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      parentId: data.parentId,
      title: data.title,
      contents: data.contents,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write item to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
  
      callback(null, withCorsHeaders({
        statusCode: error.statusCode || 501,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: 'Couldn\'t create item.'
      }));
  
      return;
    }

    // create a response
    const response = withCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(params.Item)
    });
  
    callback(null, response);
  });
};


/**
 * LIST - get all
 */
module.exports.list = (event, context, callback) => {
  // fetch all todos from the database
  dynamoDb.scan({
    TableName: process.env.DYNAMODB_TABLE,
  }, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
   
      callback(null, withCorsHeaders({
        statusCode: error.statusCode || 501,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: 'Couldn\'t fetch docs.'
      }));
   
      return;
    }

    // create a response
    const response = withCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(result.Items.map(({ 
        contents, 
        ...rest 
      }) => rest))
    });
   
    callback(null, response);
  });
};

/**
 * DELETE
 */
// module.exports.delete = (event, context, callback) => {
//   const params = {
//     TableName: process.env.DYNAMODB_TABLE,
//     Key: {
//       id: event.pathParameters.id,
//     },
//   };

//   // delete the todo from the database
//   dynamoDb.delete(params, (error) => {
//     // handle potential errors
//     if (error) {
//       console.error(error);
      
//       callback(null, {
//         statusCode: error.statusCode || 501,
//         headers: { 'Content-Type': 'text/plain' },
//         body: 'Couldn\'t remove the todo item.',
//       });
      
//       return;
//     }

//     // create a response
//     const response = {
//       statusCode: 200,
//       body: JSON.stringify({}),
//     };
    
//     callback(null, response);
//   });
// };

/**
 * GET one
 */
module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
  
      callback(null, withCorsHeaders({
        statusCode: error.statusCode || 501,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: 'Couldn\'t fetch the todo item.'
      }));
  
      return;
    }

    // create a response
    const response = withCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(result.Item)
    });
  
    callback(null, response);
  });
};

/**
 * UPDATE - PUT
 */
module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const data = JSON.parse(event.body);

  // validation
  if (typeof data.title !== 'string') {
    console.error('Validation Failed');

    callback(null, withCorsHeaders({
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the todo item.',
    }));

    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#doc_title': 'title',
    },
    ExpressionAttributeValues: {
      ':title': data.title,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #doc_title = :title, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);

      callback(null, withCorsHeaders({
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      }));

      return;
    }

    // create a response
    const response = withCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    });

    callback(null, response);
  });
};


/**
 * CORS HEADERS
 */
const withCorsHeaders = data => {
  return {
    ...data,
    headers: {
      ...data.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true 
    }
  }
}