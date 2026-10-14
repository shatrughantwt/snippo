const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true
  },
  ext: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  lines: {
    type: Number,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Snippet', snippetSchema);
