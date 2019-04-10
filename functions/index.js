'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

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
