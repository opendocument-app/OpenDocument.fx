'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

const path = require('path');
const os = require('os');

exports.inspectMime = functions.storage.object().onFinalize(async (object) => {
  var contentType = object.contentType;

  const contentTypeSplit = contentType.split('/');
  if (contentTypeSplit.length > 1) {
    contentType = contentTypeSplit[contentTypeSplit.length - 1];
  }

  const mimeDoc = firestore.doc('mimes/' + contentType);
  const mimeSnap = await mimeDoc.get();

  const mimeExists = mimeSnap.exists;
  if (!mimeExists) {
    await mimeDoc.set({
      count: 0
    });
  }

  return mimeDoc.update('count', admin.firestore.FieldValue.increment(1));
});

exports.download = functions.https.onRequest(async (req, res) => {
  const filePath = req.query.filePath;

  const bucket = admin.storage().bucket('admob-app-id-9025061963.appspot.com');
  const object = bucket.file('uploads/' + filePath);

  const [metadata] = await object.getMetadata();
  res.contentType(metadata.contentType);

  object.createReadStream().pipe(res);
  res.status(200);
});
