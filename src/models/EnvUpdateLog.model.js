import { Schema, model } from 'mongoose';

const EnvUpdateLogSchema = new Schema({
  userName: {
    type: String,
  },
  environment: {
    type: String,
    required: true,
  },
  repoName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  oldDocument: {
    type: String,
    required: true
  },
  newDocument: {
    type: String,
    required: true
  }
}, { timestamps: true });


global.EnvUpdateLogSchema = global.EnvUpdateLogSchema || model('EnvUpdateLog', EnvUpdateLogSchema);

export default global.EnvUpdateLogSchema;